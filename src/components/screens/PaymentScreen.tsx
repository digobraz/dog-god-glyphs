import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';
import { useDogyptStore } from '@/store/dogyptStore';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';

const CREATE_CHECKOUT_URL = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1/create-checkout';

const PHOTO_TIMEOUT_MS = 12_000;

async function waitForStablePhotoUrl(timeoutMs = PHOTO_TIMEOUT_MS): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const current = useDogyptStore.getState().dogPhotoUrl;
    if (current && !current.startsWith('blob:')) return current;
    await new Promise((r) => setTimeout(r, 200));
  }
  return useDogyptStore.getState().dogPhotoUrl;
}

export function PaymentScreen() {
  const navigate = useNavigate();
  const { email, dogName, ownerName, selectedAmount, selections, dogPhotoUrl, patronSvg, patronSvg2 } = useDogyptStore();
  const [loading, setLoading] = useState(false);
  const [waitingPhoto, setWaitingPhoto] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      let stablePhotoUrl = dogPhotoUrl;
      if (stablePhotoUrl?.startsWith('blob:')) {
        setWaitingPhoto(true);
        stablePhotoUrl = await waitForStablePhotoUrl();
        setWaitingPhoto(false);
      }
      const res = await fetch(CREATE_CHECKOUT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogName,
          ownerName,
          email,
          selections,
          dogPhotoUrl: stablePhotoUrl,
          patronSvg,
          patronSvg2,
          amount: selectedAmount ?? 11,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_top');
        // fallback: ak _top navigation zlyha (iframe sandbox), otvor novu zalozku
        setTimeout(() => setLoading(false), 2000);
      } else {
        console.error('create-checkout error:', data.error);
        setLoading(false);
      }
    } catch (err) {
      console.error('payment fetch error:', err);
      setLoading(false);
      setWaitingPhoto(false);
    }
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
                ${selectedAmount ?? 11} USD
              </p>
              <p className="text-xs text-muted-foreground mt-1">DOGYPT HEROGLYPH CERTIFICATE for {dogName || 'your dog'}</p>
            </div>

            <Button
              onClick={handlePay}
              disabled={loading}
              className="w-full rounded-xl py-6 text-lg font-bold tracking-wider hover:scale-[1.02] transition-transform mt-2 disabled:opacity-60 disabled:scale-100"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                color: '#000',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
              }}
            >
              {loading
                ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {waitingPhoto ? 'SEALING PHOTO...' : 'PREPARING...'}</span>
                : <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> PAY WITH STRIPE</span>
              }
            </Button>

            <p className="text-[10px] text-muted-foreground/60 text-center flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" /> Secured by Stripe · Card, Apple Pay, Google Pay
            </p>
          </motion.div>

          <button
            onClick={() => navigate('/checkout')}
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
