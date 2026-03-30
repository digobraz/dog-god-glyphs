import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import dogyptLogo from '@/assets/dogypt-logo.png';
import hekthorImg from '@/assets/hekthor.png';

import num1 from '@/assets/numbers/NUMBER-1.svg';
import num2 from '@/assets/numbers/NUMBER-2.svg';
import num3 from '@/assets/numbers/NUMBER-3.svg';
import num4 from '@/assets/numbers/NUMBER-4.svg';
import num5 from '@/assets/numbers/NUMBER-5.svg';
import num6 from '@/assets/numbers/NUMBER-6.svg';
import num7 from '@/assets/numbers/NUMBER-7.svg';
import num8 from '@/assets/numbers/NUMBER-8.svg';
import num9 from '@/assets/numbers/NUMBER-9.svg';
import num10 from '@/assets/numbers/NUMBER-10.svg';
import num11 from '@/assets/numbers/NUMBER-11.svg';

// scale factors relative to num8 (smallest visual size = 1.0)
const rankOptions = [
  { value: '2', label: '2nd', img: num2, scale: 0.85 },
  { value: '3', label: '3rd', img: num3, scale: 0.85 },
  { value: '4', label: '4th', img: num4, scale: 0.7 },
  { value: '5', label: '5th', img: num5, scale: 0.65 },
  { value: '6', label: '6th', img: num6, scale: 0.7 },
  { value: '7', label: '7th', img: num7, scale: 0.7 },
  { value: '8', label: '8th', img: num8, scale: 1.0 },
  { value: '9', label: '9th', img: num9, scale: 0.85 },
  { value: '10', label: '10th', img: num10, scale: 0.65 },
  { value: '11', label: '11th+', img: num11, scale: 0.65 },
];

export function RankingScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const [phase, setPhase] = useState<'question' | 'pickRank'>('question');
  const [selected, setSelected] = useState<string | null>(null);

  const handleYes = () => {
    setSelection('ranking', '1');
    // navigate to next step
  };

  const handleNo = () => {
    setPhase('pickRank');
  };

  const handlePickRank = (value: string) => {
    setSelected(value);
    setSelection('ranking', value);
    // navigate to next step after short delay
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
              Are you your owner's first dog?
            </p>
          </motion.div>

          {/* Answer block */}
          <AnimatePresence mode="wait">
            {phase === 'question' ? (
              <motion.div
                key="yesno"
                className="w-full rounded-2xl border border-border/40 p-6 flex flex-col items-center gap-5"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, delay: 0.1 }}
              >
                <div className="flex gap-4 w-full">
                  {/* YES */}
                  <button
                    onClick={handleYes}
                    className="flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-border/60 hover:border-primary transition-all"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    <img src={num1} alt="I" className="h-16 md:h-20 object-contain" />
                    <span className="text-sm md:text-base font-bold tracking-wider uppercase">
                      Yes, I'm first!
                    </span>
                  </button>

                  {/* NO */}
                  <button
                    onClick={handleNo}
                    className="flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-border/60 hover:border-primary transition-all"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    <img src={num2} alt="II" className="h-16 md:h-20 object-contain" />
                    <span className="text-sm md:text-base font-bold tracking-wider uppercase">
                      No, I'm not first
                    </span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="pickrank"
                className="w-full rounded-2xl border border-border/40 p-6 flex flex-col items-center gap-4"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-muted-foreground text-center text-sm tracking-wider uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
                  Which dog are you?
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 w-full">
                  {rankOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handlePickRank(opt.value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        selected === opt.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border/60 hover:border-primary/50'
                      }`}
                    >
                      <div className="h-12 md:h-14 flex items-center justify-center">
                        <img src={opt.img} alt={opt.label} className="object-contain" style={{ height: `${opt.scale * 100}%` }} />
                      </div>
                      <span className="text-xs font-medium tracking-wide uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back button */}
          <button
            onClick={() => phase === 'pickRank' ? setPhase('question') : navigate('/birthday-dog')}
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
