import { motion } from 'framer-motion';
import { GoldParticles } from '@/components/GoldParticles';
import { Button } from '@/components/ui/button';
import { useDogyptStore } from '@/store/dogyptStore';

export function WelcomeScreen() {
  const setStep = useDogyptStore(s => s.setStep);

  return (
    <div className="papyrus-bg min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <GoldParticles count={25} />

      <motion.div
        className="flex flex-col items-center gap-6 text-center max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
          The place where DOG is GOD
        </p>

        <h1 className="flex items-center gap-1 text-3xl md:text-5xl font-bold tracking-wider" style={{ fontFamily: 'Cinzel, serif' }}>
          <span className="cartouche text-primary">DOG</span>
          <span>YPT</span>
          <span className="text-primary text-lg align-super">®</span>
        </h1>

        <motion.h2
          className="text-xl md:text-3xl font-bold tracking-wide mt-4"
          style={{ fontFamily: 'Cinzel, serif' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          EVERY DOG DESERVES TO BE A GOD
        </motion.h2>

        <motion.p
          className="text-muted-foreground max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          Transform your dog's essence into a timeless HEROGLYPH.<br />
          12 Symbols ➔ 1 Eternal Legacy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <Button
            onClick={() => setStep(1)}
            className="mt-4 px-8 py-6 text-lg font-bold tracking-wider bg-primary text-primary-foreground hover:bg-primary/80 rounded-full shadow-lg"
            style={{ fontFamily: 'Cinzel, serif', boxShadow: '0 0 30px hsl(var(--gold) / 0.4)' }}
          >
            BEGIN THE RITUAL →
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
