import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, ScrollText, UserCircle2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import dogyptLogo from '@/assets/dogypt-logo.png';

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

// Soft sandy palette — bledá hnedá, mierny gradient svetlo→tmavšie
export const PACK_THEME = {
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
}

export function PackLayout({ children, title, subtitle }: PackLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
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
  const emailShort = useMemo(() => {
    if (!email) return '';
    if (email.length <= 22) return email;
    return email.slice(0, 18) + '…';
  }, [email]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  const bgGradient = `linear-gradient(180deg, ${T.bgTop} 0%, ${T.bg} 38%, ${T.bgBottom} 100%)`;

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: bgGradient }}>
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            letterSpacing: '0.3em',
            fontSize: 12,
            color: T.inkDim,
          }}
        >
          LOADING…
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-[100dvh]" style={{ background: bgGradient, color: T.ink }}>
      {/* Header — centered logo */}
      <header
        className="sticky top-0 z-30"
        style={{
          padding: '14px 18px',
          borderBottom: `1px solid ${T.hairline}`,
          background: 'linear-gradient(180deg, rgba(242,229,199,0.92), rgba(242,229,199,0.78))',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="relative flex items-center justify-center">
          <Link to="/pack" className="flex items-center" style={{ textDecoration: 'none' }}>
            <img
              src={dogyptLogo}
              alt="DOGYPT"
              style={{ height: 24, width: 'auto', filter: 'invert(1)', opacity: 0.88 }}
            />
          </Link>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 12,
                    letterSpacing: '0.02em',
                    color: T.ink,
                    padding: '6px 12px',
                    borderRadius: 999,
                    border: `1px solid ${T.border}`,
                    background: T.card,
                  }}
                >
                  <span className="hidden sm:inline">{emailShort || 'Account'}</span>
                  <span
                    className="sm:hidden"
                    style={{ width: 6, height: 6, borderRadius: 3, background: T.ink }}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[220px]">
                {email && (
                  <>
                    <div
                      className="px-2 py-2 text-xs truncate"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.inkDim }}
                    >
                      {email}
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
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
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-6 pb-28 md:pb-12">
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
                  color: T.inkDim,
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
                  color: T.ink,
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
          background: 'rgba(242, 229, 199, 0.96)',
          borderTop: `1px solid ${T.hairline}`,
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

      {/* Pill nav desktop */}
      <nav
        className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
        style={{
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 999,
          boxShadow: '0 20px 60px -15px rgba(31, 26, 14, 0.18)',
          padding: 6,
        }}
      >
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <DesktopPillLink key={item.to} item={item} />
          ))}
        </div>
      </nav>
    </div>
  );
}

function BottomTabLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/pack'}
      className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
      style={({ isActive }) => ({
        color: isActive ? T.ink : T.inkDim,
        borderTop: isActive ? `2px solid ${T.ink}` : `2px solid transparent`,
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

function DesktopPillLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/pack'}
      className="inline-flex items-center gap-2 transition-all"
      style={({ isActive }) => ({
        padding: '8px 16px',
        borderRadius: 999,
        background: isActive ? T.ink : 'transparent',
        color: isActive ? T.card : T.inkDim,
        fontFamily: "'Cinzel', serif",
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        fontWeight: 600,
        textDecoration: 'none',
      })}
    >
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  );
}
