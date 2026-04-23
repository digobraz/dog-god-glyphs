import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Info, X } from 'lucide-react';
import { useDogyptStore } from '@/store/dogyptStore';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { VerticalHeroglyphFrame } from '@/components/VerticalHeroglyphFrame';
import { CustomCharacterBadge } from '@/components/CustomCharacterBadge';
import { GoldParticles } from '@/components/GoldParticles';
import { Button } from '@/components/ui/button';
import hekthorImg from '@/assets/hekthor.png';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import dogyptLogoRound from '@/assets/dogypt-logo-round.png';

export function HeroglyphRevealScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const [phase, setPhase] = useState<'intro' | 'reveal' | 'complete'>('intro');
  const [showVertical, setShowVertical] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 1800);
    const t2 = setTimeout(() => setPhase('complete'), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="dark-bg min-h-[100dvh] flex flex-col items-center relative overflow-hidden">
      <GoldParticles count={30} />

      {/* Intro flash */}
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div
            className="flex items-center justify-center"
            style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: '#050505' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.img
              src={dogyptLogoRound}
              alt="DOGYPT"
              className="w-36 h-36 md:w-48 md:h-48 rounded-full"
              initial={{ scale: 0, rotate: -360 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1.4, type: 'spring', bounce: 0.3 }}
              style={{
                filter: 'drop-shadow(0 0 40px hsl(var(--gold) / 0.6))',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        className={`flex flex-col items-center w-full max-w-xl px-4 z-10 ${showVertical ? 'py-4 gap-4' : 'py-8 gap-8'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase !== 'intro' ? 1 : 0 }}
        transition={{ duration: 1 }}
      >
        {/* Logo */}
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-14 object-contain" />

        {/* 1. BLOCK - Ornamental frame with heroglyph */}
        <motion.div
          className="w-full relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={phase !== 'intro' ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 1, type: 'spring', bounce: 0.3 }}
          layout
        >
          <div
            className="rounded-3xl p-1"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)), hsl(var(--gold)))',
              boxShadow: '0 0 40px hsl(var(--gold) / 0.4), inset 0 0 20px hsl(var(--gold) / 0.2)',
            }}
          >
            <div className={`rounded-[1.25rem] bg-background ${showVertical ? 'p-3 md:p-4' : 'p-4 md:p-6'}`}>
              <motion.h1
                className={`text-center font-bold tracking-[0.25em] uppercase text-primary text-xl md:text-2xl ${showVertical ? 'mb-2' : 'mb-4'}`}
                style={{
                  fontFamily: "'Dogyptian', serif",
                  textShadow: '0 0 30px hsl(var(--gold) / 0.5)',
                }}
                layout
              >
                {dogName}'s Heroglyph
              </motion.h1>

              <AnimatePresence mode="wait">
                {!showVertical ? (
                  <motion.div
                    key="horizontal"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <HeroglyphFrame showOwner className="text-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="vertical"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center"
                    style={{ maxHeight: 'calc(100dvh - 420px)' }}
                  >
                    <VerticalHeroglyphFrame className="text-foreground h-full w-auto" />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className={`flex items-center justify-center gap-3 flex-wrap ${showVertical ? 'mt-2' : 'mt-4'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={phase === 'complete' ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <CustomCharacterBadge />
                <Button
                  variant="outline"
                  className="rounded-full px-6 py-3 text-sm font-bold tracking-wider border-2 hover:scale-105 transition-transform"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    borderColor: 'hsl(var(--gold))',
                    color: 'hsl(var(--gold))',
                    backgroundColor: 'transparent',
                  }}
                  onClick={() => setShowVertical(!showVertical)}
                >
                  {showVertical ? '↔ HORIZONTAL DESIGN' : '↕ VERTICAL DESIGN'}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* 2. BLOCK - Hekthor message */}
        {!showVertical ? (
          <motion.div
            className="w-full relative"
            initial={{ opacity: 0, y: 30 }}
            animate={phase === 'complete' ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div
              className="w-full rounded-2xl p-5 flex flex-col gap-4 relative"
              style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            >
              {/* Info button */}
              <button
                className="absolute top-3 right-3 z-20 flex items-center justify-center"
                style={{ width: 44, height: 44 }}
                aria-label="Info"
                onClick={() => setShowInfo((p) => !p)}
              >
                <span className="w-7 h-7 rounded-full border-2 border-white/40 flex items-center justify-center transition-colors hover:border-white/70">
                  {showInfo
                    ? <X className="h-4 w-4 text-white/70" />
                    : <Info className="h-4 w-4 text-white/80" />}
                </span>
              </button>

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
                    <div className="relative z-10 flex-1 p-5 pt-12 md:pt-5 flex flex-col justify-center">
                      <h3
                        className="text-center text-base md:text-lg font-bold tracking-[0.2em] uppercase text-primary mb-3"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        OUR VISION
                      </h3>
                      <p
                        className="text-xs md:text-sm leading-relaxed text-center text-black"
                      >
                        To claim your official symbol, we ask for a symbolic tribute. Our grand plan is simple: a Heroglyph for every dog on Earth. Because the bigger our global pack becomes, the more heroes we can rescue from the streets and shelters. Join the dynasty!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col items-center gap-3 md:flex-row md:items-center md:gap-5">
                <img src={hekthorImg} alt="HEKTHOR" className="w-36 h-36 md:w-32 md:h-32 object-contain flex-shrink-0" />
                <div className="text-white drop-shadow-sm text-center md:text-left" style={{ fontFamily: "'Cinzel', serif" }}>
                  <p className="font-bold text-amber-300 text-lg md:text-xl">WELCOME TO DOGYPT!</p>
                  <p className="font-semibold text-sm md:text-base mt-1">
                    This Heroglyph is your eternal bond.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/pay-wall')}
                className="w-full rounded-full py-6 text-lg font-bold tracking-wider hover:scale-105 transition-transform border-2 border-white/30"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
                  color: '#000',
                  boxShadow: '0 0 40px hsl(45 90% 60% / 0.6), 0 0 15px hsl(45 90% 60% / 0.3), 0 4px 15px rgba(0,0,0,0.4)',
                }}
              >
                GRAB MY HEROGLYPH
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="w-full rounded-xl px-4 py-3 flex flex-col gap-3 relative"
              style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            >
              {/* Info button compact */}
              <button
                className="absolute top-2 right-2 z-20 flex items-center justify-center"
                style={{ width: 36, height: 36 }}
                aria-label="Info"
                onClick={() => setShowInfo((p) => !p)}
              >
                <span className="w-6 h-6 rounded-full border-2 border-white/40 flex items-center justify-center transition-colors hover:border-white/70">
                  {showInfo
                    ? <X className="h-3 w-3 text-white/70" />
                    : <Info className="h-3 w-3 text-white/80" />}
                </span>
              </button>

              {/* Info overlay compact */}
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    className="absolute inset-0 z-10 flex rounded-xl overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    style={{ backgroundColor: 'hsl(var(--papyrus))' }}
                  >
                    <div className="relative z-10 flex-1 p-4 pt-10 md:pt-4 flex flex-col justify-center">
                      <h3
                        className="text-center text-sm font-bold tracking-[0.2em] uppercase text-primary mb-2"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        OUR VISION
                      </h3>
                      <p
                        className="text-[10px] md:text-xs leading-relaxed text-center text-black"
                      >
                        To claim your official symbol, we ask for a symbolic tribute. Our grand plan is simple: a Heroglyph for every dog on Earth. Because the bigger our global pack becomes, the more heroes we can rescue from the streets and shelters. Join the dynasty!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3">
                <img src={hekthorImg} alt="HEKTHOR" className="w-10 h-10 object-contain flex-shrink-0" />
                <p className="font-bold text-amber-300 text-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                  WELCOME TO DOGYPT!
                </p>
              </div>
              <Button
                onClick={() => navigate('/pay-wall')}
                className="w-full rounded-full py-4 text-base font-bold tracking-wider hover:scale-105 transition-transform border-2 border-white/30"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
                  color: '#000',
                  boxShadow: '0 0 40px hsl(45 90% 60% / 0.6), 0 0 15px hsl(45 90% 60% / 0.3), 0 4px 15px rgba(0,0,0,0.4)',
                }}
              >
                GRAB MY HEROGLYPH
              </Button>
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
