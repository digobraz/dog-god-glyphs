import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import hekthorImg from '@/assets/hekthor.png';
import manSvg from '@/assets/gender/OWNER_GENDER-MAN.svg';
import womanSvg from '@/assets/gender/OWNER_GENDER-WOMAN.svg';
import { useT } from '@/i18n/LanguageContext';
import { useFlowKeyboardFix } from '@/hooks/useFlowKeyboardFix';

import letterA from '@/assets/letters/NAME_-A.svg';
import letterB from '@/assets/letters/NAME_-B.svg';
import letterC from '@/assets/letters/NAME_-C.svg';
import letterD from '@/assets/letters/NAME_-D.svg';
import letterE from '@/assets/letters/NAME_-E.svg';
import letterF from '@/assets/letters/NAME_-F.svg';
import letterG from '@/assets/letters/NAME_-G.svg';
import letterH from '@/assets/letters/NAME_-H.svg';
import letterI from '@/assets/letters/NAME_-I.svg';
import letterJ from '@/assets/letters/NAME_-J.svg';
import letterK from '@/assets/letters/NAME_-K.svg';
import letterL from '@/assets/letters/NAME_-L.svg';
import letterM from '@/assets/letters/NAME_-M.svg';
import letterN from '@/assets/letters/NAME_-N.svg';
import letterO from '@/assets/letters/NAME_-O.svg';
import letterP from '@/assets/letters/NAME_-P.svg';
import letterQ from '@/assets/letters/NAME-Q.svg';
import letterR from '@/assets/letters/NAME_-R.svg';
import letterS from '@/assets/letters/NAME-S.svg';
import letterT from '@/assets/letters/NAME-T.svg';
import letterU from '@/assets/letters/NAME-U.svg';
import letterV from '@/assets/letters/NAME-V.svg';
import letterW from '@/assets/letters/NAME-W.svg';
import letterX from '@/assets/letters/NAME-X.svg';
import letterY from '@/assets/letters/NAME-Y.svg';
import letterZ from '@/assets/letters/NAME-Z.svg';

const letterMap: Record<string, string> = {
  A: letterA, B: letterB, C: letterC, D: letterD, E: letterE,
  F: letterF, G: letterG, H: letterH, I: letterI, J: letterJ,
  K: letterK, L: letterL, M: letterM, N: letterN, O: letterO,
  P: letterP, Q: letterQ, R: letterR, S: letterS, T: letterT,
  U: letterU, V: letterV, W: letterW, X: letterX, Y: letterY,
  Z: letterZ,
};

// ── Owner Name Modal ─────────────────────────────────────────────────────────
// Same iOS-safe pattern as NameScreen: always mounted, opened imperatively so
// the keyboard fires synchronously inside the tap gesture.
interface OwnerNameModalProps {
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

function OwnerNameModal({ open, value, placeholder, title, doneLabel, closeLabel, rootRef, inputRef, onChange, onDone, onClose }: OwnerNameModalProps) {
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
            name="ownerName"
            autoComplete="given-name"
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
        .name-modal-inputwrap { position: relative; border-radius: 12px; }
        .name-modal-input {
          position: relative; z-index: 1;
          width: 100%; background: #FFFDF7; border-radius: 12px;
          padding: 14px 16px; color: #1a1208; outline: none;
          border: 2px solid rgba(47, 107, 255, 0.45);
          box-shadow: 0 0 12px rgba(47, 107, 255, 0.28);
          font-size: 16px; font-family: 'Space Grotesk', sans-serif;
          text-transform: uppercase; text-align: center; letter-spacing: 0.05em;
        }
        .name-modal-input::placeholder { text-transform: none; letter-spacing: normal; color: rgba(0, 0, 0, 0.35); }
        .name-modal-done {
          width: 100%; height: 46px; border: none; border-radius: 12px; cursor: pointer;
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.85rem;
          letter-spacing: 0.12em; text-transform: uppercase; color: #000;
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

export function OwnerInfoScreen() {
  useFlowKeyboardFix();
  const navigate = useNavigate();
  const t = useT();
  const setOwnerName = useDogyptStore((s) => s.setOwnerName);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const storedOwnerName = useDogyptStore((s) => s.ownerName);
  const storedGender = useDogyptStore((s) => s.selections.ownerGender);
  const [input, setInput] = useState(storedOwnerName || '');
  // No default gender — user must pick manually
  const [gender, setGender] = useState<string | null>(storedGender || null);

  const [nameModalOpen, setNameModalOpen] = useState(false);
  const nameModalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

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
  const firstLetter = trimmed.charAt(0).toUpperCase();
  const letterSvg = letterMap[firstLetter] || null;

  const canContinue = trimmed.length >= 1 && !!gender;

  const handleSend = () => {
    if (!canContinue) return;
    setOwnerName(trimmed.toUpperCase());
    setSelection('ownerGender', gender!);
    navigate('/heroglyph/owner-zodiac');
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <PageTopBar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 min-h-0">
          <motion.div
            className="w-full rounded-2xl px-4 py-3 md:p-5 flex flex-col items-center gap-2 md:gap-3 flex-shrink-0"
            style={{ background: 'var(--brand-gradient)' }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-36 h-36 md:w-56 md:h-56 object-contain" />
            <p className="text-white text-center text-base md:text-2xl leading-snug drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
              {t('heroglyph.flow.ownerInfo.greetingPrefix')}{' '}
              <span className="font-bold text-amber-300">{t('heroglyph.flow.ownerInfo.greetingWord')}</span>!
            </p>
          </motion.div>

          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex-shrink-0"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="flex flex-col gap-3">
              {/* Name input row — tap-to-open modal (iOS-safe) */}
              <div className="flex items-center gap-2 min-w-0">
                <div className={`owner-name-preview-wrap${trimmed.length > 0 ? ' is-filled' : ''} flex-1 min-w-0`}>
                  <button
                    type="button"
                    onClick={openNameModal}
                    className="owner-name-preview-btn w-full rounded-xl px-3 py-2 border-2 transition-colors"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '16px',
                      textAlign: 'left',
                      textTransform: trimmed.length > 0 ? 'uppercase' : 'none',
                      letterSpacing: trimmed.length > 0 ? '0.05em' : 'normal',
                      background: trimmed.length > 0 ? 'hsl(224 60% 45% / 0.10)' : 'hsl(var(--card))',
                      borderColor: trimmed.length > 0 ? 'hsl(224 60% 45%)' : 'rgba(47, 107, 255, 0.30)',
                      color: trimmed.length > 0 ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground) / 0.5)',
                      cursor: 'text',
                    }}
                  >
                    {trimmed.length > 0 ? trimmed : t('heroglyph.flow.ownerInfo.placeholder')}
                  </button>
                  <style>{`
                    @property --owner-name-ang { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
                    .owner-name-preview-wrap { position: relative; border-radius: 0.75rem; box-shadow: 0 0 10px rgba(47, 107, 255, 0.14); }
                    .owner-name-preview-btn { position: relative; z-index: 1; }
                    .owner-name-preview-wrap::before {
                      content: ''; position: absolute; inset: -2px; border-radius: 14px; z-index: 0;
                      pointer-events: none; padding: 2px;
                      background: conic-gradient(from var(--owner-name-ang),
                        transparent 0deg, transparent 250deg,
                        rgba(47,107,255,0.85) 312deg, rgba(156,196,255,0.95) 334deg,
                        rgba(47,107,255,0.85) 352deg, transparent 360deg);
                      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                      -webkit-mask-composite: xor;
                              mask-composite: exclude;
                      filter: blur(1px);
                      animation: ownerNameSpin 3.8s linear infinite;
                    }
                    @keyframes ownerNameSpin { to { --owner-name-ang: 360deg; } }
                    @media (prefers-reduced-motion: reduce) { .owner-name-preview-wrap::before { animation: none; } }
                    .owner-name-preview-wrap.is-filled::before { animation: none; opacity: 0; }
                    .owner-name-preview-wrap.is-filled { box-shadow: 0 0 0 2px hsl(224 60% 45% / 0.45), 0 0 14px hsl(224 60% 45% / 0.22); }
                  `}</style>
                </div>

                {/* Letter preview box */}
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 flex items-center justify-center flex-shrink-0 overflow-hidden ${letterSvg ? 'is-selected-purple' : 'border-border/60 bg-card/50'}`}>
                  {letterSvg ? (
                    <motion.img
                      key={firstLetter}
                      src={letterSvg}
                      alt={firstLetter}
                      className="h-9 md:h-14 object-contain"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  ) : (
                    <span className="text-muted-foreground/30 text-2xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
                      ?
                    </span>
                  )}
                </div>
              </div>

              {/* Gender selection — no default, user must choose */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setGender('man')}
                  className={`flex-1 flex flex-col items-center gap-1.5 p-2 md:p-3 rounded-xl border-2 transition-all ${
                    gender === 'man'
                      ? 'is-selected-purple'
                      : 'border-border/60 hover:border-primary/50'
                  }`}
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  <img src={manSvg} alt={t('heroglyph.flow.ownerInfo.man')} className="h-14 md:h-20 object-contain" />
                  <span className="text-xs md:text-sm font-bold tracking-wider uppercase">{t('heroglyph.flow.ownerInfo.man')}</span>
                </button>
                <button
                  onClick={() => setGender('woman')}
                  className={`flex-1 flex flex-col items-center gap-1.5 p-2 md:p-3 rounded-xl border-2 transition-all ${
                    gender === 'woman'
                      ? 'is-selected-purple'
                      : 'border-border/60 hover:border-primary/50'
                  }`}
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  <img src={womanSvg} alt={t('heroglyph.flow.ownerInfo.woman')} className="h-14 md:h-20 object-contain" />
                  <span className="text-xs md:text-sm font-bold tracking-wider uppercase">{t('heroglyph.flow.ownerInfo.woman')}</span>
                </button>
              </div>

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
                {t('heroglyph.flow.ownerInfo.continue')}
              </Button>
            </div>
          </motion.div>

          {/* Back button */}
          <button
            onClick={() => navigate('/heroglyph/ranking')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <ArrowLeft className="h-4 w-4" /> {t('heroglyph.flow.ownerInfo.back')}
          </button>
        </div>
      </div>

      {/* Owner name modal — always mounted for iOS keyboard */}
      <OwnerNameModal
        open={nameModalOpen}
        value={input}
        placeholder={t('heroglyph.flow.ownerInfo.placeholder')}
        title={t('heroglyph.flow.ownerInfo.greetingWord')}
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
