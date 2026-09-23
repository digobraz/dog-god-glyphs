import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import hekthorImg from '@/assets/hekthor.png';
import { DateDropdowns } from '@/components/DateDropdowns';
import { useT } from '@/i18n/LanguageContext';
import { LifeStatusPick, DeathDateModal } from '@/components/screens/lifeStatusPick';
import { useFlowKeyboardFix } from '@/hooks/useFlowKeyboardFix';
import { useBlockAutocorrect } from '@/hooks/useBlockAutocorrect';
import { countryFlag } from '@/lib/countryGeo';
import { NEW_HEROFLOW } from '@/lib/flowMode';
import { hekthorFace } from '@/lib/hekthorFaces';
import { FlowMedallion } from '@/components/screens/flowMedallion';

// Android keyboards (Gboard/Samsung) ignore autoCorrect/autoComplete="off" and may
// silently swap a typed word for a predicted one (e.g. BELGA → BELGICKO). We can't
// stop that from the web, so on Android only we surface the exact captured value
// under the field — the user sees what will actually be baked into the heroglyph.
// iOS/desktop respect the attributes, so they get nothing (no clutter).
const IS_ANDROID = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

/** Premena príchodovej fázy na formulárovú — jeden prechod pre všetky prvky,
 *  aby sa blok, medailón a otázka hýbali ako jedna vec, nie ako tri. */
const MORPH = { duration: 0.52, ease: [0.2, 0.8, 0.3, 1] } as const;

// Countries list shared with CheckoutScreen (owner billing country).
// Used here for dog's country of origin / home country.
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

// ── Name Entry Modal ─────────────────────────────────────────────────────────
// Always mounted & portaled to document.body. Two things matter on iOS:
//  1) The keyboard only opens if input.focus() runs synchronously inside the
//     tap gesture on an element ALREADY in the DOM — so the input is kept mounted
//     and the trigger focuses it via ref (see NameScreen preview button).
//  2) The card is vertically centered inside the *visual viewport* (the area left
//     above the keyboard), so it's never glued to the top nor hidden behind the
//     keyboard.
interface NameModalProps {
  open: boolean;
  value: string;
  placeholder: string;
  title: string;
  doneLabel: string;
  closeLabel: string;
  rootRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  onChange: (v: string) => void;
  onDone: () => void;
  onClose: () => void;
}

function NameModal({ open, value, placeholder, title, doneLabel, closeLabel, rootRef, inputRef, onChange, onDone, onClose }: NameModalProps) {
  // Block Android auto-correct word swaps (BELGA → BELGICKO) at the source.
  useBlockAutocorrect(inputRef);
  // Track the visual viewport so the card stays centered above the soft keyboard.
  const [vp, setVp] = useState<{ top: number; height: number }>({ top: 0, height: 0 });
  useEffect(() => {
    const v = window.visualViewport;
    const update = () => {
      if (v) setVp({ top: v.offsetTop, height: v.height });
      else setVp({ top: 0, height: window.innerHeight });
    };
    update();
    v?.addEventListener('resize', update);
    v?.addEventListener('scroll', update);
    return () => {
      v?.removeEventListener('resize', update);
      v?.removeEventListener('scroll', update);
    };
  }, []);

  const canDone = value.trim().length >= 1;

  return createPortal(
    <div
      ref={rootRef}
      className={`name-modal-root ${open ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      style={{ top: vp.top, height: vp.height || undefined }}
    >
      <div className="name-modal-backdrop" onClick={onClose} />
      <div className="name-modal-card">
        <button type="button" className="name-modal-close" aria-label={closeLabel} onClick={onClose}>✕</button>
        <p className="name-modal-title">{title}</p>
        <div className="name-modal-inputwrap">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 30))}
            onKeyDown={(e) => { if (e.key === 'Enter' && canDone) onDone(); }}
            placeholder={placeholder}
            maxLength={30}
            enterKeyHint="done"
            /* No browser/iOS contact autofill suggestions for a dog's name. */
            name="dogName"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
            className="name-modal-input"
          />
        </div>
        {IS_ANDROID && value.trim().length > 0 && (
          <p className="name-modal-confirm" aria-live="polite">→ <b>{value.trim()}</b></p>
        )}
        <button type="button" className="name-modal-done" onClick={onDone} disabled={!canDone}>{doneLabel}</button>
      </div>

      <style>{`
        .name-modal-root {
          position: fixed; left: 0; right: 0; z-index: 2100;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding-left: 16px; padding-right: 16px;
          opacity: 0; pointer-events: none;
          transition: opacity 160ms ease;
        }
        .name-modal-root.is-open { opacity: 1; pointer-events: auto; }
        .name-modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.78);
          -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
        }
        .name-modal-card {
          position: relative; z-index: 1; width: 100%; max-width: 520px;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid rgba(201, 154, 63, 0.55); border-radius: 16px;
          padding: 22px 16px 16px; box-shadow: 0 20px 64px rgba(0, 0, 0, 0.65);
          display: flex; flex-direction: column; gap: 14px;
          transition: transform 220ms cubic-bezier(0.2, 0.8, 0.3, 1.1);
          transform: translateY(8px) scale(0.97);
        }
        .name-modal-root.is-open .name-modal-card { transform: translateY(0) scale(1); }
        .name-modal-close {
          position: absolute; top: 12px; right: 14px;
          background: none; border: none; cursor: pointer; font-size: 14px;
          color: rgba(0, 0, 0, 0.4); line-height: 1; padding: 4px;
          transition: color 150ms ease;
        }
        .name-modal-close:hover { color: rgba(0, 0, 0, 0.75); }
        .name-modal-title {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 1rem;
          text-align: center; color: hsl(var(--gold-dark)); margin: 0; padding: 0 20px;
        }
        /* Static blue backlit frame — popup (and later flow inputs). No motion. */
        .name-modal-inputwrap { position: relative; border-radius: 12px; }
        .name-modal-input {
          position: relative; z-index: 1;
          width: 100%; background: #FFFDF7; border-radius: 12px;
          padding: 14px 16px; color: #1a1208; outline: none;
          border: 2px solid rgba(47, 107, 255, 0.45);
          box-shadow: 0 0 12px rgba(47, 107, 255, 0.28);
          /* 16px prevents iOS auto-zoom */
          font-size: 16px; font-family: 'Space Grotesk', sans-serif;
          text-transform: uppercase; text-align: center; letter-spacing: 0.05em;
        }
        .name-modal-input::placeholder { text-transform: none; letter-spacing: normal; color: rgba(0, 0, 0, 0.35); }
        /* Android-only exact-value readout (predictive-swap safety net). */
        .name-modal-confirm {
          margin: -4px 0 0; text-align: center;
          font-family: 'Space Grotesk', sans-serif; font-size: 13px;
          color: rgba(26, 18, 8, 0.6); letter-spacing: 0.03em;
        }
        .name-modal-confirm b {
          color: hsl(var(--gold-dark)); font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
        }
        .name-modal-done {
          width: 100%; height: 46px; border: none; border-radius: 12px; cursor: pointer;
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.85rem;
          letter-spacing: 0.12em; text-transform: uppercase; color: #000;
          /* Identical to the main flow CTA (NameScreen "Continue") — gold, not orange. */
          background: linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35);
          transition: opacity 150ms ease, transform 150ms ease;
        }
        .name-modal-done:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
        .name-modal-done:not(:disabled):active { transform: scale(0.97); }
      `}</style>
    </div>,
    document.body,
  );
}

export function NameScreen() {
  useFlowKeyboardFix();
  const navigate = useNavigate();
  const t = useT();
  const setDogName = useDogyptStore((s) => s.setDogName);
  const storedDogName = useDogyptStore((s) => s.dogName);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const selections = useDogyptStore((s) => s.selections);
  // ── NOVÝ VSTUP (23. 9. 2026): táto obrazovka pohltila otázku „žije?" ───────
  // Matej ukázal obrazovku 2 z nákresu 31. 8.: meno + blok ZÁKLAD (stav ·
  // narodenie · krajina). Dôvod nie je vzhľad:
  // 🔴 v ceste ZO STENY sa dnes `lifeStatus` nespýta NIKDY — je len v Intro,
  //    ktoré popup na stene preskočí (`GodsGridLab` ide rovno na `/heroglyph/name`),
  //    takže zosnulý pes pristane na stene ako živý.
  // Tým zároveň zaniká `AboutScreen` (papierovačky) — pýtal sa na tie isté polia
  // druhýkrát a pri druhom priechode ich prepísal hodnotami prvého psa.
  const setLifeStatus = useDogyptStore((s) => s.setLifeStatus);
  const setDeathDate = useDogyptStore((s) => s.setDeathDate);
  const storedLifeStatus = useDogyptStore((s) => s.lifeStatus);
  const storedDeathDate = useDogyptStore((s) => s.deathDate);

  const initialName = storedDogName || '';
  const today = new Date();
  const currentYear = today.getFullYear();
  const minYear = currentYear - 25;
  const maxYear = currentYear;

  const stored = {
    d: parseInt(selections.birthdayDay || '0'),
    m: parseInt(selections.birthdayMonth || '0'),
    y: parseInt(selections.birthdayYear || '0'),
  };
  const hasStored = stored.d && stored.m && stored.y;

  const [input, setInput] = useState(initialName);
  const [day, setDay] = useState<number>(hasStored ? stored.d : 1);
  const [month, setMonth] = useState<number>(hasStored ? stored.m : 1);
  const [year, setYear] = useState<number>(hasStored ? stored.y : currentYear - 5);
  const [touched, setTouched] = useState<boolean>(!!hasStored);
  // Dog's country — restored from selections if user navigates back.
  // Default empty: user must consciously pick (LOCKED decision 2026-07-06).
  const [dogCountry, setDogCountry] = useState<string>(selections.country || '');
  const [alive, setAlive] = useState<boolean>(storedLifeStatus !== 'deceased');
  const [deathModal, setDeathModal] = useState(false);

  // ── PRÍCHOD NA OBRAZOVKU (23. 9. 2026) ────────────────────────────────────
  // Matej: *„príchod fotky, zväčšená fota a otázka v ráme cez celú stránku /
  // bez spodného bloku; blok s otázkou sa zvrkne a vysunie sa blok s otázkami"*.
  // Dve fázy, nie tri: najprv len Hektor s otázkou, potom sa zmenší a zdola
  // príde formulár.
  //
  // ⚠️ KTO SA VRACIA, ANIMÁCIU NEDOSTANE. Meno v store znamená návrat z ďalšieho
  //    kroku — prehrať mu príchod znova by bolo zdržanie, nie privítanie.
  // ⚠️ `prefers-reduced-motion` preskakuje rovno na formulár.
  const [phase, setPhase] = useState<'hero' | 'form'>(() => {
    if (!NEW_HEROFLOW || initialName) return 'form';
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'form';
    }
    return 'hero';
  });
  useEffect(() => {
    if (phase !== 'hero') return;
    const id = window.setTimeout(() => setPhase('form'), 1150);
    return () => window.clearTimeout(id);
  }, [phase]);

  // Ako veľmi sa medailón v príchodovej fáze nafúkne. Číslo NIE JE natvrdo:
  // ráta sa z okna, lebo „čo najväčšia fotka" znamená na telefóne inú veľkosť
  // než na stolnom počítači. Strop 2,1× drží kresbu ostrou — medailón je SVG
  // + rastrový ksicht 260 px, nad tým by začal mäknúť.
  const heroMedallion = useMemo(() => {
    if (typeof window === 'undefined') return 240;
    const byWidth = Math.min(window.innerWidth, 640) * 0.72;
    const byHeight = window.innerHeight * 0.38;
    return Math.round(Math.max(148, Math.min(310, Math.min(byWidth, byHeight))));
  }, []);
  const [showInfo, setShowInfo] = useState(false);
  const isMobile = useMemo(() => window.matchMedia('(pointer: coarse)').matches, []);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const nameModalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  // Desktop inline input — block Android (tablet/Chromebook) auto-correct swaps too.
  const desktopInputRef = useRef<HTMLInputElement>(null);
  useBlockAutocorrect(desktopInputRef);

  // iOS opens the soft keyboard only when focus() runs synchronously inside the
  // tap gesture on an already-mounted input. So we reveal the (always-mounted)
  // modal imperatively and focus its input in the same tick, then sync React state.
  const openNameModal = () => {
    nameModalRef.current?.classList.add('is-open');
    nameInputRef.current?.focus();
    setNameModalOpen(true);
  };
  const closeNameModal = () => {
    nameInputRef.current?.blur();
    setNameModalOpen(false);
  };

  const trimmed = input.trim();
  const nameValid = trimmed.length >= 1 && trimmed.length <= 30;
  const dateValid = touched;
  const countryValid = dogCountry !== '';
  const canContinue = nameValid && dateValid && countryValid;

  const handleSend = () => {
    if (!canContinue) return;
    setDogName(trimmed.toUpperCase());
    setSelection('birthdayDay', String(day).padStart(2, '0'));
    setSelection('birthdayMonth', String(month).padStart(2, '0'));
    setSelection('birthdayYear', String(year));
    // Dog's country → heroglyph pos 15 + dogs.country + WALL flag.
    // Stored as English name (matches COUNTRY_TO_ISO3 map in heroglyphCode.ts).
    setSelection('country', dogCountry);
    if (NEW_HEROFLOW) {
      // Stav zapisujeme VŽDY, aj keď človek nechal predvolené „žije" — inak by
      // pole ostalo tým, čím ho nechal predošlý priechod.
      setLifeStatus(alive ? 'alive' : 'deceased');
      if (alive) setDeathDate(null);
      // Fotka je za nami (popup na stene), ďalej ide zoznam psov.
      navigate('/heroglyph/dogs');
      return;
    }
    navigate('/heroglyph/photo');
  };

  const handleDateChange = (d: number, m: number, y: number) => {
    setDay(d);
    setMonth(m);
    setYear(y);
    setTouched(true);
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* Späť: v novom vstupe je za nami popup na stene, nie Intro (to je len
          redirect na fotku, takže by šípka skončila v kruhu). */}
      <PageTopBar onBack={() => navigate(NEW_HEROFLOW ? '/' : '/heroglyph/intro')} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3">
        {/* ⚠️ Bublina sa v príchodovej fáze roztiahne, len keď má DO ČOHO rásť —
            `flex: 1` na nej samej nestačí, lebo tento stĺpec má obsahovú výšku.
            Vo formulárovej fáze ostáva výška obsahová, teda ako dosiaľ. */}
        <div
          className="w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 min-h-0"
          style={phase === 'hero' ? { flex: '1 1 auto' } : undefined}
        >

          {/* Speech bubble — v príchodovej fáze VYPĹŇA STRÁNKU a je na stred
              (Matej 23. 9.: „modrý blok center na stred, čo najväčšia foto aj
              text"), potom sa zvrkne do dnešnej podoby.
              ⚠️ Prechod robí `layout`, nie animácia výšky: výška je `auto`
              a tú CSS animovať nevie — framer ju preloží na transform. */}
          <motion.div
            layout
            transition={MORPH}
            className="w-full rounded-2xl relative overflow-hidden flex-shrink"
            style={{
              background: 'var(--brand-gradient)',
              ...(phase === 'hero'
                ? { flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                : null),
            }}
          >
            {/* Info toggle button */}
            <button
              className="absolute top-3 right-3 z-20 flex items-center justify-center"
              style={{ width: 44, height: 44 }}
              aria-label={t('heroglyph.flow.name.infoAria')}
              onClick={() => setShowInfo((p) => !p)}
            >
              <span className="w-7 h-7 rounded-full border-2 border-foreground/40 flex items-center justify-center transition-colors hover:border-foreground/70">
                {showInfo
                  ? <X className="h-4 w-4 text-foreground/70" />
                  : <Info className="h-4 w-4 text-white/80" />}
              </span>
            </button>

            {/* Front + info share one AnimatePresence (mode="wait") so the bubble
                height fits whichever is shown — nothing gets clipped. */}
            <AnimatePresence mode="wait" initial={false}>
              {!showInfo ? (
                <motion.div
                  key="front"
                  layout
                  className="px-4 py-5 md:p-6 flex flex-col items-center gap-3 md:gap-4 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Nový vstup má na každom kroku iný Hektorov ksicht (Matej 23. 9.:
                      „bolo by to zaujímavejšie a človek by chcel vidieť čo bude
                      nasledovať"). Kruh je v súbore orezaný na pixel, preto stačí
                      `rounded-full` — netreba `object-contain`. */}
                  {NEW_HEROFLOW ? (
                    // V príchodovej fáze je medailón väčší a potom sa zvrkne —
                    // `motion` mu dá plynulý prechod, nie skok.
                    // 🔴 VEĽKOSŤ SA MENÍ SKUTOČNE, NIE CEZ `scale`. Prvý pokus
                    //    medailón iba škáloval — transform nemení tok, takže
                    //    nafúknutý medailón LEŽAL NA OTÁZKE pod sebou. Plynulosť
                    //    rieši `layout` (framer si zmenu rozmeru sám preloží na
                    //    transform), nie animácia škály.
                    <motion.div layout transition={MORPH}>
                      <FlowMedallion
                        src={hekthorFace('name')}
                        size={phase === 'hero' ? heroMedallion : 148}
                        className="hf-medal"
                      />
                    </motion.div>
                  ) : (
                    <img src={hekthorImg} alt="HEKTHOR" className="hek-lg w-36 h-36 md:w-56 md:h-56 object-contain" />
                  )}
                  <motion.p
                    layout
                    transition={MORPH}
                    className={`text-white text-center leading-snug drop-shadow-sm ${
                      phase === 'hero' ? 'text-xl md:text-3xl' : 'text-[15px] md:text-2xl'
                    }`}
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    <span className="whitespace-nowrap">{t('heroglyph.flow.name.greetingPrefix')} <span className="font-bold text-amber-300">HEKTHOR</span>.</span><br />
                    <span className="whitespace-nowrap">{t('heroglyph.flow.name.greetingQuestion')}</span>
                  </motion.p>
                </motion.div>
              ) : (
                <motion.div
                  key="info"
                  className="rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ backgroundColor: 'hsl(var(--papyrus))' }}
                >
                  {/* pt accounts for the X button */}
                  <div className="p-4 pt-11 pb-4 md:p-5 md:pt-14 md:pb-5">
                    {/* Two-column layout */}
                    <div className="flex gap-3 md:gap-4 items-start">
                      {/* Left column – video */}
                      <div className="w-[40%] md:w-[34%] flex-shrink-0 rounded-2xl overflow-hidden aspect-[4/5]">
                        <video
                          src="/videos/WHO_IS_HEKTHOR.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      {/* Right column */}
                      <div className="flex-1 flex flex-col gap-1.5 md:gap-2.5 min-w-0">
                        <h3
                          className="text-sm md:text-xl font-bold leading-tight"
                          style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}
                        >
                          {t('heroglyph.flow.name.whoTitle')} {t('heroglyph.flow.name.whoTitleName')}
                        </h3>

                        <p
                          className="text-foreground/80 text-[11px] md:text-[13px] leading-snug line-clamp-6 md:line-clamp-none"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {t('heroglyph.flow.name.whoBody')}
                        </p>

                        {/* Stats – stacked on mobile, decorative table on desktop */}
                        <div className="flex flex-col md:flex-row md:gap-0 gap-1 pt-1.5 md:pt-1 flex-shrink-0">
                          {/* Mobile: simple stacked */}
                          <div className="flex flex-col gap-1 md:hidden">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>{t('heroglyph.flow.name.born')}:</p>
                              <p className="text-foreground text-sm font-semibold">2016</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>{t('heroglyph.flow.name.adopted')}:</p>
                              <p className="text-foreground text-sm font-semibold">2017</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>{t('heroglyph.flow.name.location')}:</p>
                              <p className="text-foreground text-sm font-semibold">{t('heroglyph.flow.name.locationValue')}</p>
                            </div>
                          </div>

                          {/* Desktop: decorative open-table style */}
                          <div className="hidden md:flex md:gap-0 w-full rounded-lg border-2" style={{ borderColor: 'hsl(var(--gold-dark) / 0.35)' }}>
                            <div className="flex-1 flex flex-col items-center py-1.5">
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-0" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>{t('heroglyph.flow.name.born')}</p>
                              <p className="text-foreground text-sm font-semibold">2016</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center py-1.5 border-l-2 border-r-2" style={{ borderColor: 'hsl(var(--gold-dark) / 0.35)' }}>
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-0" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>{t('heroglyph.flow.name.adopted')}</p>
                              <p className="text-foreground text-sm font-semibold">2017</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center py-1.5">
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-0" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>{t('heroglyph.flow.name.location')}</p>
                              <p className="text-foreground text-sm font-semibold">{t('heroglyph.flow.name.locationValue')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Input — v príchodovej fáze ešte nie je na svete. Prichádza ZDOLA
              (Matej 23. 9.: „vysunie sa blok s otázkami"), nie zboku ako dosiaľ:
              zboku to vyzeralo ako výmena obrazovky, zdola to vyzerá ako ponuka,
              ktorá sa podáva. V starom vstupe ostáva pôvodný príchod. */}
          {phase === 'form' && (
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex-shrink-0"
            initial={NEW_HEROFLOW ? { opacity: 0, y: 48 } : { opacity: 0, x: 40 }}
            animate={NEW_HEROFLOW ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
            transition={NEW_HEROFLOW
              ? { duration: 0.46, ease: [0.2, 0.8, 0.3, 1] }
              : { duration: 0.35, delay: 0.1 }}
          >
            <div className="flex flex-col gap-2 md:gap-3">
            {/* Name + Dog Country row — name 70 %, country select 30 % */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

            {/* Name input — modal on mobile (keeps field above iOS keyboard),
                inline input on desktop (direct keyboard typing). */}
            <div className={`name-preview-wrap${trimmed.length > 0 ? ' is-filled' : ''}`} style={{ flex: '7 0 0', minWidth: 0 }}>
              {isMobile ? (
                <button
                  type="button"
                  onClick={openNameModal}
                  className="name-preview-btn w-full rounded-xl px-4 py-3 border-2 transition-colors"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '16px',
                    textAlign: 'center',
                    textTransform: trimmed.length > 0 ? 'uppercase' : 'none',
                    letterSpacing: trimmed.length > 0 ? '0.05em' : 'normal',
                    background: trimmed.length > 0 ? 'hsl(224 60% 45% / 0.10)' : 'hsl(var(--card))',
                    borderColor: trimmed.length > 0 ? 'hsl(224 60% 45%)' : 'rgba(47, 107, 255, 0.30)',
                    color: trimmed.length > 0 ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground) / 0.5)',
                    cursor: 'text',
                  }}
                >
                  {trimmed.length > 0 ? input : t('heroglyph.flow.name.placeholder')}
                </button>
              ) : (
                <input
                  ref={desktopInputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.toUpperCase().slice(0, 30))}
                  onKeyDown={(e) => { if (e.key === 'Enter' && canContinue) handleSend(); }}
                  placeholder={t('heroglyph.flow.name.placeholder')}
                  maxLength={30}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  data-1p-ignore
                  data-lpignore="true"
                  className="name-preview-btn w-full rounded-xl px-4 py-3 border-2 transition-colors"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '16px',
                    textAlign: 'center',
                    textTransform: trimmed.length > 0 ? 'uppercase' : 'none',
                    letterSpacing: trimmed.length > 0 ? '0.05em' : 'normal',
                    background: trimmed.length > 0 ? 'hsl(224 60% 45% / 0.10)' : 'hsl(var(--card))',
                    borderColor: trimmed.length > 0 ? 'hsl(224 60% 45%)' : 'rgba(47, 107, 255, 0.30)',
                    color: trimmed.length > 0 ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground) / 0.5)',
                    outline: 'none',
                  }}
                />
              )}
              <style>{`
                @property --name-prev-ang { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
                .name-preview-wrap { position: relative; border-radius: 0.75rem; box-shadow: 0 0 10px rgba(47, 107, 255, 0.14); }
                .name-preview-btn { position: relative; z-index: 1; }
                .name-preview-wrap::before {
                  content: ''; position: absolute; inset: -2px; border-radius: 14px; z-index: 0;
                  pointer-events: none; padding: 2px;
                  background: conic-gradient(from var(--name-prev-ang),
                    transparent 0deg, transparent 250deg,
                    rgba(47,107,255,0.85) 312deg, rgba(156,196,255,0.95) 334deg,
                    rgba(47,107,255,0.85) 352deg, transparent 360deg);
                  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                  -webkit-mask-composite: xor;
                          mask-composite: exclude;
                  filter: blur(1px);
                  animation: namePrevSpin 3.8s linear infinite;
                }
                @keyframes namePrevSpin { to { --name-prev-ang: 360deg; } }
                @media (prefers-reduced-motion: reduce) { .name-preview-wrap::before { animation: none; } }
                /* Filled = no animation, static "selected" highlight (like flow options) */
                .name-preview-wrap.is-filled::before { animation: none; opacity: 0; }
                .name-preview-wrap.is-filled { box-shadow: 0 0 0 2px hsl(224 60% 45% / 0.45), 0 0 14px hsl(224 60% 45% / 0.22); }
              `}</style>
            </div>

            {/* Dog Country select — 30% of name row; placeholder = short "HOME" label.
                Closed box shows ONLY the flag (full "flag + name" option text is kept for
                the native dropdown list — full names help pick, but overflow the tiny
                closed box). The select's own text is made transparent once a value is
                chosen; a non-interactive flag overlay renders on top of it instead. */}
            <div style={{ flex: '3 0 0', minWidth: 0, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                value={dogCountry}
                onChange={(e) => setDogCountry(e.target.value)}
                aria-label={t('heroglyph.flow.name.dogCountry')}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  width: '100%',
                  height: 48,
                  background: dogCountry ? 'hsl(var(--papyrus))' : 'hsl(var(--card))',
                  border: dogCountry
                    ? '2px solid hsl(var(--gold))'
                    : '2px solid hsl(var(--gold) / 0.5)',
                  borderRadius: 12,
                  fontFamily: "'Cinzel', serif",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  color: dogCountry ? 'transparent' : 'hsl(var(--muted-foreground) / 0.6)',
                  paddingLeft: 4,
                  paddingRight: 20,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="">{t('heroglyph.flow.name.dogCountry')}</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{countryFlag(c) || '🏳'} {c}</option>
                ))}
              </select>
              {dogCountry && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    pointerEvents: 'none',
                    fontSize: 20,
                    lineHeight: 1,
                  }}
                >{countryFlag(dogCountry) || '🏳'}</span>
              )}
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  right: 8,
                  pointerEvents: 'none',
                  color: 'hsl(var(--gold))',
                  fontSize: 12,
                  lineHeight: 1,
                }}
              >▾</span>
            </div>

            </div>{/* end name + country flex row */}

            {/* Birthday — inline iOS-style 3-wheel picker */}
            <p
              className="text-xs md:text-sm uppercase tracking-widest text-muted-foreground text-center"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {t('heroglyph.flow.name.birthday')}
            </p>
            <DateDropdowns
              day={day}
              month={month}
              year={year}
              minYear={minYear}
              maxYear={maxYear}
              maxDate={today}
              onChange={handleDateChange}
            />

            {/* STAV — len v novom vstupe. Tvar (ikonky + popup s dátumom) sa
                23. 9. vrátil z `IntroScreen`, ktorý v tomto vstupe zaniká; tu
                boli dovtedy holé textové tlačidlá. Dátum odchodu sa pýta PRÁVE
                TU: bez neho je anjel nedokončená voľba. */}
            {NEW_HEROFLOW && (
              <LifeStatusPick
                value={alive ? 'alive' : 'deceased'}
                onChange={(v) => {
                  setAlive(v === 'alive');
                  if (v === 'alive') setDeathDate(null);
                }}
                onWantDate={() => setDeathModal(true)}
                deathDate={storedDeathDate}
              />
            )}

            <Button
              onClick={handleSend}
              disabled={!canContinue}
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
            </div>
          </motion.div>
          )}
        </div>
      </div>

      {/* Dátum odchodu — vysunie sa po kliku na „psí anjel". */}
      {NEW_HEROFLOW && (
        <DeathDateModal
          open={deathModal}
          deathDate={storedDeathDate}
          onSave={(iso) => { setDeathDate(iso); setDeathModal(false); }}
          onClose={() => setDeathModal(false)}
        />
      )}

      {/* Name entry modal — only on mobile (iOS keyboard-safe); desktop types inline. */}
      {isMobile && <NameModal
        open={nameModalOpen}
        value={input}
        placeholder={t('heroglyph.flow.name.placeholder')}
        title={t('heroglyph.flow.name.greetingQuestion')}
        doneLabel={t('heroglyph.flow.message.done')}
        closeLabel={t('nav.aria.close')}
        rootRef={nameModalRef}
        inputRef={nameInputRef}
        onChange={setInput}
        onDone={closeNameModal}
        onClose={closeNameModal}
      />}
    </div>
  );
}
