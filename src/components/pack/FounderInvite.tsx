import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { PACK_THEME } from './PackLayout';

const T = PACK_THEME;

// ─────────────────────────────────────────────────────────────────────────
// Founder (Hekthor) addressing the member — purple→gold gradient card matching
// the paywall/welcome flow. Invite/affiliate link + reward hook. Link engine +
// counter = TBD (placeholder toast for now). Copy = DRAFT, EN mission voice.
// ─────────────────────────────────────────────────────────────────────────
export function FounderInvite() {
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

      <div className="relative flex flex-col items-center text-center gap-5 h-full justify-center">
        {/* Hekthor photo — gold ring */}
        <div
          className="shrink-0"
          style={{
            width: 104,
            height: 104,
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

        {/* Message */}
        <div className="text-center">
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 10,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'hsl(45 90% 82%)',
              marginBottom: 8,
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
              marginBottom: 10,
            }}
          >
            Bring your friends — reach the million faster.
          </h3>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13.5,
              lineHeight: 1.6,
              color: 'hsl(45 40% 90% / 0.9)',
              marginBottom: 18,
            }}
          >
            The pack grows paw to paw. Share your invite link and welcome your people into
            Dogypt — every Dogyptian you bring moves us all forward. The first guardians to
            spread the word will be rewarded: merch perks and founder privileges as the religion grows.
          </p>

          <button
            type="button"
            onClick={() =>
              toast('Invite links — coming soon', {
                description: 'Your personal link & reward tiers unlock as the pack grows.',
              })
            }
            className="inline-flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(to right, hsl(45 92% 62%), hsl(45 96% 52%))',
              border: 'none',
              borderRadius: 8,
              color: '#1F1A0E',
              padding: '12px 22px',
              fontFamily: "'Cinzel', serif",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 10px 24px -12px rgba(0,0,0,0.6)',
            }}
          >
            <UserPlus className="h-4 w-4" />
            Get your invite link
          </button>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11.5,
              letterSpacing: '0.01em',
              color: 'hsl(45 40% 88% / 0.7)',
              marginTop: 10,
            }}
          >
            Invite links &amp; rewards — coming soon
          </div>
        </div>
      </div>
    </section>
  );
}
