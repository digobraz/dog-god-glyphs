import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Shield } from 'lucide-react';
import dogyptLogo from '@/assets/dogypt-logo-round.png';
import hekthorImg from '@/assets/hekthor.png';

const presetAmounts = [
  { value: 11, label: '$11', tag: null },
  { value: 22, label: '$22', tag: 'Popular' },
  { value: 33, label: '$33', tag: 'Best value' },
];

export function PayWallScreen() {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<number>(11);

  const isValid = selectedAmount >= 11;

  const handleContinue = () => {
    if (!isValid) return;
    // TODO: navigate to next step
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-6 pb-3">
        <img src={dogyptLogo} alt="DOGYPT" className="h-16 md:h-20 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-5 py-4">
          {/* Hekthor bubble */}
          <motion.div
            className="w-full rounded-2xl p-6 flex flex-col items-center gap-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Subtle shimmer overlay */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)',
              }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
            />

            <motion.img
              src={hekthorImg}
              alt="HEKTHOR"
              className="w-48 h-48 md:w-56 md:h-56 object-contain relative z-10"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.p
              className="text-white text-center text-xl md:text-2xl leading-relaxed drop-shadow-sm relative z-10"
              style={{ fontFamily: "'Cinzel', serif" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              Price for <span className="font-bold text-amber-300">GOD NAME</span> is{' '}
              <span className="font-bold text-amber-300">${selectedAmount}</span>.
            </motion.p>

            <motion.p
              className="text-white/60 text-xs md:text-sm leading-relaxed text-center relative z-10"
              style={{ fontFamily: "'Inter', sans-serif" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.45 }}
            >
              However you can pay more and help our vision. Every cent goes to a good cause. 🐾
            </motion.p>
          </motion.div>

          {/* Price options card */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-5 md:p-6 flex flex-col items-center gap-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Amount buttons */}
            <div className="flex gap-3 w-full">
              {presetAmounts.map((amount, i) => {
                const isSelected = selectedAmount === amount.value;
                return (
                  <motion.button
                    key={amount.value}
                    onClick={() => setSelectedAmount(amount.value)}
                    className={`relative flex-1 rounded-xl border-2 py-4 flex flex-col items-center gap-1 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-md'
                        : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:bg-primary/5'
                    }`}
                    style={{ fontFamily: "'Cinzel', serif" }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.25 + i * 0.08 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {amount.tag && (
                      <span
                        className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground whitespace-nowrap"
                      >
                        {amount.tag}
                      </span>
                    )}
                    <span className="text-lg md:text-xl font-bold tracking-wider">{amount.label}</span>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          <Check className="h-4 w-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-border/40" />

            {/* Certificate info */}
            <motion.div
              className="flex items-start gap-3 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <span className="text-base">📜</span>
              </div>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                After payment, we will send you a{' '}
                <span className="text-foreground font-semibold">DOGYPT Certificate</span>{' '}
                along with your heroglyphs in PDF.
              </p>
            </motion.div>

            {/* CTA button */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Button
                onClick={handleContinue}
                disabled={!isValid}
                className="w-full rounded-full py-6 text-lg font-bold tracking-wider transition-transform disabled:opacity-30"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                  color: '#000',
                  boxShadow: '0 0 40px hsl(var(--gold) / 0.5), 0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                <motion.span
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  NEXT →
                </motion.span>
              </Button>
            </motion.div>

            {/* Trust signal */}
            <motion.div
              className="flex items-center gap-1.5 text-muted-foreground/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <Shield className="h-3 w-3" />
              <span className="text-[10px] tracking-wide uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                Secure payment
              </span>
            </motion.div>
          </motion.div>

          {/* Back button */}
          <motion.button
            onClick={() => navigate('/heroglyph-reveal')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: "'Cinzel', serif" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            whileHover={{ x: -3 }}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </motion.button>
        </div>
      </div>
    </div>
  );
}
