import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { useT } from '@/i18n/LanguageContext';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import hekthorImg from '@/assets/hekthor.png';
import raisedSvg from '@/assets/fate/FATE-RAISED.svg';
import rescuedSvg from '@/assets/fate/FATE-RESCUED.svg';

export function DogFateScreen() {
  const navigate = useNavigate();
  const t = useT();
  const dogName = useDogyptStore((s) => s.dogName);
  const displayName = dogName || t('heroglyph.flow.yourDogFallback');
  const setSelection = useDogyptStore((s) => s.setSelection);
  const [selected, setSelected] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleSelect = (fate: string) => {
    setSelected(fate);
    setSelection('dogFate', fate);
    setTimeout(() => navigate('/heroglyph/dog-colour'), 500);
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-[15px] pb-1 md:pt-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-9 md:h-12 object-contain" />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 py-2 my-auto">
          {/* 1. BLOCK */}
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
                <HeroglyphFrame showOwner className="text-foreground" pulseSlot="dogFate" />
              </div>
            </div>
          </motion.div>

          {/* 2. BLOCK */}
          <motion.div
            className="w-full rounded-2xl relative overflow-hidden min-h-[180px]"
            style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Info toggle */}
            <button
              className="absolute top-3 right-3 z-20 flex items-center justify-center"
              style={{ width: 44, height: 44 }}
              aria-label={t('heroglyph.flow.dogFate.infoAria')}
              onClick={() => setShowInfo((p) => !p)}
            >
              <span className="w-7 h-7 rounded-full border-2 border-foreground/40 flex items-center justify-center transition-colors hover:border-foreground/70">
                {showInfo
                  ? <X className="h-4 w-4 text-foreground/70" />
                  : <Info className="h-4 w-4 text-white/80" />}
              </span>
            </button>

            {/* Default content */}
            <div className="px-4 py-4 flex flex-col items-center gap-2 text-center">
              <img src={hekthorImg} alt="HEKTHOR" className="w-28 h-28 md:w-36 md:h-36 object-contain" />
              <h3
                className="text-base md:text-lg font-bold tracking-[0.2em] uppercase text-amber-300 pb-1.5 border-b border-white/20 drop-shadow-sm w-full"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {t('heroglyph.flow.dogFate.title')}
              </h3>
              <p className="text-white text-sm md:text-base leading-relaxed drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                {t('heroglyph.flow.dogFate.questionPrefix')} <span className="font-bold text-amber-300">{t('heroglyph.flow.dogFate.questionSafe')}</span> {t('heroglyph.flow.dogFate.questionOr')} <span className="font-bold text-amber-300">{t('heroglyph.flow.dogFate.questionSecond')}</span>{t('heroglyph.flow.dogFate.questionSuffix')}
              </p>
            </div>

            {/* Info overlay */}
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  className="absolute inset-0 z-10 flex rounded-2xl overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  style={{ backgroundColor: 'hsl(var(--papyrus))' }}
                >
                  <div className="relative z-10 flex-1 grid grid-cols-2 gap-0 p-4 pt-12 md:pt-4">
                    {/* Raised */}
                    <div className="flex flex-col items-center justify-center p-3 md:p-5 text-center">
                      <h4
                        className="text-sm md:text-base font-bold tracking-wider uppercase text-heading-on-light mb-2"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        {t('heroglyph.flow.dogFate.infoRaisedTitle')}
                      </h4>
                      <p
                        className="text-foreground/70 text-[11px] md:text-xs leading-snug"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {t('heroglyph.flow.dogFate.infoRaisedBody')}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="absolute left-1/2 top-4 bottom-4 w-px bg-foreground/10" />

                    {/* Rescued */}
                    <div className="flex flex-col items-center justify-center p-3 md:p-5 text-center">
                      <h4
                        className="text-sm md:text-base font-bold tracking-wider uppercase text-heading-on-light mb-2"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        {t('heroglyph.flow.dogFate.infoRescuedTitle')}
                      </h4>
                      <p
                        className="text-foreground/70 text-[11px] md:text-xs leading-snug"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {t('heroglyph.flow.dogFate.infoRescuedBody')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 3. BLOCK - Options */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-6 flex flex-col items-center gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <div className="flex gap-4 w-full">
              <button
                onClick={() => handleSelect('raised')}
                className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                  selected === 'raised'
                    ? 'is-selected-purple'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={raisedSvg} alt={t('heroglyph.flow.dogFate.raised')} className="h-12 md:h-16 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase">{t('heroglyph.flow.dogFate.raised')}</span>
              </button>

              <button
                onClick={() => handleSelect('rescued')}
                className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                  selected === 'rescued'
                    ? 'is-selected-purple'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={rescuedSvg} alt={t('heroglyph.flow.dogFate.rescued')} className="h-12 md:h-16 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase">{t('heroglyph.flow.dogFate.rescued')}</span>
              </button>
            </div>
          </motion.div>

          {/* Back button */}
          <button
            onClick={() => navigate('/heroglyph/dog-gender')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <ArrowLeft className="h-4 w-4" /> {t('heroglyph.flow.dogFate.back')}
          </button>
        </div>
      </div>
    </div>
  );
}
