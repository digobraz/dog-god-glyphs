import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import dogyptLogo from '@/assets/dogypt-logo-round.png';
import hekthorImg from '@/assets/hekthor.png';
import kingSvg from '@/assets/gender/GENDER-MALE.svg';
import queenSvg from '@/assets/gender/GENDER-FEMALE.svg';

export function DogGenderScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (gender: string) => {
    setSelected(gender);
    setSelection('dogGender', gender);
    setTimeout(() => navigate('/dog-fate'), 500);
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-4 pb-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-12 md:h-14 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-5 py-4">
          {/* 1. BLOCK - Heroglyph preview with pulsing slot */}
          <motion.div
            className="w-full relative mt-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 px-3" style={{ backgroundColor: 'hsl(36 33% 91%)' }}>
              <span className="text-xs md:text-sm font-bold tracking-widest text-primary whitespace-nowrap" style={{ fontFamily: "'Cinzel', serif" }}>
                {dogName || 'YOUR DOG'}'S HEROGLYPH
              </span>
            </div>
            <div className="rounded-2xl border-2 border-border papyrus-bg p-4">
              <HeroglyphFrame showOwner className="text-foreground" pulseSlot="dogGender" />
            </div>
          </motion.div>

          {/* 2. BLOCK - Hekthor question */}
          <motion.div
            className="w-full rounded-2xl p-5 flex items-center gap-5"
            style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-20 h-20 md:w-24 md:h-24 object-contain flex-shrink-0" />
            <p className="text-white text-base md:text-lg leading-relaxed drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
              Do you have a <span className="font-bold text-amber-300">king</span> or a <span className="font-bold text-amber-300">queen</span> at home?
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
              {/* KING */}
              <button
                onClick={() => handleSelect('king')}
                className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                  selected === 'king'
                    ? 'border-primary bg-primary/10'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={kingSvg} alt="King" className="h-24 md:h-32 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase">King</span>
                <span className="text-xs text-muted-foreground text-center leading-snug">
                  Three-peak crown<br />Who is peeing on three legs?
                </span>
              </button>

              {/* QUEEN */}
              <button
                onClick={() => handleSelect('queen')}
                className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                  selected === 'queen'
                    ? 'border-primary bg-primary/10'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={queenSvg} alt="Queen" className="h-24 md:h-32 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase">Queen</span>
                <span className="text-xs text-muted-foreground text-center leading-snug">
                  Four-peak crown<br />Can you guess why?
                </span>
              </button>
            </div>
          </motion.div>

          {/* Back button */}
          <button
            onClick={() => navigate('/owner-final')}
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
