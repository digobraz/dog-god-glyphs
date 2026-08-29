import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import { useT, useLang } from '@/i18n/LanguageContext';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import { useFlowKeyboardFix } from '@/hooks/useFlowKeyboardFix';
import { suggestEmailFix } from '@/lib/emailTypo';
import { saveCheckoutDraft, EMAIL_RE } from '@/lib/checkoutDraft';
import { track, identifyUser } from '@/lib/analytics';
import { FLOW_PALE_CSS } from './flowPaleSkin';
import hekthorImg from '@/assets/hekthor.png';

// ── /heroglyph/email — nepovinný e-mail hneď za menom.
//
// Vzniklo 28. 8. 2026. Dovtedy padol e-mail až na checkoute, teda ako 17. krok z 19:
// pred fotkou stálo 83 ľudí, adresu nechalo 24. Pritom kto ju nechá, zaplatí v 96 %.
// Adresa je najcennejšia vec, ktorá z flow padá — a padala najneskôr.
//
// Krok je zámerne BEZ brány. Povinné pole na treťom kroku by zopakovalo presne tú
// chybu, ktorú tento redizajn opravuje pri fotke.
//
// Musí stáť AŽ ZA menom: bez `dogName` sa draft neuloží (viď lib/checkoutDraft.ts).
// Back: /heroglyph/dogs  ·  Continue: /heroglyph/why
//
// ⚠️ ŠAT: prvá obrazovka vstupu v BLEDOM šate (Matej 28. 8., objekt `HF` z LABu).
// Rozmery ani farby sa tu nepíšu — všetko je v `flowPaleSkin.ts`. Susedné kroky
// sú zatiaľ čierne; preklápajú sa postupne, mail je prvý.
export function EmailScreen() {
  useFlowKeyboardFix();
  // Bez mena psa je tento krok bezcenný: draft sa neuloží a texty ukazujú „tvojho psa“.
  // Po obnovení stránky je store prázdny, takže guard vráti človeka na začiatok flow.
  const flowOk = useFlowGuard();
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLang();
  const dogName = useDogyptStore((s) => s.dogName);
  const storedEmail = useDogyptStore((s) => s.email);
  const setEmail = useDogyptStore((s) => s.setEmail);

  const [input, setInput] = useState(storedEmail || '');
  const trimmed = input.trim().toLowerCase();
  const valid = EMAIL_RE.test(trimmed);
  const typoFix = valid ? null : suggestEmailFix(trimmed);
  const savedRef = useRef('');

  // Draft sa zakladá už počas písania (rovnaká cesta ako na checkoute), aby mal
  // záchranný automat komu napísať aj vtedy, keď človek do platby nedôjde.
  useEffect(() => {
    if (!valid || trimmed === savedRef.current) return;
    const timer = setTimeout(() => {
      savedRef.current = trimmed;
      setEmail(trimmed);
      identifyUser(trimmed);
      track('flow_email_entered');
      saveCheckoutDraft(trimmed, lang);
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed, valid]);

  const go = (withEmail: boolean) => {
    if (withEmail && valid) setEmail(trimmed);
    if (!withEmail) track('flow_email_skipped');
    navigate('/heroglyph/why');
  };

  const displayName = dogName || t('heroglyph.flow.yourDogFallback');

  if (!flowOk) return null;

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}</style>

      <div className="hf-topbar flex-shrink-0">
        <PageTopBar onBack={() => navigate('/heroglyph/dogs')} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center">

          <motion.div
            className="hf-bubble"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="hf-hek" />
            <h2>{t('heroglyph.flow.email.title')}</h2>
            <p>{t('heroglyph.flow.email.reason', { dogName: displayName })}</p>
          </motion.div>

          <motion.div
            className="hf-block"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="hf-plate">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && valid) go(true); }}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder={t('heroglyph.flow.email.placeholder')}
                className={`hf-field${valid ? ' is-valid' : ''}`}
              />

              {typoFix && (
                <button type="button" className="hf-hint" onClick={() => setInput(typoFix)}>
                  {t('heroglyph.checkout.emailTypo', { suggestion: typoFix })}
                </button>
              )}

              <button type="button" className="hf-cta" onClick={() => go(true)} disabled={!valid}>
                {t('heroglyph.flow.name.continue')}
              </button>

              {/* Preskočenie — malým písmom, aby bolo dostupné a nie ponúkané. */}
              <button type="button" className="hf-skip" onClick={() => go(false)}>
                {t('heroglyph.flow.email.skip')}
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
