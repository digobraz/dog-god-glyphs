import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeroglyphPreview } from '@/components/HeroglyphPreview';
import { useDogyptStore } from '@/store/dogyptStore';
import { Button } from '@/components/ui/button';

export function RevealScreen() {
  const { dogName, setStep } = useDogyptStore();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-col items-center gap-8"
        style={{ color: 'hsl(var(--gold))' }}
      >
        <HeroglyphPreview animate />

        {showButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Button
              onClick={() => setStep(15)}
              className="px-8 py-5 text-lg font-bold tracking-wider rounded-xl"
              style={{
                fontFamily: 'Cinzel, serif',
                backgroundColor: 'hsl(var(--gold))',
                color: '#000',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              CONTINUE →
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
