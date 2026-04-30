import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { supabase } from '@/integrations/supabase/client';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';

function playTick() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1800;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {}
}

function usePackNumber(dogName: string, email: string, sessionId: string | null) {
  const [packNumber, setPackNumber] = useState<number | null>(null);
  const inserted = useRef(false);

  useEffect(() => {
    if (inserted.current) return;
    inserted.current = true;

    async function registerAndFetch() {
      try {
        // Insert this dog into the pack
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
          // Fallback: get current count
          const { count } = await supabase
            .from('pack_members')
            .select('*', { count: 'exact', head: true });
          if (count && count > 0) setPackNumber(count);
        }
      } catch {
        // Silent fail — packNumber stays null
      }
    }

    registerAndFetch();
  }, [dogName, email, sessionId]);

  return packNumber;
}

function AnimatedCounter({ target, reduced }: { target: number; reduced: boolean | null }) {
  const [display, setDisplay] = useState(reduced ? target : 0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (reduced || target <= 0) {
      setDisplay(target);
      return;
    }
    const duration = 800;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    // Delay to let stamp animation finish first
    const t = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, 700);
    return () => {
      clearTimeout(t);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, reduced]);

  return <>{`#${display.toLocaleString()}`}</>;
}

export function ThankYouScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const store = useDogyptStore();
  const reduced = useReducedMotion();
  const hasAnimated = useRef(false);

  const dogName = store.dogName || 'HEKTHOR';
  const email = store.email || '';

  const packNumber = usePackNumber(dogName, email, sessionId);

  useEffect(() => {
    if (hasAnimated.current || reduced) return;
    hasAnimated.current = true;
    const t = setTimeout(() => {
      playTick();
      try { navigator.vibrate?.(20); } catch {}
    }, 600);
    return () => clearTimeout(t);
  }, [reduced]);

  const handleDownload = useCallback(() => {
    alert('Certificate download will be available via the email link.');
  }, []);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${dogName}'s Heroglyph`,
      text: `${dogName} is now part of the DOGYPT pack! 🐾`,
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Link copied to clipboard!');
      }
    } catch {}
  }, [dogName]);

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* 1. Logo */}
      <div className="flex-shrink-0 flex justify-center pt-4 pb-1">
        <img src={dogyptLogo} alt="DOGYPT" className="h-8 md:h-12 object-contain" />
      </div>

      {/* Main content — centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-3 gap-3 md:gap-5 max-w-lg mx-auto w-full">

        {/* 2. Small heroglyph stamp */}
        <div className="relative flex items-center justify-center">
          {!reduced && (
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 80,
                height: 80,
                border: '2px solid hsl(var(--gold))',
              }}
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: 1.5, opacity: [0, 0.8, 0] }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            />
          )}
          <motion.div
            className="w-[80px]"
            initial={reduced ? false : { scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.6 }}
          >
            <HeroglyphFrame className="text-primary" />
          </motion.div>
        </div>

        {/* 3. Hero counter */}
        {packNumber !== null && (
          <motion.div
            className="flex flex-col items-center gap-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <span
              className="text-[96px] md:text-[140px] font-bold leading-none"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(180deg, hsl(45 90% 65%), hsl(39 80% 45%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              <AnimatedCounter target={packNumber} reduced={reduced} />
            </span>
            <span
              className="text-[24px] md:text-[32px] font-bold tracking-wide"
              style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold) / 0.6)' }}
            >
              of 1,000,000
            </span>
            <span
              className="text-[13px] md:text-[15px] tracking-[0.25em] mt-1"
              style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold) / 0.35)' }}
            >
              DOGS WELCOMED WORLDWIDE
            </span>
          </motion.div>
        )}

        {/* Fallback when no pack number — just show the dog name headline */}
        {packNumber === null && (
          <motion.h1
            className="text-center text-[28px] md:text-[32px] font-bold tracking-wide leading-tight"
            style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold))' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {dogName.toUpperCase()} is now part of the pack.
          </motion.h1>
        )}

        {/* 4. Cream card */}
        <motion.div
          className="w-full rounded-2xl papyrus-bg px-5 py-3 md:py-4 flex flex-col items-center gap-3"
          style={{ border: '1px solid hsl(var(--gold) / 0.3)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <p
            className="text-center text-[16px] md:text-[18px] font-bold tracking-wide"
            style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--heading-on-light))' }}
          >
            Thank you for moving the mission forward.
          </p>

          <p
            className="text-center text-[13px] leading-relaxed"
            style={{ color: 'hsl(var(--heading-on-light) / 0.6)' }}
          >
            Certificate is on its way to{' '}
            <strong style={{ color: 'hsl(var(--heading-on-light))' }}>
              {email || 'your inbox'}
            </strong>.
          </p>

          {/* Primary CTA */}
          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 rounded-full text-sm font-bold tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
              color: '#1a1200',
              boxShadow: '0 0 30px hsl(var(--gold) / 0.35)',
            }}
          >
            SEE {dogName.toUpperCase()} IN THE PACK →
          </button>

          {/* Secondary links */}
          <div className="flex items-center gap-4 text-xs tracking-wide">
            <button
              onClick={handleDownload}
              className="underline underline-offset-2 transition-opacity hover:opacity-70"
              style={{ color: 'hsl(var(--heading-on-light) / 0.45)', fontFamily: "'Cinzel', serif" }}
            >
              ↓ Download certificate
            </button>
            <span style={{ color: 'hsl(var(--heading-on-light) / 0.2)' }}>·</span>
            <button
              onClick={handleShare}
              className="underline underline-offset-2 transition-opacity hover:opacity-70"
              style={{ color: 'hsl(var(--heading-on-light) / 0.45)', fontFamily: "'Cinzel', serif" }}
            >
              Share with the pack
            </button>
          </div>
        </motion.div>

        {/* 5. Footer signature */}
        <motion.p
          className="text-center text-[12px] md:text-[13px] italic tracking-wide mt-1"
          style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold) / 0.3)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          With love,<br />Hektor & Matej
        </motion.p>
      </div>
    </div>
  );
}
