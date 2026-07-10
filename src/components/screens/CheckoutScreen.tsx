import { useState, useMemo, useEffect, useRef } from 'react';
import { useFlowKeyboardFix } from '@/hooks/useFlowKeyboardFix';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDogyptStore } from '@/store/dogyptStore';
import { useT, useLang } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { PageTopBar } from '@/components/PageTopBar';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { buildHeroglyphCode, countryISO3 } from '@/lib/heroglyphCode';
import { getStoredRef } from '@/lib/refCapture';
import { getAttribution } from '@/lib/attribution';
import { track, identifyUser } from '@/lib/analytics';
import { EDGE_BASE } from '@/lib/env';

const SAVE_DRAFT_URL = `${EDGE_BASE}/save-checkout-draft`;

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia',
  'Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon',
  'Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia',
  'Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominican Republic','Ecuador','Egypt','El Salvador',
  'Estonia','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece',
  'Guatemala','Guinea','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland',
  'Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia',
  'Lebanon','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malaysia','Maldives','Mali','Malta',
  'Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nepal',
  'Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Macedonia','Norway','Oman','Pakistan',
  'Panama','Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda',
  'Saudi Arabia','Senegal','Serbia','Singapore','Slovakia','Slovenia','Somalia','South Africa','South Korea',
  'Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan','Tanzania','Thailand','Tunisia',
  'Turkey','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
  'Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

export function CheckoutScreen() {
  const navigate = useNavigate();
  const t = useT();
  const dogName = useDogyptStore((s) => s.dogName);
  const dogPhotoUrl = useDogyptStore((s) => s.dogPhotoUrl);
  const setSelectedAmount = useDogyptStore((s) => s.setSelectedAmount);
  const setEmail = useDogyptStore((s) => s.setEmail);
  const setSelection = useDogyptStore((s) => s.setSelection);

  useFlowKeyboardFix();

  // Route guard — bez dogName (rozrobený flow nebol dokončený) → reset na začiatok
  useEffect(() => {
    if (!dogName) {
      navigate('/heroglyph', { replace: true });
    }
  }, [dogName, navigate]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setLocalEmail] = useState('');
  // Billing address fields (owner/payer) → saved to selections.bill* → DB bill_* columns
  const [billStreet, setBillStreet] = useState('');
  const [billCity, setBillCity] = useState('');
  const [billZip, setBillZip] = useState('');
  // billCountry = owner's billing country (NOT dog's country — that lives in selections.country set on /name)
  const [country, setCountry] = useState('');
  const [showCountries, setShowCountries] = useState(false);

  const filteredCountries = useMemo(() => {
    if (!country) return [];
    return COUNTRIES.filter((c) => c.toLowerCase().includes(country.toLowerCase())).slice(0, 5);
  }, [country]);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = EMAIL_RE.test(email.trim());

  // ── Abandoned-cart zber (2026-07-10) ──────────────────────────────────────
  // 14 z 22 checkout-odídencov nikdy neklikne Continue → email zachytávame hneď,
  // ako je v poli platný (debounce 1,2 s): posthog.identify + draft riadok v DB
  // (save-checkout-draft). Draft = rozrobený pes so všetkým zo store → záchranný
  // mail vie poslať Resume&Pay link rovno na Stripe. Fire-and-forget, žiadna
  // chyba nesmie blokovať checkout.
  const lang = useLang();
  const draftIdRef = useRef<string | null>(null);
  const lastSavedEmailRef = useRef('');

  const saveDraft = (emailVal: string) => {
    const s = useDogyptStore.getState();
    if (!s.dogName) return;
    const heroglyphCode = buildHeroglyphCode({
      dogName: s.dogName,
      ownerName: s.ownerName,
      patronSvg: s.patronSvg,
      breed: s.selections?.breed,
      patronCategory: s.selections?.patronCategory,
      country: s.selections?.country,
      selections: s.selections,
    });
    const iso3 = countryISO3(s.selections?.country);
    fetch(SAVE_DRAFT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        draftId: draftIdRef.current ?? undefined,
        dogName: s.dogName,
        ownerName: s.ownerName,
        email: emailVal.trim(),
        selections: s.selections,
        dogPhotoUrl: s.dogPhotoUrl,
        cloudinaryExtras: s.extraPhotos.filter((u) => u && !u.startsWith('blob:')),
        patronSvg: s.patronSvg,
        patronSvg2: s.patronSvg2,
        breed: s.selections?.breed || undefined,
        country: iso3 !== 'XXX' ? iso3 : undefined,
        heroglyphCode,
        refCode: getStoredRef(),
        language: lang,
        lifeStatus: s.lifeStatus,
        deathDate: s.deathDate,
        ...getAttribution(),
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.draftId) draftIdRef.current = d.draftId; })
      .catch(() => { /* draft je best-effort, checkout nesmie trpieť */ });
  };

  useEffect(() => {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed) || trimmed === lastSavedEmailRef.current) return;
    const timer = setTimeout(() => {
      lastSavedEmailRef.current = trimmed;
      identifyUser(trimmed);
      track('checkout_email_entered');
      saveDraft(trimmed);
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);
  // ──────────────────────────────────────────────────────────────────────────

  const isValid =
    firstName.trim() &&
    lastName.trim() &&
    isEmailValid &&
    billStreet.trim() &&
    billCity.trim() &&
    billZip.trim() &&
    country.trim();

  const handleContinue = () => {
    if (!isValid) return;
    setSelectedAmount(11);
    setEmail(email);
    // Save billing info to selections.* — create-checkout reads these and
    // maps to DB bill_* columns. bill_name is the payer's legal name (separate
    // from owner_name/OwnerInfoScreen cartouche name). selections.country (dog's
    // country) is intentionally NOT set here — it was set on /name screen.
    setSelection('billName', `${firstName.trim()} ${lastName.trim()}`);
    setSelection('billStreet', billStreet.trim());
    setSelection('billCity', billCity.trim());
    setSelection('billZip', billZip.trim());
    setSelection('billCountry', country.trim());
    // Zustand set je synchrónny → getState() v saveDraft už vidí bill*.
    // Update draftu s fakturačnými údajmi (fire-and-forget, nečakáme).
    saveDraft(email);
    navigate('/payment');
  };

  const inputClass =
    'w-full rounded-xl border-2 border-border/60 bg-background/50 px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors';

  if (!dogName) return null;

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* Logo */}
      <PageTopBar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="w-full max-w-xl flex flex-col items-center gap-1.5">
          {/* ORDER SUMMARY card */}
          <motion.div
            className="w-full rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)), hsl(var(--gold)))',
              padding: '2px',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="rounded-[0.875rem] papyrus-bg p-2.5 md:p-4">
              <h2
                className="text-center text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-primary mb-2"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {t('heroglyph.checkout.orderSummary')}
              </h2>

              {/* Dog photo + heroglyph preview */}
              <div className="flex flex-col items-center gap-2 py-2">
                {/* Raw dog photo */}
                {dogPhotoUrl && (
                  <div
                    className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0"
                    style={{
                      border: '3px solid hsl(var(--gold))',
                      boxShadow: '0 0 16px hsl(var(--gold) / 0.25)',
                    }}
                  >
                    <img src={dogPhotoUrl} alt={dogName || t('heroglyph.checkout.dogFallback')} className="w-full h-full object-cover" />
                  </div>
                )}
                {/* Full heroglyph */}
                <div className="w-[130px]">
                  <HeroglyphFrame showOwner className="text-foreground" />
                </div>
                {dogName && (
                  <span
                    className="text-[22px] font-bold tracking-[0.15em] uppercase text-primary"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {dogName}
                  </span>
                )}
              </div>

              {/* Product line */}
              <div
                className="flex justify-between items-center rounded-xl px-3 py-2"
                style={{ background: 'linear-gradient(135deg, hsl(var(--gold) / 0.08), hsl(var(--gold) / 0.15))' }}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] tracking-widest uppercase text-foreground/50" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {t('heroglyph.checkout.dogPossessive', { dogName: dogName || t('heroglyph.checkout.yourDogFallback') })}
                  </span>
                  <span className="text-base md:text-lg font-bold tracking-[0.15em] uppercase text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                    {t('heroglyph.checkout.heroglyph')}
                  </span>
                </div>
                <span className="text-lg md:text-xl font-bold text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                  €11
                </span>
              </div>

            </div>
          </motion.div>

          {/* YOUR DETAILS card */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-2.5 md:p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <h2
              className="text-center text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-primary mb-2"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {t('heroglyph.checkout.yourDetails')}
            </h2>

            <div
              className="flex flex-col gap-1.5"
              style={{
                position: 'relative',
                // .papyrus-bg > * dáva každému dieťaťu z-index:1 → inputs aj button = súrodenecké
                // stacking contexty, button je v DOM neskôr a prekreslí dropdown. Keď je dropdown
                // otvorený, zdvihni CELÝ inputs container nad button container.
                zIndex: showCountries && filteredCountries.length > 0 ? 5 : undefined,
              }}
            >
              <div className="flex gap-1.5">
                <input type="text" placeholder={t('heroglyph.checkout.firstName')} value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
                <input type="text" placeholder={t('heroglyph.checkout.lastName')} value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
              </div>
              <input type="email" placeholder={t('heroglyph.checkout.email')} value={email} onChange={(e) => setLocalEmail(e.target.value)} className={inputClass} style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
              {email.trim() && !isEmailValid && (
                <p className="text-[11px] text-red-400/80 px-1 -mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Enter a valid email address
                </p>
              )}
              {/* Billing address — required for invoice (SK law) */}
              <input type="text" placeholder={t('heroglyph.checkout.street')} value={billStreet} onChange={(e) => setBillStreet(e.target.value)} className={inputClass} style={{ fontFamily: "'Space Grotesk', sans-serif" }} autoComplete="street-address" />
              <div className="flex gap-1.5">
                <input type="text" placeholder={t('heroglyph.checkout.city')} value={billCity} onChange={(e) => setBillCity(e.target.value)} className={inputClass} style={{ fontFamily: "'Space Grotesk', sans-serif" }} autoComplete="address-level2" />
                <input type="text" placeholder={t('heroglyph.checkout.zip')} value={billZip} onChange={(e) => setBillZip(e.target.value)} className={inputClass} style={{ fontFamily: "'Space Grotesk', sans-serif", maxWidth: 110 }} autoComplete="postal-code" />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('heroglyph.checkout.country')}
                  value={country}
                  onChange={(e) => { setCountry(e.target.value); setShowCountries(true); }}
                  onFocus={() => country && setShowCountries(true)}
                  onBlur={() => setTimeout(() => setShowCountries(false), 150)}
                  className={inputClass}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                />
                {showCountries && filteredCountries.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border-2 border-border/40 bg-background shadow-lg max-h-32 overflow-y-auto">
                    {filteredCountries.map((c) => (
                      <button
                        key={c}
                        onMouseDown={() => { setCountry(c); setShowCountries(false); }}
                        className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-primary/10 transition-colors"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CTA inside card */}
            <div className="mt-2.5 px-1">
              <Button
                onClick={handleContinue}
                disabled={!isValid}
                className="w-full rounded-xl py-4 text-base font-bold tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-30"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                  color: '#000',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
                }}
              >
                {t('heroglyph.checkout.cta')}
              </Button>
            </div>

            {/* Disclaimer inside card */}
            <p className="text-primary/50 text-[10px] text-center leading-relaxed px-2 mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {t('heroglyph.checkout.disclaimerPrefix')}<span className="text-primary font-bold uppercase">{t('heroglyph.checkout.disclaimerHighlight')}</span>{t('heroglyph.checkout.disclaimerSuffix')}
            </p>
          </motion.div>

          {/* Back link outside card */}
          <button
            onClick={() => navigate('/heroglyph/message')}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <ArrowLeft className="h-3 w-3" /> {t('heroglyph.checkout.back')}
          </button>
        </div>
      </div>
    </div>
  );
}