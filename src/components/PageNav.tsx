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
    <div
      style={{
        position: 'fixed',
        top: 22,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
      }}
    >
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          background: 'rgba(250,244,236,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '7px 20px',
          borderRadius: 999,
        }}
      >
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
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: isActive ? '#000' : 'rgba(0,0,0,0.42)',
                textDecoration: 'none',
                borderBottom: isActive ? '1px solid #C99A3F' : '1px solid transparent',
                paddingBottom: 2,
                transition: 'color 0.2s, opacity 0.2s',
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
