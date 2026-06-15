import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { useT } from '@/i18n/LanguageContext';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { PageTopBar } from '@/components/PageTopBar';
import hekthorImg from '@/assets/hekthor.png';
import brightSvg from '@/assets/colour/COLOUR-BRIGHT.svg';
import darkSvg from '@/assets/colour/COLOUR-DARK.svg';
import mixSvg from '@/assets/colour/COLOUR-MIX.svg';

export function DogColourScreen() {
  const navigate = useNavigate();
  const t = useT();
  const dogName = useDogyptStore((s) => s.dogName);
  const displayName = dogName || t('heroglyph.flow.yourDogFallback');
  const setSelection = useDogyptStore((s) => s.setSelection);
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (colour: string) => {
    setSelected(colour);
    setSelection('dogColour', colour);
    setTimeout(() => navigate('/heroglyph/dog-bloodline'), 500);
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <PageTopBar />

      <div className="flex-1 flex flex-col items-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 py-2 my-auto">
          {/* 1. BLOCK - Heroglyph preview with pulsing slot */}
          <motion.div
            className="w-full relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-2xl border-2 border-border papyrus-bg px-6 pt-6 pb-6">
              <h2
                className="text-center text-base md:text-lg font-bold tracking-[0.2em] uppercase text-primary mb-3"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {t('heroglyph.flow.dogHeroglyphTitle', { dogName: displayName })}
              </h2>
              <div className="px-2">
                <HeroglyphFrame showOwner className="text-foreground" pulseSlot="dogColour" />
              </div>
            </div>
          </motion.div>

          {/* 2. BLOCK - Hekthor question */}
          <motion.div
            className="w-full rounded-2xl px-4 py-4 flex flex-col items-center gap-2 text-center"
            style={{ background: 'var(--brand-gradient)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-28 h-28 md:w-36 md:h-36 object-contain" />
            <h3
              className="text-base md:text-lg font-bold tracking-[0.2em] uppercase text-amber-300 pb-1.5 border-b border-white/20 drop-shadow-sm w-full"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {t('heroglyph.flow.dogColour.title')}
            </h3>
            <p className="text-white text-sm md:text-base leading-relaxed drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
              {t('heroglyph.flow.dogColour.questionPrefix')} <span className="font-bold text-amber-300">{t('heroglyph.flow.dogColour.questionCoat')}</span>{t('heroglyph.flow.dogColour.questionSuffix')}
            </p>
          </motion.div>

          {/* 3. BLOCK - Options */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-6 flex flex-col items-center gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <div className="flex gap-4 w-full">
              {/* BRIGHT */}
              <button
                onClick={() => handleSelect('bright')}
                className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  selected === 'bright'
                    ? 'is-selected-purple'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={brightSvg} alt={t('heroglyph.flow.dogColour.bright')} className="h-10 md:h-14 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase">{t('heroglyph.flow.dogColour.bright')}</span>
                <span className="text-xs text-muted-foreground text-center leading-snug">
                  {t('heroglyph.flow.dogColour.brightSub')}
                </span>
              </button>

              {/* DARK */}
              <button
                onClick={() => handleSelect('dark')}
                className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  selected === 'dark'
                    ? 'is-selected-purple'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={darkSvg} alt={t('heroglyph.flow.dogColour.dark')} className="h-10 md:h-14 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase">{t('heroglyph.flow.dogColour.dark')}</span>
                <span className="text-xs text-muted-foreground text-center leading-snug">
                  {t('heroglyph.flow.dogColour.darkSub')}
                </span>
              </button>

              {/* MIX */}
              <button
                onClick={() => handleSelect('mix')}
                className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  selected === 'mix'
                    ? 'is-selected-purple'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={mixSvg} alt={t('heroglyph.flow.dogColour.mix')} className="h-10 md:h-14 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase">{t('heroglyph.flow.dogColour.mix')}</span>
                <span className="text-xs text-muted-foreground text-center leading-snug">
                  {t('heroglyph.flow.dogColour.mixSub')}
                </span>
              </button>
            </div>
          </motion.div>

          {/* Back button */}
          <button
            onClick={() => navigate('/heroglyph/dog-fate')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <ArrowLeft className="h-4 w-4" /> {t('heroglyph.flow.dogColour.back')}
          </button>
        </div>
      </div>
    </div>
  );
}
