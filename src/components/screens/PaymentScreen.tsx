import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';
import dogyptLogo from '@/assets/dogypt-logo-round.png';

export function PaymentScreen() {
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);

  const isCardValid = cardNumber.length >= 16 && expiry.length >= 4 && cvc.length >= 3;

  const handlePay = () => {
    if (!isCardValid) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      navigate('/thank-you');
    }, 2000);
  };

  const inputClass = "w-full bg-transparent border-b-2 border-border/60 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary transition-colors";

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-6 pb-3">
        <img src={dogyptLogo} alt="DOGYPT" className="h-16 md:h-20 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-5 py-4">
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-6 flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-primary text-center" style={{ fontFamily: "'Cinzel', serif" }}>
              Payment Method
            </h3>

            <button
              onClick={() => alert('Apple Pay will be available with Stripe integration')}
              className="w-full rounded-xl border-2 border-border/60 py-3 flex items-center justify-center gap-2 hover:border-primary/50 transition-colors"
            >
              <span className="text-foreground text-base font-medium"> Pay</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-xs text-muted-foreground tracking-wider">OR PAY WITH CARD</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative">
                <input
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="Card number"
                  className={inputClass + " pr-10"}
                />
                <CreditCard className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={expiry}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                    if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                    setExpiry(v);
                  }}
                  placeholder="MM/YY"
                  className={inputClass}
                />
                <input
                  value={cvc}
                  onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="CVC"
                  className={inputClass}
                />
              </div>
            </div>

            <Button
              onClick={handlePay}
              disabled={!isCardValid || processing}
              className="w-full rounded-full py-6 text-lg font-bold tracking-wider hover:scale-105 transition-transform disabled:opacity-30 mt-2"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                color: '#000',
                boxShadow: '0 0 40px hsl(var(--gold) / 0.5), 0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              {processing ? '⏳ Processing...' : (
                <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> PAY NOW</span>
              )}
            </Button>

            <p className="text-[10px] text-muted-foreground/60 text-center flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" /> Secured by Stripe · Test mode
            </p>
          </motion.div>

          <button
            onClick={() => navigate('/payment-summary')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pb-6"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </div>
    </div>
  );
}
