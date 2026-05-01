import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { supabase } from '@/integrations/supabase/client';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import hekthorImg from '@/assets/hekthor.png';
import hektorPhoto from '@/assets/hektor-photo.jpeg';
import hektorHeroglyph from '@/assets/hekthor-heroglyph.png';

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

  return { display, landed };
}

// TODO: replace placeholder with user's dog photo from photo step state.
const DOG_PLACEHOLDER_URL = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop&crop=face';

function DogToGod({ style }: { style?: React.CSSProperties }) {
  const [visible, setVisible] = useState(true);
  const [label, setLabel] = useState('DOG');

  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];
    const cycle = () => {
      setVisible(true); setLabel('DOG');
      t.push(setTimeout(() => setVisible(false), 1400));
      t.push(setTimeout(() => setLabel('GOD'), 1750));
      t.push(setTimeout(() => setVisible(true), 1750));
      t.push(setTimeout(() => setVisible(false), 3200));
      t.push(setTimeout(() => setLabel('DOG'), 3550));
      t.push(setTimeout(() => setVisible(true), 3550));
      t.push(setTimeout(cycle, 5000));
    };
    t.push(setTimeout(cycle, 1000));
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.span style={style}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}>
      {label}
    </motion.span>
  );
}

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
  const ownerFirstName = (store.ownerName || '').split(' ')[0] || 'Friend';
  const email = store.email || '';
  const photoUrl = store.dogPhotoUrl || DOG_PLACEHOLDER_URL;

  const packNumber = usePackNumber(dogName, email, sessionId);
  const { display: packDisplay, landed } = useAnimatedCounter(packNumber ?? 0, reduced);

  const handleEnterPack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* 1. Logo — on dark bg */}
      <div className="flex-shrink-0 flex justify-center pt-3 pb-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-7 md:h-10 object-contain" />
      </div>

      {/* Outer centering container */}
      <div className="flex-1 flex items-center justify-center px-4 pb-4">
      <motion.div
        className="w-full max-w-sm papyrus-bg rounded-3xl flex flex-col items-center px-5 pt-7 pb-7 gap-3"
        style={{ border: '1px solid hsl(var(--gold) / 0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* Goal tracker + dog photo — one block */}
        <div className="w-full rounded-2xl flex flex-col items-center flex-shrink-0 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}>

          {/* Stats section */}
          <div className="w-full flex flex-col items-center gap-2.5 px-4 pt-3 pb-2.5">

            {/* Number left, goal info right */}
            <div className="w-full flex items-center justify-between gap-3">
              {packNumber === null ? (
                <span className="font-bold animate-pulse"
                  style={{ fontFamily: "'Cinzel', serif", fontSize: 28, color: 'hsl(45 80% 65%)' }}>
                  ...
                </span>
              ) : (
                <motion.span
                  className="font-bold leading-none"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 'clamp(1.6rem, 7vw, 2.4rem)',
                    background: 'linear-gradient(135deg, hsl(45 95% 80%), hsl(45 80% 60%))',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}
                  animate={landed ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.35 }}
                >
                  #{packDisplay.toLocaleString()}
                </motion.span>
              )}
              <div className="flex flex-col items-end gap-0.5">
                <span className="tracking-widest uppercase font-semibold"
                  style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                  Our Goal 🎯
                </span>
                <span className="tracking-wider uppercase font-bold"
                  style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.72rem, 2.8vw, 0.9rem)', color: 'hsl(45 90% 70%)' }}>
                  1,000,000 Dogyptians
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.25)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(to right, hsl(270 65% 65%), hsl(45 90% 65%))' }}
                initial={{ width: '0%' }}
                animate={{ width: packNumber ? `${Math.max(2.5, (packNumber / 1000000) * 100)}%` : '0%' }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              />
            </div>

          </div>

          {/* Dog photo — full width, absorbed into block */}
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
          <img
            src={photoUrl !== DOG_PLACEHOLDER_URL ? photoUrl : hektorPhoto}
            alt={dogName}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.7) 28%, rgba(0,0,0,0.1) 52%, transparent 68%)' }}
          />
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-2.5" style={{ height: '36%' }}>
            <img src={hektorHeroglyph} alt="Heroglyph"
              className="w-3/5 max-w-[170px] object-contain"
              style={{ filter: 'drop-shadow(0 2px 10px rgba(201,146,42,0.5))' }}
            />
          </div>
          </div>

        </div>

        {/* Text content */}
        <div className="w-full flex flex-col items-center gap-2 text-center">

          {/* Congrats + dog name */}
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-baseline justify-center gap-1.5 flex-wrap mb-1">
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1a1a1a' }}>
                Congratulations,
              </span>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.95rem, 4vw, 1.2rem)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, hsl(45 90% 50%), hsl(39 80% 40%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {ownerFirstName}.
              </span>
            </div>

            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.2rem, 5.5vw, 1.6rem)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1, background: 'linear-gradient(135deg, hsl(45 90% 50%), hsl(39 80% 40%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {dogName}
            </span>

            <div className="flex items-baseline gap-1.5 justify-center">
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.9rem, 3.8vw, 1.1rem)', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a1a1a' }}>
                is now a
              </span>
              <DogToGod style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.9rem, 3.8vw, 1.1rem)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'linear-gradient(135deg, hsl(45 90% 50%), hsl(39 80% 40%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }} />
            </div>
          </div>

          {/* Mission text — Inter */}
          <p className="leading-relaxed text-center"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#888', letterSpacing: '0.01em' }}>
            You just changed history — one dog at a time.<br />
            Tell the world. Spread the pack. Join us.<br />
            <strong>IN DOG WE TRUST.</strong>
          </p>

          {/* CTA + email hint */}
          <div className="w-full flex flex-col items-center gap-2">
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
              ENTER THE GODS →
            </button>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: '#666', letterSpacing: '0.01em' }}>
              Your certificate is on its way — check your email.
            </p>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
