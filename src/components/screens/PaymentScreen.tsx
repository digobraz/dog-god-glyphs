import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock } from 'lucide-react';
import { useDogyptStore } from '@/store/dogyptStore';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_aFa28rd5T2M4fUTbzdeZ200';

export function PaymentScreen() {
  const navigate = useNavigate();
  const { email, dogName, ownerName, selectedAmount } = useDogyptStore();

  const handlePay = () => {
    const params = new URLSearchParams({
      prefilled_email: email,
      client_reference_id: `${dogName}-${ownerName}-${Date.now()}`,
    });
    window.location.href = `${STRIPE_PAYMENT_LINK}?${params.toString()}`;
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-6 pb-3">
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-14 object-contain" />
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
              Secure Payment
            </h3>

            <div className="text-center py-2">
              <p className="text-2xl font-bold text-amber-300" style={{ fontFamily: "'Cinzel', serif" }}>
                ${selectedAmount} USD
              </p>
              <p className="text-xs text-muted-foreground mt-1">DOGYPT HEROGLYPH CERTIFICATE for {dogName || 'your dog'}</p>
            </div>

            <Button
              onClick={handlePay}
              className="w-full rounded-full py-6 text-lg font-bold tracking-wider hover:scale-105 transition-transform mt-2"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                color: '#000',
                boxShadow: '0 0 40px hsl(var(--gold) / 0.5), 0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> PAY WITH STRIPE</span>
            </Button>

            <p className="text-[10px] text-muted-foreground/60 text-center flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" /> Secured by Stripe · Card, Apple Pay, Google Pay
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
