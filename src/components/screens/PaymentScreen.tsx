import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';
import dogyptLogo from '@/assets/dogypt-logo-round.png';

export function PaymentScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', city: '', street: '', country: '',
  });
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const isFormValid = form.firstName && form.lastName && form.email && form.city && form.street && form.country;
  const isCardValid = cardNumber.length >= 16 && expiry.length >= 4 && cvc.length >= 3;

  const handlePay = () => {
    if (!isFormValid || !isCardValid) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      // TODO: integrate real Stripe
      alert('Payment simulation complete! Stripe will be connected later.');
    }, 2000);
  };

  const inputClass = "w-full bg-transparent border-b-2 border-border/60 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary transition-colors";

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-6 pb-3">
        <img src={dogyptLogo} alt="DOGYPT" className="h-16 md:h-20 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-5 py-4">
          {/* BLOCK 1: Customer details */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-6 flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-primary text-center" style={{ fontFamily: "'Cinzel', serif" }}>
              Your Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="First name" className={inputClass} />
              <input value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Last name" className={inputClass} />
            </div>
            <input value={form.email} onChange={e => update('email', e.target.value)} placeholder="Email" type="email" className={inputClass} />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.street} onChange={e => update('street', e.target.value)} placeholder="Street" className={inputClass} />
              <input value={form.city} onChange={e => update('city', e.target.value)} placeholder="City" className={inputClass} />
            </div>
            <input value={form.country} onChange={e => update('country', e.target.value)} placeholder="Country" className={inputClass} />
          </motion.div>

          {/* BLOCK 2: Payment */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-6 flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-primary text-center" style={{ fontFamily: "'Cinzel', serif" }}>
              Payment Method
            </h3>

            {/* Apple Pay button (mock) */}
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

            {/* Card fields */}
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

            {/* Pay button */}
            <Button
              onClick={handlePay}
              disabled={!isFormValid || !isCardValid || processing}
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

          {/* Back */}
          <button
            onClick={() => navigate('/pay-wall')}
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
