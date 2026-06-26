import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDogyptStore } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import matejFounderImg from '@/assets/matej-founder.png';
import legendIconUrl from '@/assets/legend-icon.svg';
import angelIconUrl from '@/assets/angel-icon.svg';
import { useT } from '@/i18n/LanguageContext';

// ── /heroglyph/intro — dedikačný predkrok (nepočítaný)
// Misijné intro s Matejovou fotkou + výber živý / mŕtvy psa → uloží lifeStatus do store.
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

      {/* Mierne skrolovateľné — intro má viac obsahu ako bežný krok */}
      <div className="flex-1 flex flex-col items-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 py-3 my-auto">

          {/* Block 1 — papyrus karta: Matej founder foto + eyebrow + title + body ×2 */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-4 md:p-6 flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Matej founder photo — transparent PNG, papyrus background presvitá */}
            <img
              src={matejFounderImg}
              alt="Matej — DOGYPT founder"
              className="w-36 h-44 md:w-44 md:h-56 object-contain object-top"
            />

            <div className="flex flex-col items-center gap-2 text-center">
              <p
                className="text-[11px] md:text-xs uppercase tracking-[0.22em] font-semibold"
                style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}
              >
                {t('intro.eyebrow')}
              </p>
              <h2
                className="text-base md:text-xl font-bold leading-snug"
                style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}
              >
                {t('intro.title')}
              </h2>
              <p
                className="text-foreground/80 text-sm md:text-base leading-relaxed"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t('intro.body')}
              </p>
              <p
                className="text-foreground/65 text-sm md:text-base leading-relaxed"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t('intro.body2')}
              </p>
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

            {/* Voľby — brand hand-drawn SVG ikonky + selected štýl z DogBloodlineScreen */}
            <div className="flex gap-3 w-full">
              {/* alive → Legend.svg */}
              <button
                onClick={() => handleSelect('alive')}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all font-bold text-sm uppercase tracking-wider ${
                  selected === 'alive'
                    ? 'is-selected-purple'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img
                  src={legendIconUrl}
                  alt=""
                  aria-hidden="true"
                  className="h-10 w-10 object-contain flex-shrink-0"
                  style={{
                    filter: selected === 'alive'
                      ? 'brightness(0) invert(1)'
                      : 'brightness(0)',
                  }}
                />
                <span>{t('intro.alive')}</span>
              </button>

              {/* deceased → Angel.svg */}
              <button
                onClick={() => handleSelect('deceased')}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all font-bold text-sm uppercase tracking-wider ${
                  selected === 'deceased'
                    ? 'is-selected-purple'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img
                  src={angelIconUrl}
                  alt=""
                  aria-hidden="true"
                  className="h-10 w-10 object-contain flex-shrink-0"
                  style={{
                    filter: selected === 'deceased'
                      ? 'brightness(0) invert(1)'
                      : 'brightness(0)',
                  }}
                />
                <span>{t('intro.deceased')}</span>
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
