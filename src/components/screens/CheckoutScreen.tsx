import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDogyptStore } from '@/store/dogyptStore';
import { useT, useLang } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { PageTopBar } from '@/components/PageTopBar';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { COUNTRIES } from '@/lib/flowCountries';
import { suggestEmailFix } from '@/lib/emailTypo';
import { getStoredRef } from '@/lib/refCapture';
import { getAttribution } from '@/lib/attribution';
import { track, identifyUser } from '@/lib/analytics';
import { saveCheckoutDraft } from '@/lib/checkoutDraft';


export function CheckoutScreen() {
  const navigate = useNavigate();
  const t = useT();
  const dogName = useDogyptStore((s) => s.dogName);
  const dogPhotoUrl = useDogyptStore((s) => s.dogPhotoUrl);
  const setSelectedAmount = useDogyptStore((s) => s.setSelectedAmount);
  const setEmail = useDogyptStore((s) => s.setEmail);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const storedOwnerName = useDogyptStore((s) => s.ownerName);
  const storedEmail = useDogyptStore((s) => s.email);

  // Route guard — bez dogName (rozrobený flow nebol dokončený) → reset na začiatok
  useEffect(() => {
    if (!dogName) {
      navigate('/heroglyph', { replace: true });
    }
  }, [dogName, navigate]);

  // Prefill z predošlých krokov flow — ownerName (owner-info krok) a email
  // (ak už bol zadaný, napr. návrat z /payment cez Back). User môže stále prepísať.
  const [firstName, setFirstName] = useState(() => storedOwnerName.trim().split(/\s+/)[0] || '');
  const [lastName, setLastName] = useState(() => {
    const parts = storedOwnerName.trim().split(/\s+/);
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  });
  const [email, setLocalEmail] = useState(() => storedEmail || '');
  // Billing address fields (owner/payer) → saved to selections.bill* → DB bill_* columns
  const [billStreet, setBillStreet] = useState('');
  const [billCity, setBillCity] = useState('');
  const [billZip, setBillZip] = useState('');
  // billCountry = owner's billing country (NOT dog's country — that lives in selections.country set on /heroglyph/about)
  const [country, setCountry] = useState('');
  const [showCountries, setShowCountries] = useState(false);

  // Click-to-validate (2026-07-11) — tlačidlo Continue je vždy aktívne (gold,
  // nie disabled/sivé). Na klik s neplatným formulárom nenavigujeme, namiesto
  // toho scrollneme + zafokusujeme prvé chýbajúce pole a ukážeme inline hlášku.
  const [invalidField, setInvalidField] = useState<string | null>(null);
  const [showValidationMsg, setShowValidationMsg] = useState(false);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const billStreetRef = useRef<HTMLInputElement>(null);
  const billCityRef = useRef<HTMLInputElement>(null);
  const billZipRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLInputElement>(null);

  const clearInvalid = (field: string) => {
    if (invalidField === field) {
      setInvalidField(null);
      setShowValidationMsg(false);
    }
  };

  const filteredCountries = useMemo(() => {
    if (!country) return [];
    return COUNTRIES.filter((c) => c.toLowerCase().includes(country.toLowerCase())).slice(0, 5);
  }, [country]);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = EMAIL_RE.test(email.trim());

  // Preklep v doméne (`gmial.com`) — jeden klik ho opraví. Lokálnu časť
  // (`cabane` vs `cabanek`, člen #60) takto chytiť NEJDE; tú si musí prečítať
  // človek na /payment. Viď lib/emailTypo.ts.
  const emailSuggestion = useMemo(
    () => (isEmailValid ? suggestEmailFix(email) : null),
    [email, isEmailValid],
  );

  // ── Abandoned-cart zber (2026-07-10) ──────────────────────────────────────
  // 14 z 22 checkout-odídencov nikdy neklikne Continue → email zachytávame hneď,
  // ako je v poli platný (debounce 1,2 s): posthog.identify + draft riadok v DB
  // (save-checkout-draft). Draft = rozrobený pes so všetkým zo store → záchranný
  // mail vie poslať Resume&Pay link rovno na Stripe. Fire-and-forget, žiadna
  // chyba nesmie blokovať checkout.
  const { lang } = useLang();
  const lastSavedEmailRef = useRef('');

  const saveDraft = (emailVal: string) => saveCheckoutDraft(emailVal, lang);

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

  // ── PREČÍTAJ POLE Z DOM, NIE ZO STAVU (2026-08-28) ────────────────────────
  // Nahrávka odchodu (PostHog 01a0041c) ukazuje človeka, ktorý formulár vyplnil,
  // klikol POKRAČOVAŤ a **Priezvisko mu sčervenelo, hoci vyplnené bolo** — potom
  // sa vrátil a už neprišiel. Príčinu z kódu dokázať nevieme, ale celá tá trieda
  // chýb má jeden tvar: prehliadač (autofill, správca hesiel, iOS kontaktná karta)
  // zapíše hodnotu priamo do `input.value` bez udalosti, ktorú by React zachytil.
  // Pole je vtedy VIDITEĽNE vyplnené a stav prázdny — presne to, čo videl on.
  //
  // Namiesto hádania príčiny sa pri odosielaní pýtame DOM-u, teda toho istého
  // zdroja, na ktorý sa pozerá človek. Ak sa hodnoty líšia, stav sa dorovná.
  // ⚠️ Validuje sa NAD `v.*`, nie nad stavom — `setState` je asynchrónny a v tom
  // istom kliku by sme si znova prečítali staré prázdno.
  const domValues = () => ({
    firstName: (firstNameRef.current?.value ?? firstName).trim(),
    lastName:  (lastNameRef.current?.value  ?? lastName).trim(),
    email:     (emailRef.current?.value     ?? email).trim(),
    billStreet:(billStreetRef.current?.value?? billStreet).trim(),
    billCity:  (billCityRef.current?.value  ?? billCity).trim(),
    billZip:   (billZipRef.current?.value   ?? billZip).trim(),
    country:   (countryRef.current?.value   ?? country).trim(),
  });

  const handleContinue = () => {
    const v = domValues();
    // Dorovnanie stavu — aby sa pole po kliku prestalo tváriť ako prázdne aj v Reacte.
    if (v.firstName !== firstName.trim()) setFirstName(v.firstName);
    if (v.lastName !== lastName.trim()) setLastName(v.lastName);
    if (v.email !== email.trim()) setLocalEmail(v.email);
    if (v.billStreet !== billStreet.trim()) setBillStreet(v.billStreet);
    if (v.billCity !== billCity.trim()) setBillCity(v.billCity);
    if (v.billZip !== billZip.trim()) setBillZip(v.billZip);
    if (v.country !== country.trim()) setCountry(v.country);

    const validNow =
      !!v.firstName && !!v.lastName && EMAIL_RE.test(v.email.toLowerCase()) &&
      !!v.billStreet && !!v.billCity && !!v.billZip && !!v.country;

    if (!validNow) {
      // Nájdi prvé chýbajúce/nevalidné pole v poradí ako sú vo formulári,
      // scrollni naň + zafokusuj + zvýrazni, namiesto tichého no-op.
      const fields: Array<[string, boolean, typeof firstNameRef]> = [
        ['firstName', !!v.firstName, firstNameRef],
        ['lastName', !!v.lastName, lastNameRef],
        ['email', EMAIL_RE.test(v.email.toLowerCase()), emailRef],
        ['billStreet', !!v.billStreet, billStreetRef],
        ['billCity', !!v.billCity, billCityRef],
        ['billZip', !!v.billZip, billZipRef],
        ['country', !!v.country, countryRef],
      ];
      const firstInvalid = fields.find(([, valid]) => !valid);
      if (firstInvalid) {
        const [field, , ref] = firstInvalid;
        setInvalidField(field);
        setShowValidationMsg(true);
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        ref.current?.focus();
      }
      return;
    }
    setInvalidField(null);
    setShowValidationMsg(false);
    setSelectedAmount(11);
    setEmail(v.email);
    // Save billing info to selections.* — create-checkout reads these and
    // maps to DB bill_* columns. bill_name is the payer's legal name (separate
    // from owner_name/OwnerInfoScreen cartouche name). selections.country (dog's
    // country) is intentionally NOT set here — it was set on /heroglyph/about screen.
    setSelection('billName', `${v.firstName} ${v.lastName}`);
    setSelection('billStreet', v.billStreet);
    setSelection('billCity', v.billCity);
    setSelection('billZip', v.billZip);
    setSelection('billCountry', v.country);
    // Zustand set je synchrónny → getState() v saveDraft už vidí bill*.
    // Update draftu s fakturačnými údajmi (fire-and-forget, nečakáme).
    saveDraft(v.email);
    navigate('/payment');
  };

  const inputClass =
    'w-full rounded-xl border-2 border-border/60 bg-background/50 px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors';
  const invalidClass = ' border-red-400 ring-2 ring-red-400/40';
  const fieldClass = (field: string) => inputClass + (invalidField === field ? invalidClass : '');

  if (!dogName) return null;

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* Logo */}
      <PageTopBar />

      <div className="flex-1 flex flex-col items-center px-4 py-4 overflow-y-auto">
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
                <input ref={firstNameRef} aria-invalid={invalidField === 'firstName'} type="text" placeholder={t('heroglyph.checkout.firstName')} value={firstName} onChange={(e) => { setFirstName(e.target.value); clearInvalid('firstName'); }} className={fieldClass('firstName')} style={{ fontFamily: "'Space Grotesk', sans-serif" }} autoComplete="given-name" />
                <input ref={lastNameRef} aria-invalid={invalidField === 'lastName'} type="text" placeholder={t('heroglyph.checkout.lastName')} value={lastName} onChange={(e) => { setLastName(e.target.value); clearInvalid('lastName'); }} className={fieldClass('lastName')} style={{ fontFamily: "'Space Grotesk', sans-serif" }} autoComplete="family-name" />
              </div>
              <input ref={emailRef} aria-invalid={invalidField === 'email'} type="email" placeholder={t('heroglyph.checkout.email')} value={email} onChange={(e) => { setLocalEmail(e.target.value); clearInvalid('email'); }} className={fieldClass('email')} style={{ fontFamily: "'Space Grotesk', sans-serif" }} autoComplete="email" />
              {email.trim() && !isEmailValid && (
                <p className="text-[11px] text-red-400/80 px-1 -mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Enter a valid email address
                </p>
              )}
              {emailSuggestion && (
                <button
                  type="button"
                  onClick={() => { setLocalEmail(emailSuggestion); track('checkout_email_typo_fixed'); }}
                  className="text-[11px] text-primary/90 hover:text-primary underline underline-offset-2 px-1 -mt-0.5 text-left"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {t('heroglyph.checkout.emailTypo').replace('{suggestion}', emailSuggestion)}
                </button>
              )}
              {/* Billing address — required for invoice (SK law) */}
              <input ref={billStreetRef} aria-invalid={invalidField === 'billStreet'} type="text" placeholder={t('heroglyph.checkout.street')} value={billStreet} onChange={(e) => { setBillStreet(e.target.value); clearInvalid('billStreet'); }} className={fieldClass('billStreet')} style={{ fontFamily: "'Space Grotesk', sans-serif" }} autoComplete="street-address" />
              <div className="flex gap-1.5">
                <input ref={billCityRef} aria-invalid={invalidField === 'billCity'} type="text" placeholder={t('heroglyph.checkout.city')} value={billCity} onChange={(e) => { setBillCity(e.target.value); clearInvalid('billCity'); }} className={fieldClass('billCity')} style={{ fontFamily: "'Space Grotesk', sans-serif" }} autoComplete="address-level2" />
                <input ref={billZipRef} aria-invalid={invalidField === 'billZip'} type="text" placeholder={t('heroglyph.checkout.zip')} value={billZip} onChange={(e) => { setBillZip(e.target.value); clearInvalid('billZip'); }} className={fieldClass('billZip')} style={{ fontFamily: "'Space Grotesk', sans-serif", maxWidth: 110 }} autoComplete="postal-code" />
              </div>
              <div className="relative">
                <input
                  ref={countryRef}
                  aria-invalid={invalidField === 'country'}
                  type="text"
                  placeholder={t('heroglyph.checkout.country')}
                  value={country}
                  onChange={(e) => { setCountry(e.target.value); setShowCountries(true); clearInvalid('country'); }}
                  onFocus={() => country && setShowCountries(true)}
                  onBlur={() => setTimeout(() => setShowCountries(false), 150)}
                  className={fieldClass('country')}
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

            {/* CTA inside card — vždy vizuálne aktívne (gold); validácia beží na klik,
                nie cez disabled, aby button nikdy nevyzeral „rozbito" (2026-07-11 fix). */}
            <div className="mt-2.5 px-1">
              <Button
                onClick={handleContinue}
                className="w-full rounded-xl py-4 text-base font-bold tracking-wider hover:scale-[1.02] transition-transform"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                  color: '#000',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
                }}
              >
                {t('heroglyph.checkout.cta')}
              </Button>
              {showValidationMsg && (
                <p role="alert" className="text-[11px] text-red-400/80 text-center mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {t('heroglyph.checkout.fillAllFields')}
                </p>
              )}
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