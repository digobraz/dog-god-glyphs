import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { supabase } from '@/integrations/supabase/client';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import hekthorImg from '@/assets/hekthor.png';

function usePackNumber(dogName: string, email: string, sessionId: string | null) {
  const [packNumber, setPackNumber] = useState<number | null>(null);
  const inserted = useRef(false);

  useEffect(() => {
    if (inserted.current) return;
    inserted.current = true;

    async function registerAndFetch() {
      try {
        const { data } = await supabase
          .from('pack_members')
          .insert({
            dog_name: dogName || 'Unknown',
            email: email || null,
            stripe_session_id: sessionId || null,
          })
          .select('pack_number')
          .single();

        if (data?.pack_number) {
          setPackNumber(data.pack_number);
        } else {
          const { count } = await supabase
            .from('pack_members')
            .select('*', { count: 'exact', head: true });
          if (count && count > 0) setPackNumber(count);
        }
      } catch {
        // Silent fail
      }
    }

    registerAndFetch();
  }, [dogName, email, sessionId]);

  return packNumber;
}

/** Animated count-up hook from 0 to target, returns text + landed flag */
function useAnimatedCounter(target: number, reduced: boolean | null) {
  const [display, setDisplay] = useState(reduced ? target : 0);
  const [landed, setLanded] = useState(!!reduced);

  useEffect(() => {
    if (reduced || target <= 0) {
      setDisplay(target);
      setLanded(true);
      return;
    }
    setLanded(false);
    const duration = 600;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * target));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setLanded(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);

  return { text: `#${display.toLocaleString()}`, landed };
}

// TODO: replace placeholder with user's dog photo from photo step state.
const DOG_PLACEHOLDER_URL = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop&crop=face';

/** Purple-to-gold gradient matching the paywall card */
const GRADIENT_CARD: React.CSSProperties = {
  background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))',
  border: '1px solid hsl(45 80% 60% / 0.2)',
};

export function ThankYouScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const store = useDogyptStore();
  const reduced = useReducedMotion();

  const dogName = store.dogName || 'HEKTHOR';
  const email = store.email || '';

  // Still register in pack DB
  usePackNumber(dogName, email, sessionId);

  const handleEnterPack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* 1. Logo — on dark bg */}
      <div className="flex-shrink-0 flex justify-center pt-3 pb-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-7 md:h-10 object-contain" />
      </div>

      {/* Cards container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-3 gap-3 max-w-lg mx-auto w-full min-h-0">

        {/* Dog photo — square, full content width */}
        <motion.div
          className="w-full flex-shrink-0"
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            layoutId={`dog-photo-${dogName}`}
            className="overflow-hidden w-full"
            style={{
              aspectRatio: '1 / 1',
              borderRadius: 16,
              boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            }}
          >
            <img
              src={DOG_PLACEHOLDER_URL}
              alt={dogName}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>

        {/* Block #1 — Cream/papyrus card, empty */}
        <motion.div
          className="w-full rounded-2xl papyrus-bg flex-[0.5] min-h-0 flex-shrink"
          style={{ border: '1px solid hsl(var(--gold) / 0.3)' }}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        />

        {/* Block #2 — Thank you + CTA (purple-orange gradient) */}
        <motion.div
          className="w-full rounded-2xl px-4 py-3 flex flex-col gap-3 flex-shrink-0"
          style={GRADIENT_CARD}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {/* Founder row */}
          <div className="flex items-center gap-3">
            <img
              src={hekthorImg}
              alt="Hektor"
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex flex-col">
              <span
                className="text-[17px] md:text-[19px] font-bold tracking-wide uppercase"
                style={{ fontFamily: "'Cinzel', serif", color: '#FAF4EC' }}
              >
                Thank you, friends.
              </span>
              <span
                className="text-[13px] md:text-[14px] italic"
                style={{ fontFamily: "'Cinzel', serif", color: 'hsl(45 60% 85% / 0.7)' }}
              >
                With love, Hektor & Matej
              </span>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            onClick={handleEnterPack}
            className="w-full py-3.5 rounded-full text-sm font-bold tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
              color: '#1a1200',
              boxShadow: '0 4px 20px hsl(45 80% 50% / 0.4)',
            }}
          >
            ENTER THE PACK →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
