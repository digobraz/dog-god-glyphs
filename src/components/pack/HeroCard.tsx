import { Link } from 'react-router-dom';
import { Camera, Crown, Bone, Lock } from 'lucide-react';
import { PACK_THEME } from './packTheme';
import { PackNotifications } from './PackNotifications';
import { devotionLevel } from '@/lib/devotion';

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
  /** DEVOTION — sakrálna mena ranku. Placeholder; plný systém = ďalšia session. */
  devotion?: number;
  /** $BONE balance — placeholder; ekonomika = ďalšia session. */
  bones?: number;
  /** Pack pulse pre notifikačný bell (top-right). Nezobrazí sa kým nedôjdu stats. */
  stats?: { last24h: number; last30d: number; total: number } | null;
}

export function HeroCard({ name, email, avatarUrl, genderPlaceholder = null, devotion = 100, bones = 0, stats = null }: HeroCardProps) {
  const initial = name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || 'D';
  const hasAvatar = !!avatarUrl;
  const placeholderSrc = genderPlaceholder ? `/images/avatars/pharaoh-${genderPlaceholder}.png` : null;
  // DEVOTION úroveň počítaná z bodov → poháňa LEVEL badge (žiadny hardcode „Pharaoh" pre všetkých).
  const lv = devotionLevel(devotion);
  const topTier = lv.name === 'Pharaoh' || lv.name === 'Demigod';

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

      {/* Notifikácie + správy (coming soon) — vpravo hore */}
      {stats && (
        <PackNotifications last24h={stats.last24h} last30d={stats.last30d} total={stats.total} />
      )}

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
        {/* Badge riadok — STATUS (Pawtner) + LEVEL (Pharaoh) + BONES (minca).
            grid-cols-3 = tri totožné stĺpce; každý badge w-full + centrovaný = rovnaká veľkosť.
            Celé full width = šírka status baru pod ním. */}
        <div className="mt-3 grid grid-cols-3 gap-2 w-full">
          {/* STATUS */}
          <div
            className="flex w-full items-center justify-center gap-1.5"
            style={{
              padding: '7px 6px',
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
                flexShrink: 0,
                background: T.accentGold ?? 'hsl(40 55% 50%)',
                boxShadow: '0 0 6px rgba(201, 154, 63, 0.6)',
              }}
            />
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: T.ink,
              }}
            >
              Pawtner
            </span>
          </div>

          {/* LEVEL — počítaný z DEVOTION (nie natvrdo). Top tier (Pharaoh/Demigod) = zlato-fialový
              gradient + Crown; nižšie úrovne = jemný outline bez koruny. */}
          <div
            className="flex w-full items-center justify-center gap-1.5"
            style={{
              padding: '7px 6px',
              borderRadius: 999,
              background: topTier
                ? 'linear-gradient(135deg, hsl(45 80% 48%) 0%, hsl(270 50% 42%) 100%)'
                : 'transparent',
              border: topTier ? '1px solid rgba(201, 154, 63, 0.55)' : `1px solid ${T.border}`,
              boxShadow: topTier
                ? '0 5px 18px -5px rgba(124, 58, 237, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
                : 'none',
            }}
          >
            {topTier && <Crown className="h-3 w-3 shrink-0" style={{ color: 'hsl(45 92% 82%)' }} />}
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: topTier ? '#FFF6E6' : T.ink,
                textShadow: topTier ? '0 1px 4px rgba(0,0,0,0.35)' : 'none',
              }}
            >
              {lv.name}
            </span>
          </div>

          {/* BONES — minca + kostička (presunuté hore vedľa Pharaoh) */}
          <div
            className="flex w-full items-center justify-center gap-1.5"
            title="Bones"
            aria-label={`${bones} bones`}
            style={{
              padding: '7px 6px',
              borderRadius: 999,
              background: 'transparent',
              border: `1px solid ${T.border}`,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 17, height: 17, borderRadius: '50%', flexShrink: 0,
                background: 'radial-gradient(circle at 35% 30%, #F7DD92 0%, #C99A3F 68%, #9A742B 100%)',
                border: '1px solid rgba(120,90,30,0.7)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.55), 0 1px 3px rgba(0,0,0,0.2)',
              }}
            >
              <Bone style={{ width: 9, height: 9, color: '#5A3F12' }} />
            </span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: T.ink }}>
              {bones.toLocaleString('sk-SK')}
            </span>
          </div>
        </div>

        {/* 12 odznakov — PLACEHOLDER (locked), jeden rad vo veľkosti mince. Namapujú sa podľa
            STAREJ ÚSTAVY (psie preteky, poslušnosť, krajiny…) — za ne sa zbierajú DEVOTION body. */}
        <div className="mt-4 grid grid-cols-12 gap-1 w-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              title="Coming soon"
              aria-label={`Achievement ${i + 1} — locked`}
              className="flex items-center justify-center"
              style={{
                width: '100%',
                maxWidth: 20,
                aspectRatio: '1 / 1',
                marginInline: 'auto',
                borderRadius: '50%',
                border: `1px dashed ${T.border}`,
                background: 'rgba(201,154,63,0.05)',
                color: T.inkFaint,
              }}
            >
              <Lock style={{ width: 9, height: 9 }} />
            </span>
          ))}
        </div>

        {/* DEVOTION status bar + progress — pod badge.
            PLACEHOLDER hodnoty + ladder; plný systém = ďalšia session. */}
        {(() => {
          return (
            <div className="hc-dev mt-4 w-full">
              <style>{`
                .hc-bar { position: relative; cursor: default; outline: none; }
                .hc-bar .hc-tip {
                  position: absolute; left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%);
                  white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity .2s ease;
                  background: rgba(20,16,8,0.96); color: #FAF4EC; z-index: 5;
                  font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
                  padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(201,154,63,0.45);
                  box-shadow: 0 8px 22px -8px rgba(0,0,0,0.6);
                }
                .hc-bar:hover .hc-tip, .hc-bar:focus-visible .hc-tip { opacity: 1; }
              `}</style>

              {/* DEVOTION status bar — full width (ako badge nad ním); vnútri vycentrované iba číslo + ankh.
                  Hover = label „Devotion". Fill = progress na ďalšiu úroveň. */}
              <div
                className="hc-bar w-full"
                tabIndex={0}
                role="img"
                aria-label={`Devotion ${devotion.toLocaleString('sk-SK')}, level ${lv.index} ${lv.name}`}
                style={{ position: 'relative', height: 34, borderRadius: 999, overflow: 'hidden', background: T.hairline, border: `1px solid ${T.border}` }}
              >
                <div style={{ position: 'absolute', inset: 0, width: `${lv.pct}%`, background: 'linear-gradient(90deg, hsl(270 42% 42%), hsl(45 82% 55%))', transition: 'width .5s ease' }} />
                <div className="relative h-full flex items-center justify-center gap-1.5">
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 17, fontWeight: 700, color: T.ink, lineHeight: 1, letterSpacing: '0.02em', textShadow: '0 1px 2px rgba(250,244,236,0.5)' }}>
                    {devotion.toLocaleString('sk-SK')}
                  </span>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: T.ink, lineHeight: 1, textShadow: '0 1px 2px rgba(250,244,236,0.5)' }}>☥</span>
                </div>
                <span className="hc-tip">Devotion</span>
              </div>

              {/* body do ďalšej (2.) úrovne — vpravo pod barom, malým */}
              <div style={{ textAlign: 'right', marginTop: 5 }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: T.inkDim }}>
                  {lv.next ? <>{lv.toNext.toLocaleString('sk-SK')} ☥ to {lv.next.name}</> : 'Highest devotion reached'}
                </span>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
