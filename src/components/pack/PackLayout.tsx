import { ReactNode, useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { Bone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PACK_THEME } from './packTheme';
import { devotionLevel } from '@/lib/devotion';
import iconHome from '@/assets/icons/nav-home.svg';
import iconPortal from '@/assets/icons/nav-portal.svg';
import statBadge from '@/assets/icons/stat-badge.svg';
import statBars from '@/assets/icons/stat-bars.svg';

interface PackDog {
  id: string;
  dog_name: string | null;
  cloudinary_main_url: string | null;
}

const T = PACK_THEME;
const STATS_EDGE = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1/get-pack-stats';

interface PackLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  wide?: boolean;
}

export function PackLayout({ children, title, subtitle, wide }: PackLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [dogs, setDogs] = useState<PackDog[]>([]);
  const [devotion, setDevotion] = useState(100);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [packTotal, setPackTotal] = useState<number | null>(null);
  const [packToday, setPackToday] = useState<number | null>(null);

  // Empire stats — identical header on every tab so the member always sees live state.
  useEffect(() => {
    let alive = true;
    fetch(STATS_EDGE)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        setPackTotal(typeof j?.total === 'number' ? j.total : null);
        setPackToday(typeof j?.last24h === 'number' ? j.last24h : null);
      })
      .catch(() => { /* best-effort */ });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted) return;
      if (s) {
        try { await supabase.rpc('link_my_dogs'); } catch { /* non-blocking */ }
        if (!mounted) return;
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: dogRows } = await (supabase as any)
            .from('dogs')
            .select('id, dog_name, cloudinary_main_url, created_at')
            .eq('user_id', s.user.id)
            .order('created_at', { ascending: true }) as { data: PackDog[] | null };
          if (mounted && dogRows) setDogs(dogRows.map(d => ({
            id: d.id,
            dog_name: d.dog_name ?? null,
            cloudinary_main_url: d.cloudinary_main_url ?? null,
          })));
        } catch { /* non-blocking */ }
        if (!mounted) return;
        const meta = (s.user.user_metadata ?? {}) as Record<string, unknown>;
        if (mounted) {
          setDevotion(Number(meta.devotion) || 100);
          setAvatarUrl((meta.avatar_url || meta.avatar || null) as string | null);
        }
      }
      setSession(s);
      setLoading(false);
      if (!s) {
        const ret = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?return=${ret}`, { replace: true });
      }
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      if (!s) {
        const ret = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?return=${ret}`, { replace: true });
      }
    });
    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center relative" style={{ backgroundColor: T.pageBg }}>
        <HieroglyphBg />
        <div className="relative" style={{ zIndex: 1 }}>
          <div style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.3em', fontSize: 12, color: T.onDarkDim }}>
            LOADING…
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const avatarInitial = (session.user?.email?.[0] ?? 'D').toUpperCase();

  return (
    <div className="min-h-[100dvh] relative" style={{ backgroundColor: T.pageBg, color: T.onDark }}>
      <HieroglyphBg />

      {/* FLOATING STATUS HUB — fixed top, slim single-row pill */}
      <DevotionHeader
        avatarUrl={avatarUrl}
        avatarInitial={avatarInitial}
        devotion={devotion}
        bones={0}
        packTotal={packTotal}
        packToday={packToday}
        dogs={dogs}
        wide={wide}
        onProfile={() => navigate('/pack/profile')}
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

      {/* Floating pill nav — dolný (Portal nahrádza Settings) */}
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
          <FloatingNavLink to="/pack" label="Home" icon={iconHome} end />
          <FloatingNavLink to="/pack/portal" label="Portal" icon={iconPortal} />
        </div>
      </nav>
    </div>
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

function DevotionHeader({ avatarUrl, avatarInitial, devotion, bones, packTotal, packToday, dogs, wide, onProfile, onDog }: DevotionHeaderProps) {
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
        <button type="button" onClick={onProfile} style={{ flexShrink: 0, lineHeight: 0 }} aria-label="Profile">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Your avatar"
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
      <div style={{ ...glassPill, flex: '2 1 0', minWidth: 0, justifyContent: 'space-around', width: '100%' }}>
        {/* PART A: badge icon + total count (gold number + pale zeros → 1M frame) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <img src={statBadge} alt="" aria-hidden style={{ height: 28, width: 'auto', objectFit: 'contain', flexShrink: 0, display: 'block', filter: 'saturate(0.1) brightness(1.8) opacity(0.45)' }} />
          {packTotal == null ? (
            <span style={{ fontFamily: 'system-ui,-apple-system,Arial,sans-serif', fontWeight: 700, fontSize: 17, color: 'rgba(245,240,228,0.4)', whiteSpace: 'nowrap' }}>—</span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
              <span style={{ fontFamily: 'system-ui,-apple-system,Arial,sans-serif', fontWeight: 700, fontSize: 17, color: '#C99A3F', letterSpacing: '0.01em' }}>
                {String(packTotal)}
              </span>
              <span style={{ fontFamily: 'system-ui,-apple-system,Arial,sans-serif', fontWeight: 700, fontSize: Math.round(17 * 0.8), color: 'rgba(245,240,228,0.2)', letterSpacing: '0.01em' }}>
                {'0'.repeat(Math.max(0, 6 - String(packTotal).length))}
              </span>
            </span>
          )}
        </div>
        <VDivider />
        {/* PART B: bars icon + new members 24h */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <img src={statBars} alt="" aria-hidden style={{ height: 22, width: 'auto', objectFit: 'contain', flexShrink: 0, display: 'block', filter: 'saturate(0.1) brightness(1.8) opacity(0.45)' }} />
          <span style={{
            fontFamily: 'system-ui,-apple-system,Arial,sans-serif', fontWeight: 700, fontSize: 13,
            letterSpacing: '0.03em', color: 'rgba(120,200,120,0.9)', whiteSpace: 'nowrap',
          }}>
            +{packToday ?? 0} /24h
          </span>
        </div>
      </div>
    </header>
  );
}

function BonesChip({ bones }: { bones: number }) {
  return (
    <div
      title="Bones"
      aria-label={`${bones} bones`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}
    >
      <span aria-hidden style={{
        width: 17, height: 17, borderRadius: '50%', flexShrink: 0,
        background: 'radial-gradient(circle at 35% 30%, #F7DD92 0%, #C99A3F 68%, #9A742B 100%)',
        border: '1px solid rgba(120,90,30,0.7)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.55), 0 1px 3px rgba(0,0,0,0.2)',
      }}>
        <Bone style={{ width: 9, height: 9, color: '#5A3F12' }} />
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
        background: 'linear-gradient(90deg, hsl(270 42% 42%), hsl(45 82% 55%))',
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
  const scrollable = dogs.length >= 5;
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
          aria-label={dog.dog_name || 'Dog'}
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

function HieroglyphBg() {
  return (
    <>
      {/* 100lvh (nie inset:0) — na mobile stabilné pozadie pri scroll (URL bar zmena viewportu) */}
      <div
        aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100lvh',
          backgroundImage: "url('/images/bg-dark.png')",
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
    ? 'linear-gradient(135deg, hsl(45 80% 48%) 0%, hsl(270 50% 42%) 100%)'
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


