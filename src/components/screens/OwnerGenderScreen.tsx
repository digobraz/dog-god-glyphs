import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import dogyptLogo from '@/assets/dogypt-logo.png';
import hekthorImg from '@/assets/hekthor.png';
import manSvg from '@/assets/gender/OWNER_GENDER-MAN.svg';
import womanSvg from '@/assets/gender/OWNER_GENDER-WOMAN.svg';

export function OwnerGenderScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (gender: string) => {
    setSelected(gender);
    setSelection('ownerGender', gender);
    // TODO: navigate to next step when ready
  };

  return (
    <div className="papyrus-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-4 pb-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-12 object-contain" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col items-center gap-6">
          {/* Question block */}
          <motion.div
            className="w-full rounded-2xl border border-border/40 p-6 flex flex-col items-center gap-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
            <p className="text-foreground text-center text-xl md:text-2xl leading-relaxed" style={{ fontFamily: "'Cinzel', serif" }}>
              {dogName}, who is your boss?
            </p>
          </motion.div>

          {/* Options block */}
          <motion.div
            className="w-full rounded-2xl border border-border/40 p-6 flex flex-col items-center gap-5"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="flex gap-4 w-full">
              {/* MAN */}
              <button
                onClick={() => handleSelect('man')}
                className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                  selected === 'man'
                    ? 'border-primary bg-primary/10'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={manSvg} alt="Man" className="h-28 md:h-36 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase">
                  Man
                </span>
              </button>

              {/* WOMAN */}
              <button
                onClick={() => handleSelect('woman')}
                className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                  selected === 'woman'
                    ? 'border-primary bg-primary/10'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img src={womanSvg} alt="Woman" className="h-28 md:h-36 object-contain" />
                <span className="text-sm md:text-base font-bold tracking-wider uppercase">
                  Woman
                </span>
              </button>
            </div>
          </motion.div>

          {/* Back button */}
          <button
            onClick={() => navigate('/owner-name')}
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
