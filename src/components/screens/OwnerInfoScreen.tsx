import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import dogyptLogo from '@/assets/dogypt-logo-round.png';
import hekthorImg from '@/assets/hekthor.png';

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
  const [input, setInput] = useState('');

  const firstLetter = input.trim().charAt(0).toUpperCase();
  const letterSvg = letterMap[firstLetter] || null;

  const handleSend = () => {
    if (!input.trim()) return;
    setOwnerName(input.trim().toUpperCase());
    navigate('/owner-gender');
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-4 pb-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-12 md:h-14 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col items-center gap-6">
          <motion.div
            className="w-full rounded-2xl border border-border/40 p-6 flex flex-col items-center gap-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
            <p className="text-foreground text-center text-xl md:text-2xl leading-relaxed" style={{ fontFamily: "'Cinzel', serif" }}>
              Okay, let's talk about your owner first!
            </p>
          </motion.div>

          <motion.div
            className="w-full rounded-2xl border border-border/40 p-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border/30">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                  placeholder="Owner's name..."
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base md:text-lg"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  autoFocus
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  size="icon"
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/80 h-9 w-9 flex-shrink-0 disabled:opacity-30"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Letter preview box */}
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-border/60 bg-card/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {letterSvg ? (
                  <motion.img
                    key={firstLetter}
                    src={letterSvg}
                    alt={firstLetter}
                    className="h-12 md:h-14 object-contain rounded-full"
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
