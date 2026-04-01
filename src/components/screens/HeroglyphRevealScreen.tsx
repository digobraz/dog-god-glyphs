import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { VerticalHeroglyphFrame } from '@/components/VerticalHeroglyphFrame';
import { GoldParticles } from '@/components/GoldParticles';
import { Button } from '@/components/ui/button';
import hekthorImg from '@/assets/hekthor.png';
import dogyptLogo from '@/assets/dogypt-logo.png';

export function HeroglyphRevealScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const [phase, setPhase] = useState<'intro' | 'reveal' | 'complete'>('intro');
  const [showVertical, setShowVertical] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 1800);
    const t2 = setTimeout(() => setPhase('complete'), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="papyrus-bg min-h-[100dvh] flex flex-col items-center relative overflow-hidden">
      <GoldParticles count={30} />

      {/* Intro flash */}
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center papyrus-bg"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: 'spring', bounce: 0.4 }}
              className="relative"
            >
              <div
                className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, hsl(var(--gold)) 0%, hsl(var(--gold-dark)) 70%, transparent 100%)',
                  boxShadow: '0 0 80px hsl(var(--gold) / 0.6), 0 0 160px hsl(var(--gold) / 0.3)',
                }}
              >
                <span className="text-5xl md:text-6xl">🐾</span>
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-6 text-lg md:text-xl tracking-[0.3em] uppercase"
              style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold))' }}
            >
              Forging {dogName}'s Heroglyph…
            </motion.p>
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
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-12 object-contain" />

        {/* 1. BLOCK - Ornamental frame with heroglyph (horizontal or vertical) */}
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
                  fontFamily: "'Cinzel', serif",
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
                className={`flex justify-center ${showVertical ? 'mt-2' : 'mt-4'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={phase === 'complete' ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
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
            <div className="flex justify-center">
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: '16px solid transparent',
                  borderRight: '16px solid transparent',
                  borderBottom: '16px solid hsl(270 40% 25%)',
                }}
              />
            </div>
            <div
              className="w-full rounded-2xl p-5 flex items-start gap-4"
              style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            >
              <img src={hekthorImg} alt="HEKTHOR" className="w-16 h-16 md:w-20 md:h-20 object-contain flex-shrink-0" />
              <div className="text-white drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                <p className="font-bold text-amber-300 text-base md:text-lg">WELCOME DOGYPTIANS!</p>
                <p className="font-semibold text-sm md:text-base mt-1">
                  This Heroglyph is your eternal bond. 🐾
                </p>
                <p className="text-xs md:text-sm text-amber-100/80 mt-2 leading-relaxed">
                  My dream is for every dog and human to have one. The bigger our pack, the more dogs we can save. Thank you!
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-center">
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: '12px solid transparent',
                  borderRight: '12px solid transparent',
                  borderBottom: '12px solid hsl(270 40% 25%)',
                }}
              />
            </div>
            <div
              className="w-full rounded-xl px-4 py-3 flex items-center gap-3 -mt-[1px]"
              style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            >
              <img src={hekthorImg} alt="HEKTHOR" className="w-10 h-10 object-contain flex-shrink-0" />
              <p className="font-bold text-amber-300 text-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                WELCOME DOGYPTIANS!
              </p>
            </div>
          </motion.div>
        )}

        {/* 3. BLOCK - Join mission button */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={phase === 'complete' ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Button
            onClick={() => navigate('/pricing')}
            className="w-full rounded-full py-6 text-lg font-bold tracking-wider hover:scale-105 transition-transform"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
              color: '#000',
              boxShadow: '0 0 40px hsl(var(--gold) / 0.5), 0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            🐾 JOIN OUR MISSION
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
