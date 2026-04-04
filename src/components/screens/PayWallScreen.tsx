import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CustomCharacterBadge } from '@/components/CustomCharacterBadge';
import dogyptLogo from '@/assets/dogypt-logo-round.png';
import hekthorImg from '@/assets/hekthor.png';

const presetAmounts = [11, 22, 33];

export function PayWallScreen() {
  const navigate = useNavigate();
  const setSelectedAmount = useDogyptStore((s) => s.setSelectedAmount);
  const [selectedAmount, setLocalAmount] = useState<number>(11);

  const isValid = selectedAmount >= 11;

  const handleContinue = () => {
    if (!isValid) return;
    setSelectedAmount(selectedAmount);
    navigate('/payment-summary');
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
            <img src={hekthorImg} alt="HEKTHOR" className="w-32 h-32 md:w-40 md:h-40 object-contain" />
            <p className="text-white text-center text-xl md:text-2xl leading-relaxed drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
              Price for <span className="font-bold text-amber-300">GOD NAME</span> is <span className="font-bold text-amber-300">$11</span>.
            </p>
            <p className="text-white/70 text-xs md:text-sm leading-relaxed text-center drop-shadow-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
              However you can pay more and help our vision. Every cent goes to a good cause.
            </p>
          </motion.div>

          {/* Price options */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-6 flex flex-col items-center gap-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="flex gap-2 justify-center">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`w-16 rounded-xl border-2 py-3 text-sm font-bold tracking-wider transition-all ${
                    selectedAmount === amount
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 text-muted-foreground hover:border-primary/50'
                  }`}
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <CustomCharacterBadge showPrice />

            {/* Certificate info */}
            <p className="text-muted-foreground text-xs text-center leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              After payment, we will send you a <span className="text-foreground font-bold uppercase">DOGYPT Certificate</span> along with your <span className="text-foreground font-bold uppercase">Heroglyph</span> in PDF.
            </p>

            <Button
              onClick={handleContinue}
              disabled={!isValid}
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