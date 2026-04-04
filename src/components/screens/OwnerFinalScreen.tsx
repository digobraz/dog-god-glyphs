import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { Button } from '@/components/ui/button';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import dogyptLogo from '@/assets/dogypt-logo-round.png';
import hekthorImg from '@/assets/hekthor.png';

export function OwnerFinalScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-6 pb-3">
        <img src={dogyptLogo} alt="DOGYPT" className="h-16 md:h-20 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-5 py-4">
          {/* Heroglyph frame with title inside */}
          <motion.div
            className="w-full relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-2xl border-2 border-border papyrus-bg p-4">
              <h2
                className="text-center text-sm md:text-base font-bold tracking-[0.2em] uppercase text-primary mb-3"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {dogName || 'YOUR DOG'}'S HEROGLYPH
              </h2>
              <HeroglyphFrame showOwner className="text-foreground" />
            </div>
          </motion.div>

          {/* Hekthor message block */}
          <motion.div
            className="w-full rounded-2xl relative overflow-hidden flex-1 min-h-0"
            style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {/* Info toggle button */}
            <button
              className="absolute top-3 right-3 z-20 flex items-center justify-center"
              style={{ width: 44, height: 44 }}
              aria-label="Info about Heroglyph"
              onClick={() => setShowInfo((p) => !p)}
            >
              <span className="w-7 h-7 rounded-full border-2 border-foreground/40 flex items-center justify-center transition-colors hover:border-foreground/70">
                {showInfo
                  ? <X className="h-4 w-4 text-foreground/70" />
                  : <Info className="h-4 w-4 text-white/80" />}
              </span>
            </button>

            {/* Default content */}
            <div className="p-6 md:p-8 flex items-center gap-6 h-full">
              <img src={hekthorImg} alt="HEKTHOR" className="w-24 h-24 md:w-32 md:h-32 object-contain flex-shrink-0" />
              <div className="flex flex-col gap-4 pr-8 flex-1">
                <p className="text-white text-base md:text-lg leading-relaxed drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                  HEY MAN, your part is done. That little frame — that is you! Now let's finish HEROGLYPH with{' '}
                  <span className="font-bold text-amber-300">{dogName || 'YOUR DOG'}</span>'s part.
                </p>
                <Button
                  onClick={() => navigate('/dog-gender')}
                  className="w-full rounded-full gap-2 h-14 px-8 text-lg font-bold tracking-wider hover:scale-105 transition-transform"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                    color: '#000',
                    boxShadow: '0 0 30px hsl(var(--gold) / 0.4), 0 4px 15px rgba(0,0,0,0.3)',
                  }}
                >
                  LET'S GO <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Info overlay */}
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  className="absolute inset-0 z-10 flex flex-col rounded-2xl overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  style={{ backgroundColor: 'hsl(var(--papyrus))' }}
                >
                  <div className="relative z-10 p-6 pt-14 flex-1 flex flex-col items-center text-center gap-3 overflow-y-auto">
                    <h3
                      className="text-lg md:text-xl font-bold leading-tight uppercase tracking-wider"
                      style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}
                    >
                      NAMES IN ANCIENT EGYPT
                    </h3>
                    <p
                      className="text-foreground/80 text-sm md:text-base leading-relaxed max-w-md"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      The HEROGLYPH consists of two frames that together form your dog's true identity. In Ancient Egypt, the names of gods and pharaohs were written inside similar protective oval frames, called cartouches, to preserve their legacy for eternity.
                    </p>

                    {/* Image placeholder */}
                    <div className="w-full max-w-[220px] flex flex-col items-center gap-1.5 mt-1">
                      <div
                        className="w-full aspect-square rounded-xl border-2 flex items-center justify-center overflow-hidden"
                        style={{ borderColor: 'hsl(var(--gold-dark) / 0.35)', backgroundColor: 'hsl(var(--gold-dark) / 0.08)' }}
                      >
                        <span className="text-4xl">𓂀</span>
                      </div>
                      <p
                        className="text-foreground/50 text-[10px] md:text-xs italic"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        This hieroglyph belongs to Cleopatra.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Back button */}
          <button
            onClick={() => navigate('/owner-zodiac')}
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
