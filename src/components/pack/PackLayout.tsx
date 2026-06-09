import { ReactNode, useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, UserCircle2, ChevronDown } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { PACK_THEME } from './packTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// Brand ikonky (hand-drawn set z brand manuálu — vstupy/vizualna-identita/Icons hand drawn).
// VŽDY používať tieto, nie generické lucide. Čierne → prefarbené CSS filterom na svetlé.
import iconHome from '@/assets/icons/nav-home.svg';
import iconGods from '@/assets/icons/nav-gods.svg';
import iconSettings from '@/assets/icons/nav-settings.svg';

interface PackDog {
  id: string;
  dog_name: string | null;
}

// Brand ikonka v pille — čierny SVG → svetlý cez filter, intenzita podľa active.
function BrandIcon({ src, active }: { src: string; active: boolean }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className="h-5 w-5 shrink-0"
      style={{
        filter: 'brightness(0) invert(1)',
        opacity: active ? 1 : 0.55,
        transition: 'opacity 0.15s',
      }}
    />
  );
}

const T = PACK_THEME;

interface PackLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  topStrip?: ReactNode;
  wide?: boolean;
}

export function PackLayout({ children, title, subtitle, topStrip, wide }: PackLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [dogs, setDogs] = useState<PackDog[]>([]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted) return;
      if (s) {
        // Dolinkuj psov kúpených pred signupom / 2. psa existujúceho usera.
        // Trigger link_dogs_to_new_user beží len pri prvom signupe — toto pokryje zvyšok.
        // Await pred render detí, aby PackList fetchol psov až po napojení.
        try { await supabase.rpc('link_my_dogs'); } catch { /* non-blocking */ }
        if (!mounted) return;
        // Psy usera — pre Gods nav (1 pes → profil, viac → dropdown).
        try {
          const { data: dogRows } = await supabase
            .from('dogs')
            .select('id, dog_name, created_at')
            .eq('user_id', s.user.id)
            .order('created_at', { ascending: true });
          if (mounted && dogRows) setDogs(dogRows.map((d) => ({ id: d.id, dog_name: d.dog_name })));
        } catch { /* non-blocking */ }
        if (!mounted) return;
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

  const email = session?.user?.email ?? '';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center relative" style={{ backgroundColor: T.pageBg }}>
        <HieroglyphBg />
        <div className="relative" style={{ zIndex: 1 }}>
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            letterSpacing: '0.3em',
            fontSize: 12,
            color: T.onDarkDim,
          }}
        >
          LOADING…
        </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-[100dvh] relative" style={{ backgroundColor: T.pageBg, color: T.onDark }}>
      <HieroglyphBg />
      {/* Top strip (e.g. live stats ticker) — sits above the sticky header */}
      {topStrip && (
        <div
          style={{
            borderBottom: `1px solid ${T.onDarkHair}`,
            background: T.glassSoft,
            backdropFilter: 'blur(8px)',
            padding: '8px 14px',
          }}
        >
          {topStrip}
        </div>
      )}

      {/* Header — email-as-account (logo dropped; members are already "inside") */}
      <header
        className="sticky top-0 z-30"
        style={{
          padding: '12px 18px',
          borderBottom: `1px solid ${T.onDarkHair}`,
          background: T.glass,
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 12.5,
                  letterSpacing: '0.03em',
                  color: T.onDark,
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: `1px solid ${T.onDarkBorder}`,
                  background: 'rgba(245, 240, 228, 0.04)',
                  maxWidth: '86vw',
                }}
              >
                <span className="truncate">{email || 'Account'}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ opacity: 0.7 }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[200px]">
              <DropdownMenuItem onClick={() => navigate('/pack/profile')}>
                <UserCircle2 className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className={`relative z-10 mx-auto w-full ${wide ? 'max-w-5xl' : 'max-w-2xl'} px-4 sm:px-6 py-6 pb-32`}>
        {(title || subtitle) && (
          <header className="mb-7 text-center">
            {subtitle && (
              <div
                className="mb-2"
                style={{
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: '0.32em',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  color: T.onDarkDim,
                }}
              >
                {subtitle}
              </div>
            )}
            {title && (
              <h1
                style={{
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: '0.1em',
                  fontSize: 28,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: T.onDark,
                }}
              >
                {title}
              </h1>
            )}
          </header>
        )}
        <main>{children}</main>
      </div>

      {/* Floating pill nav — oblý rámik s ikonkami, centrovaný dole (Instagram-style) */}
      <nav
        className="fixed z-40"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        }}
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
          <GodsNavItem dogs={dogs} navigate={navigate} />
          <FloatingNavLink to="/pack/profile" label="Settings" icon={iconSettings} />
        </div>
      </nav>

    </div>
  );
}

// "Naše tmavé" pozadie — bg-dark.png heroglyf textúra (blur) + jemný radial overlay.
// Mirror GodsGrid (.gods-root::before) + Heroglyph flow (.dark-bg + radial). zIndex 0.
function HieroglyphBg() {
  return (
    <>
      {/* Fixná výška 100lvh (NIE inset:0) — na mobile sa pri scrolle skrýva URL bar,
          dynamická výška viewportu sa mení a inset:0 fixed vrstva by sa preškálovala
          → backgroundSize:cover prepočíta obrázok = „jemná zmena pozadia". 100lvh je
          konštanta (najväčší viewport), takže pozadie ostáva stabilné. */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100lvh',
          backgroundImage: "url('/images/bg-dark.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(3px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100lvh',
          background:
            'radial-gradient(ellipse at center, rgba(5,5,5,0.25) 0%, rgba(5,5,5,0.45) 60%, rgba(5,5,5,0.6) 100%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

// Pill item štýl (zdieľaný NavLinkom aj Gods dropdown triggerom).
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

// Gods — 1 pes → priamo profil; viac psov → dropdown → klik na psa otvorí profil.
function GodsNavItem({ dogs, navigate }: { dogs: PackDog[]; navigate: ReturnType<typeof useNavigate> }) {
  const location = useLocation();
  const active = location.pathname.startsWith('/pack/dogs') || location.pathname === '/pack/gods';

  const content = (
    <>
      <BrandIcon src={iconGods} active={active} />
      <span className="hidden sm:inline" style={pillLabelStyle}>Gods</span>
    </>
  );

  // 0 psov → fallback placeholder; 1 pes → priamo jeho profil.
  if (dogs.length <= 1) {
    const to = dogs.length === 1 ? `/pack/dogs/${dogs[0].id}` : '/pack/gods';
    return (
      <button
        type="button"
        onClick={() => navigate(to)}
        className="group flex items-center gap-2 transition-all"
        style={pillStyle(active)}
      >
        {content}
      </button>
    );
  }

  // Viac psov → dropdown.
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-2 transition-all"
          style={pillStyle(active)}
        >
          {content}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side="top" sideOffset={10} className="min-w-[200px]">
        {dogs.map((d) => (
          <DropdownMenuItem key={d.id} onClick={() => navigate(`/pack/dogs/${d.id}`)}>
            <img src={iconGods} alt="" aria-hidden className="mr-2 h-4 w-4" style={{ opacity: 0.7 }} />
            {d.dog_name || 'Unnamed'}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
