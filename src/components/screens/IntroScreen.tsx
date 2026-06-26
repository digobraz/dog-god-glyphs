import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDogyptStore } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import introMedallionImg from '@/assets/intro-medallion.png';
import legendIconUrl from '@/assets/legend-icon.svg';
import angelIconUrl from '@/assets/angel-icon.svg';
import { useT } from '@/i18n/LanguageContext';

// ── /heroglyph/intro — dedikačný predkrok (nepočítaný)
// Misijné intro (medailón + 2-col header + body2 rámik) + výber živý/mŕtvy psa.
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

      {/* justify-center vertikálne centruje na väčších obrazovkách;
          overflow-y-auto je záchrana pre extrémne malé zariadenia */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col gap-2.5 py-2">

          {/* Block 1 — brand modro-zlatý gradient (tmavý → svetlý text) */}
          <motion.div
            className="w-full rounded-2xl p-4 md:p-5 flex flex-col gap-3"
            style={{
              background: 'var(--brand-gradient)',
              border: '2px solid rgba(160,116,35,0.55)',
            }}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {/* Horný riadok: medailón VĽAVO, eyebrow/title/body VPRAVO */}
            <div className="flex gap-4 items-start">
              {/* Medailón — vlastný kruhový rám, žiadny ďalší wrapper */}
              <img
                src={introMedallionImg}
                alt="DOGYPT — Matej a pes"
                className="w-[140px] h-[140px] md:w-[170px] md:h-[170px] object-contain flex-shrink-0"
              />

              {/* Pravý stĺpec: eyebrow + title + body (1. odsek) — svetlý text na tmavom */}
              <div className="flex-1 flex flex-col gap-2">
                <p
                  className="text-[10px] uppercase tracking-[0.22em] font-semibold"
                  style={{ fontFamily: "'Cinzel', serif", color: '#E5C16E' }}
                >
                  {t('intro.eyebrow')}
                </p>
                <h2
                  className="text-xl md:text-2xl font-bold leading-snug"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    color: '#FAF4EC',
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                  }}
                >
                  {t('intro.title')}
                </h2>
                <p
                  className="text-xs md:text-sm leading-snug"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: 'rgba(250,244,236,0.92)',
                  }}
                >
                  {t('intro.body')}
                </p>
              </div>
            </div>

            {/* body2 — rámik na tmavom: gold border, presvitavá výplň, krémový text */}
            <div
              style={{
                border: '1px solid rgba(229,193,110,0.4)',
                borderRadius: 8,
                padding: '8px 10px',
                background: 'rgba(255,250,240,0.10)',
              }}
            >
              <p
                className="text-[11px] md:text-xs leading-snug"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: 'rgba(250,244,236,0.85)',
                }}
              >
                {t('intro.body2')}
              </p>
            </div>
          </motion.div>

          {/* Block 2 — papyrus karta: otázka + voľby + Continue */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex flex-col gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
          >
            <p
              className="text-center text-[11px] md:text-xs font-bold uppercase tracking-wider"
              style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}
            >
              {t('intro.question')}
            </p>

            {/* Voľby — brand hand-drawn SVG ikonky, selected štýl z DogBloodlineScreen */}
            <div className="flex gap-2.5 w-full">
              {/* alive → Legend.svg */}
              <button
                onClick={() => handleSelect('alive')}
                className={`flex-1 flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${
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
                  className="h-8 w-8 object-contain flex-shrink-0"
                  style={{ filter: 'brightness(0)' }}
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-wider leading-tight text-center"
                >
                  {t('intro.alive')}
                </span>
              </button>

              {/* deceased → Angel.svg */}
              <button
                onClick={() => handleSelect('deceased')}
                className={`flex-1 flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${
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
                  className="h-8 w-8 object-contain flex-shrink-0"
                  style={{
                    filter: selected === 'deceased'
                      ? 'brightness(0) invert(1)'
                      : 'brightness(0)',
                  }}
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-wider leading-tight text-center"
                >
                  {t('intro.deceased')}
                </span>
              </button>
            </div>

            {/* Continue — vždy aktívny, gold gradient ako ostatné flow kroky */}
            <Button
              onClick={handleContinue}
              className="w-full rounded-xl gap-2 h-9 md:h-10 font-bold tracking-wider hover:scale-[1.02] transition-transform"
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
