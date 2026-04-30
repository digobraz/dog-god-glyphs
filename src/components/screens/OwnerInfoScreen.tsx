import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import hekthorImg from '@/assets/hekthor.png';
import manSvg from '@/assets/gender/OWNER_GENDER-MAN.svg';
import womanSvg from '@/assets/gender/OWNER_GENDER-WOMAN.svg';

import letterA from '@/assets/letters/NAME_-A.svg';
import letterB from '@/assets/letters/NAME_-B.svg';
import letterC from '@/assets/letters/NAME_-C.svg';
import letterD from '@/assets/letters/NAME_-D.svg';
import letterE from '@/assets/letters/NAME_-E.svg';
import letterF from '@/assets/letters/NAME_-F.svg';
import letterG from '@/assets/letters/NAME_-G.svg';
import letterH from '@/assets/letters/NAME_-H.svg';
import letterI from '@/assets/letters/NAME_-I.svg';
import letterJ from '@/assets/letters/NAME_-J.svg';
import letterK from '@/assets/letters/NAME_-K.svg';
import letterL from '@/assets/letters/NAME_-L.svg';
import letterM from '@/assets/letters/NAME_-M.svg';
import letterN from '@/assets/letters/NAME_-N.svg';
import letterO from '@/assets/letters/NAME_-O.svg';
import letterP from '@/assets/letters/NAME_-P.svg';
import letterQ from '@/assets/letters/NAME-Q.svg';
import letterR from '@/assets/letters/NAME_-R.svg';
import letterS from '@/assets/letters/NAME-S.svg';
import letterT from '@/assets/letters/NAME-T.svg';
import letterU from '@/assets/letters/NAME-U.svg';
import letterV from '@/assets/letters/NAME-V.svg';
import letterW from '@/assets/letters/NAME-W.svg';
import letterX from '@/assets/letters/NAME-X.svg';
import letterY from '@/assets/letters/NAME-Y.svg';
import letterZ from '@/assets/letters/NAME-Z.svg';

const letterMap: Record<string, string> = {
  A: letterA, B: letterB, C: letterC, D: letterD, E: letterE,
  F: letterF, G: letterG, H: letterH, I: letterI, J: letterJ,
  K: letterK, L: letterL, M: letterM, N: letterN, O: letterO,
  P: letterP, Q: letterQ, R: letterR, S: letterS, T: letterT,
  U: letterU, V: letterV, W: letterW, X: letterX, Y: letterY,
  Z: letterZ,
};

export function OwnerInfoScreen() {
  const navigate = useNavigate();
  const setOwnerName = useDogyptStore((s) => s.setOwnerName);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const storedOwnerName = useDogyptStore((s) => s.ownerName);
  const storedGender = useDogyptStore((s) => s.selections.ownerGender);
  const [input, setInput] = useState(storedOwnerName || '');
  const [gender, setGender] = useState<string | null>(storedGender || null);

  const firstLetter = input.trim().charAt(0).toUpperCase();
  const letterSvg = letterMap[firstLetter] || null;

  const canContinue = !!input.trim() && !!gender;

  const handleSend = () => {
    if (!canContinue) return;
    setOwnerName(input.trim().toUpperCase());
    setSelection('ownerGender', gender!);
    navigate('/owner-zodiac');
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-3 pb-2 md:pt-5">
        <img src={dogyptLogo} alt="DOGYPT" className="h-8 md:h-12 object-contain" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 min-h-0">
          <motion.div
            className="w-full rounded-2xl px-4 py-4 md:p-5 flex flex-col items-center gap-2 md:gap-3 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-40 h-40 md:w-52 md:h-52 object-contain" />
            <p className="text-white text-center text-lg md:text-2xl leading-snug drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
              Okay, let's talk about you,<br />
              <span className="font-bold text-amber-300">hooman</span>!
            </p>
          </motion.div>

          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex-shrink-0"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border/30">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && canContinue) handleSend(); }}
                  placeholder="Owner's first name..."
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base md:text-lg"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  autoFocus
                />
              </div>

              {/* Letter preview box */}
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-border/60 bg-card/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {letterSvg ? (
                  <motion.img
                    key={firstLetter}
                    src={letterSvg}
                    alt={firstLetter}
                    className="h-10 md:h-14 object-contain"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                ) : (
                  <span className="text-muted-foreground/30 text-2xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
                    ?
                  </span>
                )}
              </div>
              </div>

              {/* Gender selection */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setGender('man')}
                  className={`flex-1 flex flex-col items-center gap-1.5 p-2 md:p-3 rounded-xl border-2 transition-all ${
                    gender === 'man'
                      ? 'border-primary bg-primary/10'
                      : 'border-border/60 hover:border-primary/50'
                  }`}
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  <img src={manSvg} alt="Man" className="h-14 md:h-20 object-contain" />
                  <span className="text-xs md:text-sm font-bold tracking-wider uppercase">Man</span>
                </button>
                <button
                  onClick={() => setGender('woman')}
                  className={`flex-1 flex flex-col items-center gap-1.5 p-2 md:p-3 rounded-xl border-2 transition-all ${
                    gender === 'woman'
                      ? 'border-primary bg-primary/10'
                      : 'border-border/60 hover:border-primary/50'
                  }`}
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  <img src={womanSvg} alt="Woman" className="h-14 md:h-20 object-contain" />
                  <span className="text-xs md:text-sm font-bold tracking-wider uppercase">Woman</span>
                </button>
              </div>

              <Button
                onClick={handleSend}
                disabled={!canContinue}
                className="w-full rounded-full gap-2 h-10 md:h-11 font-bold tracking-wider hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                  color: '#000',
                  boxShadow: '0 0 40px hsl(var(--gold) / 0.5), 0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                Continue
              </Button>
            </div>
          </motion.div>

          {/* Back button */}
          <button
            onClick={() => navigate('/ranking')}
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
