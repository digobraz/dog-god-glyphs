import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { useT } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { PageTopBar } from '@/components/PageTopBar';
import hekthorImg from '@/assets/hekthor.png';

const MAX_CHARS = 300;

export function MessageScreen() {
  const navigate = useNavigate();
  const t = useT();
  const dogName = useDogyptStore((s) => s.dogName);
  const displayName = dogName || t('heroglyph.flow.yourDogFallback');
  const setSelection = useDogyptStore((s) => s.setSelection);
  const storedMessage = useDogyptStore((s) => s.selections.dogMessage) || '';

  const [message, setMessage] = useState(storedMessage);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = message.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSubmit = charCount > 0 && !isOverLimit;

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxH = 5 * 24; // ~5 lines
    el.style.height = Math.min(el.scrollHeight, maxH) + 'px';
    el.style.overflowY = el.scrollHeight > maxH ? 'auto' : 'hidden';
  }, [message]);

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

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <PageTopBar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 min-h-0">

          {/* TOP CARD — dark with gradient */}
          <div
            className="w-full rounded-2xl relative overflow-hidden flex-shrink"
            style={{
              background: 'var(--brand-gradient)',
            }}
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

              {/* Textarea */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('heroglyph.flow.message.placeholder', { dogName: displayName })}
                  maxLength={MAX_CHARS + 50}
                  rows={3}
                  className="w-full bg-card rounded-xl px-4 py-3 text-foreground text-sm leading-relaxed placeholder:text-muted-foreground/50 outline-none border-2 transition-colors resize-none"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    borderColor: message.length > 0
                      ? 'hsl(var(--gold))'
                      : 'hsl(var(--border) / 0.3)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'hsl(var(--gold))';
                  }}
                  onBlur={(e) => {
                    if (message.length === 0) {
                      e.currentTarget.style.borderColor = 'hsl(var(--border) / 0.3)';
                    }
                  }}
                />
                {/* Character counter */}
                <span
                  className="absolute bottom-2 right-3 text-xs font-medium"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: isOverLimit ? 'hsl(0 70% 55%)' : 'hsl(var(--gold))',
                  }}
                >
                  {charCount} / {MAX_CHARS}
                </span>
              </div>

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
    </div>
  );
}