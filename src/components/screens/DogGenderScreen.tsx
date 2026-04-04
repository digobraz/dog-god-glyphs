import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Info, X } from 'lucide-react';
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
  const [showInfo, setShowInfo] = useState(false);

  const handleSelect = (gender: string) => {
    setSelected(gender);
    setSelection('dogGender', gender);
    setTimeout(() => navigate('/dog-fate'), 500);
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
            <div className="rounded-2xl border-2 border-border papyrus-bg px-6 pt-6 pb-6">
              <h2
                className="text-center text-base md:text-lg font-bold tracking-[0.2em] uppercase text-primary mb-3"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {dogName || 'YOUR DOG'}'S HEROGLYPH
              </h2>
              <div className="px-2">
                <HeroglyphFrame showOwner className="text-foreground" pulseSlot="dogGender" />
              </div>
            </div>
          </motion.div>

          {/* 2. BLOCK - Hekthor question + options (merged & enlarged) */}
          <motion.div
            className="w-full flex-1 rounded-2xl p-6 md:p-8 flex flex-col gap-5 relative"
            style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Info button */}
            <button
              onClick={() => setShowInfo(true)}
              className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              aria-label="Info"
            >
              <Info className="h-5 w-5 text-white/80" />
            </button>

            {/* Title */}
            <h3
              className="text-center text-sm md:text-base font-bold tracking-[0.2em] uppercase text-white/70"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              DOG GENDER
            </h3>

            {/* Hekthor + question */}
            <div className="flex items-center gap-5">
              <img src={hekthorImg} alt="HEKTHOR" className="w-20 h-20 md:w-24 md:h-24 object-contain flex-shrink-0" />
              <p className="text-white text-base md:text-lg leading-relaxed drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                Do you have a <span className="font-bold text-amber-300">king</span> or a <span className="font-bold text-amber-300">queen</span> at home?
              </p>
            </div>

            {/* Options */}
            <div className="flex gap-4 w-full mt-auto">
              {/* KING */}
              <button
                onClick={() => handleSelect('king')}
                className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                  selected === 'king'
                    ? 'border-amber-400 bg-white/15'
                    : 'border-white/20 hover:border-amber-400/50 bg-white/5'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={kingSvg} alt="King" className="h-14 md:h-20 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase text-white">King</span>
              </button>

              {/* QUEEN */}
              <button
                onClick={() => handleSelect('queen')}
                className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                  selected === 'queen'
                    ? 'border-amber-400 bg-white/15'
                    : 'border-white/20 hover:border-amber-400/50 bg-white/5'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={queenSvg} alt="Queen" className="h-14 md:h-20 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase text-white">Queen</span>
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

      {/* INFO OVERLAY */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowInfo(false)} />
            <motion.div
              className="relative w-full max-w-lg rounded-2xl papyrus-bg border-2 border-border p-6 md:p-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>

              <h3
                className="text-center text-lg font-bold tracking-[0.15em] uppercase text-primary mb-6"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Dog Gender
              </h3>

              <div className="grid grid-cols-2 gap-6">
                {/* King info */}
                <div className="flex flex-col items-center gap-3 text-center">
                  <img src={kingSvg} alt="King" className="h-20 md:h-24 object-contain" />
                  <h4 className="font-bold text-sm uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>
                    3-Point Crown
                  </h4>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                    For boys who've mastered the 3-paw balance. One leg up, maximum aim, absolute legend.
                  </p>
                </div>

                {/* Queen info */}
                <div className="flex flex-col items-center gap-3 text-center">
                  <img src={queenSvg} alt="Queen" className="h-20 md:h-24 object-contain" />
                  <h4 className="font-bold text-sm uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>
                    4-Point Crown
                  </h4>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                    For girls who prefer the 4-paw stability. Maximum comfort, zero mess, total elegance.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
