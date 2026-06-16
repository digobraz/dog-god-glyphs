import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import hekthorImg from '@/assets/hekthor.png';
import { WheelDatePicker } from '@/components/WheelDatePicker';
import { useT } from '@/i18n/LanguageContext';
import { useFlowKeyboardFix } from '@/hooks/useFlowKeyboardFix';

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
  const [showInfo, setShowInfo] = useState(false);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const nameModalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

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
  const canContinue = nameValid && dateValid;

  const handleSend = () => {
    if (!canContinue) return;
    setDogName(trimmed.toUpperCase());
    setSelection('birthdayDay', String(day).padStart(2, '0'));
    setSelection('birthdayMonth', String(month).padStart(2, '0'));
    setSelection('birthdayYear', String(year));
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
      <PageTopBar />

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
              <span className="w-7 h-7 rounded-full border-2 border-foreground/40 flex items-center justify-center transition-colors hover:border-foreground/70">
                {showInfo
                  ? <X className="h-4 w-4 text-foreground/70" />
                  : <Info className="h-4 w-4 text-white/80" />}
              </span>
            </button>

            {/* Default front content */}
            <div className="px-4 py-5 md:p-6 flex flex-col items-center gap-3 md:gap-4">
              <img src={hekthorImg} alt="HEKTHOR" className="w-36 h-36 md:w-56 md:h-56 object-contain" />
              <p className="text-white text-center text-[15px] md:text-2xl leading-snug drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                <span className="whitespace-nowrap">{t('heroglyph.flow.name.greetingPrefix')} <span className="font-bold text-amber-300">HEKTHOR</span>.</span><br />
                <span className="whitespace-nowrap">{t('heroglyph.flow.name.greetingQuestion')}</span>
              </p>
            </div>

            {/* Info overlay – papyrus light bg */}
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  className="absolute inset-0 z-10 flex flex-col rounded-2xl overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  style={{ backgroundColor: 'hsl(var(--papyrus))' }}
                >
                  {/* Content – equal padding all around, pt accounts for X button */}
                  <div className="relative z-10 p-4 pt-10 pb-3 md:p-5 md:pt-14 md:pb-5 flex-1 flex flex-col min-h-0">
                    {/* Two-column layout */}
                    <div className="flex gap-3 md:gap-4 flex-1 min-h-0 items-center overflow-hidden">
                      {/* Left column – video, fixed aspect ratio centered against right text */}
                      <div className="w-[38%] md:w-[35%] flex-shrink-0 rounded-2xl overflow-hidden aspect-[3/4]">
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
                      <div className="flex-1 flex flex-col gap-1.5 md:gap-3 min-w-0 min-h-0 md:justify-center">
                        <h3
                          className="text-sm md:text-xl font-bold leading-tight"
                          style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}
                        >
                          {t('heroglyph.flow.name.whoTitle')} {t('heroglyph.flow.name.whoTitleName')}
                        </h3>

                        <p
                          className="text-foreground/80 text-[10px] md:text-sm leading-snug md:leading-relaxed line-clamp-6 md:line-clamp-none"
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
          </div>

          {/* Input */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex-shrink-0"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="flex flex-col gap-2 md:gap-3">
            {/* Read-only preview — tap opens the name modal (keeps the iOS keyboard
                from covering the field; the modal sits near the top of the screen).
                A decent blue glow slowly orbits the frame to invite the tap. */}
            <div className={`name-preview-wrap${trimmed.length > 0 ? ' is-filled' : ''}`}>
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

            {/* Birthday — inline iOS-style 3-wheel picker */}
            <p
              className="text-xs md:text-sm uppercase tracking-widest text-muted-foreground text-center"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {t('heroglyph.flow.name.birthday')}
            </p>
            <WheelDatePicker
              day={day}
              month={month}
              year={year}
              minYear={minYear}
              maxYear={maxYear}
              maxDate={today}
              onChange={handleDateChange}
            />

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
        </div>
      </div>

      {/* Name entry modal — ALWAYS mounted (so iOS can focus the input inside the
          tap gesture and open the keyboard); visibility toggled via the open prop. */}
      <NameModal
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
      />
    </div>
  );
}
