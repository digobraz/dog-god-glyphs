import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Sparkles, ScrollText, UserCircle2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/pack', label: 'My Heroglyphs', icon: <ScrollText className="h-4 w-4" /> },
  { to: '/pack/eternal', label: '✦ Eternal Dog', icon: <Sparkles className="h-4 w-4" /> },
  { to: '/pack/profile', label: 'Profile', icon: <UserCircle2 className="h-4 w-4" /> },
];

interface PackLayoutProps {
  children: ReactNode;
  /** Optional title shown on top of the body */
  title?: string;
  /** Optional subtitle / kicker line */
  subtitle?: string;
}

export function PackLayout({ children, title, subtitle }: PackLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auth gate
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

  // Close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

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

  if (loading) {
    return (
      <div className="dark-bg min-h-screen flex items-center justify-center">
        <div
          className="text-[hsl(var(--gold))]"
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.3em', fontSize: 14 }}
        >
          LOADING…
        </div>
      </div>
    );
  }

  if (!session) {
    // Redirect happens in effect; render nothing while in transit
    return null;
  }

  return (
    <div className="dark-bg min-h-screen text-[hsl(var(--gold))]">
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[hsl(var(--gold)/0.25)] bg-black/55 backdrop-blur-md"
        style={{ padding: '12px 16px' }}
      >
        <div className="flex items-center gap-3">
          {/* Mobile drawer toggle */}
          <button
            type="button"
            aria-label="Open navigation"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-[hsl(var(--gold)/0.4)] text-[hsl(var(--gold))]"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link to="/pack" className="flex items-center gap-2">
            <img
              src={dogyptLogo}
              alt="DOGYPT"
              style={{ height: 28, width: 'auto', filter: 'drop-shadow(0 0 18px rgba(201,154,63,0.35))' }}
            />
          </Link>
        </div>

        {/* Email pill */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-[hsl(var(--gold)/0.45)] bg-[hsl(var(--gold)/0.06)] px-3 py-1.5 text-[hsl(var(--gold))] hover:bg-[hsl(var(--gold)/0.12)] transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, letterSpacing: '0.04em' }}
            >
              <span className="hidden sm:inline">{emailShort || 'Account'}</span>
              <span className="sm:hidden">●</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[220px]">
            {email && (
              <>
                <div
                  className="px-2 py-2 text-xs text-muted-foreground truncate"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
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
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="mx-auto flex w-full max-w-6xl gap-0 md:gap-6 px-4 md:px-6 py-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block w-56 shrink-0">
          <nav className="sticky top-24 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <PackNavLink key={item.to} item={item} />
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-[hsl(var(--gold)/0.3)] px-3 py-2 text-left text-[hsl(var(--gold))] hover:bg-[hsl(var(--gold)/0.08)] transition-colors"
              style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.18em', fontSize: 12, textTransform: 'uppercase' }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 flex"
            onClick={() => setDrawerOpen(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
              className="relative flex h-full w-72 max-w-[80%] flex-col gap-2 border-r border-[hsl(var(--gold)/0.3)] bg-black/95 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <img src={dogyptLogo} alt="DOGYPT" style={{ height: 24 }} />
                <button
                  type="button"
                  aria-label="Close navigation"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[hsl(var(--gold)/0.3)] text-[hsl(var(--gold))]"
                  onClick={() => setDrawerOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {NAV_ITEMS.map((item) => (
                <PackNavLink key={item.to} item={item} onClick={() => setDrawerOpen(false)} />
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-[hsl(var(--gold)/0.3)] px-3 py-2 text-left text-[hsl(var(--gold))]"
                style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.18em', fontSize: 12, textTransform: 'uppercase' }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {(title || subtitle) && (
            <header className="mb-6">
              {subtitle && (
                <div
                  className="mb-2 text-[hsl(var(--gold)/0.7)]"
                  style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.32em', fontSize: 11, textTransform: 'uppercase' }}
                >
                  {subtitle}
                </div>
              )}
              {title && (
                <h1
                  className="text-[hsl(var(--gold))]"
                  style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.18em', fontSize: 28, textTransform: 'uppercase', fontWeight: 700 }}
                >
                  {title}
                </h1>
              )}
            </header>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

function PackNavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/pack'}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'inline-flex items-center gap-2 rounded-md border px-3 py-2 transition-colors',
          isActive
            ? 'border-[hsl(var(--gold)/0.6)] bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]'
            : 'border-transparent text-[hsl(var(--gold)/0.7)] hover:bg-[hsl(var(--gold)/0.06)] hover:text-[hsl(var(--gold))]',
        ].join(' ')
      }
      style={{
        fontFamily: "'Cinzel', serif",
        letterSpacing: '0.18em',
        fontSize: 12,
        textTransform: 'uppercase',
      }}
    >
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  );
}
