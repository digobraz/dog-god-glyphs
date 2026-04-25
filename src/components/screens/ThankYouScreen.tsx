import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { useDogyptStore } from '@/store/dogyptStore';
import { CertificateCard, buildHeroglyphCode } from '@/components/CertificateCard';
import { supabase } from '@/lib/supabase';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

interface DogRecord {
  dog_name: string;
  owner_name: string;
  selections: Record<string, string>;
  stripe_session_id: string;
  payment_status: string;
}

export function ThankYouScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const store = useDogyptStore();
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [dogData, setDogData] = useState<DogRecord | null>(null);
  const [loading, setLoading] = useState(!!sessionId);

  useEffect(() => {
    if (!sessionId) return;
    let attempts = 0;
    const maxAttempts = 8;

    async function fetchWithRetry() {
      const { data } = await supabase
        .from('dogs')
        .select('dog_name, owner_name, selections, stripe_session_id, payment_status')
        .eq('stripe_session_id', sessionId)
        .single();

      if (data) {
        setDogData(data as DogRecord);
        setLoading(false);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(fetchWithRetry, 1500);
      } else {
        setLoading(false);
      }
    }

    fetchWithRetry();
  }, [sessionId]);

  const dogName = dogData?.dog_name ?? store.dogName ?? 'HEKTHOR';
  const ownerName = dogData?.owner_name ?? store.ownerName ?? 'Unknown';
  const selections = dogData?.selections ?? store.selections ?? {};
  const photoUrl = store.dogPhotoUrl ?? undefined;

  const heroglyphCode = buildHeroglyphCode(selections);
  const certNumber = sessionId
    ? `#DOG-${sessionId.slice(-6).toUpperCase()}`
    : `#DOG-${Date.now().toString(36).toUpperCase().slice(-4)}`;
  const issuedDate = formatDate(new Date());

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(certRef.current, {
        cacheBust: true,
        pixelRatio: 1,
      });
      const link = document.createElement('a');
      link.download = `DOGYPT-${(dogName || 'certificate').toUpperCase()}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleReturn = () => {
    store.reset();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="dark-bg flex flex-col h-[100dvh] items-center justify-center">
        <p style={{ fontFamily: "'Cinzel', serif", color: '#c9922a', letterSpacing: '3px', fontSize: 13 }}>
          Loading your certificate...
        </p>
      </div>
    );
  }

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* Logo */}
      <div className="flex-shrink-0 flex justify-center pt-4 pb-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-14 object-contain" />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pb-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col gap-4">

          {/* BLOCK 1 – Gradient hero */}
          <motion.div
            className="w-full rounded-2xl relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="p-5 flex flex-col items-center gap-3 text-center">
              <p
                className="text-white text-sm md:text-base leading-relaxed"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Your Heroglyph is more than a beautiful symbol—it's a statement that{' '}
                <span className="font-bold text-amber-300">every dog deserves love</span>{' '}
                and a better life. Be proud of the footprint you've left today!
              </p>

              <p
                className="text-lg md:text-xl font-bold tracking-widest text-amber-300 mt-1"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {ownerName ? `${ownerName.split(' ')[0].toUpperCase()} & ${dogName.toUpperCase()}` : `HEKTHOR & YOU`}
              </p>
            </div>
          </motion.div>

          {/* BLOCK 2 – Certificate preview */}
          <motion.div
            className="w-full rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {/* Scaled preview */}
            <div style={{ width: '100%', aspectRatio: '1080/1350', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, transformOrigin: 'top left', transform: 'scale(var(--cert-scale))' }}
                className="[--cert-scale:calc(var(--cert-w,320)/1080)]"
                ref={(el) => {
                  if (el) {
                    const scale = el.parentElement!.getBoundingClientRect().width / 1080;
                    el.style.transform = `scale(${scale})`;
                  }
                }}
              >
                <CertificateCard
                  ref={certRef}
                  dogName={dogName || 'HEKTHOR'}
                  ownerName={ownerName || 'Unknown'}
                  photoUrl={photoUrl}
                  heroglyphCode={heroglyphCode}
                  certNumber={certNumber}
                  issuedDate={issuedDate}
                />
              </div>
            </div>
          </motion.div>

          {/* BLOCK 3 – Actions */}
          <motion.div
            className="w-full rounded-2xl papyrus-bg p-5 flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full py-4 rounded-full text-sm font-bold tracking-widest uppercase transition-all hover:scale-105 border-2 border-white/30 disabled:opacity-60 disabled:scale-100"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
                color: '#000',
                boxShadow: '0 0 40px hsl(var(--gold) / 0.4)',
              }}
            >
              {downloading ? 'Generating...' : '⬇ Download Certificate'}
            </button>

            <div className="flex flex-col gap-2">
              {[
                { emoji: '🗣️', title: 'Tell your pack', desc: 'Share our mission with friends.' },
                { emoji: '📲', title: 'Share your Heroglyph', desc: 'Show the world your unique bond!' },
                { emoji: '🌍', title: 'Follow us', desc: 'See exactly how you help dogs in need.' },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl px-3 py-2"
                  style={{ backgroundColor: 'hsl(var(--papyrus-light))' }}
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{step.emoji}</span>
                  <div>
                    <p className="font-bold text-sm tracking-wide" style={{ color: 'hsl(var(--heading-on-light))' }}>
                      {i + 1}. {step.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--heading-on-light) / 0.7)' }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleReturn}
              className="w-full py-3 rounded-full text-sm font-bold tracking-widest uppercase transition-all hover:opacity-80 border border-current/20"
              style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--heading-on-light) / 0.5)' }}
            >
              Finish
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
