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

// TODO: replace with actual Hektor founder photo
const HEKTOR_PHOTO_URL = 'https://placedog.net/100/100?random';

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
  const dogPhotoUrl = store.dogPhotoUrl || '';

  const packNumber = usePackNumber(dogName, email, sessionId);

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

  const handleEnterPack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const counterText = packNumber !== null
    ? `#${packNumber.toLocaleString()} OF 1,000,000`
    : '#… OF 1,000,000';

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* 1. Logo */}
      <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
        <img src={dogyptLogo} alt="DOGYPT" className="h-7 md:h-10 object-contain" />
      </div>

      {/* 2. Hero dog photo */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-2 gap-2.5 max-w-lg mx-auto w-full min-h-0">
        <motion.div
          layoutId={`dog-photo-${dogName}`}
          className="relative w-full overflow-hidden rounded-[18px]"
          style={{ aspectRatio: '1 / 1', maxHeight: '62dvh', maxWidth: '62dvh' }}
          initial={reduced ? false : { scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24, duration: 0.6 }}
        >
          {dogPhotoUrl ? (
            <img
              src={dogPhotoUrl}
              alt={dogName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-lg">🐾</span>
            </div>
          )}

          {/* Gold overlay strip at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center"
            style={{
              height: 48,
              background: 'linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.25))',
            }}
          >
            <span
              className="text-[14px] md:text-[16px] font-bold tracking-[0.2em] leading-tight"
              style={{
                fontFamily: "'Cinzel', serif",
                color: 'hsl(var(--gold))',
              }}
            >
              {counterText}
            </span>
            <span
              className="text-[10px] md:text-[11px] tracking-[0.15em]"
              style={{
                fontFamily: "'Cinzel', serif",
                color: 'hsl(var(--gold) / 0.55)',
              }}
            >
              dogs welcomed worldwide
            </span>
          </div>
        </motion.div>

        {/* 3. Cream card — founders note */}
        <motion.div
          className="w-full rounded-2xl papyrus-bg px-4 py-2.5 flex items-center gap-3"
          style={{ border: '1px solid hsl(var(--gold) / 0.3)' }}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {/* Hektor's portrait */}
          <img
            src={HEKTOR_PHOTO_URL}
            alt="Hektor"
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            style={{ border: '2px solid hsl(var(--gold) / 0.4)' }}
          />
          <div className="flex flex-col">
            <span
              className="text-[15px] md:text-[16px] font-bold tracking-wide"
              style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold))' }}
            >
              Thank you, {ownerFirstName}.
            </span>
            <span
              className="text-[11px] md:text-[12px] italic"
              style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold) / 0.45)' }}
            >
              With love, Hektor & Matej
            </span>
          </div>
        </motion.div>

        {/* 4. Primary CTA */}
        <motion.button
          onClick={handleEnterPack}
          className="w-full py-3.5 rounded-full text-sm font-bold tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            fontFamily: "'Cinzel', serif",
            background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
            color: '#1a1200',
            boxShadow: '0 0 30px hsl(var(--gold) / 0.35)',
          }}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          ENTER THE PACK →
        </motion.button>

        {/* 5. Secondary links */}
        <motion.div
          className="flex items-center gap-4 text-xs tracking-wide"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        >
          <button
            onClick={handleDownload}
            className="underline underline-offset-2 transition-opacity hover:opacity-70"
            style={{ color: 'hsl(var(--gold) / 0.45)', fontFamily: "'Cinzel', serif" }}
          >
            ↓ Download certificate
          </button>
          <span style={{ color: 'hsl(var(--gold) / 0.2)' }}>·</span>
          <button
            onClick={handleShare}
            className="underline underline-offset-2 transition-opacity hover:opacity-70"
            style={{ color: 'hsl(var(--gold) / 0.45)', fontFamily: "'Cinzel', serif" }}
          >
            Share with the pack
          </button>
        </motion.div>
      </div>
    </div>
  );
}
