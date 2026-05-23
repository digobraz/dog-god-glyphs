import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'WALL', to: '/grid' },
  { label: 'VISION', to: '/vision' },
  { label: 'CODEX', to: '/codex' },
  { label: 'ABOUT', to: '/about' },
];

type LangCode =
  | 'en' | 'sk' | 'cs' | 'pt' | 'zh' | 'ru' | 'de' | 'es'
  | 'fr' | 'it' | 'pl' | 'nl' | 'uk' | 'ja' | 'tr' | 'hi';
const LANGS: { code: LangCode; flag: string; label: string; native: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'USA', native: 'English' },
  { code: 'sk', flag: '🇸🇰', label: 'SVK', native: 'Slovenčina' },
  { code: 'cs', flag: '🇨🇿', label: 'CZE', native: 'Čeština' },
  { code: 'pt', flag: '🇵🇹', label: 'PRT', native: 'Português' },
  { code: 'zh', flag: '🇨🇳', label: 'CHN', native: '中文' },
  { code: 'ru', flag: '🇷🇺', label: 'RUS', native: 'Русский' },
  { code: 'uk', flag: '🇺🇦', label: 'UKR', native: 'Українська' },
  { code: 'de', flag: '🇩🇪', label: 'DEU', native: 'Deutsch' },
  { code: 'nl', flag: '🇳🇱', label: 'NLD', native: 'Nederlands' },
  { code: 'es', flag: '🇪🇸', label: 'ESP', native: 'Español' },
  { code: 'fr', flag: '🇫🇷', label: 'FRA', native: 'Français' },
  { code: 'it', flag: '🇮🇹', label: 'ITA', native: 'Italiano' },
  { code: 'pl', flag: '🇵🇱', label: 'POL', native: 'Polski' },
  { code: 'ja', flag: '🇯🇵', label: 'JPN', native: '日本語' },
  { code: 'tr', flag: '🇹🇷', label: 'TUR', native: 'Türkçe' },
  { code: 'hi', flag: '🇮🇳', label: 'IND', native: 'हिन्दी' },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 767px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

export function PageNav() {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const [lang, setLang] = useState<LangCode>('en');
  const [langOpen, setLangOpen] = useState(false);

  // ESC closes modal
  useEffect(() => {
    if (!langOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [langOpen]);

  // Lock body scroll while modal open
  useEffect(() => {
    if (!langOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [langOpen]);

  const currentLang = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isMobile ? 6 : 14,
        padding: '10px 0 6px',
        position: 'relative',
        zIndex: 50,
      }}
    >
      {NAV_ITEMS.filter((item) => !(isMobile && item.label === 'WALL')).map(({ label, to }) => {
        const isActive =
          to === '/grid'
            ? pathname === '/grid' || pathname === '/gods' || pathname === '/'
            : pathname === to;
        return (
          <span
            key={to}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: isMobile ? 6 : 14,
            }}
          >
            <Link
              to={to}
              style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: isMobile ? 12 : 'clamp(10px, 1.5vw, 0.78rem)',
                letterSpacing: isMobile ? '0.10em' : '0.15em',
                textTransform: 'uppercase',
                color: isActive ? '#C99A3F' : 'rgba(242,234,214,0.55)',
                textDecoration: 'none',
                borderBottom: isActive
                  ? '1px solid #C99A3F'
                  : '1px solid transparent',
                paddingBottom: 2,
                transition: 'color 0.2s, opacity 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Link>
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 1,
                height: isMobile ? 9 : 12,
                background: 'rgba(242,234,214,0.28)',
              }}
            />
          </span>
        );
      })}

      <button
        type="button"
        onClick={() => setLangOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Change language (current: ${currentLang.label})`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 4px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: isMobile ? 14 : 'clamp(15px, 1.6vw, 18px)',
          lineHeight: 1,
        }}
      >
        <span>{currentLang.flag}</span>
      </button>

      {langOpen &&
        createPortal(
          <LanguageModal
            currentCode={lang}
            onSelect={(c) => {
              setLang(c);
              setLangOpen(false);
            }}
            onClose={() => setLangOpen(false)}
          />,
          document.body,
        )}
    </nav>
  );
}

function LanguageModal({
  currentCode,
  onSelect,
  onClose,
}: {
  currentCode: LangCode;
  onSelect: (c: LangCode) => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose language"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'langModalBackdrop 0.18s ease-out',
      }}
    >
      <style>{`
        @keyframes langModalBackdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes langModalCard {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .lang-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 8px;
          max-height: min(60vh, 440px);
          overflow-y: auto;
        }
        @media (max-width: 767px) {
          .lang-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          padding: '20px 22px 24px',
          background:
            'linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%)',
          border: '1.5px solid #C99A3F',
          borderRadius: 14,
          boxShadow:
            '0 16px 56px rgba(0,0,0,0.7), 0 0 0 4px rgba(201,154,63,0.22)',
          animation: 'langModalCard 0.22s ease-out',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#1a0a05',
            }}
          >
            Choose language
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 22,
              lineHeight: 1,
              color: '#1a0a05',
              padding: 0,
              width: 28,
              height: 28,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        <div role="listbox" className="lang-grid">
          {LANGS.map((l) => {
            const active = l.code === currentCode;
            return (
              <button
                key={l.code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onSelect(l.code)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  background: active ? 'rgba(201,154,63,0.30)' : 'transparent',
                  border: active
                    ? '1.5px solid #C99A3F'
                    : '1px solid rgba(201,154,63,0.30)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    e.currentTarget.style.background = 'rgba(201,154,63,0.18)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{l.flag}</span>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      color: '#1a0a05',
                      lineHeight: 1.2,
                    }}
                  >
                    {l.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 10,
                      color: '#5c3e10',
                      lineHeight: 1.2,
                    }}
                  >
                    {l.native}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
