import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { supabase } from '@/integrations/supabase/client';
import { CertificateCard } from '@/components/CertificateCard';
import { buildHeroglyphCode } from '@/lib/heroglyphCode';
import { VerticalHeroglyphFrame } from '@/components/VerticalHeroglyphFrame';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { usePostPaymentPipeline } from '@/hooks/usePostPaymentPipeline';
import { useT } from '@/i18n/LanguageContext';
import { PageTopBar } from '@/components/PageTopBar';

// Direct REST — bypasses supabase-js client which Lovable may overwrite with zombie project.
const PM_URL = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/rest/v1/pack_members';
const PM_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuenVyd21kZ3Z6bHFoc2JocnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDAxMzIsImV4cCI6MjA5MjI3NjEzMn0.oMdBisx_0Mla4PI1JtUT4lM1vgZVvbpcORfA8kbdWQY';
const PM_HEADERS = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PM_KEY}`, 'apikey': PM_KEY };

function usePackNumber(dogName: string, email: string, sessionId: string | null) {
  const [packNumber, setPackNumber] = useState<number | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function registerAndFetch() {
      // Try INSERT first — succeeds if we beat the webhook.
      try {
        const res = await fetch(`${PM_URL}?select=pack_number`, {
          method: 'POST',
          headers: { ...PM_HEADERS, 'Prefer': 'return=representation' },
          body: JSON.stringify({ dog_name: dogName || 'Unknown', email: email || null, stripe_session_id: sessionId || null }),
        });
        if (res.ok) {
          const rows = await res.json();
          if (rows?.[0]?.pack_number) { setPackNumber(rows[0].pack_number); return; }
        }
      } catch { /* fall through to poll */ }

      // INSERT failed (duplicate or webhook race). Poll until the webhook inserts the row.
      // Stripe webhook can take 30-45s on slow infra; 15 × 3s = 45s window.
      if (!sessionId) return;
      for (let i = 0; i < 15; i++) {
        if (i > 0) await new Promise(r => setTimeout(r, 3000));
        try {
          const res = await fetch(`${PM_URL}?select=pack_number&stripe_session_id=eq.${encodeURIComponent(sessionId)}`, {
            headers: PM_HEADERS,
          });
          if (res.ok) {
            const rows = await res.json();
            if (rows?.[0]?.pack_number) { setPackNumber(rows[0].pack_number); return; }
          }
        } catch { /* continue */ }
      }
    }

    registerAndFetch();
  }, [dogName, email, sessionId]);

  return packNumber;
}

const EDGE_BASE = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1';

function useSessionData(sessionId: string | null, fallbackStore: { dogName: string; ownerName: string; email: string; selections: Record<string, string>; dogPhotoUrl: string; patronSvg: string; patronSvg2: string }) {
  const [data, setData] = useState(fallbackStore);
  const fetched = useRef(false);
  const sessionResolved = useRef(false);

  useEffect(() => {
    if (!sessionId || fetched.current) return;
    fetched.current = true;
    fetch(`${EDGE_BASE}/get-session-data?session_id=${sessionId}`)
      .then(r => r.json())
      .then(d => {
        if (d.dogName) {
          sessionResolved.current = true;
          setData({
            dogName: d.dogName,
            ownerName: d.ownerName,
            email: d.email,
            selections: d.selections,
            dogPhotoUrl: d.dogPhotoUrl,
            patronSvg: d.patronSvg ?? '',
            patronSvg2: d.patronSvg2 ?? '',
          });
        }
      })
      .catch(() => {/* use fallback store */});
  }, [sessionId]);

  // Mirror live store ONLY when there is no payment session.
  // When a session_id is present, identity fields (name/owner/email/selections)
  // MUST come from the real payment via get-session-data — never from the
  // Zustand-persisted localStorage store, which can hold a previous buyer's
  // name on a shared device/browser (stale-name bug). We still defer to session.
  useEffect(() => {
    if (sessionId || sessionResolved.current) return;
    setData(prev => ({
      dogName: fallbackStore.dogName || prev.dogName,
      ownerName: fallbackStore.ownerName || prev.ownerName,
      email: fallbackStore.email || prev.email,
      selections: Object.keys(fallbackStore.selections || {}).length ? fallbackStore.selections : prev.selections,
      dogPhotoUrl: fallbackStore.dogPhotoUrl || prev.dogPhotoUrl,
      patronSvg: fallbackStore.patronSvg || prev.patronSvg,
      patronSvg2: fallbackStore.patronSvg2 || prev.patronSvg2,
    }));
  }, [sessionId, fallbackStore.dogName, fallbackStore.ownerName, fallbackStore.email, fallbackStore.dogPhotoUrl, fallbackStore.selections, fallbackStore.patronSvg, fallbackStore.patronSvg2]);

  return data;
}

/** Animated count-up hook from 0 to target, returns text + landed flag */
function useAnimatedCounter(target: number, reduced: boolean | null) {
  const [display, setDisplay] = useState(reduced ? target : 0);
  const [landed, setLanded] = useState(!!reduced);

  useEffect(() => {
    if (reduced || target <= 0) {
      setDisplay(target);
      setLanded(true);
      return;
    }
    setLanded(false);
    const duration = 600;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * target));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setLanded(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);

  return { display, landed };
}

/** Purple-to-gold gradient matching the paywall card */
const GRADIENT_CARD: React.CSSProperties = {
  background: 'var(--brand-gradient)',
  border: '1px solid hsl(45 80% 60% / 0.2)',
};

export function WelcomeScreen() {
  const t = useT();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const store = useDogyptStore();
  const reduced = useReducedMotion();

  const certData = useSessionData(sessionId, {
    dogName: store.dogName || '',
    ownerName: store.ownerName || '',
    email: store.email || '',
    selections: store.selections,
    dogPhotoUrl: store.dogPhotoUrl || '',
    patronSvg: store.patronSvg || '',
    patronSvg2: store.patronSvg2 || '',
  });

  const dogName = certData.dogName;
  const ownerFirstName = certData.ownerName.split(' ')[0] || t('welcome.ownerFallback');
  const email = certData.email;
  const photoUrl = certData.dogPhotoUrl;
  const [photoFailed, setPhotoFailed] = useState(false);
  const [heroglyphPngUrl, setHeroglyphPngUrl] = useState('');
  useEffect(() => { setPhotoFailed(false); }, [photoUrl]);

  const packNumber = usePackNumber(dogName, email, sessionId);

  // Rehydrate store from session data so hidden HeroglyphFrame/VerticalHeroglyphFrame render correctly
  useEffect(() => {
    if (!certData.dogName || !certData.selections) return;
    const s = useDogyptStore.getState();
    if (certData.dogName && s.dogName !== certData.dogName) s.setDogName(certData.dogName);
    if (certData.ownerName && s.ownerName !== certData.ownerName) s.setOwnerName(certData.ownerName);
    if (certData.dogPhotoUrl && s.dogPhotoUrl !== certData.dogPhotoUrl) s.setDogPhotoUrl(certData.dogPhotoUrl);
    if (certData.patronSvg && s.patronSvg !== certData.patronSvg) s.setPatronSvg(certData.patronSvg);
    if (certData.patronSvg2 && s.patronSvg2 !== certData.patronSvg2) s.setPatronSvg2(certData.patronSvg2);
    Object.entries(certData.selections).forEach(([k, v]) => {
      if (typeof v === 'string') s.setSelection(k, v);
    });
  }, [certData]);

  // Hidden PDF render targets
  const certRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);

  const heroglyphCode = buildHeroglyphCode({
    dogName,
    ownerName: certData.ownerName,
    patronSvg: certData.patronSvg,
    breed: certData.selections?.breed,
    patronCategory: certData.selections?.patronCategory,
    country:
      certData.selections?.country || certData.selections?.ownerCountry,
    selections: certData.selections,
  });
  const certNumber = sessionId
    ? `#DOG-${sessionId.slice(-6).toUpperCase()}`
    : `#DOG-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const issuedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  usePostPaymentPipeline({
    email,
    dogName,
    ownerName: certData.ownerName,
    dogPhotoUrl: photoUrl,
    sessionId,
    packNumber,
    certRef,
    verticalRef,
    horizontalRef,
    onHeroglyphReady: setHeroglyphPngUrl,
  });

  const handleEnterPack = useCallback(() => {
    const params = new URLSearchParams({
      reveal: 'true',
      dogName,
      packNumber: String(packNumber ?? 0),
    });
    if (photoUrl) params.set('photoUrl', photoUrl);
    if (heroglyphPngUrl) params.set('heroglyphUrl', heroglyphPngUrl);
    navigate(`/grid?${params.toString()}`);
  }, [navigate, dogName, packNumber, photoUrl, heroglyphPngUrl]);

  // ── Set-password state ──
  const [pwValue, setPwValue] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwDone, setPwDone] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    if (pwValue.length < 8) { setPwError(t('welcome.password.tooShort')); return; }
    if (pwValue !== pwConfirm) { setPwError(t('welcome.password.mismatch')); return; }
    setPwLoading(true);
    try {
      const { error: fnError } = await supabase.functions.invoke('set-pack-password', {
        body: { sessionId, password: pwValue },
      });
      if (fnError) {
        const msg = (fnError as { message?: string }).message ?? '';
        if (msg.includes('not_paid') || msg.includes('402')) {
          setPwError(t('welcome.password.notPaid'));
        } else {
          setPwError(t('welcome.password.error'));
        }
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: pwValue,
      });
      if (signInError) {
        setPwError(t('welcome.password.error'));
        return;
      }
      setPwDone(true);
      setPwModalOpen(false);
      handleEnterPack();
    } catch {
      setPwError(t('welcome.password.error'));
    } finally {
      setPwLoading(false);
    }
  }

  const { display: packDisplay, landed } = useAnimatedCounter(
    packNumber ?? 0,
    reduced
  );

  // Password modal portal
  const pwModal = pwModalOpen && createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) setPwModalOpen(false); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          background: 'rgba(245,235,210,0.97)',
          borderRadius: 16,
          padding: '28px 24px',
          width: '100%',
          maxWidth: 360,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          border: '1px solid rgba(160,116,35,0.3)',
        }}
      >
        <form onSubmit={handleSetPassword} className="flex flex-col gap-3">
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: '#555', letterSpacing: '0.08em', textAlign: 'center', textTransform: 'uppercase', marginBottom: 4 }}>
            {t('welcome.password.title', { email: email || '…' })}
          </p>
          <input
            type="password"
            value={pwValue}
            onChange={e => setPwValue(e.target.value)}
            placeholder={t('welcome.password.placeholder')}
            required
            autoComplete="new-password"
            className="w-full px-4 py-3 rounded-[8px] border outline-none"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 16,
              color: '#0E0E0E',
              background: 'rgba(255,255,255,0.7)',
              borderColor: 'rgba(160,116,35,0.4)',
            }}
          />
          <input
            type="password"
            value={pwConfirm}
            onChange={e => setPwConfirm(e.target.value)}
            placeholder={t('welcome.password.confirm')}
            required
            autoComplete="new-password"
            className="w-full px-4 py-3 rounded-[8px] border outline-none"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 16,
              color: '#0E0E0E',
              background: 'rgba(255,255,255,0.7)',
              borderColor: 'rgba(160,116,35,0.4)',
            }}
          />
          {pwError && (
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: '#b91c1c', textAlign: 'center' }}>
              {pwError}
            </p>
          )}
          <motion.button
            type="submit"
            disabled={packNumber === null || !heroglyphPngUrl || pwLoading}
            className="relative w-full py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase cursor-pointer disabled:opacity-50 disabled:cursor-wait"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
              color: '#1a1200',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
            animate={!pwLoading && packNumber !== null && heroglyphPngUrl ? { scale: [1, 1.025, 1] } : {}}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {packNumber === null
              ? t('welcome.cta.preparing')
              : !heroglyphPngUrl
                ? t('welcome.cta.forging')
                : pwLoading
                  ? t('welcome.password.processing')
                  : t('welcome.password.submit')}
          </motion.button>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: '#666', letterSpacing: '0.01em', textAlign: 'center' }}>
            {t('welcome.password.altLink')}
          </p>
        </form>
      </motion.div>
    </div>,
    document.body
  );

  return (
    <div className="dark-bg min-h-[100dvh] overflow-y-auto overflow-x-hidden relative">
      {pwModal}

      <motion.div
        className="flex flex-col min-h-[100dvh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* 1. Logo — on dark bg */}
        <PageTopBar />

        {/* Outer centering container */}
        <div className="flex-1 flex items-center justify-center px-4 pb-4 pt-2">
      <motion.div
        className="w-full max-w-sm md:max-w-2xl papyrus-bg rounded-3xl flex flex-col items-center px-5 pt-7 pb-7 gap-3"
        style={{ border: '1px solid hsl(var(--gold) / 0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* Goal tracker — samostatne, gradient len tu (foto ide pod) */}
        <div className="w-full max-w-sm mx-auto rounded-2xl flex flex-col items-center flex-shrink-0 overflow-hidden"
          style={{ background: 'var(--brand-gradient)' }}>

          {/* Stats section */}
          <div className="w-full flex flex-col items-center gap-2.5 px-4 pt-3 pb-3">

            {/* Number left, goal info right */}
            <div className="w-full flex items-center justify-between gap-3">
              {packNumber === null ? (
                <span className="font-bold animate-pulse"
                  style={{ fontFamily: "'Cinzel', serif", fontSize: 28, color: 'hsl(45 80% 65%)' }}>
                  ...
                </span>
              ) : (
                <motion.span
                  className="font-bold leading-none"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 'clamp(1.6rem, 7vw, 2.4rem)',
                    background: 'linear-gradient(135deg, hsl(45 95% 80%), hsl(45 80% 60%))',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}
                  animate={landed ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.35 }}
                >
                  #{packDisplay.toLocaleString()}
                </motion.span>
              )}
              <div className="flex flex-col items-end gap-0.5">
                <span className="tracking-widest uppercase font-semibold"
                  style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                  {t('welcome.goal.label')}
                </span>
                <span className="tracking-wider uppercase font-bold"
                  style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.72rem, 2.8vw, 0.9rem)', color: 'hsl(45 90% 70%)' }}>
                  {t('welcome.goal.target')}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.25)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(to right, hsl(224 65% 65%), hsl(45 90% 65%))' }}
                initial={{ width: '0%' }}
                animate={{ width: packNumber ? `${Math.max(2.5, (packNumber / 1000000) * 100)}%` : '0%' }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              />
            </div>

          </div>

        </div>

        {/* Dog photo — kruhová, samostatne pod statmi (bez fialového pozadia) */}
        {photoUrl && !photoFailed && (
          <div
            className="relative overflow-hidden mx-auto rounded-full"
            style={{
              aspectRatio: '1 / 1',
              width: 'clamp(140px, 42vw, 200px)',
              border: '2px solid hsl(45 80% 60% / 0.5)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            }}
          >
            <img
              src={photoUrl}
              alt={dogName}
              className="w-full h-full object-cover object-center"
              onError={() => setPhotoFailed(true)}
            />
          </div>
        )}

        {/* Text content */}
        <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-2 text-center">

          {/* Congrats + dog name */}
          <div className="flex flex-col items-center gap-0.5 text-center w-full">
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888' }}>
              {t('welcome.congratsPrefix')}<strong style={{ color: '#555' }}>{t('welcome.congratsName', { name: ownerFirstName })}</strong>
            </span>

            <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, hsl(45 80% 60% / 0.4), transparent)', margin: '4px 0' }} />

            <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(2rem, 9vw, 2.8rem)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1, color: '#1a1a1a' }}>
              {dogName}
            </span>

            <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, hsl(45 80% 60% / 0.4), transparent)', margin: '4px 0' }} />

            <div className="flex items-center gap-1.5 justify-center flex-wrap">
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.75rem, 3vw, 0.9rem)', fontWeight: 400, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555' }}>
                {t('welcome.officiallyA')}
              </span>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(39 80% 35%)' }}>
                GOD
              </span>
            </div>
          </div>

          {/* Mission text */}
          <p className="text-center" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: '#888', lineHeight: 1.5, letterSpacing: '0.01em', margin: 0 }}>
            {t('welcome.missionLine1')}
          </p>

          {/* CTA area */}
          <div className="w-full flex flex-col items-center gap-2">
            {/* sessionId present + password not yet set: CTA opens modal */}
            {sessionId && !pwDone && (
              <>
                <motion.button
                  onClick={() => setPwModalOpen(true)}
                  disabled={packNumber === null || !heroglyphPngUrl}
                  className="relative w-full py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
                    color: '#1a1200',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                  animate={packNumber !== null && heroglyphPngUrl ? { scale: [1, 1.025, 1] } : {}}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {packNumber === null
                    ? t('welcome.cta.preparing')
                    : !heroglyphPngUrl
                      ? t('welcome.cta.forging')
                      : t('welcome.password.submit')}
                </motion.button>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: '#666', letterSpacing: '0.01em', textAlign: 'center' }}>
                  {t('welcome.password.altLink')}
                </p>
              </>
            )}

            {/* Fallback / no-session or pwDone: original enter button */}
            {(!sessionId || pwDone) && (
              <>
                <motion.button
                  onClick={handleEnterPack}
                  disabled={packNumber === null || !heroglyphPngUrl}
                  className="relative w-full py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
                    color: '#1a1200',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                  animate={packNumber !== null && heroglyphPngUrl ? { scale: [1, 1.025, 1] } : {}}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {packNumber === null
                    ? t('welcome.cta.preparing')
                    : !heroglyphPngUrl
                      ? t('welcome.cta.forging')
                      : t('welcome.cta.enter')}
                </motion.button>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: '#666', letterSpacing: '0.01em' }}>
                  {t('welcome.emailHint')}
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>
      </div>
      </motion.div>

      {/* Hidden PDF render targets — off-screen, rendered for html-to-image */}
      <div aria-hidden="true" style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none', opacity: 1 }}>
        <div ref={certRef}>
          <CertificateCard
            dogName={dogName}
            ownerName={certData.ownerName}
            photoUrl={photoUrl}
            heroglyphCode={heroglyphCode}
            certNumber={certNumber}
            issuedDate={issuedDate}
          />
        </div>
        <div ref={verticalRef} style={{ width: 800, height: 1131, background: 'transparent', color: '#000' }}>
          <VerticalHeroglyphFrame />
        </div>
        <div ref={horizontalRef} style={{ width: 1200, height: 321, background: 'transparent', color: '#000' }}>
          <HeroglyphFrame showOwner />
        </div>
      </div>
    </div>
  );
}
