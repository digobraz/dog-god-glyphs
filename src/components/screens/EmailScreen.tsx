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
import { hekthorFace } from '@/lib/hekthorFaces';
import { FlowMedallion, FLOW_MEDAL_CSS } from './flowMedallion';

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
/** Rozmer odvodený z OKNA (nie z vykresleného prvku) — prepočíta sa pri resize. */
function useWinSize(f: (w: number, h: number) => number) {
  const calc = () => (typeof window === 'undefined' ? f(1280, 900) : f(window.innerWidth, window.innerHeight));
  const [v, setV] = useState(calc);
  useEffect(() => {
    const on = () => setV(calc());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}

export function EmailScreen() {
  useFlowKeyboardFix();
  // Bez mena psa je tento krok bezcenný: draft sa neuloží a texty ukazujú „tvojho psa“.
  // Po obnovení stránky je store prázdny, takže guard vráti človeka na začiatok flow.
  const flowOk = useFlowGuard();
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLang();
  const dogName = useDogyptStore((s) => s.dogName);
  const extraDogs = useDogyptStore((s) => s.extraDogs);
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

  // ── VETA SA MENÍ PODĽA TOHO, KOĽKO PSOV ČLOVEK PRIVIEDOL (Matej 31. 8.) ────
  // *„musí rozlišovať či človek robí pre jedného psa alebo viacerých psov… čiže
  // texting: Tvorba heroglyfu pre HEktora(,xxx,yyy,zzz,) trvá zhruba 3 minúty
  // (4,5,6…minút) zanechaj nám email nech sa ti email nestratí."*
  //
  // Odhad času rastie s počtom psov presne podľa jeho zátvorky: 1 pes = 3 min,
  // 2 = 4, 3 = 5 ⇒ `2 + počet`. Nie je to meranie, je to sľub — a musí byť
  // radšej mierne štedrý než tesný.
  //
  // ⚠️ Mená stoja v NOMINATÍVE za slovom „psa"/„psov". Matejova veta znela
  // „pre HEktora", lenže skloňovanie mena sa v slovenčine nedá odvodiť: HEKTOR →
  // Hektora, ale BELLA → Bellu, CINDY → Cindy, MAXI → Maxiho. Veta „pre psa
  // HEKTOR" drží gramatiku pri každom mene a je to zároveň tvar, aký tento kľúč
  // mal už predtým.
  const dogNames = [displayName, ...extraDogs.map((d) => d.name.trim()).filter(Boolean)];
  const manyDogs = dogNames.length > 1;
  const nameList = manyDogs
    ? `${dogNames.slice(0, -1).join(', ')} ${t('heroglyph.flow.email.and')} ${dogNames[dogNames.length - 1]}`
    : dogNames[0];
  const minutes = dogNames.length + 2;
  // SK: 3–4 „minúty", 5+ „minút". EN má jeden tvar, kľúče sú tam zhodné.
  const minuteWord = t(minutes >= 5 ? 'heroglyph.flow.email.minMany' : 'heroglyph.flow.email.minFew');

  // ── PRIEMER MEDAILÓNU (24. 9. 2026) ────────────────────────────────────────
  // Matej: *„tu musí byť čo najväčšie Hektorova fotka"* + *„pridaj obruč,
  // veľkosť potom doladíme"*.
  // 🔴 Obruč berie 8 % priemeru na KAŽDEJ strane, takže samotná fotka je 84 %
  //    z tohto čísla — 260 znamená psa 218 px. Preto je strop vyšší než tých
  //    200/240, ktoré mala fotka bez rámu.
  // Rovnica, nie pevné číslo: menšia z polovice šírky a tretiny výšky okna.
  // Na 1280×900 vyjde strop 260, na 390×740 dvestoštrnásť, na nízkom okne klesne sama.
  const medallion = useWinSize(
    (w, h) => Math.round(Math.max(160, Math.min(260, Math.min(w * 0.55, h * 0.30)))),
  );

  if (!flowOk) return null;

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}{FLOW_MEDAL_CSS}</style>

      <div className="hf-topbar flex-shrink-0">
        <PageTopBar onBack={() => navigate('/heroglyph/dogs')} />
      </div>

      <div className="hf-stage">
        <div className="w-full max-w-xl flex flex-col items-center">

          <motion.div
            className="hf-bubble"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* ⚠️ KSICHT PODĽA KROKU, nie jedna fotka pre celý vstup. Do 24. 9.
                2026 tu bol import `assets/hekthor.png`, takže táto obrazovka ako
                jediná obchádzala sadu `hekthorFaces` — a Matejov výber ksichtu
                sa jej nemohol dotknúť.
                🔁 A od 24. 9. má aj OBRUČ — ten istý odliatok ako kroky mena
                a svorky (Matej: *„prečo nemá okolo fotky obruč ako na prvých
                dvoch?"*). Bol to holý `<img class="hf-hek">`, jediný ksicht vo
                vstupe bez rámu; veľkosť sa ešte bude ladiť. */}
            <FlowMedallion src={hekthorFace('email')} size={medallion} className="hf-medal" />
            <h2>{t('heroglyph.flow.email.title')}</h2>
            <p>{t(manyDogs ? 'heroglyph.flow.email.reasonMany' : 'heroglyph.flow.email.reasonOne', {
              names: nameList,
              minutes: String(minutes),
              minuteWord,
            })}</p>
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
