import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDogyptStore } from '@/store/dogyptStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const tiers = [
  { id: 'bronze', name: 'BRONZE CARTOUCHE', price: '€11', features: ['Basic digital HEROGLYPH PDF', 'Standard resolution'], popular: false },
  { id: 'silver', name: 'SILVER CARTOUCHE', price: '€22', features: ['High resolution, printable', 'Dynasty registry entry', 'Certificate of origin'], popular: true },
  { id: 'gold', name: 'GOLD CARTOUCHE', price: '€33', features: ['Ultra-HD premium print', 'Premium certificate', 'Early access to future features', 'Exclusive dynasty perks'], popular: false },
];

export function PricingScreen() {
  const { selectedTier, setSelectedTier, email, setEmail, setStep } = useDogyptStore();
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    if (!email) return;
    setLoading(true);
    setTimeout(() => setStep(17), 2000);
  };

  return (
    <div className="dark-bg min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        className="flex flex-col items-center gap-8 max-w-4xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold tracking-widest text-center" style={{ fontFamily: 'Cinzel, serif' }}>
          CHOOSE YOUR CARTOUCHE
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {tiers.map(tier => (
            <motion.button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              whileHover={{ scale: 1.02 }}
              className={cn(
                'relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left',
                selectedTier === tier.id ? 'gold-glow border-primary bg-primary/5' : 'border-muted hover:border-primary/40',
                tier.popular && 'border-primary'
              )}
            >
              {tier.popular && (
                <span className="absolute -top-3 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full tracking-widest"
                  style={{ fontFamily: 'Cinzel, serif' }}>
                  MOST POPULAR
                </span>
              )}
              <h3 className="text-lg font-bold tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>{tier.name}</h3>
              <span className="text-3xl font-bold text-primary" style={{ fontFamily: 'Cinzel, serif' }}>{tier.price}</span>
              <ul className="text-sm text-muted-foreground space-y-2">
                {tier.features.map(f => <li key={f}>✦ {f}</li>)}
              </ul>
            </motion.button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <p className="text-sm text-muted-foreground tracking-wide" style={{ fontFamily: 'Cinzel, serif' }}>
            Where shall we send the scroll?
          </p>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-transparent border-b-4 border-primary text-center text-lg py-3 outline-none placeholder:text-muted-foreground/40"
          />
          <Button
            onClick={handlePay}
            disabled={!email || loading}
            className="px-8 py-5 text-lg font-bold tracking-wider bg-primary text-primary-foreground hover:bg-primary/80 rounded-full disabled:opacity-30 min-w-[200px]"
            style={{ fontFamily: 'Cinzel, serif', boxShadow: '0 0 30px hsl(var(--gold) / 0.4)' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="inline-block">⏳</motion.span>
                Initiating secure ritual...
              </span>
            ) : 'PAY & FORGE'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
