import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDogyptStore } from '@/store/dogyptStore';
import { HeroglyphPreview } from '@/components/HeroglyphPreview';
import { Button } from '@/components/ui/button';

function Confetti() {
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      size: 4 + Math.random() * 8,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: 'hsl(var(--gold))',
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '100vh', opacity: 0, rotate: 720 }}
          transition={{ delay: p.delay, duration: p.duration, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

export function ConfirmationScreen() {
  const { dogName, email, reset, setStep } = useDogyptStore();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const handleReturn = () => {
    reset();
    setStep(0);
  };

  return (
    <div className="papyrus-bg min-h-screen flex items-center justify-center px-4 py-12 relative">
      {showConfetti && <Confetti />}

      <motion.div
        className="flex flex-col items-center gap-8 max-w-lg text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
          {dogName}'S HEROGLYPH<br />HAS BEEN FORGED
        </h2>

        <HeroglyphPreview compact />

        <p className="text-muted-foreground">
          The sacred scroll has been sent to <strong className="text-foreground">{email}</strong>
        </p>

        <div className="flex items-center gap-4 text-2xl">
          <button className="hover:scale-110 transition-transform" title="Instagram">📸</button>
          <button className="hover:scale-110 transition-transform" title="Twitter">🐦</button>
          <button className="hover:scale-110 transition-transform" title="Facebook">📘</button>
        </div>

        <Button
          onClick={handleReturn}
          className="px-8 py-5 text-lg font-bold tracking-wider bg-primary text-primary-foreground hover:bg-primary/80 rounded-full"
          style={{ fontFamily: 'Cinzel, serif', boxShadow: '0 0 30px hsl(var(--gold) / 0.4)' }}
        >
          RETURN TO DOGYPT
        </Button>
      </motion.div>
    </div>
  );
}
