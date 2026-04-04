import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import dogyptLogo from '@/assets/dogypt-logo-round.png';
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

// Pre-built SVGs for 1-11
const prebuiltMap: Record<number, { img: string; scale: number }> = {
  1: { img: num1, scale: 0.5 },
  2: { img: num2, scale: 0.85 },
  3: { img: num3, scale: 0.85 },
  4: { img: num4, scale: 0.7 },
  5: { img: num5, scale: 0.65 },
  6: { img: num6, scale: 0.7 },
  7: { img: num7, scale: 0.7 },
  8: { img: num8, scale: 1.0 },
  9: { img: num9, scale: 0.85 },
  10: { img: num10, scale: 0.65 },
  11: { img: num11, scale: 0.65 },
};

// Roman numeral symbol → SVG mapping (individual characters)
// I=1, V=5, X=10, L=50
const romanCharSvg: Record<string, { img: string; scale: number }> = {
  'I': { img: num1, scale: 0.4 },
  'V': { img: num5, scale: 0.55 },
  'X': { img: num10, scale: 0.55 },
};

// Convert number to Roman numeral string
function toRoman(n: number): string {
  const vals = [50, 40, 10, 9, 5, 4, 1];
  const syms = ['L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) {
      result += syms[i];
      n -= vals[i];
    }
  }
  return result;
}

// Compose Roman numeral from individual SVG characters
function RomanComposed({ num, height }: { num: number; height: number }) {
  // For 1-11, use prebuilt SVGs
  if (num >= 1 && num <= 11 && prebuiltMap[num]) {
    const p = prebuiltMap[num];
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <img src={p.img} alt={String(num)} className="object-contain" style={{ height: `${p.scale * 100}%` }} />
      </div>
    );
  }

  const roman = toRoman(num);
  // Split into individual characters for SVG composition
  // Handle two-char subtractive forms (IV, IX, XL) by splitting properly
  const chars: string[] = [];
  for (let i = 0; i < roman.length; i++) {
    chars.push(roman[i]);
  }

  return (
    <div className="flex items-center justify-center gap-[1px]" style={{ height }}>
      {chars.map((ch, i) => {
        const svgInfo = romanCharSvg[ch];
        if (svgInfo) {
          return (
            <img
              key={i}
              src={svgInfo.img}
              alt={ch}
              className="object-contain"
              style={{ height: `${svgInfo.scale * 100}%` }}
            />
          );
        }
        // Fallback for L (50) - render as styled text
        return (
          <span
            key={i}
            className="font-bold text-foreground"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: height * 0.6,
              lineHeight: 1,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
}

const rankOptions = [
  { value: '2', label: '2nd', num: 2 },
  { value: '3', label: '3rd', num: 3 },
  { value: '4', label: '4th', num: 4 },
  { value: '5', label: '5th', num: 5 },
  { value: '6', label: '6th', num: 6 },
  { value: '7', label: '7th', num: 7 },
  { value: '8', label: '8th', num: 8 },
  { value: '9', label: '9th', num: 9 },
  { value: '10', label: '10th', num: 10 },
];

function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function RankingScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const [phase, setPhase] = useState<'question' | 'pickRank' | 'custom'>('question');
  const [selected, setSelected] = useState<string | null>(null);
  const [customNum, setCustomNum] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleYes = () => {
    setSelection('ranking', '1');
    navigate('/owner-name');
  };

  const handleNo = () => {
    setPhase('pickRank');
  };

  const handlePickRank = (value: string) => {
    setSelected(value);
    setSelection('ranking', value);
    setTimeout(() => navigate('/owner-name'), 500);
  };

  const handleCustomConfirm = () => {
    const n = parseInt(customNum);
    if (n >= 11 && n <= 50) {
      handlePickRank(String(n));
    }
  };

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -160 : 160, behavior: 'smooth' });
  };

  const customValid = (() => {
    const n = parseInt(customNum);
    return n >= 11 && n <= 50;
  })();

  // Shared rank button renderer
  const RankButton = ({ opt, iconHeight, className }: { opt: typeof rankOptions[0]; iconHeight: number; className?: string }) => (
    <button
      onClick={() => handlePickRank(opt.value)}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
        selected === opt.value ? 'border-primary bg-primary/10' : 'border-border/60 hover:border-primary/50'
      } ${className || ''}`}
    >
      <RomanComposed num={opt.num} height={iconHeight} />
      <span className="text-xs font-medium tracking-wide uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
        {opt.label}
      </span>
    </button>
  );

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-6 pb-3">
        <img src={dogyptLogo} alt="DOGYPT" className="h-16 md:h-20 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col items-center gap-6">
          {/* Question block */}
          <motion.div
            className="w-full rounded-2xl p-6 flex flex-col items-center gap-4" style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
            <p className="text-white text-center text-xl md:text-2xl leading-relaxed drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
              Is <span className="font-bold text-amber-300">{dogName || 'your pup'}</span> the first dog you've ever had?
            </p>
          </motion.div>

          {/* Answer block */}
          <AnimatePresence mode="wait">
            {phase === 'question' && (
              <motion.div
                key="yesno"
                className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-6 flex flex-col items-center gap-5"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, delay: 0.1 }}
              >
                <div className="flex gap-4 w-full">
                  <button
                    onClick={handleYes}
                    className="flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-border/60 hover:border-primary transition-all"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    <RomanComposed num={1} height={64} />
                    <span className="text-sm md:text-base font-bold tracking-wider uppercase">
                      YES, my first love
                    </span>
                  </button>
                  <button
                    onClick={handleNo}
                    className="flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-border/60 hover:border-primary transition-all"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    <RomanComposed num={2} height={64} />
                    <span className="text-sm md:text-base font-bold tracking-wider uppercase">
                      NO, dog lover forever!
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'pickRank' && (
              <motion.div
                key="pickrank"
                className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-4 md:p-6 flex flex-col items-center gap-4"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-foreground text-center text-sm tracking-wider uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
                  Which dog is <span className="font-bold">{dogName || 'your pup'}</span>?
                </p>

                {/* Mobile: horizontal slider */}
                <div className="relative w-full md:hidden">
                  <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 border border-border/40 flex items-center justify-center shadow-md"
                  >
                    <ChevronLeft className="h-4 w-4 text-foreground" />
                  </button>
                  <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto scrollbar-hide px-8 snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {rankOptions.map((opt) => (
                      <RankButton key={opt.value} opt={opt} iconHeight={40} className="flex-shrink-0 snap-center w-20" />
                    ))}
                    {/* Custom option */}
                    <button
                      onClick={() => setPhase('custom')}
                      className="flex-shrink-0 snap-center flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-border/60 hover:border-primary/50 transition-all w-20"
                    >
                      <div className="h-10 flex items-center justify-center">
                        <Hash className="h-6 w-6 text-foreground/60" />
                      </div>
                      <span className="text-[10px] font-medium tracking-wide uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
                        11–50
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 border border-border/40 flex items-center justify-center shadow-md"
                  >
                    <ChevronRight className="h-4 w-4 text-foreground" />
                  </button>
                </div>

                {/* Desktop: grid */}
                <div className="hidden md:grid grid-cols-5 gap-3 w-full">
                  {rankOptions.map((opt) => (
                    <RankButton key={opt.value} opt={opt} iconHeight={56} />
                  ))}
                  {/* Custom option */}
                  <button
                    onClick={() => setPhase('custom')}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-border/60 hover:border-primary/50 transition-all"
                  >
                    <div className="h-14 flex items-center justify-center">
                      <Hash className="h-7 w-7 text-foreground/60" />
                    </div>
                    <span className="text-xs font-medium tracking-wide uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
                      11–50
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'custom' && (
              <motion.div
                key="custom"
                className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-4 md:p-6 flex flex-col items-center gap-5"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-foreground text-center text-sm tracking-wider uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
                  Enter dog number (12–50)
                </p>

                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={customNum}
                    onChange={(e) => setCustomNum(e.target.value.replace(/\D/g, '').slice(0, 2))}
                    placeholder="##"
                    className="w-20 h-14 bg-transparent border-2 border-border/60 rounded-xl text-center text-2xl font-bold outline-none focus:border-primary transition-colors"
                    style={{ fontFamily: "'Cinzel', serif" }}
                    autoFocus
                  />
                  {customValid && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <RomanComposed num={parseInt(customNum)} height={48} />
                      <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Cinzel', serif" }}>
                        {ordinalSuffix(parseInt(customNum))}
                      </span>
                    </motion.div>
                  )}
                </div>

                {customValid && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                    <button
                      onClick={handleCustomConfirm}
                      className="w-full rounded-full h-11 font-bold tracking-wider hover:scale-105 transition-transform"
                      style={{
                        fontFamily: "'Cinzel', serif",
                        background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                        color: '#000',
                        boxShadow: '0 0 40px hsl(var(--gold) / 0.5), 0 4px 20px rgba(0,0,0,0.3)',
                      }}
                    >
                      Continue
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back button */}
          <button
            onClick={() => {
              if (phase === 'custom') setPhase('pickRank');
              else if (phase === 'pickRank') setPhase('question');
              else navigate('/birthday-dog');
            }}
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
