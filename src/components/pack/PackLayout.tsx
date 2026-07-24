import { ReactNode, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BrandIcon as PackBrandIcon } from './BrandIcon';
import { PACK_THEME } from './packTheme';
import { devotionLevel } from '@/lib/devotion';
import { DEV_FULL } from '@/lib/packFlags';
import { usePackIdentity, type PackDog } from './usePackIdentity';
import iconHome from '@/assets/icons/nav-home.svg';
import iconPortal from '@/assets/icons/nav-portal.svg';
import iconDogs from '@/assets/icons/nav-dogs.svg';
import statBadge from '@/assets/icons/stat-badge.svg';
import statBars from '@/assets/icons/stat-bars.svg';
import { useT } from '@/i18n/LanguageContext';
import { Inbox } from './messaging/Inbox';
import { Thread } from './messaging/Thread';
import { onOpenMessaging, emitOpenInbox, type MessagingOpenEvent } from './messaging/openBridge';
import { unreadCount, subscribe as subscribeMessaging } from './messaging/packMessaging';

const T = PACK_THEME;

interface PackLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  wide?: boolean;
}

export function PackLayout({ children, title, subtitle, wide }: PackLayoutProps) {
  const t = useT();
  const navigate = useNavigate();
  const { session, loading, dogs, devotion, bones, avatarUrl, avatarInitial, packTotal, packToday } = usePackIdentity();

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center relative" style={{ backgroundColor: T.pageBg }}>
        <HieroglyphBg />
        <div className="relative" style={{ zIndex: 1 }}>
          <div style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.3em', fontSize: 12, color: T.onDarkDim }}>
            {t('pack.layout.loading')}
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-[100dvh] relative" style={{ backgroundColor: T.pageBg, color: T.onDark }}>
      <HieroglyphBg />

      {/* FLOATING STATUS HUB — fixed top, slim single-row pill */}
      <DevotionHeader
        avatarUrl={avatarUrl}
        avatarInitial={avatarInitial}
        devotion={devotion}
        bones={bones}
        packTotal={packTotal}
        packToday={packToday}
        dogs={dogs}
        wide={wide}
        onProfile={() => {
          // LIVE: profil zrušený → avatar skroluje na settings blok dole na homepage.
          // DEV_FULL: plný profil ostáva.
          if (DEV_FULL) { navigate('/pack/profile'); return; }
          navigate('/pack');
          setTimeout(() => document.getElementById('pack-settings')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
        }}
        onDog={(id) => navigate(`/pack/dogs/${id}`)}
      />

      <div
        className={`relative z-10 mx-auto w-full ${wide ? 'max-w-5xl' : 'max-w-2xl'} px-4 sm:px-6 pb-32`}
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 106px)' }}
      >
        {(title || subtitle) && (
          <header className="mb-7 text-center">
            {subtitle && (
              <div className="mb-2" style={{
                fontFamily: "'Cinzel', serif", letterSpacing: '0.32em',
                fontSize: 10, textTransform: 'uppercase', color: T.onDarkDim,
              }}>
                {subtitle}
              </div>
            )}
            {title && (
              <h1 style={{
                fontFamily: "'Cinzel', serif", letterSpacing: '0.1em',
                fontSize: 28, textTransform: 'uppercase', fontWeight: 700, color: T.onDark,
              }}>
                {title}
              </h1>
            )}
          </header>
        )}
        <main>{children}</main>
      </div>

      {/* Floating pill nav — dolný (Home + Portal + Dogs + Messages). LIVE: skryté (orezaný
          pack). DEV_FULL: ostáva = plná dev verzia zamrznutá v tomto stave. */}
      <PackBottomNav />
      <MessagingOverlayHost />
    </div>
  );
}

// ── Messaging overlay host (Inbox/Thread) — design:
// plany/zadanie-profil-messaging-2026-07-23.md §10 Fable amendment: "stav inbox/thread overlayu
// žije v PackLayout ... žiadny prop-drilling cez 1944-riadkový PackPortal". PackPortal.tsx je ale
// full-bleed a NEmountuje <PackLayout> (vlastný <DevotionHeader>/<PackBottomNav>, viď komentár pri
// PackBottomNav nižšie) — preto je hosting vytiahnutý ako samostatný exportovaný komponent (žije
// TU, v PackLayout.tsx, presne podľa zadania), mountnutý raz tu a raz priamo v PackPortal.tsx
// (surgical 1-riadkový prídavok), nech "Message owner"/"Open trip group" na tripe aj Messages tab
// v zdieľanom bottom nave majú vždy kam otvoriť overlay. Gated DEV_FULL — spúšťacie miesta
// (PackNotifications live stav, bottom nav Messages, trip panel tlačidlá) sú tiež všetky
// DEV_FULL-only, takže LIVE build sa nemení (§8.4 bez regresie).
type MessagingOverlayState = { mode: 'closed' } | { mode: 'inbox' } | { mode: 'thread'; convId: string };

export function MessagingOverlayHost() {
  const [overlay, setOverlay] = useState<MessagingOverlayState>({ mode: 'closed' });

  useEffect(() => {
    if (!DEV_FULL) return;
    return onOpenMessaging((ev: MessagingOpenEvent) => {
      setOverlay(ev.mode === 'inbox' ? { mode: 'inbox' } : { mode: 'thread', convId: ev.convId });
    });
  }, []);

  if (!DEV_FULL || overlay.mode === 'closed') return null;

  if (overlay.mode === 'inbox') {
    return (
      <Inbox
        onOpenThread={(convId) => setOverlay({ mode: 'thread', convId })}
        onClose={() => setOverlay({ mode: 'closed' })}
      />
    );
  }

  // Thread "back" (←) sa vracia do Inboxu (rovnaký vzor ako bežné DM appky), Inbox "×" zatvára
  // overlay úplne.
  return <Thread convId={overlay.convId} onClose={() => setOverlay({ mode: 'inbox' })} />;
}

// ── Floating bottom pill nav — Home · Portal · Dogs ─────────────────────────
// Shared between PackLayout (every narrow-column pack page) and the full-bleed
// Portal Trips surface (its own <DevotionHeader>, but the same bottom nav so
// tab-switching feels identical everywhere). DEV_FULL-gated — LIVE pack stays
// trimmed (nav hidden).
export function PackBottomNav() {
  const t = useT();
  if (!DEV_FULL) return null;
  return (
    <nav
      className="fixed z-40"
      style={{ left: '50%', transform: 'translateX(-50%)', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
    >
      <div
        className="flex items-center gap-1"
        style={{
          background: T.glass,
          border: `1px solid ${T.onDarkBorder}`,
          borderRadius: 999,
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          padding: 6,
          boxShadow: '0 12px 36px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(245,240,228,0.06)',
        }}
      >
        <FloatingNavLink to="/pack" label={t('pack.layout.navHome')} icon={iconHome} end />
        <FloatingNavLink to="/pack/portal/trips" label={t('pack.layout.navPortal')} icon={iconPortal} />
        <FloatingNavLink to="/pack/dogs" label={t('pack.layout.navDogs')} icon={iconDogs} />
        <MessagesNavButton />
      </div>
    </nav>
  );
}

// Messages entry — otvára Inbox overlay (emitOpenInbox → MessagingOverlayHost), s live unread
// badge (unreadCount() je sync/pre-hydratovaný pri module load — žiadne 0→N bliknutie, viď
// packMessaging.ts flag §10). Rovnaký pilulkový vzor ako FloatingNavLink, len <button> (nie route).
function MessagesNavButton() {
  const [count, setCount] = useState(() => unreadCount());
  useEffect(() => subscribeMessaging(() => setCount(unreadCount())), []);
  return (
    <button
      type="button"
      className="group flex items-center gap-2 transition-all relative"
      style={pillStyle(false)}
      onClick={() => emitOpenInbox()}
      aria-label="Messages"
    >
      <BrandIcon src="/icons/pack/chat.svg" active={false} />
      <span className="hidden sm:inline" style={pillLabelStyle}>Messages</span>
      {count > 0 && (
        <span
          style={{
            position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, padding: '0 4px',
            borderRadius: 999, background: '#C99A3F', color: '#1F1A0E',
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1.5px solid ${T.pageBg}`, lineHeight: 1,
          }}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}

// ── Floating devotion header ────────────────────────────────────────────────

interface DevotionHeaderProps {
  avatarUrl: string | null;
  avatarInitial: string;
  devotion: number;
  bones: number;
  packTotal: number | null;
  packToday: number | null;
  dogs: PackDog[];
  wide?: boolean;
  onProfile: () => void;
  onDog: (id: string) => void;
}

function VDivider() {
  return <div aria-hidden style={{ width: 1, height: 20, background: 'rgba(245,240,228,0.18)', flexShrink: 0 }} />;
}

export function DevotionHeader({ avatarUrl, avatarInitial, devotion, bones, packTotal, packToday, dogs, wide, onProfile, onDog }: DevotionHeaderProps) {
  const t = useT();
  const glassPill: React.CSSProperties = {
    background: T.glass,
    border: `1px solid ${T.onDarkBorder}`,
    borderRadius: 999,
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    boxShadow: '0 12px 36px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(245,240,228,0.06)',
    padding: '13px 14px',
    display: 'flex',
    alignItems: 'center',
  };
  return (
    <header
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        top: 'calc(env(safe-area-inset-top, 0px) + 24px)',
        width: 'calc(100% - 32px)',
        maxWidth: wide ? 1024 : 672,
        zIndex: 40,
        display: 'flex',
        alignItems: 'stretch',
        gap: 8,
      }}
    >
      {/* ── LEFT block 60%: member identity ── */}
      <div style={{ ...glassPill, flex: '3 1 0', minWidth: 0, gap: 10, width: '100%' }}>
        <button type="button" onClick={onProfile} style={{ flexShrink: 0, lineHeight: 0 }} aria-label={t('pack.layout.profileAriaLabel')}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={t('pack.layout.yourAvatarAlt')}
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(201,154,63,0.45)', display: 'block' }}
            />
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #F5C73D, #E69E1A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: '#1c160c',
              border: '2px solid rgba(201,154,63,0.45)',
            }}>
              {avatarInitial}
            </div>
          )}
        </button>
        <DogSvorka dogs={dogs} onDog={onDog} />
        <DevotionBarCompact devotion={devotion} />
        <BonesChip bones={bones} />
      </div>

      {/* ── RIGHT block 40%: DOGYPT global stats ── */}
      {/* Mobile: flex-[1_1_0] + smaller padding/icons. Desktop sm+: flex-[2_1_0] + full size. */}
      <div
        className="flex-[1_1_0] sm:flex-[2_1_0] px-2 py-2 sm:px-[14px] sm:py-[13px]"
        style={{
          ...glassPill,
          padding: undefined, // overridden by Tailwind px/py above
          flex: undefined,    // overridden by Tailwind flex above
          minWidth: 0,
          justifyContent: 'space-around',
          width: '100%',
          cursor: 'pointer',
        }}
        role="button"
        tabIndex={0}
        aria-label={t('pack.layout.jumpToStatsAriaLabel')}
        onClick={() => document.getElementById('wiz-globe')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.getElementById('wiz-globe')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
      >
        {/* PART A: badge icon + total count (gold number + pale zeros → 1M frame) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {/* Mobile: ikona 20px, desktop: 28px */}
          <img src={statBadge} alt="" aria-hidden className="h-5 w-auto sm:h-7" style={{ objectFit: 'contain', flexShrink: 0, display: 'block', filter: 'saturate(0.1) brightness(1.8) opacity(0.45)' }} />
          {packTotal == null ? (
            <span className="text-sm sm:text-[17px]" style={{ fontFamily: 'system-ui,-apple-system,Arial,sans-serif', fontWeight: 700, color: 'rgba(245,240,228,0.4)', whiteSpace: 'nowrap' }}>—</span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
              {/* leading zeros — hidden on mobile, visible sm+ */}
              <span className="hidden sm:inline" style={{ fontFamily: 'system-ui,-apple-system,Arial,sans-serif', fontWeight: 700, fontSize: Math.round(17 * 0.8), color: 'rgba(245,240,228,0.2)', letterSpacing: '0.01em' }}>
                {'0'.repeat(Math.max(0, 7 - String(packTotal).length))}
              </span>
              {/* Mobile: 13px, desktop: 17px */}
              <span className="text-[13px] sm:text-[17px]" style={{ fontFamily: 'system-ui,-apple-system,Arial,sans-serif', fontWeight: 700, color: '#C99A3F', letterSpacing: '0.01em' }}>
                {String(packTotal)}
              </span>
            </span>
          )}
        </div>
        {/* PART B: bars icon + new members 24h — schované na mobile (tam ostáva
            v pravej pilulke len celkový počet psov v DOGYPTe). sm:contents → na
            desktope divider + PART B participujú priamo v space-around layoute. */}
        <div className="hidden sm:contents">
          <VDivider />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <img src={statBars} alt="" aria-hidden style={{ height: 22, width: 'auto', objectFit: 'contain', flexShrink: 0, display: 'block', filter: 'saturate(0.1) brightness(1.8) opacity(0.45)' }} />
            <span style={{
              fontFamily: 'system-ui,-apple-system,Arial,sans-serif', fontWeight: 700, fontSize: 13,
              letterSpacing: '0.03em', color: 'rgba(120,200,120,0.9)', whiteSpace: 'nowrap',
            }}>
              +{packToday ?? 0}/d
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function BonesChip({ bones }: { bones: number }) {
  return (
    <div
      title="BONES"
      aria-label={`${bones} BONES`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}
    >
      <span aria-hidden style={{
        width: 17, height: 17, borderRadius: '50%', flexShrink: 0,
        background: 'radial-gradient(circle at 35% 30%, #F7DD92 0%, #C99A3F 68%, #9A742B 100%)',
        border: '1px solid rgba(120,90,30,0.7)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.55), 0 1px 3px rgba(0,0,0,0.2)',
      }}>
        <PackBrandIcon name="bone" size={9} tint="dark" />
      </span>
      <span style={{
        fontFamily: 'system-ui,-apple-system,Arial,sans-serif', fontWeight: 700, fontSize: 11,
        color: 'rgba(245,240,228,0.92)',
      }}>
        {bones.toLocaleString('en-US')}
      </span>
    </div>
  );
}


function DevotionBarCompact({ devotion }: { devotion: number }) {
  const lv = devotionLevel(devotion);
  return (
    <div style={{
      flex: '1 1 auto',
      minWidth: 56,
      position: 'relative',
      height: 22,
      borderRadius: 999,
      overflow: 'hidden',
      background: 'rgba(245, 240, 228, 0.07)',
      border: '1px solid rgba(245, 240, 228, 0.14)',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: `${lv.pct}%`,
        background: 'linear-gradient(90deg, hsl(224 42% 42%), hsl(45 82% 55%))',
        transition: 'width 0.5s ease',
      }} />
      <span style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 3, display: 'inline-flex', alignItems: 'baseline', gap: 2,
        pointerEvents: 'none',
        fontFamily: 'system-ui,-apple-system,Arial,sans-serif', fontWeight: 700, fontSize: 11,
        color: 'rgba(245, 240, 228, 0.92)', letterSpacing: '0.01em',
        textShadow: '0 1px 3px rgba(0,0,0,0.6)',
      }}>
        {Math.round(devotion).toLocaleString('en-US')}
        <i style={{ fontStyle: 'normal', fontSize: 10 }}>☥</i>
      </span>
    </div>
  );
}

function DogSvorka({ dogs, onDog }: { dogs: PackDog[]; onDog: (id: string) => void }) {
  const t = useT();
  // Slajdovateľná svorka od 3 psov — pevný maxWidth, takže psy scrollujú horizontálne
  // a nikdy netlačia devotion bar / bones v header pilulke (najmä mobil).
  const scrollable = dogs.length >= 3;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
      overflowX: scrollable ? 'auto' : 'visible',
      maxWidth: scrollable ? 112 : undefined,
      // hide scrollbar
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    } as React.CSSProperties}>
      {dogs.map((dog) => (
        <button
          key={dog.id}
          type="button"
          onClick={() => onDog(dog.id)}
          style={{ flexShrink: 0, lineHeight: 0 }}
          aria-label={dog.dog_name || t('pack.layout.dogFallbackAriaLabel')}
        >
          {dog.cloudinary_main_url ? (
            <img
              src={dog.cloudinary_main_url}
              alt={dog.dog_name || ''}
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(201,154,63,0.40)', display: 'block' }}
            />
          ) : (
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(201, 154, 63, 0.22)',
              border: '1.5px solid rgba(201,154,63,0.40)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13,
            }}>🐕</div>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Shared background ───────────────────────────────────────────────────────

export function HieroglyphBg() {
  return (
    <>
      {/* 100lvh (nie inset:0) — na mobile stabilné pozadie pri scroll (URL bar zmena viewportu) */}
      <div
        aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100lvh',
          backgroundImage: "url('/images/bg-dark.webp')",
          backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          filter: 'blur(3px)', zIndex: 0, pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100lvh',
          background: 'radial-gradient(ellipse at center, rgba(5,5,5,0.25) 0%, rgba(5,5,5,0.45) 60%, rgba(5,5,5,0.6) 100%)',
          zIndex: 0, pointerEvents: 'none',
        }}
      />
    </>
  );
}

// ── Bottom pill nav ─────────────────────────────────────────────────────────

const pillStyle = (active: boolean): React.CSSProperties => ({
  padding: '10px 16px',
  borderRadius: 999,
  color: active ? '#FFF6E6' : T.onDarkDim,
  background: active
    ? 'linear-gradient(135deg, hsl(45 80% 48%) 0%, hsl(224 50% 42%) 100%)'
    : 'transparent',
  boxShadow: active
    ? '0 5px 16px -5px rgba(124, 58, 237, 0.55), inset 0 1px 0 rgba(255,255,255,0.25)'
    : 'none',
  textDecoration: 'none',
});

const pillLabelStyle: React.CSSProperties = {
  fontFamily: "'Cinzel', serif",
  fontSize: 11,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  fontWeight: 700,
};

function BrandIcon({ src, active }: { src: string; active: boolean }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className="h-5 w-5 shrink-0"
      style={{ filter: 'brightness(0) invert(1)', opacity: active ? 1 : 0.55, transition: 'opacity 0.15s' }}
    />
  );
}

function FloatingNavLink({ to, label, icon, end }: { to: string; label: string; icon: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className="group flex items-center gap-2 transition-all"
      style={({ isActive }) => pillStyle(isActive)}
    >
      {({ isActive }) => (
        <>
          <BrandIcon src={icon} active={isActive} />
          <span className="hidden sm:inline" style={pillLabelStyle}>{label}</span>
        </>
      )}
    </NavLink>
  );
}


