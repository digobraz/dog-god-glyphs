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
import legendIconUrl from '@/assets/legend-icon.svg';
import angelIconUrl from '@/assets/angel-icon.svg';
import { useT } from '@/i18n/LanguageContext';

// Najstarší rok v prepínači dátumu úmrtia.
const MIN_DEATH_YEAR = 1990;
import { useFlowKeyboardFix } from '@/hooks/useFlowKeyboardFix';
import { useBlockAutocorrect } from '@/hooks/useBlockAutocorrect';
import { FLOW_PALE_CSS } from './flowPaleSkin';

// Android keyboards (Gboard/Samsung) ignore autoCorrect/autoComplete="off" and may
// silently swap a typed word for a predicted one (e.g. BELGA → BELGICKO). We can't
// stop that from the web, so on Android only we surface the exact captured value
// under the field — the user sees what will actually be baked into the heroglyph.
// iOS/desktop respect the attributes, so they get nothing (no clutter).
const IS_ANDROID = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

// ── ZADNÁ STRANA BUBLINY (klik na „i") ───────────────────────────────────────
// Matej 28. 8.: „my sa bavíme o zadnej strane!" + „dať blok do brandovej farby,
// bloku". Predná a zadná strana sú TÁ ISTÁ karta, len otočená — zadná preto nemá
// vlastnú výplň (dedí brandový povrch rodiča) a mení sa len inkoust na tmavý
// podklad. Predtým to bol plochý `hsl(var(--papyrus))` bez rámu, čo na papyrusovej
// stránke nebol blok, ale svetlejšia škvrna.
const BACK_GOLD = '#FCD34D';


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
  // Otázka „žije pes?" tu 28. 8. 2026 chvíľu bola (prišla zo zaniknutého
  // /heroglyph/intro), ale putovala ďalej na krok 3 (/heroglyph/dogs) — tam sa
  // pýta pri KAŽDOM psovi, nielen pri prvom. Meno má byť ľahká otázka.

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
    // Zavretie popupu je vedomé „dopísal som" — odpočet 900 ms by tu len zdržal.
    if (input.trim().length >= 1) setSettled(true);
  };

  const trimmed = input.trim();
  const nameValid = trimmed.length >= 1 && trimmed.length <= 30;

  // ── KEDY JE MENO „DOPÍSANÉ" ────────────────────────────────────────────────
  // Matej 28. 8.: „až po dopísaní mena sa zjaví červený text nie pri začiatku
  // písania…ak človek dopíše!". Pri prvom písmene by červená hláška a odomknutie
  // tlačidla reagovali na „B" z BARÓNA — teda na pol slova.
  // Dopísané = 900 ms bez ďalšieho písmena, ALEBO človek to povedal sám (opustil
  // pole, Enter, HOTOVO v mobilnom popupe) — vtedy sa nečaká.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!nameValid) { setSettled(false); return; }
    setSettled(false);
    const id = window.setTimeout(() => setSettled(true), 900);
    return () => window.clearTimeout(id);
  }, [input, nameValid]);
  // Krajina a dátum narodenia sa 28. 8. 2026 presunuli na /heroglyph/about — meno má byť
  // ľahká otázka, nie formulár. Tu drží tlačidlo platné a DOPÍSANÉ meno.
  const canContinue = nameValid && settled;

  const handleSend = (name = trimmed) => {
    if (!(name.length >= 1 && name.length <= 30)) return;
    setDogName(name.toUpperCase());
    navigate('/heroglyph/dogs');
  };




  const handleDateChange = (d: number, m: number, y: number) => {
    setDay(d);
    setMonth(m);
    setYear(y);
    setTouched(true);
  };

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}</style>

      <div className="hf-topbar flex-shrink-0">
        <PageTopBar onBack={() => navigate('/heroglyph/photo')} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 min-h-0">

          {/* Speech bubble */}
          <div
            className="w-full rounded-2xl relative overflow-hidden flex-shrink"
            style={{
              background: 'var(--brand-gradient)',
            }}
          >
            {/* Info toggle button */}
            <button
              className="absolute top-3 right-3 z-20 flex items-center justify-center"
              style={{ width: 44, height: 44 }}
              aria-label={t('heroglyph.flow.name.infoAria')}
              onClick={() => setShowInfo((p) => !p)}
            >
              <span className="w-7 h-7 rounded-full border-2 border-white/40 flex items-center justify-center transition-colors hover:border-white/70">
                {showInfo
                  ? <X className="h-4 w-4 text-white/80" />
                  : <Info className="h-4 w-4 text-white/80" />}
              </span>
            </button>

            {/* Front + info share one AnimatePresence (mode="wait") so the bubble
                height fits whichever is shown — nothing gets clipped. */}
            <AnimatePresence mode="wait" initial={false}>
              {!showInfo ? (
                <motion.div
                  key="front"
                  className="px-4 py-4 md:p-5 flex flex-col items-center gap-2.5 md:gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Matej 28. 8.: „foto hektora je enormne veľká" — bublina je úvod,
                      nie hrdina obrazovky. Hrdinom je pole pod ňou, tak sa fotka
                      zmenšila zo 144/224 px na 96/112 a bublina stiahla výplň. */}
                  <img src={hekthorImg} alt="HEKTHOR" className="hek-lg hf-hek" />
                  <p className="text-white text-center text-[15px] md:text-2xl leading-snug drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                    <span className="whitespace-nowrap">{t('heroglyph.flow.name.greetingPrefix')} <span className="font-bold text-amber-300">HEKTHOR</span>.</span><br />
                    <span className="whitespace-nowrap">{t('heroglyph.flow.name.greetingQuestion')}</span>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="info"
                  className="rounded-2xl"
                  /* Závoj nad brandovým gradientom: text zadnej strany stojí vpravo, teda
                     nad jeho ZLATÝM koncom (#C99A3F) — biele písmo tam má kontrast 2,7:1
                     a nedá sa čítať. Závoj drží povrch brandový a text čitateľný (~6:1). */
                  style={{ background: 'linear-gradient(180deg, rgba(6,4,2,0.58), rgba(6,4,2,0.58))' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
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
                          style={{ fontFamily: "'Cinzel', serif", color: BACK_GOLD }}
                        >
                          {t('heroglyph.flow.name.whoTitle')} {t('heroglyph.flow.name.whoTitleName')}
                        </h3>

                        <p
                          className="text-[#FAF4EC]/80 text-[11px] md:text-[13px] leading-snug line-clamp-6 md:line-clamp-none"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {t('heroglyph.flow.name.whoBody')}
                        </p>

                        {/* Stats – stacked on mobile, decorative table on desktop */}
                        <div className="flex flex-col md:flex-row md:gap-0 gap-1 pt-1.5 md:pt-1 flex-shrink-0">
                          {/* Mobile: simple stacked */}
                          <div className="flex flex-col gap-1 md:hidden">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif", color: BACK_GOLD }}>{t('heroglyph.flow.name.born')}:</p>
                              <p className="text-[#FAF4EC] text-sm font-semibold">2016</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif", color: BACK_GOLD }}>{t('heroglyph.flow.name.adopted')}:</p>
                              <p className="text-[#FAF4EC] text-sm font-semibold">2017</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif", color: BACK_GOLD }}>{t('heroglyph.flow.name.location')}:</p>
                              <p className="text-[#FAF4EC] text-sm font-semibold">{t('heroglyph.flow.name.locationValue')}</p>
                            </div>
                          </div>

                          {/* Desktop: decorative open-table style */}
                          <div className="hidden md:flex md:gap-0 w-full rounded-lg border-2" style={{ borderColor: 'rgba(201,154,63,0.45)' }}>
                            <div className="flex-1 flex flex-col items-center py-1.5">
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-0" style={{ fontFamily: "'Cinzel', serif", color: BACK_GOLD }}>{t('heroglyph.flow.name.born')}</p>
                              <p className="text-[#FAF4EC] text-sm font-semibold">2016</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center py-1.5 border-l-2 border-r-2" style={{ borderColor: 'rgba(201,154,63,0.45)' }}>
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-0" style={{ fontFamily: "'Cinzel', serif", color: BACK_GOLD }}>{t('heroglyph.flow.name.adopted')}</p>
                              <p className="text-[#FAF4EC] text-sm font-semibold">2017</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center py-1.5">
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-0" style={{ fontFamily: "'Cinzel', serif", color: BACK_GOLD }}>{t('heroglyph.flow.name.location')}</p>
                              <p className="text-[#FAF4EC] text-sm font-semibold">{t('heroglyph.flow.name.locationValue')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          <motion.div
            className="hf-block flex-shrink-0"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="hf-plate">
            {/* ── DVA BLOKY, NIE ŠTYRI SAMOSTATNÉ VECI (Matej 31. 8.) ────────────
                *„tie pod texty prisuň viac hore k text area aj k cta, patria k nim,
                nie do stredu — sú to 2 bloky s dvomi textami, nie 4 obsahy
                samostatne (tak to teraz vyzerá)"*. Doska mala jednu medzeru medzi
                všetkými štyrmi prvkami, takže veta patriaca k poľu stála rovnako
                ďaleko od poľa ako od tlačidla a nebolo vidno, ku ktorému hovorí.
                `.hf-group` drží dvojicu pri sebe (6 px); medzi dvojicami ostáva
                medzera dosky. */}
            <div className="hf-group">
            {/* Name + Dog Country row — name 70 %, country select 30 % */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

            {/* Name input — modal on mobile (keeps field above iOS keyboard),
                inline input on desktop (direct keyboard typing). */}
            <div className={`hf-ring${trimmed.length > 0 ? ' is-filled' : ''}`} style={{ flex: '7 0 0', minWidth: 0 }}>
              {isMobile ? (
                <button
                  type="button"
                  onClick={openNameModal}
                  className={`hf-field${trimmed.length > 0 ? ' is-valid' : ''}`}
                  style={{
                    textTransform: trimmed.length > 0 ? 'uppercase' : 'none',
                    letterSpacing: trimmed.length > 0 ? '0.05em' : 'normal',
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
                  onKeyDown={(e) => { if (e.key === 'Enter' && nameValid) { setSettled(true); handleSend(trimmed); } }}
                  onBlur={() => { if (nameValid) setSettled(true); }}
                  placeholder={t('heroglyph.flow.name.placeholder')}
                  maxLength={30}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  data-1p-ignore
                  data-lpignore="true"
                  className={`hf-field${trimmed.length > 0 ? ' is-valid' : ''}`}
                  style={{
                    textTransform: trimmed.length > 0 ? 'uppercase' : 'none',
                    letterSpacing: trimmed.length > 0 ? '0.05em' : 'normal',
                  }}
                />
              )}
            </div>

            </div>{/* end name + country flex row */}

            {/* NAPÄTIE → TLAČIDLO → SĽUB (LAB, krok 2 · 28. 8. 2026).
                Červená hovorí, čo je zlé (meno samo nestačí), zelená čo z toho bude.
                Objavia sa až keď meno stojí — pred vstupom by to bol sľub do prázdna,
                takto je to odpoveď na to, čo človek práve napísal.
                🚩 Konkrétne číslo („toto meno nosí 123 554 psov") tu byť NESMIE —
                taký dataset neexistuje a bola by to vymyslená štatistika. */}
            {canContinue && <p className="hf-alert">{t('heroglyph.flow.name.alert')}</p>}
            </div>{/* end skupina POLE + napätie */}

            <div className="hf-group">

            {/* 🚩 Tlačidlo sľubuje CIEĽ, nie akciu — klik heroglyf nevytvorí, otvorí
                ďalšiu otázku. Vedomé rozhodnutie z LABu, nie prehliadnutie. */}
            {/* Text tlačidla sa mení s tým, čo tlačidlo v tej chvíli znamená
                (Matej 28. 8.): kým je pole prázdne, je vyblednuté a hovorí len
                „Ďalej" — sľubovať heroglyf pred menom je sľub do prázdna.
                S menom sa odomkne a prevezme cieľ: VYTVORIŤ HEROGLYPH. */}
            {/* Hviezdička je v JSX, nie v preklade — je to typografická značka
                a nemusí ju niesť 18 jazykov. Stojí len pri odomknutom CTA, teda
                spolu s vetou, ktorú vysvetľuje. */}
            <button type="button" className="hf-cta" onClick={() => handleSend()} disabled={!canContinue}>
              {t(canContinue ? 'heroglyph.flow.name.createCta' : 'heroglyph.flow.name.nextCta')}
              {canContinue && '*'}
            </button>

            {canContinue && (
              <p className="hf-promise"><span className="star">*</span>{t('heroglyph.flow.name.promise')}</p>
            )}
            </div>{/* end skupina CTA + vysvetlivka */}
            </div>
          </motion.div>
        </div>
      </div>

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
