import { Link } from 'react-router-dom';
import { Camera, Crown } from 'lucide-react';
import { PACK_THEME } from './packTheme';

const T = PACK_THEME;

const AVATAR_SIZE = 164;
// Ring = náš fialovo-zlatý gradient (rovnaký ako MY PACK blok vedľa)
const STORY_RING = 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))';

interface HeroCardProps {
  name: string;
  email: string;
  avatarUrl: string | null;
  /** Faraón line-art placeholder podľa pohlavia majiteľa (selections.ownerGender) keď chýba reálna fotka */
  genderPlaceholder?: 'man' | 'woman' | null;
  /** Devotion points — placeholder hodnota, point systém = ďalšia session */
  points?: number;
}

export function HeroCard({ name, email, avatarUrl, genderPlaceholder = null, points = 1000000 }: HeroCardProps) {
  const initial = name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || 'D';
  const hasAvatar = !!avatarUrl;
  const placeholderSrc = genderPlaceholder ? `/images/avatars/pharaoh-${genderPlaceholder}.png` : null;

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

      <div className="flex flex-col items-center text-center flex-1 justify-center relative">
        {/* Avatar — Instagram-style fialový gradient ring (väčší rámik) */}
        <div className="relative" style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}>
          {/* pulsing purple glow behind */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              animation: 'pack-breathe 3.8s ease-in-out infinite',
              boxShadow: '0 0 26px 2px rgba(124, 58, 237, 0.30), 0 0 18px 2px rgba(201, 154, 63, 0.22)',
            }}
          />
          {/* gradient ring */}
          <div
            className="relative rounded-full"
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, padding: 4, background: STORY_RING }}
          >
            {/* gap ring (papyrus) */}
            <div className="rounded-full h-full w-full" style={{ padding: 3, background: T.card }}>
              <Link
                to="/pack/profile?edit=avatar"
                aria-label="Edit avatar"
                className="relative group block h-full w-full"
                style={{
                  borderRadius: '50%',
                  background: hasAvatar
                    ? 'transparent'
                    : `linear-gradient(135deg, ${T.cardSoft} 0%, ${T.bgTop} 100%)`,
                  overflow: 'hidden',
                  textDecoration: 'none',
                }}
              >
                {hasAvatar ? (
                  <img
                    src={avatarUrl!}
                    alt={name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : placeholderSrc ? (
                  <span className="flex items-center justify-center h-full w-full" style={{ padding: 20 }}>
                    <img
                      src={placeholderSrc}
                      alt={name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </span>
                ) : (
                  <span
                    className="flex items-center justify-center h-full w-full"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: 54,
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
          </div>
        </div>

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
        {/* Badge riadok — LEVEL (Pharaoh, filled zlato-fialový) + STATUS (Handler, outline).
            Dve nezávislé osi profilu; level systém = brainstorm ďalšia session. */}
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
          {/* STATUS */}
          <div
            className="inline-flex items-center gap-1.5"
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              background: 'transparent',
              border: `1px solid ${T.border}`,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: T.accentGold ?? 'hsl(40 55% 50%)',
                boxShadow: '0 0 6px rgba(201, 154, 63, 0.6)',
              }}
            />
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color: T.ink,
              }}
            >
              Handler
            </span>
          </div>

          {/* LEVEL */}
          <div
            className="inline-flex items-center gap-2"
            style={{
              padding: '7px 16px',
              borderRadius: 999,
              background: 'linear-gradient(135deg, hsl(45 80% 48%) 0%, hsl(270 50% 42%) 100%)',
              border: '1px solid rgba(201, 154, 63, 0.55)',
              boxShadow: '0 5px 18px -5px rgba(124, 58, 237, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
            }}
          >
            <Crown className="h-3.5 w-3.5" style={{ color: 'hsl(45 92% 82%)' }} />
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color: '#FFF6E6',
                textShadow: '0 1px 4px rgba(0,0,0,0.35)',
              }}
            >
              Pharaoh
            </span>
          </div>
        </div>

        {/* Devotion points — pod badge. Placeholder; point systém = ďalšia session. */}
        <div className="mt-4 flex items-baseline justify-center gap-1.5">
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.02em',
              color: T.accentGold,
              lineHeight: 1,
            }}
          >
            {points.toLocaleString('sk-SK')}
          </span>
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: T.inkDim,
            }}
          >
            points
          </span>
        </div>
      </div>
    </section>
  );
}
