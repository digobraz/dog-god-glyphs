import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import dogyptLogo from '@/assets/dogypt-logo-round.png';
import hekthorImg from '@/assets/hekthor.png';

const presetAmounts = [11, 22, 33, 50, 100];

export function PayWallScreen() {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<number>(11);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const activeAmount = isCustom ? Number(customAmount) : selectedAmount;

  const handleContinue = () => {
    if (!activeAmount || activeAmount < 1) return;
    // TODO: navigate to next step
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-6 pb-3">
        <img src={dogyptLogo} alt="DOGYPT" className="h-16 md:h-20 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-5 py-4">
          {/* Large Hekthor bubble like /name */}
          <motion.div
            className="w-full rounded-2xl p-6 flex flex-col items-center gap-4"
            style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
            <p className="text-white text-center text-xl md:text-2xl leading-relaxed drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
              Price for <span className="font-bold text-amber-300">GOD NAME</span> is <span className="font-bold text-amber-300">$11</span>.
            </p>
            <p className="text-white/70 text-xs md:text-sm leading-relaxed text-center drop-shadow-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
              However you can choose your own price and help us more. Every cent goes to a good cause. 🐾
            </p>
          </motion.div>

          {/* Price options */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-6 flex flex-col items-center gap-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="flex gap-2 w-full">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => { setSelectedAmount(amount); setIsCustom(false); }}
                  className={`flex-1 rounded-xl border-2 py-3 text-sm md:text-base font-bold tracking-wider transition-all ${
                    !isCustom && selectedAmount === amount
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 text-muted-foreground hover:border-primary/50'
                  }`}
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <button
              onClick={() => setIsCustom(true)}
              className={`w-full rounded-xl border-2 py-3 transition-all flex items-center justify-center gap-2 ${
                isCustom
                  ? 'border-primary bg-primary/10'
                  : 'border-border/60 hover:border-primary/50'
              }`}
            >
              {isCustom ? (
                <div className="flex items-center gap-1">
                  <span className="text-primary text-base font-bold" style={{ fontFamily: "'Cinzel', serif" }}>$</span>
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="bg-transparent outline-none text-base font-bold text-primary text-center w-28 placeholder:text-muted-foreground/40"
                    style={{ fontFamily: "'Cinzel', serif" }}
                    autoFocus
                  />
                </div>
              ) : (
                <span className="text-muted-foreground text-xs tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>
                  CHOOSE YOUR OWN PRICE
                </span>
              )}
            </button>

            {/* Next button - styled like heroglyph reveal */}
            <Button
              onClick={handleContinue}
              disabled={!activeAmount || activeAmount < 1}
              className="w-full rounded-full py-6 text-lg font-bold tracking-wider hover:scale-105 transition-transform disabled:opacity-30 mt-2"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                color: '#000',
                boxShadow: '0 0 40px hsl(var(--gold) / 0.5), 0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              NEXT →
            </Button>
          </motion.div>

          {/* Back button */}
          <button
            onClick={() => navigate('/heroglyph-reveal')}
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
