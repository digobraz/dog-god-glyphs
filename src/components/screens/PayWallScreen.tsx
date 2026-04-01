import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { Button } from '@/components/ui/button';
import dogyptLogo from '@/assets/dogypt-logo-round.png';
import hekthorImg from '@/assets/hekthor.png';

const presetAmounts = [20, 30, 50, 100];

export function PayWallScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const activeAmount = isCustom ? Number(customAmount) : selectedAmount;

  const handleContinue = () => {
    if (!activeAmount || activeAmount < 1) return;
    // TODO: navigate to payment processing
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-6 pb-3">
        <img src={dogyptLogo} alt="DOGYPT" className="h-16 md:h-20 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col items-center gap-6">
          {/* Hekthor bubble */}
          <motion.div
            className="w-full rounded-2xl p-6 flex flex-col items-center gap-4"
            style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
            <p className="text-white text-center text-xl md:text-2xl leading-relaxed whitespace-pre-line drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
              {"Price for GOD NAME is "}
              <span className="font-bold text-amber-300">$11</span>
              {".\nHowever you can choose your\nown price and help us more."}
            </p>
          </motion.div>

          {/* Price options */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 p-5 flex flex-col items-center gap-4"
            style={{ background: 'hsl(var(--card) / 0.6)' }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="grid grid-cols-2 gap-3 w-full">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => { setSelectedAmount(amount); setIsCustom(false); }}
                  className={`rounded-xl border-2 py-4 text-xl font-bold tracking-wider transition-all ${
                    !isCustom && selectedAmount === amount
                      ? 'border-primary bg-primary/15 text-primary gold-glow'
                      : 'border-border/50 text-muted-foreground hover:border-primary/40'
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
                  ? 'border-primary bg-primary/15 gold-glow'
                  : 'border-border/50 hover:border-primary/40'
              }`}
            >
              {isCustom ? (
                <div className="flex items-center gap-1">
                  <span className="text-primary text-xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>$</span>
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="bg-transparent outline-none text-xl font-bold text-primary text-center w-32 placeholder:text-muted-foreground/40"
                    style={{ fontFamily: "'Cinzel', serif" }}
                    autoFocus
                  />
                </div>
              ) : (
                <span className="text-muted-foreground text-sm tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>
                  CHOOSE YOUR OWN PRICE
                </span>
              )}
            </button>

            {/* Continue button */}
            <Button
              onClick={handleContinue}
              disabled={!activeAmount || activeAmount < 1}
              className="w-full py-6 text-lg font-bold tracking-wider bg-primary text-primary-foreground hover:bg-primary/80 rounded-full disabled:opacity-30 mt-2"
              style={{ fontFamily: "'Cinzel', serif", boxShadow: '0 0 30px hsl(var(--gold) / 0.4)' }}
            >
              🐾 GRAB MY HEROGLYPH
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
