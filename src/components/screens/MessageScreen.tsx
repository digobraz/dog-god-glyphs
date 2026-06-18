import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { useT } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { PageTopBar } from '@/components/PageTopBar';
import { useFlowKeyboardFix } from '@/hooks/useFlowKeyboardFix';
import hekthorImg from '@/assets/hekthor.png';

const MAX_CHARS = 150;

// ── Message Compose Modal ────────────────────────────────────────────────────
// Portaled to document.body so the underlying screen never reflows when the
// iOS keyboard appears. Card sits near the top so the keyboard doesn't cover it.

interface MessageModalProps {
  value: string;
  placeholder: string;
  doneLabel: string;
  isOverLimit: boolean;
  charCount: number;
  maxChars: number;
  onChange: (v: string) => void;
  onDone: () => void;
  onClose: () => void;
}

function MessageModal({
  value,
  placeholder,
  doneLabel,
  isOverLimit,
  charCount,
  maxChars,
  onChange,
  onDone,
  onClose,
}: MessageModalProps) {
  // Auto-focus: keyboard is already open (hidden input grabbed it), transfer immediately
  const handleMount = useCallback((node: HTMLTextAreaElement | null) => {
    if (node) node.focus();
  }, []);

  return createPortal(
    <div className="msg-modal-root" role="dialog" aria-modal="true">
      {/* Scrim — tap to close */}
      <div className="msg-modal-backdrop" onClick={onClose} />

      {/* Card */}
      <div className="msg-modal-card">
        {/* Textarea */}
        <div className="relative mt-1">
          <textarea
            ref={handleMount}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={MAX_CHARS + 50}
            rows={5}
            className="msg-modal-textarea"
            style={{
              borderColor: isOverLimit
                ? 'hsl(0 70% 55%)'
                : value.length > 0
                  ? 'hsl(var(--gold))'
                  : 'hsl(var(--border) / 0.3)',
            }}
          />
          {/* Char counter */}
          <span
            className="absolute bottom-3 right-3 text-xs font-medium"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: isOverLimit ? 'hsl(0 70% 55%)' : 'hsl(var(--gold))',
            }}
          >
            {charCount} / {maxChars}
          </span>
        </div>

        {/* Done button */}
        <button
          type="button"
          className="msg-modal-done"
          onClick={onDone}
          disabled={isOverLimit}
        >
          {doneLabel}
        </button>
      </div>

      <style>{`
        .msg-modal-root {
          position: fixed;
          inset: 0;
          z-index: 2100;
          display: flex;
          flex-direction: column;
          align-items: center;
          /* Align card toward the top so the iOS keyboard (which pushes up from the
             bottom) doesn't overlap it. padding-top = safe-area + small gap. */
          padding-top: max(env(safe-area-inset-top, 0px) + 48px, 60px);
          padding-left: 16px;
          padding-right: 16px;
        }
        .msg-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.78);
          -webkit-backdrop-filter: blur(3px);
          backdrop-filter: blur(3px);
          animation: msgScrimIn 160ms ease-out;
        }
        .msg-modal-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 520px;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid rgba(201, 154, 63, 0.55);
          border-radius: 16px;
          padding: 20px 16px 16px;
          box-shadow: 0 20px 64px rgba(0, 0, 0, 0.65);
          animation: msgCardIn 220ms cubic-bezier(0.2, 0.8, 0.3, 1.1);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .msg-modal-textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 12px;
          padding: 12px 14px 28px 14px; /* bottom space for counter */
          color: #1a1208;
          line-height: 1.6;
          outline: none;
          border-width: 2px;
          border-style: solid;
          resize: none;
          transition: border-color 150ms ease;
          /* 16px prevents iOS auto-zoom */
          font-size: 16px;
          font-family: 'Space Grotesk', sans-serif;
          min-height: 130px;
        }
        .msg-modal-done {
          width: 100%;
          height: 44px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #000;
          background: linear-gradient(135deg, #F5C73D, #E69E1A);
          box-shadow: 0 0 30px rgba(201, 154, 63, 0.45), 0 3px 12px rgba(0,0,0,0.25);
          transition: opacity 150ms ease, transform 150ms ease;
        }
        .msg-modal-done:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          box-shadow: none;
        }
        .msg-modal-done:not(:disabled):active { transform: scale(0.97); }
        @keyframes msgScrimIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes msgCardIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)     scale(1); }
        }
      `}</style>
    </div>,
    document.body,
  );
}

// ── MessageScreen ────────────────────────────────────────────────────────────

export function MessageScreen() {
  useFlowKeyboardFix();

  const navigate = useNavigate();
  const t = useT();
  const dogName = useDogyptStore((s) => s.dogName);
  const displayName = dogName || t('heroglyph.flow.yourDogFallback');
  const setSelection = useDogyptStore((s) => s.setSelection);
  const storedMessage = useDogyptStore((s) => s.selections.dogMessage) || '';

  // Local draft while the modal is open; committed to store on Done/submit
  const [message, setMessage] = useState(storedMessage);
  const [modalOpen, setModalOpen] = useState(false);

  const charCount = message.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSubmit = charCount > 0 && !isOverLimit;

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const openModal = () => {
    // iOS requires focus() called synchronously inside a user gesture to open the keyboard.
    // We grab focus with a hidden input here, then transfer to the textarea when it mounts.
    hiddenInputRef.current?.focus();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    // Persist whatever was typed when user dismisses via backdrop / X
    setSelection('dogMessage', message.trim());
  };

  const doneModal = () => {
    setModalOpen(false);
    setSelection('dogMessage', message.trim());
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSelection('dogMessage', message.trim());

    // Haptic
    if (navigator.vibrate) navigator.vibrate(15);

    // Tick sound
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1800;
      gain.gain.value = 0.08;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}

    navigate('/checkout');
  };

  const placeholder = t('heroglyph.flow.message.placeholder', { dogName: displayName });

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* Hidden input — iOS keyboard trick: focused synchronously in user gesture */}
      <input
        ref={hiddenInputRef}
        type="text"
        aria-hidden="true"
        readOnly
        style={{ position: 'fixed', top: 0, left: 0, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
      <PageTopBar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 min-h-0">

          {/* TOP CARD — dark with gradient */}
          <div
            className="w-full rounded-2xl relative overflow-hidden flex-shrink"
            style={{ background: 'var(--brand-gradient)' }}
          >
            <div className="px-4 py-5 md:p-6 flex flex-col items-center gap-3 md:gap-4">
              <img src={hekthorImg} alt="HEKTHOR" className="w-36 h-36 md:w-44 md:h-44 object-contain" />
              <p
                className="text-white text-center text-base md:text-xl leading-snug drop-shadow-sm"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {t('heroglyph.flow.message.promptPrefix')}
                <span className="font-bold text-amber-300">{displayName}</span>{t('heroglyph.flow.message.promptMid')}
                <br />
                {t('heroglyph.flow.message.promptStayPrefix')}
                <span className="font-bold">{t('heroglyph.flow.message.promptStayWord')}</span>{t('heroglyph.flow.message.promptStaySuffix')}
              </p>
            </div>
          </div>

          {/* BOTTOM CARD — cream */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex-shrink-0"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="flex flex-col gap-2 md:gap-3">
              {/* Section heading */}
              <p
                className="text-xs uppercase tracking-widest text-muted-foreground text-center"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t('heroglyph.flow.message.yourMessage')}
              </p>

              {/* Read-only preview — tap to open compose modal */}
              <button
                type="button"
                onClick={openModal}
                className="w-full text-left rounded-xl px-4 py-3 leading-relaxed border-2 transition-colors relative"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '16px',
                  minHeight: '88px',
                  borderColor: message.length > 0
                    ? 'hsl(var(--gold))'
                    : 'hsl(var(--border) / 0.3)',
                  background: 'hsl(var(--card))',
                  color: message.length > 0
                    ? 'hsl(var(--foreground))'
                    : 'hsl(var(--muted-foreground) / 0.5)',
                  cursor: 'text',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message.length > 0 ? message : placeholder}
                {/* Char counter shown in preview too */}
                {message.length > 0 && (
                  <span
                    className="absolute bottom-2 right-3 text-xs font-medium"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: isOverLimit ? 'hsl(0 70% 55%)' : 'hsl(var(--gold))',
                    }}
                  >
                    {charCount} / {MAX_CHARS}
                  </span>
                )}
              </button>

              {/* Info line */}
              <p
                className="text-[10px] md:text-xs text-muted-foreground text-center leading-relaxed"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t('heroglyph.flow.message.profileNotePrefix')}
                <span className="font-semibold text-foreground/70">{t('heroglyph.flow.message.profileNoteSite')}</span>{t('heroglyph.flow.message.profileNoteSuffix')}
              </p>

              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full rounded-xl gap-2 h-10 md:h-11 font-bold tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: canSubmit
                    ? 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))'
                    : undefined,
                  color: canSubmit ? '#000' : undefined,
                  boxShadow: canSubmit
                    ? '0 0 40px hsl(var(--gold) / 0.5), 0 4px 20px rgba(0,0,0,0.3)'
                    : undefined,
                }}
              >
                {t('heroglyph.flow.message.cta')}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Compose modal — portaled to body, prevents page reflow on keyboard open */}
      {modalOpen && (
        <MessageModal
          value={message}
          placeholder={placeholder}
          doneLabel={t('heroglyph.flow.message.done')}
          isOverLimit={isOverLimit}
          charCount={charCount}
          maxChars={MAX_CHARS}
          onChange={setMessage}
          onDone={doneModal}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
