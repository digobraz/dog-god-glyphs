import { ReactNode, useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, ScrollText, UserCircle2, ChevronDown } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/pack', label: 'Pack', icon: <ScrollText className="h-5 w-5" /> },
  { to: '/pack/eternal', label: 'Eternal', icon: <Sparkles className="h-5 w-5" /> },
  { to: '/pack/profile', label: 'Profile', icon: <UserCircle2 className="h-5 w-5" /> },
];

// Soft sandy palette — bledé papyrusové bloky (karty) na ČIERNOM pozadí (web-konzistentné).
// POZN: bgTop/bg/bgBottom = svetlé VÝPLNE VNÚTRI kariet (HeroCard/PackTree/skeletony), NIE page bg.
export const PACK_THEME = {
  // "Naše tmavé" — #050505 + bg-dark.png heroglyf textúra (ako GodsGrid / heroglyph flow)
  pageBg: '#050505',
  glass: 'rgba(5, 5, 5, 0.72)',
  glassSoft: 'rgba(5, 5, 5, 0.55)',
  onDark: 'rgba(245, 240, 228, 0.86)',
  onDarkDim: 'rgba(245, 240, 228, 0.46)',
  onDarkHair: 'rgba(245, 240, 228, 0.10)',
  onDarkBorder: 'rgba(245, 240, 228, 0.18)',
  // Light fills INSIDE cards (papyrus) — neslúžia ako page bg
  bgTop: '#F2E5C7',
  bgBottom: '#E5D5B3',
  bg: '#EDDCBD',
  card: '#FFFBF2',
  cardSoft: '#FCF4DF',
  ink: '#1F1A0E', // off-black, warm
  inkDim: 'rgba(31, 26, 14, 0.62)',
  inkFaint: 'rgba(31, 26, 14, 0.42)',
  hairline: 'rgba(31, 26, 14, 0.08)',
  border: 'rgba(31, 26, 14, 0.16)',
  accentGold: '#C99A3F',
  growGreen: '#3D7A4E',
  growGreenSoft: 'rgba(61, 122, 78, 0.12)',
  alertRed: '#B25640',
  alertRedSoft: 'rgba(178, 86, 64, 0.12)',
};

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

      <div className={`relative z-10 mx-auto w-full ${wide ? 'max-w-5xl' : 'max-w-2xl'} px-4 sm:px-6 py-6 pb-28 md:pb-12`}>
        {/* Desktop nav — 3 icon cards above the blocks (mobile uses bottom tab bar) */}
        <DesktopTopNav />
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

      {/* Bottom tab bar mobile */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        style={{
          background: T.glass,
          borderTop: `1px solid ${T.onDarkHair}`,
          backdropFilter: 'blur(12px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-stretch justify-around">
          {NAV_ITEMS.map((item) => (
            <BottomTabLink key={item.to} item={item} />
          ))}
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
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
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
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(5,5,5,0.25) 0%, rgba(5,5,5,0.45) 60%, rgba(5,5,5,0.6) 100%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

function BottomTabLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/pack'}
      className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
      style={({ isActive }) => ({
        color: isActive ? T.accentGold : T.onDarkDim,
        borderTop: isActive ? `2px solid ${T.accentGold}` : `2px solid transparent`,
        marginTop: -1,
        transition: 'color 0.15s',
      })}
    >
      {item.icon}
      <span
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 9,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        {item.label}
      </span>
    </NavLink>
  );
}

// Desktop nav = 3 papyrus icon cards above the blocks
function DesktopTopNav() {
  return (
    <nav className="hidden md:flex items-stretch gap-3 md:gap-5 mb-6 w-full">
      {NAV_ITEMS.map((item) => (
        <TopNavCard key={item.to} item={item} />
      ))}
    </nav>
  );
}

function TopNavCard({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/pack'}
      className="pack-card-hover group flex flex-1 flex-col items-center justify-center gap-1.5 transition-all"
      style={({ isActive }) => ({
        padding: '14px 22px',
        borderRadius: 16,
        background: T.card,
        border: `1px solid ${isActive ? T.accentGold : T.border}`,
        boxShadow: isActive
          ? '0 10px 30px -12px rgba(201,154,63,0.45)'
          : '0 8px 24px -16px rgba(0,0,0,0.5)',
        color: isActive ? T.accentGold : T.inkDim,
        textDecoration: 'none',
      })}
    >
      {item.icon}
      <span
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: 'inherit',
        }}
      >
        {item.label}
      </span>
    </NavLink>
  );
}
