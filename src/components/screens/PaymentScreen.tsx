import { useState, useEffect, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, Loader2, Check } from 'lucide-react';
import { useDogyptStore } from '@/store/dogyptStore';
import { buildHeroglyphCode, countryISO3 } from '@/lib/heroglyphCode';
import { getStoredRef } from '@/lib/refCapture';
import { useT, useLang } from '@/i18n/LanguageContext';
import { PageTopBar } from '@/components/PageTopBar';
import { TRANSPARENCY_SPLIT } from '@/lib/transparency';
import { EDGE_BASE } from '@/lib/env';
import { track } from '@/lib/analytics';
import { getAttribution } from '@/lib/attribution';

const CREATE_CHECKOUT_URL = `${EDGE_BASE}/create-checkout`;

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
  const { lang } = useLang();
  const { email, dogName, ownerName, selectedAmount, selections, dogPhotoUrl, extraPhotos, patronSvg, patronSvg2, lifeStatus, deathDate } = useDogyptStore();
  const [loading, setLoading] = useState(false);
  const [waitingPhoto, setWaitingPhoto] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [openTooltip, setOpenTooltip] = useState<number | null>(null);
  // Ostrá prevádzka — pole je prázdne, používateľ zadá promo kód ručne.
  // Reálna Stripe validácia ostáva v create-checkout; tu len UI potvrdenie.
  const [promoCode, setPromoCode] = useState('');
  // Apply overí kód cez validate-promo (Stripe) — prečiarknutá cena €11 → €1
  // sa ukáže LEN pre reálne platný kód (Matej 2026-07-08: kupec potrebuje
  // istotu, že kupón platí, inak nedoklikne na Zaplatiť). Neplatný kód
  // dostane hlášku namiesto falošnej ceny.
  const [promoLocked, setPromoLocked] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoInvalid, setPromoInvalid] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState<{ percentOff: number | null; amountOff: number | null } | null>(null);

  const handleApplyPromo = async () => {
    const code = promoCode.trim();
    if (!code || promoChecking) return;
    setPromoChecking(true);
    setPromoInvalid(false);
    try {
      const res = await fetch(`${EDGE_BASE}/validate-promo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = res.ok ? await res.json() : { valid: false };
      if (data.valid) {
        setPromoLocked(true);
        setPromoApplied(true);
        setPromoDiscount({ percentOff: data.percentOff ?? null, amountOff: data.amountOff ?? null });
        track('promo_applied', { code });
      } else {
        setPromoInvalid(true);
      }
    } catch (err) {
      console.warn('validate-promo failed:', err);
      // Sieťová chyba ≠ neplatný kód — kód nechaj tak, aplikuje sa na Stripe.
    } finally {
      setPromoChecking(false);
    }
  };

  // Route guard — deep-link / stale localStorage ochrana
  useEffect(() => {
    if (!dogName || !email) {
      navigate('/heroglyph', { replace: true });
    }
  }, [dogName, email, navigate]);

  if (!dogName || !email) return null;

  const handlePay = async () => {
    setLoading(true);
    setPayError(null);
    try {
      let stablePhotoUrl = dogPhotoUrl;
      if (stablePhotoUrl?.startsWith('blob:')) {
        setWaitingPhoto(true);
        stablePhotoUrl = await waitForStablePhotoUrl();
        setWaitingPhoto(false);
      }
      // A blob: URL is local to this tab — persisted to DB it renders as a dead
      // image on the WALL and certificate. If the Cloudinary upload still hasn't
      // finished after the wait, stop here instead of paying with a broken photo.
      if (stablePhotoUrl?.startsWith('blob:')) {
        setPayError(t('payment.photoNotReady'));
        setLoading(false);
        return;
      }
      // Same inputs as WelcomeScreen → deterministic, matches the certificate the buyer sees.
      // selections.country = dog's country (set on /name screen, FIX3). Never fall back to
      // owner country — that would silently push owner's billing country into heroglyph pos 15.
      const heroglyphCode = buildHeroglyphCode({
        dogName,
        ownerName,
        patronSvg,
        breed: selections?.breed,
        patronCategory: selections?.patronCategory,
        country: selections?.country,
        selections,
      });
      // Top-level breed + country columns power the Nation stats breakdown
      // (get-pack-stats reads them, NOT the selections JSON). country is
      // normalized to ISO3 (e.g. "SVK") to match the invoice-language check
      // and the heroglyph code. Without these, every customer is missing from
      // the by-country / by-breed breakdown.
      const rawCountry = selections?.country;
      const iso3 = countryISO3(rawCountry);
      track('payment_initiated', { amount: selectedAmount ?? 11, lifeStatus });
      const res = await fetch(CREATE_CHECKOUT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogName,
          ownerName,
          email,
          selections,
          dogPhotoUrl: stablePhotoUrl,
          // Extra fotky z PhotoScreen — create-checkout ich ukladá do
          // dogs.cloudinary_extras. Blob: URL by v DB boli mŕtve, filtrujeme.
          cloudinaryExtras: extraPhotos.filter((u) => u && !u.startsWith('blob:')),
          patronSvg,
          patronSvg2,
          breed: selections?.breed || undefined,
          country: iso3 !== 'XXX' ? iso3 : undefined,
          heroglyphCode,
          amount: selectedAmount ?? 11,
          refCode: getStoredRef(),
          promoCode: promoCode.trim() || undefined,
          language: lang,
          lifeStatus,
          deathDate,
          ...getAttribution(),   // utm_source/medium/campaign/content, first_referrer, first_landing
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error('create-checkout HTTP error:', res.status, errText);
        setPayError(t('payment.error'));
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.promoApplied) {
        setPromoApplied(true);
        track('promo_applied', { code: promoCode.trim() });
      }
      if (data.url) {
        window.open(data.url, '_top');
        // fallback: ak _top navigation zlyha (iframe sandbox), otvor novu zalozku
        setTimeout(() => setLoading(false), 2000);
      } else {
        console.error('create-checkout error:', data.error);
        setPayError(t('payment.error'));
        setLoading(false);
      }
    } catch (err) {
      console.error('payment fetch error:', err);
      setPayError(t('payment.error'));
      setLoading(false);
      setWaitingPhoto(false);
    }
  };

  const basePrice = selectedAmount ?? 11;
  const isPromoValid = promoCode.trim().length > 0;
  // Zľava z reálneho Stripe kupónu (validate-promo) — amount_off je v centoch.
  const discountedPrice = (() => {
    if (!promoApplied || !promoDiscount) return basePrice;
    if (promoDiscount.amountOff != null) return Math.max(0, basePrice - promoDiscount.amountOff / 100);
    if (promoDiscount.percentOff != null) return Math.max(0, basePrice * (1 - promoDiscount.percentOff / 100));
    return basePrice;
  })();
  const effectivePrice = Math.round(discountedPrice * 100) / 100;
  const showDiscount = promoApplied && effectivePrice < basePrice;

  // Zdieľaný box pre promo tlačidlo → rovnaká veľkosť pred aj po klику.
  const promoBtnBox: CSSProperties = {
    minWidth: 92,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
    fontFamily: "'Cinzel', serif",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '0 16px',
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'var(--brand-blue)',
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
                {showDiscount && (
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      textDecoration: 'line-through',
                      opacity: 0.65,
                      marginRight: 10,
                    }}
                  >
                    €{basePrice}
                  </span>
                )}
                €{effectivePrice}
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

            {/* ── 3a. PROMO CODE FIELD — tester perk callout ── */}
            <div className="px-6 pt-4">
              <div
                style={{
                  background: 'rgba(201,154,63,0.10)',
                  border: '1.5px solid rgba(201,154,63,0.45)',
                  borderRadius: 12,
                  padding: '12px 14px',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'hsl(30 20% 20%)',
                    margin: '0 0 10px',
                  }}
                >
                  {t('payment.promo.placeholder')}
                </p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                  {/* ĽAVO — predvyplnený kód + ✓ validácia */}
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value); setPromoLocked(false); setPromoApplied(false); setPromoInvalid(false); setPromoDiscount(null); }}
                      placeholder={t('payment.promo.placeholder')}
                      maxLength={32}
                      readOnly={promoLocked}
                      style={{
                        width: '100%',
                        fontFamily: "'Cinzel', serif",
                        fontSize: 16, // ≥16px → blokuje iOS Safari auto-zoom pri focuse
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        background: promoLocked ? 'rgba(201,154,63,0.12)' : 'rgba(255,255,255,0.55)',
                        border: isPromoValid ? '1.5px solid #C99A3F' : '1.5px solid rgba(31,26,14,0.22)',
                        borderRadius: 8,
                        padding: '10px 34px 10px 12px',
                        color: 'hsl(30 20% 20%)',
                        outline: 'none',
                        opacity: promoLocked ? 0.7 : 1,
                        cursor: promoLocked ? 'default' : 'text',
                      }}
                    />
                    {isPromoValid && (
                      <Check
                        className="h-4 w-4"
                        style={{
                          position: 'absolute',
                          right: 11,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#C99A3F',
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </div>

                  {/* PRAVO — Apply tlačidlo (outlined modré) → po klику filled modré + ✓.
                      Rovnaká veľkosť cez zdieľaný promoBtnBox. */}
                  {promoLocked ? (
                    <div
                      aria-label={t('payment.promo.applied')}
                      style={{
                        ...promoBtnBox,
                        background: 'var(--brand-blue)',
                        color: '#fff',
                      }}
                    >
                      <Check className="h-5 w-5" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={!isPromoValid || promoChecking}
                      style={{
                        ...promoBtnBox,
                        background: 'transparent',
                        color: 'var(--brand-blue)',
                        cursor: isPromoValid && !promoChecking ? 'pointer' : 'not-allowed',
                        opacity: isPromoValid ? 1 : 0.4,
                      }}
                    >
                      {promoChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : t('payment.promo.apply')}
                    </button>
                  )}
                </div>
                {promoInvalid && (
                  <p
                    role="alert"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 11.5,
                      color: '#8a2c1d',
                      margin: '8px 0 0',
                    }}
                  >
                    {t('payment.promo.invalid')}
                  </p>
                )}
              </div>
            </div>

            {/* ── 3b. PAY BUTTON + SECURED ── */}
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

              {payError && (
                <p
                  role="alert"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 12,
                    lineHeight: 1.5,
                    textAlign: 'center',
                    color: '#8a2c1d',
                    background: 'rgba(138,44,29,0.08)',
                    border: '1px solid rgba(138,44,29,0.35)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    margin: '10px 0 0',
                  }}
                >
                  {payError}
                </p>
              )}

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
              }}
            >
              {/* Section heading — eyebrow otázka + zväčšený titul */}
              <p
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'hsl(30 20% 20% / 0.5)',
                  textAlign: 'center',
                  marginBottom: 4,
                  position: 'relative',
                }}
              >
                {t('payment.transparency.eyebrow')}
              </p>
              <p
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--brand-blue)',
                  textAlign: 'center',
                  marginTop: 0,
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
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 9.5,
                  fontStyle: 'italic',
                  opacity: 0.6,
                  textAlign: 'center',
                  margin: '6px 0 0',
                  color: 'hsl(30 20% 20%)',
                }}
              >
                {t('payment.transparency.hint')}
              </p>

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
                    {t(TRANSPARENCY_SPLIT[openTooltip].noteKey)}
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
