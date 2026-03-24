import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDogyptStore } from '@/store/dogyptStore';
import { Button } from '@/components/ui/button';

export function DogNameScreen() {
  const { setDogName, setStep } = useDogyptStore();
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      setDogName(name.trim().toUpperCase());
      setStep(2);
    }
  };

  return (
    <div className="papyrus-bg min-h-screen flex items-center justify-center px-4">
      <motion.div
        className="flex flex-col items-center gap-8 max-w-lg w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold tracking-wide text-center" style={{ fontFamily: 'Cinzel, serif' }}>
          What is the name of your dog?
        </h2>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="ENTER NAME"
          className="w-full bg-transparent border-b-4 border-primary text-center text-3xl font-bold uppercase tracking-widest py-4 outline-none placeholder:text-muted-foreground/40"
          style={{ fontFamily: 'Cinzel, serif' }}
          autoFocus
        />

        <Button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="px-8 py-5 text-base font-bold tracking-wider bg-primary text-primary-foreground hover:bg-primary/80 rounded-full disabled:opacity-30"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          NEXT →
        </Button>
      </motion.div>
    </div>
  );
}
