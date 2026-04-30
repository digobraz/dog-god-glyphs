import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { supabase } from '@/integrations/supabase/client';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';

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

/** Animated count-up from 0 to target */
function AnimatedCounter({ target, reduced }: { target: number; reduced: boolean | null }) {
  const [display, setDisplay] = useState(reduced ? target : 0);

  useEffect(() => {
    if (reduced || target <= 0) {
      setDisplay(target);
      return;
    }
    const duration = 800;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);

  return <>{`#${display.toLocaleString()}`}</>;
}

// TODO: replace placeholder with user's dog photo from photo step state.
// We're using a placeholder so we can iterate on the design without going through the full flow each time.
const DOG_PLACEHOLDER_URL = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop&crop=face';

// TODO: replace with actual Hektor founder photo
const HEKTOR_PHOTO_URL = 'https://placedog.net/100/100?random';

const CARD_STYLE: React.CSSProperties = {
  border: '1px solid hsl(var(--gold) / 0.3)',
};

export function ThankYouScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const store = useDogyptStore();
  const reduced = useReducedMotion();

  const dogName = store.dogName || 'HEKTHOR';
  const ownerName = store.ownerName || '';
  const ownerFirstName = ownerName.split(' ')[0] || 'friend';
  const email = store.email || '';

  const packNumber = usePackNumber(dogName, email, sessionId);

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
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-3 gap-2.5 max-w-lg mx-auto w-full min-h-0">

        {/* Card #1 — Dog photo (compact) */}
        <motion.div
          className="w-full rounded-2xl papyrus-bg flex items-center justify-center p-3 flex-shrink-0"
          style={CARD_STYLE}
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            layoutId={`dog-photo-${dogName}`}
            className="overflow-hidden rounded-xl"
            style={{ width: 148, height: 148 }}
          >
            <img
              src={DOG_PLACEHOLDER_URL}
              alt={dogName}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>

        {/* Card #2 — Million counter (HERO) */}
        <motion.div
          className="w-full rounded-2xl papyrus-bg flex flex-col items-center justify-center py-6 md:py-8 px-4 flex-shrink-0"
          style={CARD_STYLE}
          initial={reduced ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 24 }}
        >
          <span
            className="leading-none font-bold"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(110px, 18vw, 180px)',
              background: 'linear-gradient(180deg, hsl(45 90% 65%), hsl(39 80% 45%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {packNumber !== null ? (
              <AnimatedCounter target={packNumber} reduced={reduced} />
            ) : (
              '#…'
            )}
          </span>
          <span
            className="mt-1 font-bold tracking-wide"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(28px, 4.5vw, 36px)',
              color: 'hsl(var(--gold) / 0.55)',
            }}
          >
            of 1,000,000
          </span>
          <span
            className="mt-1 uppercase tracking-[0.2em]"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(11px, 1.8vw, 14px)',
              color: 'hsl(var(--gold) / 0.35)',
            }}
          >
            dogs welcomed worldwide
          </span>
        </motion.div>

        {/* Card #3 — Thank you + CTA (compact) */}
        <motion.div
          className="w-full rounded-2xl papyrus-bg px-4 py-3 flex flex-col gap-3 flex-shrink-0"
          style={CARD_STYLE}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {/* Founder row */}
          <div className="flex items-center gap-3">
            <img
              src={HEKTOR_PHOTO_URL}
              alt="Hektor"
              className="w-11 h-11 rounded-full object-cover flex-shrink-0"
              style={{ border: '2px solid hsl(var(--gold) / 0.4)' }}
            />
            <div className="flex flex-col">
              <span
                className="text-[16px] md:text-[18px] font-bold tracking-wide"
                style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold))' }}
              >
                Thank you, {ownerFirstName}.
              </span>
              <span
                className="text-[13px] md:text-[14px] italic"
                style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold) / 0.45)' }}
              >
                With love, Hektor &amp; Matej
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
              boxShadow: '0 0 30px hsl(var(--gold) / 0.35)',
            }}
          >
            ENTER THE PACK →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
