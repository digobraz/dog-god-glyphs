import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';
import { useDogyptStore } from '@/store/dogyptStore';
import { buildHeroglyphCode } from '@/lib/heroglyphCode';
import { getStoredRef } from '@/lib/refCapture';
import { useT } from '@/i18n/LanguageContext';
import { PageTopBar } from '@/components/PageTopBar';
import { TRANSPARENCY_SPLIT } from '@/lib/transparency';

const CREATE_CHECKOUT_URL = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1/create-checkout';

const PHOTO_TIMEOUT_MS = 12_000;

async function waitForStablePhotoUrl(timeoutMs = PHOTO_TIMEOUT_MS): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const current = useDogyptStore.getState().dogPhotoUrl;
    if (current && !current.startsWith('blob:')) return current;
    await new Promise((r) => setTimeout(r, 200));
  }
  return useDogyptStore.getState().dogPhotoUrl;
}

export function PaymentScreen() {
  const navigate = useNavigate();
  const t = useT();
  const { email, dogName, ownerName, selectedAmount, selections, dogPhotoUrl, patronSvg, patronSvg2 } = useDogyptStore();
  const [loading, setLoading] = useState(false);
  const [waitingPhoto, setWaitingPhoto] = useState(false);
  const [openTooltip, setOpenTooltip] = useState<number | null>(null);

  // Route guard — deep-link / stale localStorage ochrana
  useEffect(() => {
    if (!dogName || !email) {
      navigate('/heroglyph', { replace: true });
    }
  }, [dogName, email, navigate]);

  if (!dogName || !email) return null;

  const handlePay = async () => {
    setLoading(true);
    try {
      let stablePhotoUrl = dogPhotoUrl;
      if (stablePhotoUrl?.startsWith('blob:')) {
        setWaitingPhoto(true);
        stablePhotoUrl = await waitForStablePhotoUrl();
        setWaitingPhoto(false);
      }
      // Same inputs as WelcomeScreen → deterministic, matches the certificate the buyer sees.
      const heroglyphCode = buildHeroglyphCode({
        dogName,
        ownerName,
        patronSvg,
        breed: selections?.breed,
        patronCategory: selections?.patronCategory,
        country: selections?.country || selections?.ownerCountry,
        selections,
      });
      const res = await fetch(CREATE_CHECKOUT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogName,
          ownerName,
          email,
          selections,
          dogPhotoUrl: stablePhotoUrl,
          patronSvg,
          patronSvg2,
          heroglyphCode,
          amount: selectedAmount ?? 11,
          refCode: getStoredRef(),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_top');
        // fallback: ak _top navigation zlyha (iframe sandbox), otvor novu zalozku
        setTimeout(() => setLoading(false), 2000);
      } else {
        console.error('create-checkout error:', data.error);
        setLoading(false);
      }
    } catch (err) {
      console.error('payment fetch error:', err);
      setLoading(false);
      setWaitingPhoto(false);
    }
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <PageTopBar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-4 py-4">
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* ── 1. SECURE PAYMENT title ── */}
            <div className="px-6 pt-5 pb-0">
              <h3
                className="text-sm font-bold tracking-[0.2em] uppercase text-primary text-center"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {t('payment.title')}
              </h3>
            </div>

            {/* ── 2. GRADIENT PRICE BLOCK ── */}
            <div
              style={{
                background: 'var(--brand-gradient)',
                margin: '14px 20px 0',
                borderRadius: 16,
                padding: '18px 20px 16px',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 40,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: '#fff',
                  textShadow: '0 2px 8px rgba(0,0,0,0.45)',
                  letterSpacing: '0.02em',
                  margin: 0,
                }}
              >
                €{selectedAmount ?? 11}
              </p>
              <p
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.82)',
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                {t('payment.product', { dogName: dogName || t('payment.yourDog') })}
              </p>
            </div>

            {/* ── 3. PAY BUTTON + SECURED ── */}
            <div className="px-6 pt-4 pb-1">
              <Button
                onClick={handlePay}
                disabled={loading}
                className="w-full rounded-xl py-6 text-lg font-bold tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:scale-100"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                  color: '#000',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
                }}
              >
                {loading
                  ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {waitingPhoto ? t('payment.sealing') : t('payment.preparing')}</span>
                  : <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> {t('payment.pay')}</span>
                }
              </Button>

              <p className="text-[10px] text-muted-foreground/60 text-center flex items-center justify-center gap-1 mt-2">
                <Lock className="h-3 w-3" /> {t('payment.secured')}
              </p>
            </div>

            {/* ── 4. 100% TRANSPARENCY — PILLS + WATERMARK ── */}
            <div
              style={{
                position: 'relative',
                marginTop: 10,
                borderTop: '1px solid rgba(31,26,14,0.12)',
                paddingTop: 14,
                paddingBottom: 20,
                paddingLeft: 20,
                paddingRight: 20,
                overflow: 'hidden',
              }}
            >
              {/* Watermark: faint proportional treasury bar at bottom */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 48,
                  display: 'flex',
                  pointerEvents: 'none',
                }}
              >
                {TRANSPARENCY_SPLIT.map((s) => (
                  <div
                    key={s.labelKey}
                    style={{
                      flex: s.share,
                      background: s.color,
                      opacity: 0.10,
                    }}
                  />
                ))}
              </div>

              {/* Section heading */}
              <p
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--brand-blue)',
                  textAlign: 'center',
                  marginBottom: 12,
                  position: 'relative',
                }}
              >
                {t('payment.transparency.title')}
              </p>

              {/* Pills row */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {TRANSPARENCY_SPLIT.map((s, si) => (
                  <button
                    key={s.labelKey}
                    type="button"
                    aria-label={`Info about ${t(s.labelKey)}`}
                    onClick={() => setOpenTooltip(openTooltip === si ? null : si)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      paddingTop: 5,
                      paddingBottom: 5,
                      paddingLeft: 10,
                      paddingRight: 10,
                      borderRadius: 999,
                      background: `${s.color}18`,
                      border: `1.5px solid ${s.color}`,
                      cursor: 'pointer',
                      fontFamily: "'Cinzel', serif",
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      color: s.color,
                      whiteSpace: 'nowrap',
                      outline: openTooltip === si ? `2px solid ${s.color}` : 'none',
                      outlineOffset: 2,
                    }}
                  >
                    {t(s.labelKey)}
                    <span
                      style={{
                        background: s.color,
                        color: '#fff',
                        borderRadius: 999,
                        fontSize: 9,
                        fontWeight: 800,
                        padding: '1px 5px',
                        letterSpacing: '0.04em',
                      }}
                    >
                      €{s.share}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tooltip note panel */}
              {openTooltip !== null && (
                <motion.div
                  key={openTooltip}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    marginTop: 10,
                    background: `${TRANSPARENCY_SPLIT[openTooltip].color}12`,
                    border: `1px solid ${TRANSPARENCY_SPLIT[openTooltip].color}`,
                    borderRadius: 10,
                    padding: '10px 12px',
                    position: 'relative',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 11,
                      lineHeight: 1.55,
                      color: 'hsl(30 20% 20%)',
                      margin: 0,
                    }}
                  >
                    {TRANSPARENCY_SPLIT[openTooltip].note}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          <button
            onClick={() => navigate('/checkout')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pb-6"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <ArrowLeft className="h-4 w-4" /> {t('payment.back')}
          </button>
        </div>
      </div>
    </div>
  );
}
