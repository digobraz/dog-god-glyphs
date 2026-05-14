import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { PACK_THEME } from './PackLayout';

const T = PACK_THEME;

interface HeroCardProps {
  name: string;
  email: string;
  avatarUrl: string | null;
  founderNumber?: number | null;
  dogCount?: number;
}

export function HeroCard({ name, email, avatarUrl, founderNumber, dogCount = 0 }: HeroCardProps) {
  const initial = name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || 'D';
  const hasAvatar = !!avatarUrl;
  const founderLabel = founderNumber
    ? `FOUNDER #${String(founderNumber).padStart(5, '0')}`
    : 'PACK CANDIDATE';

  return (
    <section
      className="pack-card-hover h-full"
      style={{
        background: `linear-gradient(180deg, ${T.card} 0%, ${T.cardSoft} 100%)`,
        borderRadius: 24,
        padding: '28px 22px 22px',
        border: `1px solid ${T.hairline}`,
        boxShadow: '0 20px 50px -25px rgba(31, 26, 14, 0.18)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* corner ornament */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201, 154, 63, 0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -40,
          left: -40,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201, 154, 63, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="flex flex-col items-center text-center flex-1 relative">
        {/* Avatar with breathing gold ring */}
        <div className="relative" style={{ width: 100, height: 100 }}>
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              animation: 'pack-breathe 3.6s ease-in-out infinite',
              boxShadow: hasAvatar
                ? `0 0 0 1px ${T.accentGold}, 0 0 24px 2px rgba(201, 154, 63, 0.45)`
                : `0 0 0 1px rgba(201, 154, 63, 0.4), 0 0 18px 2px rgba(201, 154, 63, 0.18)`,
            }}
          />
          <Link
            to="/pack/profile?edit=avatar"
            aria-label="Edit avatar"
            className="relative group block"
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: hasAvatar ? `2px solid ${T.accentGold}` : `2px dashed ${T.border}`,
              background: hasAvatar
                ? 'transparent'
                : `linear-gradient(135deg, ${T.cardSoft} 0%, ${T.bgTop} 100%)`,
              overflow: 'hidden',
              textDecoration: 'none',
              transition: 'transform 0.2s',
            }}
          >
            {hasAvatar ? (
              <img
                src={avatarUrl!}
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span
                className="flex items-center justify-center h-full w-full"
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 34,
                  fontWeight: 700,
                  color: T.inkDim,
                }}
              >
                {initial}
              </span>
            )}
            <span
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: 'rgba(31, 26, 14, 0.5)',
                borderRadius: '50%',
                color: T.card,
              }}
            >
              <Camera className="h-5 w-5" />
            </span>
          </Link>
        </div>

        {!hasAvatar && (
          <Link
            to="/pack/profile?edit=avatar"
            className="mt-3 inline-flex items-center gap-1.5"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 12,
              color: T.accentGold,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              textDecorationColor: 'rgba(201, 154, 63, 0.4)',
            }}
          >
            <Camera className="h-3 w-3" />
            add your photo
          </Link>
        )}

        <div
          className="mt-5"
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 10,
            letterSpacing: '0.34em',
            textTransform: 'uppercase',
            color: T.inkDim,
            marginBottom: 4,
          }}
        >
          Welcome back
        </div>
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: T.ink,
            lineHeight: 1.1,
            maxWidth: '90%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12,
            color: T.inkDim,
            marginTop: 4,
          }}
        >
          {email}
        </div>

        {/* Spacer pushes identity badge to bottom */}
        <div className="flex-1" style={{ minHeight: 18 }} />

        {/* Identity badge */}
        <div className="w-full mt-4">
          <div
            className="mx-auto flex items-center justify-center gap-2"
            style={{
              padding: '10px 14px',
              borderRadius: 999,
              background: `linear-gradient(90deg, rgba(201, 154, 63, 0.10) 0%, rgba(201, 154, 63, 0.22) 50%, rgba(201, 154, 63, 0.10) 100%)`,
              border: `1px solid rgba(201, 154, 63, 0.32)`,
              maxWidth: '100%',
              flexWrap: 'wrap',
            }}
          >
            <LivePulse />
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: T.ink,
              }}
            >
              Dogyptian
            </span>
            <span style={{ color: T.inkFaint, fontSize: 10 }}>·</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 11,
                letterSpacing: '0.12em',
                color: T.accentGold,
              }}
            >
              {founderLabel}
            </span>
          </div>
          {dogCount > 0 && (
            <div
              className="text-center mt-2"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 9.5,
                letterSpacing: '0.34em',
                textTransform: 'uppercase',
                color: T.inkFaint,
              }}
            >
              Guardian of {dogCount} {dogCount === 1 ? 'dog' : 'dogs'}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function LivePulse() {
  return (
    <span
      className="relative inline-flex"
      style={{ width: 8, height: 8 }}
      aria-hidden
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: '#3D7A4E',
          animation: 'pack-live-pulse 1.8s ease-out infinite',
        }}
      />
      <span
        className="relative inline-block rounded-full"
        style={{
          width: 8,
          height: 8,
          background: '#3D7A4E',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.4)',
        }}
      />
    </span>
  );
}
