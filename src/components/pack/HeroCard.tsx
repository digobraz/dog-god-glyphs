import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { PACK_THEME } from './PackLayout';

const T = PACK_THEME;

interface HeroCardProps {
  name: string;
  email: string;
  avatarUrl: string | null;
}

export function HeroCard({ name, email, avatarUrl }: HeroCardProps) {
  const initial = name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || 'D';
  const hasAvatar = !!avatarUrl;

  return (
    <section
      className="text-center"
      style={{
        background: `linear-gradient(180deg, ${T.card} 0%, ${T.cardSoft} 100%)`,
        borderRadius: 24,
        padding: '28px 22px 26px',
        border: `1px solid ${T.hairline}`,
        boxShadow: '0 20px 50px -25px rgba(31, 26, 14, 0.18)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* faint corner ornament */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201, 154, 63, 0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="flex flex-col items-center">
        <Link
          to="/pack/profile?edit=avatar"
          aria-label="Edit avatar"
          className="relative group"
          style={{
            width: 92,
            height: 92,
            borderRadius: '50%',
            border: hasAvatar ? `1px solid ${T.hairline}` : `2px dashed ${T.border}`,
            background: hasAvatar
              ? 'transparent'
              : `linear-gradient(135deg, ${T.cardSoft} 0%, ${T.bgTop} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            textDecoration: 'none',
            transition: 'transform 0.15s',
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
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 32,
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

        {!hasAvatar && (
          <Link
            to="/pack/profile?edit=avatar"
            className="mt-2 inline-flex items-center gap-1.5"
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
          className="mt-4"
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 11,
            letterSpacing: '0.3em',
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
            fontSize: 26,
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
      </div>
    </section>
  );
}
