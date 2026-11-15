import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { CertificateCard } from '@/components/CertificateCard';
import { buildHeroglyphCode } from '@/lib/heroglyphCode';
import { VerticalHeroglyphFrame } from '@/components/VerticalHeroglyphFrame';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { ShareCard } from '@/components/ShareCard';
import { usePostPaymentPipeline } from '@/hooks/usePostPaymentPipeline';
import { useT } from '@/i18n/LanguageContext';
import { PageTopBar } from '@/components/PageTopBar';
import { EDGE_BASE } from '@/lib/env';
import { track } from '@/lib/analytics';
import { HandCamera } from '@/components/pack/HandIcons';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { APP_NEW } from '@/lib/packFlags';
import { PACK_R, PACK_SPACE } from '@/components/pack/packTheme';
import { FlowMedallion, FLOW_MEDAL_CSS } from '@/components/screens/flowMedallion';
import { hekthorFace } from '@/lib/hekthorFaces';
import { cleanText, withFallback } from '@/components/screens/welcomeText';


function useSessionData(sessionId: string | null, fallbackStore: { dogName: string; ownerName: string; email: string; selections: Record<string, string>; dogPhotoUrl: string; patronSvg: string; patronSvg2: string }) {
  const [data, setData] = useState<typeof fallbackStore & { packNumber: number | null; settled: boolean }>({ ...fallbackStore, packNumber: null, settled: false });
  const fetched = useRef(false);
  const sessionResolved = useRef(false);

  useEffect(() => {
    if (!sessionId || fetched.current) return;
    fetched.current = true;
    // Retry with backoff — a single failed fetch used to leave the buyer stuck
    // on "preparing" forever (CTA disabled, blank certificate) right after
    // paying. Transient network/edge hiccups are the common case; retrying a
    // few times recovers them. Delays: 1s, 2s, 4s, 8s, 15s.
    let alive = true;
    const delays = [1000, 2000, 4000, 8000, 15000];
    const attempt = async (n: number): Promise<void> => {
      try {
        const r = await fetch(`${EDGE_BASE}/get-session-data?session_id=${sessionId}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        if (!d.dogName) throw new Error('empty session data');
        if (!alive) return;
        sessionResolved.current = true;
        setData({
          dogName: d.dogName,
          ownerName: d.ownerName,
          email: d.email,
          selections: d.selections,
          dogPhotoUrl: d.dogPhotoUrl,
          patronSvg: d.patronSvg ?? '',
          patronSvg2: d.patronSvg2 ?? '',
          packNumber: typeof d.packNumber === 'number' ? d.packNumber : null,
          settled: true,
        });
      } catch (e) {
        if (!alive) return;
        if (n < delays.length) {
          setTimeout(() => { if (alive) void attempt(n + 1); }, delays[n]);
        } else {
          console.error('[welcome] get-session-data failed after retries:', e);
          setData(prev => ({ ...prev, settled: true }));
          // Fallback store data (mirrored by the other effect) stays in place.
        }
      }
    };
    void attempt(0);
    return () => { alive = false; };
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
      packNumber: prev.packNumber,
      settled: prev.settled,
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

/** ŠAT PAPYRUS 3D pre `/welcome` (15. 11. 2026). Tokeny `--p3d-*` nesie `html.papyrus3d` (appka, `APP_NEW`).
 *  ⚠️ Bez spätných apostrofov: CSS je v template literáli. */
const WELCOME_P3D_CSS = `
.wc-page { min-height: 100dvh; display: flex; flex-direction: column; background: var(--p3d-paper); color: var(--p3d-ink); font-family: 'Space Grotesk', sans-serif; overflow-x: hidden; }
.wc-wrap { flex: 1; display: flex; padding: ${PACK_SPACE.sm}px ${PACK_SPACE.lg}px ${PACK_SPACE.lg}px; }
@media (min-width: 768px) { .wc-wrap { padding-bottom: ${PACK_SPACE.xl}px; } }
.wc-card {
  width: 100%; max-width: 480px; margin: auto; display: flex; flex-direction: column; align-items: center; gap: ${PACK_SPACE.lg}px;
  padding: ${PACK_SPACE.xl}px ${PACK_SPACE.lg}px; text-align: center;
  background: var(--p3d-card); border: 2.5px solid var(--p3d-ink); border-radius: ${PACK_R.card}px; box-shadow: var(--p3d-pera);
}

/* Číslo psa + cieľ + progres */
.wc-goal { width: 100%; display: flex; flex-direction: column; gap: ${PACK_SPACE.md}px; }
.wc-goal-row { display: flex; align-items: center; justify-content: space-between; gap: ${PACK_SPACE.md}px; min-height: 32px; }
.wc-num { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 24px; line-height: 1; color: var(--p3d-gold-ink); font-variant-numeric: tabular-nums; }
.wc-goal-t { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; text-align: right; }
.wc-goal-t span { font-size: 12px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--p3d-gold-ink); }
.wc-goal-t b { font-size: 14px; font-weight: 700; color: var(--p3d-ink); }
.wc-bar { width: 100%; box-sizing: border-box; height: 16px; border-radius: ${PACK_R.pill}px; overflow: hidden; border: 2.5px solid var(--p3d-ink); background: var(--p3d-paper-hi); box-shadow: var(--p3d-inset); }
.wc-bar > span { display: block; height: 100%; background: linear-gradient(180deg, #FFE27A 0%, #F5C73D 50%, #E69E1A 100%); border-right: 2.5px solid var(--p3d-ink); box-sizing: border-box; }

/* Fotka: tmavý obrys + zlatý prstenec (poloha), bez závoja */
.wc-photo { width: clamp(120px, 26dvh, 184px); aspect-ratio: 1; border-radius: 50%; overflow: hidden; flex: none; border: 2.5px solid var(--p3d-ink); box-shadow: 0 0 0 5px var(--p3d-gold), 0 0 0 7.5px var(--p3d-ink), 0 9px 0 5px var(--p3d-gold-ink); margin: 7px 0 ${PACK_SPACE.sm}px; }
.wc-photo img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
.wc-photo--empty { display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--p3d-gold) 26%, var(--p3d-paper)); box-shadow: var(--p3d-inset); color: var(--p3d-ink); margin: 0; width: clamp(96px, 20dvh, 144px); }
.wc-miss { display: flex; flex-direction: column; gap: 4px; max-width: 320px; }
.wc-miss b { font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px; color: var(--p3d-ink); } /* písmo: nadpis */
.wc-miss span { font-size: 14px; line-height: 1.4; font-weight: 500; color: var(--p3d-ink); }

/* Identita: pozdrav, meno psa, titul */
.wc-id { width: 100%; display: flex; flex-direction: column; align-items: center; gap: ${PACK_SPACE.sm}px; padding: ${PACK_SPACE.md}px 0; border-top: 2px solid var(--p3d-gold-solid); border-bottom: 2px solid var(--p3d-gold-solid); }
.wc-cong { font-size: 12px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--p3d-ink); }
.wc-cong b { font-weight: 700; }
.wc-dog { font-family: 'Cinzel Decorative', serif; font-weight: 700; font-size: clamp(28px, 9vw, 40px); line-height: 1.05; text-transform: uppercase; color: var(--p3d-ink); max-width: 100%; overflow-wrap: anywhere; } /* písmo: meno */
.wc-god { display: flex; align-items: baseline; justify-content: center; flex-wrap: wrap; gap: 0 ${PACK_SPACE.sm}px; font-size: 14px; font-weight: 500; color: var(--p3d-ink); }
.wc-god b { font-family: 'Cinzel', serif; font-weight: 700; font-size: 20px; color: var(--p3d-gold-ink); } /* písmo: nadpis */
.wc-god i { font-style: normal; font-size: 12px; font-weight: 600; color: var(--p3d-gold-ink); }
.wc-mission { margin: 0; font-size: 14px; line-height: 1.4; font-weight: 500; color: var(--p3d-ink); }

/* CTA = lapis, hotové aj počas kovania (bez vyblednutia, stav nesú bodky) */
.wc-act { width: 100%; display: flex; flex-direction: column; align-items: center; gap: ${PACK_SPACE.md}px; }
.wc-cta { width: 100%; height: 52px; text-transform: uppercase; letter-spacing: .04em; font-weight: 900; }
.wc-cta:disabled { opacity: 1; cursor: progress; }
.wc-cta[aria-busy=true] { font-size: 16px; white-space: nowrap; }
@media (max-width: 400px) { .wc-cta[aria-busy=true] { font-size: 14px; } }
/* Logo hore: tmavé na papyruse (Logo 2026), nie zlaté */
.wc-page img[alt=DOGYPT] { filter: brightness(0) opacity(.85); }
.wc-hint { margin: 0; font-size: 12px; line-height: 1.4; font-weight: 500; color: var(--p3d-ink); }

/* Stavy bez psa */
.wc-state { max-width: 440px; }
.wc-h { margin: 0; font-family: 'Cinzel', serif; font-weight: 700; font-size: 24px; line-height: 1.2; color: var(--p3d-ink); text-wrap: balance; } /* písmo: nadpis */
.wc-sub { margin: 0; max-width: 360px; font-size: 16px; line-height: 1.4; font-weight: 500; color: var(--p3d-ink); }
.wc-dots { display: inline-flex; gap: ${PACK_SPACE.sm}px; align-items: center; }
.wc-dots i { width: 10px; height: 10px; border-radius: 50%; background: var(--p3d-gold); border: 2px solid var(--p3d-ink); animation: wc-dot 1s ease-in-out infinite; }
.wc-dots i:nth-child(2) { animation-delay: .15s; } .wc-dots i:nth-child(3) { animation-delay: .3s; }
.wc-dots--btn { margin-left: ${PACK_SPACE.sm}px; } .wc-dots--btn i { width: 8px; height: 8px; background: #EFD79A; border-color: #EFD79A; }
@keyframes wc-dot { 0%, 100% { transform: translateY(0); opacity: .5; } 50% { transform: translateY(-4px); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .wc-dots i { animation: none; } }
@media (max-height: 760px) { .wc-card { gap: ${PACK_SPACE.md}px; padding: ${PACK_SPACE.lg}px; } .wc-id { padding: ${PACK_SPACE.sm}px 0; } }
`;

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

  // Single source of truth: the dog's WALL position, computed server-side in
  // get-session-data (same logic as get-grid-dogs) so /welcome and /grid match.
  const packNumber = certData.packNumber;

  // purchase_completed — fire once, only after the real session resolves a pack_number
  // (avoids firing on a fallback-store render with packNumber still null).
  const purchaseTracked = useRef(false);
  useEffect(() => {
    if (purchaseTracked.current || packNumber === null) return;
    purchaseTracked.current = true;
    track('purchase_completed', { pack_number: packNumber });
  }, [packNumber]);

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
  const shareRef = useRef<HTMLDivElement>(null);

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
  // Cert # = plain number, NO leading zeros (Matej lock 2026-06-07): "#1" not
  // "#00001" — mirrors CertRender.tsx (server-side render), which is the
  // canonical format. Bug fixed 2026-07-26: this used to ALWAYS render the
  // sessionId-derived placeholder regardless of packNumber, so any buyer whose
  // client-side PDF pipeline (usePostPaymentPipeline) won the write race against
  // the server-side generate-pdfs got a certificate stamped with a meaningless
  // "#DOG-XXXXXX" code instead of their real pack number (MIA #52, 2026-07-26).
  const certNumber = packNumber != null
    ? `#${packNumber}`
    : sessionId
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
    shareRef,
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
    navigate(`/wall?${params.toString()}`);
  }, [navigate, dogName, packNumber, photoUrl, heroglyphPngUrl]);

  const { display: packDisplay, landed } = useAnimatedCounter(
    packNumber ?? 0,
    reduced
  );

  // Fallback: ak heroglyph PNG nikdy nedokončí (Cloudinary/render hiccup),
  // nezamknúť kupca na /welcome navždy — po grace perióde povoliť Enter.
  // heroglyphUrl sa do /grid pošle len ak existuje (handleEnterPack to už rieši).
  const [forgeTimedOut, setForgeTimedOut] = useState(false);
  useEffect(() => {
    if (heroglyphPngUrl || packNumber === null) return;
    const id = setTimeout(() => setForgeTimedOut(true), 8000);
    return () => clearTimeout(id);
  }, [heroglyphPngUrl, packNumber]);
  const canEnter = packNumber !== null && (!!heroglyphPngUrl || forgeTimedOut);


  const hiddenTargets = (
    <>
    {/* Hidden PDF render targets — off-screen, rendered for html-to-image.
        translate="no" + .notranslate are LOAD-BEARING, do not remove: these
        nodes are captured from the BUYER's browser, so Chrome auto-translate
        rewrites them before toPng sees them. It translates the dog's name too
        — BELGA became BELGICKO ("Belgium") on share card #42, 2026-07-16. */}
    <div aria-hidden="true" translate="no" className="notranslate" style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none', opacity: 1 }}>
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
      {/* Share card render target — mounted always (so shareRef.current exists
          for the pipeline's initial gate) but the ShareCard itself only once
          heroglyphPngUrl exists: it needs a real (uploaded) heroglyph source
          to fetch + recolor gold, and packNumber must be resolved. */}
      <div ref={shareRef}>
        {heroglyphPngUrl && packNumber !== null && (
          <ShareCard
            packNumber={packNumber}
            dogName={dogName}
            photoUrl={photoUrl}
            heroglyphUrl={heroglyphPngUrl}
          />
        )}
      </div>
    </div>
    </>
  );

  // ── ŠAT PAPYRUS 3D (15. 11. 2026) ───────────────────────────────────────────
  // Matej 15. 11.: „oprav to všetko“ — sken ukázal, že /welcome nie je v brande (fialovo-zlatý gradient pod
  // papyrusovým závojom, rozstrelený Cinzel, sivé tlačidlo s trojbodkou). Len pod `APP_NEW`; web LIVE
  // ide nižšie starou vetvou, nedotknutou. Vrstva `FlowRedress` na /welcome ťahá fonty a blokové pravidlá
  // na `.dark-bg`/`.hf-pale`, preto nový povrch ani jednu z tried nenosí.
  if (APP_NEW) {
    const tx = withFallback(t);
    const view: 'loading' | 'failed' | 'empty' | null = dogName ? null
      : sessionId ? (certData.settled ? 'failed' : 'loading') : 'empty';
    const stateMedal = Math.round(Math.max(96, Math.min(160, window.innerHeight * 0.2)));
    const cta = packNumber === null
      ? cleanText(t('welcome.cta.preparing'))
      : (!heroglyphPngUrl && !forgeTimedOut) ? cleanText(t('welcome.cta.forging')) : t('welcome.cta.enter');
    const goalLabel = cleanText(t('welcome.goal.label'));
    const pct = packNumber ? Math.max(2, Math.min(100, (packNumber / 1000000) * 100)) : 0;
    return (
      <div className="wc-page">
        <style>{FLOW_MEDAL_CSS}{WELCOME_P3D_CSS}</style>
        <PageTopBar />
        <div className="wc-wrap">
          {view ? (
            <motion.div className="wc-card wc-state" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} aria-busy={view === 'loading'}>
              <span className="hf-medin"><FlowMedallion src={hekthorFace('welcome')} size={stateMedal} className="hf-medal" /></span>
              <h1 className="wc-h">
                {view === 'loading' ? cleanText(t('welcome.cta.preparing')).toLowerCase().replace(/^./, (c) => c.toUpperCase())
                  : view === 'failed' ? tx('heroglyph.flow.welcomeState.failedTitle', 'We could not load your entry')
                  : tx('heroglyph.flow.welcomeState.emptyTitle', 'There is nothing to show here yet')}
              </h1>
              {view === 'loading' ? <span className="wc-dots" aria-hidden><i /><i /><i /></span> : (
                <>
                  <p className="wc-sub">
                    {view === 'failed'
                      ? tx('heroglyph.flow.welcomeState.failedSub', 'Reload the page in a moment. The link to your profile is also in your e-mail.')
                      : tx('heroglyph.flow.welcomeState.emptySub', 'This page opens after you join. Start with your dog and your heroglyph.')}
                  </p>
                  <button type="button" className="pk-b3 pk-b3--lapis wc-cta" onClick={() => (view === 'failed' ? window.location.reload() : navigate('/heroglyph'))}>
                    {view === 'failed' ? tx('heroglyph.flow.welcomeState.retry', 'Try again') : t('wall.hero.cta')}
                  </button>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div className="wc-card" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              {/* Číslo psa a cieľ — jeden riadok, pod ním progres */}
              <div className="wc-goal">
                <div className="wc-goal-row">
                  {packNumber === null ? (
                    <span className="wc-dots" aria-label={t('welcome.cta.preparing')}><i /><i /><i /></span>
                  ) : (
                    <motion.span className="wc-num" animate={landed ? { scale: [1, 1.08, 1] } : {}} transition={{ duration: 0.35 }}>
                      #{packDisplay.toLocaleString()}
                    </motion.span>
                  )}
                  <span className="wc-goal-t">
                    <span>{goalLabel}</span>
                    <b>{t('welcome.goal.target')}</b>
                  </span>
                </div>
                <div className="wc-bar" role="progressbar" aria-valuemin={0} aria-valuemax={1000000} aria-valuenow={packNumber ?? 0}>
                  <motion.span initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }} />
                </div>
              </div>

              {/* Fotka psa, alebo značka „tvár ešte chýba“ (po platbe sa fotka doplní v DOG ID, nie tu) */}
              {photoUrl && !photoFailed ? (
                <div className="wc-photo">
                  <img src={photoUrl} alt={dogName} onError={() => setPhotoFailed(true)} />
                </div>
              ) : (
                <>
                  <div className="wc-photo wc-photo--empty"><HandCamera size={32} style={{ color: 'currentColor' }} /></div>
                  <div className="wc-miss">
                    <b>{t('welcome.photoMissing.title')}</b>
                    <span>{cleanText(t('welcome.photoMissing.sub'))}</span>
                  </div>
                </>
              )}

              <div className="wc-id">
                <span className="wc-cong">{t('welcome.congratsPrefix')}<b>{t('welcome.congratsName', { name: ownerFirstName })}</b></span>
                <span className="wc-dog" translate="no">{dogName}</span>
                <span className="wc-god">
                  {t('welcome.officiallyA')} <b>“{t('welcome.godWord')}”</b>{t('welcome.godPun') && <i>{t('welcome.godPun')}</i>}
                </span>
              </div>

              <p className="wc-mission">{cleanText(t('welcome.missionLine1'))}</p>

              <div className="wc-act">
                <button type="button" className="pk-b3 pk-b3--lapis wc-cta" onClick={handleEnterPack} disabled={!canEnter} aria-busy={!canEnter}>
                  {cta}
                  {!canEnter && <span className="wc-dots wc-dots--btn" aria-hidden><i /><i /><i /></span>}
                </button>
                <p className="wc-hint">{cleanText(t('welcome.emailHint'))}</p>
              </div>
            </motion.div>
          )}
        </div>
        {hiddenTargets}
      </div>
    );
  }

  return (
    <div className="dark-bg min-h-[100dvh] overflow-y-auto overflow-x-hidden relative">

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

        {/* PES BEZ TVÁRE — od 28. 8. 2026 sa dá fotka vo flow preskočiť, takže sem
            dôjdu aj psi bez nej. Dovtedy sa v tom mieste NEVYKRESLILO NIČ: stránka
            vyzerala kompletne a človek nemal ako zistiť, že mu niečo chýba.
            ⚠️ Zámerne to NIE JE nahrávanie ani druhé tlačidlo — po platbe nemá klient
            cestu zapísať fotku do `dogs` (robí to až prihlásený /pack, kde `handleRegenerate`
            prepečie aj certifikát a share kartu). Toto je značka a veta, akciu nesie
            existujúce CTA nižšie, ktoré tam presne vedie. */}
        {(!photoUrl || photoFailed) && (
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative flex items-center justify-center mx-auto rounded-full"
              style={{
                aspectRatio: '1 / 1',
                width: 'clamp(140px, 42vw, 200px)',
                border: '2px dashed hsl(45 80% 60% / 0.55)',
                background: 'hsl(45 60% 92% / 0.35)',
              }}
            >
              <HandCamera size={28} style={{ color: 'hsl(45 55% 45% / 0.75)' }} />
            </div>
            <div className="flex flex-col items-center gap-0.5 text-center" style={{ maxWidth: 280 }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a5a2a' }}>
                {t('welcome.photoMissing.title')}
              </span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, lineHeight: 1.45, color: '#666' }}>
                {t('welcome.photoMissing.sub')}
              </span>
            </div>
          </div>
        )}

        {/* Text content */}
        <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-2 text-center">

          {/* Congrats + dog name */}
          <div className="flex flex-col items-center gap-0.5 text-center w-full">
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888' }}>
              {t('welcome.congratsPrefix')}<strong style={{ color: '#555', fontWeight: 600 }}>{t('welcome.congratsName', { name: ownerFirstName })}</strong>
            </span>

            <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, hsl(45 80% 60% / 0.4), transparent)', margin: '4px 0' }} />

            <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(2rem, 9vw, 2.8rem)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1, color: '#1a1a1a' }}>
              {dogName}
            </span>

            <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, hsl(45 80% 60% / 0.4), transparent)', margin: '4px 0' }} />

            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1.5 justify-center flex-wrap">
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.75rem, 3vw, 0.9rem)', fontWeight: 400, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555' }}>
                  {t('welcome.officiallyA')}
                </span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(39 80% 35%)' }}>
                  “{t('welcome.godWord')}”
                </span>
              </div>
              {t('welcome.godPun') && (
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.6rem, 2.4vw, 0.7rem)', fontWeight: 400, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'hsl(39 60% 45% / 0.8)' }}>
                  {t('welcome.godPun')}
                </span>
              )}
            </div>
          </div>

          {/* Mission text */}
          <p className="text-center" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: '#888', lineHeight: 1.5, letterSpacing: '0.01em', margin: 0 }}>
            {t('welcome.missionLine1')}
          </p>

          {/* CTA area — clean reveal entry; no password here (set later in /pack/profile) */}
          <div className="w-full flex flex-col items-center gap-2">
            <motion.button
              onClick={handleEnterPack}
              disabled={!canEnter}
              className="relative w-full py-3.5 text-sm font-bold tracking-widest uppercase cursor-pointer disabled:opacity-50 disabled:cursor-wait"
              /* Hlavné CTA na papyruse = LAPIS r8 (brand manuál v4.1 · Buttons). Do 13. 10. 2026
                 tu bolo zlato s radius 12 — jediné také tlačidlo v celom vstupe. */
              style={{
                fontFamily: "'Cinzel', serif",
                borderRadius: 8,
                background: LAPIS.grad,
                color: LAPIS.ink,
                boxShadow: LAPIS_BTN_SHADOW,
              }}
              animate={canEnter ? { scale: [1, 1.025, 1] } : {}}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {packNumber === null
                ? t('welcome.cta.preparing')
                : (!heroglyphPngUrl && !forgeTimedOut)
                  ? t('welcome.cta.forging')
                  : t('welcome.cta.enter')}
            </motion.button>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: '#666', letterSpacing: '0.01em' }}>
              {t('welcome.emailHint')}
            </p>
          </div>
        </div>
      </motion.div>
      </div>
      </motion.div>

      {hiddenTargets}
    </div>
  );
}
