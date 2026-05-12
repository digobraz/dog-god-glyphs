import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'HOME', to: '/' },
  { label: 'VISION', to: '/vision' },
  { label: 'CODEX', to: '/codex' },
  { label: 'ABOUT', to: '/about' },
];

export function PageNav() {
  const { pathname } = useLocation();

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 28px',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(201,154,63,0.18)',
      }}
    >
      <nav style={{ display: 'flex', gap: 'clamp(24px, 4vw, 52px)', alignItems: 'center' }}>
        {NAV_ITEMS.map(({ label, to }) => {
          const isActive = to === '/' ? pathname === '/' || pathname === '/grid' : pathname === to;
          return (
            <Link
              key={to}
              to={to}
              style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: 'clamp(10px, 1.1vw, 13px)',
                letterSpacing: '0.18em',
                color: isActive ? '#FAF4EC' : 'rgba(201,154,63,0.65)',
                textDecoration: 'none',
                borderBottom: isActive ? '1px solid #C99A3F' : '1px solid transparent',
                paddingBottom: 3,
                transition: 'color 0.2s, border-color 0.2s',
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
