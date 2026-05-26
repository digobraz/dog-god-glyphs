import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { Button } from '@/components/ui/button';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import hekthorImg from '@/assets/hekthor.png';
import cleopatraImg from '@/assets/cleopatra-cartouche.png';

export function OwnerFinalScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-[15px] pb-3 md:pt-6">
        <img src={dogyptLogo} alt="DOGYPT" className="h-9 md:h-12 object-contain" />
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
            <div className="rounded-2xl border-2 border-border papyrus-bg px-6 pt-6 pb-6">
              <h2
                className="text-center text-base md:text-lg font-bold tracking-[0.2em] uppercase text-primary mb-3"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {dogName || 'YOUR DOG'}'S HEROGLYPH
              </h2>
              <div className="px-2">
                <HeroglyphFrame showOwner className="text-foreground" pulseAllEmpty />
              </div>
            </div>
          </motion.div>

          {/* Hekthor message block */}
          <motion.div
            className="w-full rounded-2xl relative overflow-hidden"
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
            <div className="px-4 py-4 flex flex-col items-center gap-3 text-center">
              <img src={hekthorImg} alt="HEKTHOR" className="w-28 h-28 md:w-36 md:h-36 object-contain" />
              <p className="text-white text-sm md:text-base leading-relaxed drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                HOOMAN, your part is done.<br />
                That little frame — that is you!<br />
                Now let's finish the HEROGLYPH with{' '}
                <span className="font-bold text-amber-300">{dogName || 'YOUR DOG'}</span>'s part.
              </p>
              <Button
                onClick={() => navigate('/heroglyph/dog-gender')}
                className="w-full rounded-xl gap-2 h-11 text-base font-bold tracking-wider hover:scale-[1.02] transition-transform"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
                  color: '#000',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.4)',
                }}
              >
                LET'S GO
              </Button>
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
                  <div className="relative z-10 p-5 pt-12 md:pt-5 flex-1 flex flex-col items-center text-center">
                    <h3
                      className="text-sm md:text-base font-bold leading-tight uppercase tracking-wider mt-0 text-heading-on-light"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      INSPIRED BY ANCIENT EGYPT
                    </h3>
                    <p
                      className="text-foreground/80 text-[11px] md:text-xs leading-snug max-w-md mt-1.5"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      The HEROGLYPH consists of two frames that together form your dog's true identity. In Ancient Egypt, the names of gods and pharaohs were written inside similar protective oval frames, called cartouches, to preserve their legacy for eternity.
                    </p>

                    <div className="w-full max-w-[260px] flex flex-col items-center gap-1 mt-auto mb-5">
                      <img src={cleopatraImg} alt="Cleopatra's cartouche" className="w-full" />
                      <p
                        className="text-foreground/50 text-[10px] md:text-xs italic"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
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
            onClick={() => navigate('/heroglyph/owner-zodiac')}
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
