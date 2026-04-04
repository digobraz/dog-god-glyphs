import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import hekthorImg from '@/assets/hekthor.png';
import raisedSvg from '@/assets/fate/FATE-RAISED.svg';
import rescuedSvg from '@/assets/fate/FATE-RESCUED.svg';

export function DogFateScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const [selected, setSelected] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleSelect = (fate: string) => {
    setSelected(fate);
    setSelection('dogFate', fate);
    setTimeout(() => navigate('/dog-colour'), 500);
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-2 pb-1">
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-14 object-contain" />
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
                {dogName || 'YOUR DOG'}'S HEROGLYPH
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
              aria-label="Info about Dog Fate"
              onClick={() => setShowInfo((p) => !p)}
            >
              <span className="w-7 h-7 rounded-full border-2 border-foreground/40 flex items-center justify-center transition-colors hover:border-foreground/70">
                {showInfo
                  ? <X className="h-4 w-4 text-foreground/70" />
                  : <Info className="h-4 w-4 text-white/80" />}
              </span>
            </button>

            {/* Default content */}
            <div className="p-6 md:p-8 flex items-center gap-5 min-h-[180px]">
              <img src={hekthorImg} alt="HEKTHOR" className="w-20 h-20 md:w-24 md:h-24 object-contain flex-shrink-0" />
              <div className="flex flex-col gap-2 pr-8">
                <h3
                  className="text-base md:text-lg font-bold tracking-[0.2em] uppercase text-amber-300 pb-1.5 border-b border-white/20 drop-shadow-sm"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  The Origin
                </h3>
                <p className="text-white text-base md:text-lg leading-relaxed drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                  Was your dog born into a <span className="font-bold text-amber-300">safe home</span> or given a <span className="font-bold text-amber-300">second chance</span> at life?
                </p>
              </div>
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
                        Baby Pacifier
                      </h4>
                      <p
                        className="text-foreground/70 text-[11px] md:text-xs leading-snug"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        A dog born into the family. Raised with love from day one.
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
                        Lifebuoy
                      </h4>
                      <p
                        className="text-foreground/70 text-[11px] md:text-xs leading-snug"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        A rescued or found dog. Given a second chance at life.
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
                    ? 'border-primary bg-primary/10'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={raisedSvg} alt="Raised" className="h-12 md:h-16 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase">Raised</span>
              </button>

              <button
                onClick={() => handleSelect('rescued')}
                className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                  selected === 'rescued'
                    ? 'border-primary bg-primary/10'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={rescuedSvg} alt="Rescued" className="h-12 md:h-16 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase">Rescued</span>
              </button>
            </div>
          </motion.div>

          {/* Back button */}
          <button
            onClick={() => navigate('/dog-gender')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </div>
    </div>
  );
}
