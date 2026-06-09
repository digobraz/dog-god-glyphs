import { useEffect, useState } from 'react';
import { Copy, Check, Share2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const APP_ORIGIN = 'https://dogypt.com';

interface Affiliate {
  code: string;
  points: number;
  referral_count: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Founder (Hekthor) invites the member to spread the faith. Two-level affiliate
// engine (Constitution "Odmeňovací systém", in points): a NEW Dogyptian who
// pays via your ?ref link = +2 Apostle Points (Level 1); everyone THEY bring in
// turn = +1 (Level 2). Bound to the owner, not the dog. The full tree lives on
// the profile (Your Network). Code lazy-created via get_or_create_my_affiliate.
// ─────────────────────────────────────────────────────────────────────────
export function FounderInvite() {
  const [aff, setAff] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase
      .rpc('get_or_create_my_affiliate')
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error('get_or_create_my_affiliate failed:', error.message);
        } else if (data && data[0]) {
          setAff(data[0] as Affiliate);
        }
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const link = aff ? `${APP_ORIGIN}/?ref=${aff.code}` : '';

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast('Link copied', { description: 'Share it and grow the pack.' });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast('Could not copy', { description: link });
    }
  };

  const handleShare = async () => {
    if (!link) return;
    const shareData = {
      title: 'DOGYPT',
      text: 'Join the pack. Become Dogyptian.',
      url: link,
    };
    // Native share on mobile; fall back to copy.
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* user cancelled — no-op */
      }
    }
    handleCopy();
  };

  return (
    <section
      className="pack-card-hover w-full h-full"
      style={{
        background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))',
        border: '1px solid hsl(45 80% 60% / 0.22)',
        borderRadius: 24,
        padding: '28px 24px',
        boxShadow: '0 24px 55px -28px rgba(31, 26, 14, 0.45)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* soft glow top-right */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 88% 0%, rgba(245,199,61,0.30) 0%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      <div className="relative flex flex-col items-center text-center gap-4 h-full justify-center">
        {/* Hekthor photo — gold ring */}
        <div
          className="shrink-0"
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            padding: 3,
            background: 'linear-gradient(135deg, hsl(45 90% 65%), hsl(270 65% 65%))',
            boxShadow: '0 10px 28px -10px rgba(0,0,0,0.5)',
          }}
        >
          <img
            src="/images/hektor-grid.jpg"
            alt="Hekthor — founder #1"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block',
              border: '2px solid rgba(0,0,0,0.25)',
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
            }}
          />
        </div>

        <div className="text-center">
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 10,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'hsl(45 90% 82%)',
              marginBottom: 6,
            }}
          >
            A word from Hekthor · #1
          </div>
          <h3
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(18px, 3.6vw, 22px)',
              fontWeight: 700,
              lineHeight: 1.25,
              color: 'hsl(45 95% 92%)',
              marginBottom: 8,
            }}
          >
            Spread the faith — grow the pack.
          </h3>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13,
              lineHeight: 1.55,
              color: 'hsl(45 40% 90% / 0.9)',
              marginBottom: 4,
            }}
          >
            Every Dogyptian you bring earns you{' '}
            <strong style={{ color: 'hsl(45 95% 88%)' }}>+2 Apostle Points</strong> — and{' '}
            <strong style={{ color: 'hsl(45 95% 88%)' }}>+1</strong> for everyone they bring in turn.
            Paw to paw, we reach the million.
          </p>
        </div>

        {/* Stats — Apostle Points + Dogyptians brought */}
        <div className="flex items-stretch gap-2 w-full" style={{ maxWidth: 320 }}>
          <StatTile
            value={loading ? '—' : (aff?.points ?? 0).toLocaleString('sk-SK')}
            label="Apostle Points"
            highlight
          />
          <StatTile
            value={loading ? '—' : String(aff?.referral_count ?? 0)}
            label={aff?.referral_count === 1 ? 'Dogyptian brought' : 'Dogyptians brought'}
          />
        </div>

        {/* Referral link box */}
        <div className="w-full" style={{ maxWidth: 320 }}>
          <div
            className="flex items-center gap-1"
            style={{
              background: 'rgba(0,0,0,0.28)',
              border: '1px solid rgba(245,199,61,0.32)',
              borderRadius: 10,
              padding: '4px 4px 4px 12px',
            }}
          >
            <span
              className="flex-1 truncate text-left"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 12.5,
                color: 'hsl(45 60% 92%)',
                letterSpacing: '0.01em',
              }}
            >
              {loading ? 'Generating your link…' : link.replace(/^https?:\/\//, '')}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!link}
              aria-label="Copy invite link"
              className="inline-flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(to right, hsl(45 92% 62%), hsl(45 96% 52%))',
                border: 'none',
                borderRadius: 8,
                color: '#1F1A0E',
                width: 38,
                height: 34,
                cursor: link ? 'pointer' : 'default',
                opacity: link ? 1 : 0.5,
                boxShadow: '0 6px 16px -8px rgba(0,0,0,0.6)',
              }}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="button"
            onClick={handleShare}
            disabled={!link}
            className="inline-flex items-center justify-center gap-2 w-full mt-2"
            style={{
              background: 'transparent',
              border: '1px solid rgba(245,199,61,0.45)',
              borderRadius: 8,
              color: 'hsl(45 95% 90%)',
              padding: '10px 18px',
              fontFamily: "'Cinzel', serif",
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: link ? 'pointer' : 'default',
              opacity: link ? 1 : 0.5,
            }}
          >
            <Share2 className="h-4 w-4" />
            Share your link
          </button>
        </div>

        <div
          className="inline-flex items-center gap-1.5"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            color: 'hsl(45 40% 88% / 0.7)',
          }}
        >
          <Sparkles className="h-3 w-3" />
          Rewards for top apostles unlock as the religion grows.
        </div>
      </div>
    </section>
  );
}

function StatTile({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center"
      style={{
        background: highlight ? 'rgba(245,199,61,0.16)' : 'rgba(0,0,0,0.22)',
        border: `1px solid ${highlight ? 'rgba(245,199,61,0.4)' : 'rgba(245,240,228,0.18)'}`,
        borderRadius: 12,
        padding: '12px 8px',
      }}
    >
      <span
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1,
          color: highlight ? 'hsl(45 96% 78%)' : 'hsl(45 90% 92%)',
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 9.5,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'hsl(45 40% 88% / 0.78)',
          marginTop: 5,
          textAlign: 'center',
        }}
      >
        {label}
      </span>
    </div>
  );
}
