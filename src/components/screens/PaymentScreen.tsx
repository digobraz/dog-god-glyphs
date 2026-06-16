import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, Loader2, Info } from 'lucide-react';
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
        <div className="w-full max-w-xl flex flex-col items-center gap-5 py-4">
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-6 flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-primary text-center" style={{ fontFamily: "'Cinzel', serif" }}>
              {t('payment.title')}
            </h3>

            <div className="text-center py-2">
              <p className="text-2xl font-bold text-amber-300" style={{ fontFamily: "'Cinzel', serif" }}>
                ${selectedAmount ?? 11} USD
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t('payment.product', { dogName: dogName || t('payment.yourDog') })}</p>
            </div>

            <Button
              onClick={handlePay}
              disabled={loading}
              className="w-full rounded-xl py-6 text-lg font-bold tracking-wider hover:scale-[1.02] transition-transform mt-2 disabled:opacity-60 disabled:scale-100"
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

            <p className="text-[10px] text-muted-foreground/60 text-center flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" /> {t('payment.secured')}
            </p>

            {/* ── 100% Transparency treasury ── */}
            <div
              style={{
                marginTop: 4,
                borderTop: '1px solid rgba(245,240,228,0.12)',
                paddingTop: 16,
              }}
            >
              {/* Section heading */}
              <p
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'hsl(45 60% 80% / 0.7)',
                  textAlign: 'center',
                  marginBottom: 10,
                }}
              >
                {t('payment.transparency.title')}
              </p>

              {/* 11-segment bar */}
              <div className="flex w-full gap-[3px]" style={{ marginBottom: 12 }}>
                {TRANSPARENCY_SPLIT.flatMap((s, si) =>
                  Array.from({ length: s.share }).map((_, i) => (
                    <span
                      key={`${si}-${i}`}
                      style={{ flex: 1, height: 6, borderRadius: 2, background: s.color }}
                    />
                  )),
                )}
              </div>

              {/* Legend rows */}
              <div className="flex flex-col gap-[6px]">
                {TRANSPARENCY_SPLIT.map((s, si) => (
                  <div key={s.labelKey} className="flex items-center justify-between gap-2">
                    {/* left: colour dot + label */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        style={{ width: 8, height: 8, borderRadius: 999, background: s.color, flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: 10.5,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: 'hsl(45 80% 92%)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t(s.labelKey)}
                      </span>
                    </div>

                    {/* right: euro amount + (i) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: s.color,
                        }}
                      >
                        €{s.share}
                      </span>
                      <button
                        type="button"
                        aria-label={`Info about ${t(s.labelKey)}`}
                        onClick={() => setOpenTooltip(openTooltip === si ? null : si)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 18,
                          height: 18,
                          borderRadius: 999,
                          border: `1px solid ${s.color}`,
                          background: 'transparent',
                          color: s.color,
                          cursor: 'pointer',
                          padding: 0,
                          flexShrink: 0,
                        }}
                      >
                        <Info style={{ width: 10, height: 10 }} />
                      </button>
                    </div>
                  </div>
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
                    background: 'rgba(0,0,0,0.30)',
                    border: `1px solid ${TRANSPARENCY_SPLIT[openTooltip].color}`,
                    borderRadius: 10,
                    padding: '10px 12px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 11,
                      lineHeight: 1.55,
                      color: 'hsl(45 28% 90% / 0.88)',
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
