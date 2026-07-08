import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { useT } from '@/i18n/LanguageContext';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { PageTopBar } from '@/components/PageTopBar';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import hekthorImg from '@/assets/hekthor.png';
import kingSvg from '@/assets/gender/GENDER-MALE.svg';
import queenSvg from '@/assets/gender/GENDER-FEMALE.svg';

export function DogGenderScreen() {
  const navigate = useNavigate();
  const t = useT();
  const flowOk = useFlowGuard();
  const dogName = useDogyptStore((s) => s.dogName);
  const displayName = dogName || t('heroglyph.flow.yourDogFallback');
  const setSelection = useDogyptStore((s) => s.setSelection);
  const [selected, setSelected] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const navigateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (navigateTimeout.current) clearTimeout(navigateTimeout.current);
    };
  }, []);

  const handleSelect = (gender: string) => {
    setSelected(gender);
    setSelection('dogGender', gender);
    navigateTimeout.current = setTimeout(() => navigate('/heroglyph/dog-fate'), 500);
  };

  if (!flowOk) return null;

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <PageTopBar />

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
                <HeroglyphFrame showOwner className="text-foreground" pulseSlot="dogGender" />
              </div>
            </div>
          </motion.div>

          {/* 2. BLOCK */}
          <motion.div
            className="w-full rounded-2xl relative overflow-hidden min-h-[180px]"
            style={{ background: 'var(--brand-gradient)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Info toggle */}
            <button
              className="absolute top-3 right-3 z-20 flex items-center justify-center"
              style={{ width: 44, height: 44 }}
              aria-label={t('heroglyph.flow.dogGender.infoAria')}
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
                {t('heroglyph.flow.dogGender.title')}
              </h3>
              <p className="text-white text-sm md:text-base leading-relaxed drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                {t('heroglyph.flow.dogGender.questionPrefix')} <span className="font-bold text-amber-300">{t('heroglyph.flow.dogGender.questionKing')}</span> {t('heroglyph.flow.dogGender.questionOr')} <span className="font-bold text-amber-300">{t('heroglyph.flow.dogGender.questionQueen')}</span>{t('heroglyph.flow.dogGender.questionSuffix')}
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
                    {/* 3-Point Crown */}
                    <div className="flex flex-col items-center justify-center p-3 md:p-5 text-center">
                      <h4
                        className="text-sm md:text-base font-bold tracking-wider uppercase text-heading-on-light mb-2"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        {t('heroglyph.flow.dogGender.info3Title')}
                      </h4>
                      <p
                        className="text-foreground/70 text-[11px] md:text-xs leading-snug"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {t('heroglyph.flow.dogGender.info3Body')}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="absolute left-1/2 top-4 bottom-4 w-px bg-foreground/10" />

                    {/* 4-Point Crown */}
                    <div className="flex flex-col items-center justify-center p-3 md:p-5 text-center">
                      <h4
                        className="text-sm md:text-base font-bold tracking-wider uppercase text-heading-on-light mb-2"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        {t('heroglyph.flow.dogGender.info4Title')}
                      </h4>
                      <p
                        className="text-foreground/70 text-[11px] md:text-xs leading-snug"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {t('heroglyph.flow.dogGender.info4Body')}
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
                onClick={() => handleSelect('king')}
                className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                  selected === 'king'
                    ? 'is-selected-purple'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={kingSvg} alt={t('heroglyph.flow.dogGender.king')} className="h-12 md:h-16 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase">{t('heroglyph.flow.dogGender.king')}</span>
              </button>

              <button
                onClick={() => handleSelect('queen')}
                className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                  selected === 'queen'
                    ? 'is-selected-purple'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={queenSvg} alt={t('heroglyph.flow.dogGender.queen')} className="h-12 md:h-16 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase">{t('heroglyph.flow.dogGender.queen')}</span>
              </button>
            </div>
          </motion.div>

          {/* Back button */}
          <button
            onClick={() => navigate('/heroglyph/owner-final')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <ArrowLeft className="h-4 w-4" /> {t('heroglyph.flow.dogGender.back')}
          </button>
        </div>
      </div>
    </div>
  );
}
