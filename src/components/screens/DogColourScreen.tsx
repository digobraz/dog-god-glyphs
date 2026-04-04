import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import dogyptLogo from '@/assets/dogypt-logo-round.png';
import hekthorImg from '@/assets/hekthor.png';
import brightSvg from '@/assets/colour/COLOUR-BRIGHT.svg';
import darkSvg from '@/assets/colour/COLOUR-DARK.svg';
import mixSvg from '@/assets/colour/COLOUR-MIX.svg';

export function DogColourScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (colour: string) => {
    setSelected(colour);
    setSelection('dogColour', colour);
    setTimeout(() => navigate('/dog-bloodline'), 500);
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-2 pb-1">
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-14 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 py-2 my-auto">
          {/* 1. BLOCK - Heroglyph preview with pulsing slot */}
          <motion.div
            className="w-full relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-2xl border-2 border-border <div className="rounded-2xl border-2 border-border papyrus-bg px-1.5 pt-8 pb-0">">
              <h2
                className="text-center text-base md:text-lg font-bold tracking-[0.2em] uppercase text-primary mb-2"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {dogName || 'YOUR DOG'}'S HEROGLYPH
              </h2>
              <HeroglyphFrame showOwner className="text-foreground" pulseSlot="dogColour" />
            </div>
          </motion.div>

          {/* 2. BLOCK - Hekthor question */}
          <motion.div
            className="w-full rounded-2xl p-6 md:p-8 flex items-center gap-5"
            style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-20 h-20 md:w-24 md:h-24 object-contain flex-shrink-0" />
            <p className="text-white text-base md:text-lg leading-relaxed drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
              What <span className="font-bold text-amber-300">coat</span> is your dog wearing?
            </p>
          </motion.div>

          {/* 3. BLOCK - Options */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-6 flex flex-col items-center gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <div className="flex gap-4 w-full">
              {/* BRIGHT */}
              <button
                onClick={() => handleSelect('bright')}
                className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  selected === 'bright'
                    ? 'border-primary bg-primary/10'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={brightSvg} alt="Bright" className="h-10 md:h-14 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase">Bright</span>
                <span className="text-xs text-muted-foreground text-center leading-snug">
                  Sun
                </span>
              </button>

              {/* DARK */}
              <button
                onClick={() => handleSelect('dark')}
                className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  selected === 'dark'
                    ? 'border-primary bg-primary/10'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={darkSvg} alt="Dark" className="h-10 md:h-14 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase">Dark</span>
                <span className="text-xs text-muted-foreground text-center leading-snug">
                  Moon
                </span>
              </button>

              {/* MIX */}
              <button
                onClick={() => handleSelect('mix')}
                className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  selected === 'mix'
                    ? 'border-primary bg-primary/10'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={mixSvg} alt="Mix" className="h-10 md:h-14 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase">Mix</span>
                <span className="text-xs text-muted-foreground text-center leading-snug">
                  Rainbow
                </span>
              </button>
            </div>
          </motion.div>

          {/* Back button */}
          <button
            onClick={() => navigate('/dog-fate')}
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
