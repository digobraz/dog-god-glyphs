import { useEffect, useRef, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { buildHeroglyphCode } from '@/components/CertificateCard';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

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

export function ThankYouScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const store = useDogyptStore();
  const reduced = useReducedMotion();
  const hasAnimated = useRef(false);

  const dogName = store.dogName || 'HEKTHOR';
  const email = store.email || '';
  const selections = store.selections ?? {};

  const heroglyphCode = useMemo(() => {
    const code = buildHeroglyphCode(selections);
    if (code) return `#${code}`;
    if (sessionId) return `#DOG-${sessionId.slice(-4).toUpperCase()}`;
    return `#DOG-${Date.now().toString(36).toUpperCase().slice(-4)}`;
  }, [selections, sessionId]);

  const issuedDate = useMemo(() => formatDate(new Date()), []);

  useEffect(() => {
    if (hasAnimated.current || reduced) return;
    hasAnimated.current = true;
    const t = setTimeout(() => {
      playTick();
      try { navigator.vibrate?.(20); } catch {}
    }, 600);
    return () => clearTimeout(t);
  }, [reduced]);

  const handleDownload = () => {
    // Placeholder — in production this triggers the real PDF download
    alert('Certificate download will be available via the email link.');
  };

  const handleShare = async () => {
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
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* 1. Logo */}
      <div className="flex-shrink-0 flex justify-center pt-4 pb-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-14 object-contain" />
      </div>

      {/* Main content — centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-4 gap-5 max-w-lg mx-auto w-full">

        {/* 2. Heroglyph stamp */}
        <div className="relative flex items-center justify-center">
          {/* Glow ring */}
          {!reduced && (
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 160,
                height: 160,
                border: '2px solid hsl(var(--gold))',
              }}
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: 1.4, opacity: [0, 0.8, 0] }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            />
          )}
          <motion.div
            className="w-[160px]"
            initial={reduced ? false : { scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.6 }}
          >
            <HeroglyphFrame className="text-primary" />
          </motion.div>
        </div>

        {/* 3. Headline */}
        <motion.h1
          className="text-center text-[28px] md:text-[32px] font-bold tracking-wide leading-tight"
          style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold))' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {dogName.toUpperCase()} is now part of the pack.
        </motion.h1>

        {/* 4. Subline */}
        <motion.p
          className="text-center text-sm tracking-[0.2em]"
          style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", color: 'hsl(var(--gold) / 0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          {heroglyphCode} · {issuedDate}
        </motion.p>

        {/* 5. Cream card */}
        <motion.div
          className="w-full rounded-2xl papyrus-bg px-5 py-4 flex flex-col items-center gap-4"
          style={{ border: '1px solid hsl(var(--gold) / 0.3)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          <p
            className="text-center text-sm leading-relaxed"
            style={{ color: 'hsl(var(--heading-on-light) / 0.7)' }}
          >
            Your certificate is on its way to{' '}
            <strong style={{ color: 'hsl(var(--heading-on-light))' }}>
              {email || 'your inbox'}
            </strong>.
          </p>

          {/* Primary CTA */}
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-full text-sm font-bold tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
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
          <div className="flex items-center gap-6 text-xs tracking-wide">
            <button
              onClick={handleDownload}
              className="underline underline-offset-2 transition-opacity hover:opacity-70"
              style={{ color: 'hsl(var(--heading-on-light) / 0.5)', fontFamily: "'Cinzel', serif" }}
            >
              ↓ Download certificate
            </button>
            <button
              onClick={handleShare}
              className="underline underline-offset-2 transition-opacity hover:opacity-70"
              style={{ color: 'hsl(var(--heading-on-light) / 0.5)', fontFamily: "'Cinzel', serif" }}
            >
              Share with the pack
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
