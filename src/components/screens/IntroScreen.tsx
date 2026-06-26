import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDogyptStore } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import hekthorImg from '@/assets/hekthor.png';
import { useT } from '@/i18n/LanguageContext';

// ── /heroglyph/intro — dedikačný predkrok (nepočítaný)
// Misijné intro + výber živý / mŕtvy psa → uloží lifeStatus do store.
// Route: /heroglyph/intro
// Back: /heroglyph (sales)  ·  Continue: /heroglyph/name
export function IntroScreen() {
  const navigate = useNavigate();
  const t = useT();
  const setLifeStatus = useDogyptStore((s) => s.setLifeStatus);
  const storedLifeStatus = useDogyptStore((s) => s.lifeStatus);

  // Default = alive (predvolene vybraté podľa spec)
  const [selected, setSelected] = useState<'alive' | 'deceased'>(
    storedLifeStatus ?? 'alive',
  );

  const handleSelect = (v: 'alive' | 'deceased') => {
    setSelected(v);
    setLifeStatus(v);
  };

  const handleContinue = () => {
    setLifeStatus(selected);
    navigate('/heroglyph/name');
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <PageTopBar onBack={() => navigate('/heroglyph')} />

      <div className="flex-1 flex flex-col items-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 py-2 my-auto">

          {/* Block 1 — brand-gradient bubble: Hekthor + eyebrow + title + body */}
          <motion.div
            className="w-full rounded-2xl relative overflow-hidden"
            style={{ background: 'var(--brand-gradient)' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="px-4 py-5 md:p-6 flex flex-col items-center gap-3 md:gap-4">
              <img
                src={hekthorImg}
                alt="HEKTHOR"
                className="hek-lg w-28 h-28 md:w-44 md:h-44 object-contain"
              />
              <div className="flex flex-col items-center gap-1.5 text-center">
                <p
                  className="text-[11px] md:text-xs uppercase tracking-[0.22em] font-semibold"
                  style={{ fontFamily: "'Cinzel', serif", color: 'rgba(245,199,61,0.75)' }}
                >
                  {t('intro.eyebrow')}
                </p>
                <h2
                  className="text-base md:text-xl font-bold text-white drop-shadow-sm leading-snug"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {t('intro.title')}
                </h2>
                <p
                  className="text-white/75 text-sm md:text-base leading-relaxed"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {t('intro.body')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Block 2 — papyrus karta: otázka + voľby + Continue */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-4 md:p-6 flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <p
              className="text-center text-sm md:text-base font-bold uppercase tracking-wider"
              style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}
            >
              {t('intro.question')}
            </p>

            {/* Voľby — selected štýl z DogBloodlineScreen */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => handleSelect('alive')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all font-bold text-sm md:text-base uppercase tracking-wider ${
                  selected === 'alive'
                    ? 'is-selected-purple'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {t('intro.alive')}
              </button>
              <button
                onClick={() => handleSelect('deceased')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all font-bold text-sm md:text-base uppercase tracking-wider ${
                  selected === 'deceased'
                    ? 'is-selected-purple'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {t('intro.deceased')}
              </button>
            </div>

            {/* Continue — vždy aktívny (alive je predvolené) */}
            <Button
              onClick={handleContinue}
              className="w-full rounded-xl gap-2 h-10 md:h-11 font-bold tracking-wider hover:scale-[1.02] transition-transform"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                color: '#000',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
              }}
            >
              {t('intro.continue')}
            </Button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
