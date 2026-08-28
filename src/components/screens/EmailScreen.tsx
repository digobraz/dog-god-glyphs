import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDogyptStore } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import { useT, useLang } from '@/i18n/LanguageContext';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import { useFlowKeyboardFix } from '@/hooks/useFlowKeyboardFix';
import { suggestEmailFix } from '@/lib/emailTypo';
import { saveCheckoutDraft, EMAIL_RE } from '@/lib/checkoutDraft';
import { track, identifyUser } from '@/lib/analytics';

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
// Back: /heroglyph/name  ·  Continue: /heroglyph/about
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
    navigate('/heroglyph/about');
  };

  const displayName = dogName || t('heroglyph.flow.yourDogFallback');

  if (!flowOk) return null;

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <PageTopBar onBack={() => navigate('/heroglyph/name')} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 md:gap-4">

          <motion.div
            className="w-full rounded-2xl p-4 md:p-5"
            style={{ background: 'var(--brand-gradient)' }}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <h2
              className="text-center text-lg md:text-xl font-bold leading-snug"
              style={{ fontFamily: "'Cinzel', serif", color: '#FAF4EC' }}
            >
              {t('heroglyph.flow.email.title')}
            </h2>
            <p
              className="text-center text-xs md:text-sm mt-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(250,244,236,0.72)' }}
            >
              {t('heroglyph.flow.email.reason', { dogName: displayName })}
            </p>
          </motion.div>

          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex flex-col gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
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
              className="w-full rounded-xl px-4 py-3 border-2 transition-colors"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '16px',
                textAlign: 'center',
                background: valid ? 'hsl(224 60% 45% / 0.10)' : 'hsl(var(--card))',
                borderColor: valid ? 'hsl(224 60% 45%)' : 'rgba(47, 107, 255, 0.30)',
                color: 'hsl(var(--foreground))',
                outline: 'none',
              }}
            />

            {typoFix && (
              <button
                type="button"
                onClick={() => setInput(typoFix)}
                className="text-center text-xs underline decoration-dotted"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'hsl(var(--gold))' }}
              >
                {t('heroglyph.checkout.emailTypo', { suggestion: typoFix })}
              </button>
            )}

            <Button
              onClick={() => go(true)}
              disabled={!valid}
              className="w-full rounded-xl gap-2 h-10 md:h-11 font-bold tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                color: '#000',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
              }}
            >
              {t('heroglyph.flow.name.continue')}
            </Button>

            {/* Preskočenie — malým písmom, aby bolo dostupné a nie ponúkané. */}
            <button
              type="button"
              onClick={() => go(false)}
              className="text-center text-[11px] tracking-wide underline decoration-dotted"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(14,14,14,0.55)' }}
            >
              {t('heroglyph.flow.email.skip')}
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
