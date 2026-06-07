import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import dogyptLogoRound from '@/assets/dogypt-logo-round.png';
import { useLang } from '@/i18n/LanguageContext';

const NAV_ITEMS = [
  { label: 'WALL', to: '/grid' },
  { label: 'VISION', to: '/vision' },
  { label: 'RELIGION', to: '/religion' },
  { label: 'ABOUT', to: '/about' },
];

type LangCode =
  | 'en' | 'sk' | 'cs' | 'pt' | 'zh' | 'ru' | 'de' | 'es'
  | 'fr' | 'it' | 'pl' | 'nl' | 'uk' | 'ja' | 'tr' | 'hi'
  | 'ar' | 'ko';
// 18 jazykov — poradie matchuje LanguagePicker.tsx (canonical zdroj pravdy).
// Layout = 2-col 9-row column-major: LEFT col (world) prvých 9, RIGHT col (EU) druhých 9.
// `enabled` = je k dispozícii preklad. Iba en + sk zatiaľ, ostatné disabled (visual dim).
const LANGS: { code: LangCode; flag: string; label: string; native: string; enabled: boolean }[] = [
  // ── LEFT column (world / Asian / global) ──
  { code: 'en', flag: '🇺🇸', label: 'ENG', native: 'English',    enabled: true  },
  { code: 'es', flag: '🇪🇸', label: 'ESP', native: 'Español',    enabled: false },
  { code: 'pt', flag: '🇵🇹', label: 'PRT', native: 'Português',  enabled: false },
  { code: 'zh', flag: '🇨🇳', label: 'CHN', native: '中文',         enabled: false },
  { code: 'ja', flag: '🇯🇵', label: 'JPN', native: '日本語',        enabled: false },
  { code: 'hi', flag: '🇮🇳', label: 'IND', native: 'हिन्दी',      enabled: false },
  { code: 'ar', flag: '🇸🇦', label: 'ARA', native: 'العربية',    enabled: false },
  { code: 'ru', flag: '🇷🇺', label: 'RUS', native: 'Русский',    enabled: false },
  { code: 'ko', flag: '🇰🇷', label: 'KOR', native: '한국어',        enabled: false },
  // ── RIGHT column (EU + neighbors) ──
  { code: 'sk', flag: '🇸🇰', label: 'SVK', native: 'Slovenčina', enabled: true  },
  { code: 'cs', flag: '🇨🇿', label: 'CZE', native: 'Čeština',    enabled: false },
  { code: 'de', flag: '🇩🇪', label: 'DEU', native: 'Deutsch',    enabled: false },
  { code: 'nl', flag: '🇳🇱', label: 'NLD', native: 'Nederlands', enabled: false },
  { code: 'fr', flag: '🇫🇷', label: 'FRA', native: 'Français',   enabled: false },
  { code: 'it', flag: '🇮🇹', label: 'ITA', native: 'Italiano',   enabled: false },
  { code: 'pl', flag: '🇵🇱', label: 'POL', native: 'Polski',     enabled: false },
  { code: 'uk', flag: '🇺🇦', label: 'UKR', native: 'Українська', enabled: false },
  { code: 'tr', flag: '🇹🇷', label: 'TUR', native: 'Türkçe',     enabled: false },
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
  const isMobile = useIsMobile();
  return isMobile ? <MobileNav /> : <DesktopNav />;
}

function DesktopNav() {
  const { pathname } = useLocation();
  const { lang, setLang } = useLang(); // i18n context — reálny swap obsahu
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    if (!langOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [langOpen]);

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
        gap: 14,
        padding: '10px 0 6px',
        position: 'relative',
        zIndex: 50,
      }}
    >
      {NAV_ITEMS.map(({ label, to }) => {
        const isActive =
          to === '/grid'
            ? pathname === '/grid' || pathname === '/'
            : pathname === to;
        return (
          <span
            key={to}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <Link
              to={to}
              style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: 'clamp(10px, 1.5vw, 0.78rem)',
                letterSpacing: '0.15em',
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
                height: 12,
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
          fontSize: 'clamp(15px, 1.6vw, 18px)',
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

function MobileNav() {
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useLang(); // i18n context — reálny swap obsahu

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '6px 18px 4px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <style>{`
          @keyframes chevronPulse {
            0%, 100% {
              filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0));
              opacity: 0.88;
              transform: translateY(0);
            }
            50% {
              filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.55));
              opacity: 1;
              transform: translateY(2px);
            }
          }
          .chevron-svg {
            display: block;
            animation: chevronPulse 2.4s ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .chevron-svg { animation: none; opacity: 1; transform: none; }
          }
        `}</style>
        <svg
          width="28"
          height="16"
          viewBox="0 0 28 16"
          fill="none"
          aria-hidden
          className="chevron-svg"
        >
          <path
            d="M4 4 L14 12.5 L24 4"
            stroke="#FAF4EC"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>

      {open &&
        createPortal(
          <MobileMenuOverlay
            currentLang={lang}
            onSelectLang={(c) => setLang(c)}
            onClose={() => setOpen(false)}
          />,
          document.body,
        )}
    </>
  );
}

function MobileMenuOverlay({
  currentLang,
  onSelectLang,
  onClose,
}: {
  currentLang: LangCode;
  onSelectLang: (c: LangCode) => void;
  onClose: () => void;
}) {
  const { pathname } = useLocation();
  const [langOpen, setLangOpen] = useState(false);
  const current = LANGS.find((l) => l.code === currentLang) ?? LANGS[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        animation: 'mobileMenuSlide 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        overflowY: 'auto',
      }}
    >
      <style>{`
        @keyframes mobileMenuSlide {
          from { transform: translateY(-100%); }
          to   { transform: translateY(0); }
        }
        @keyframes mobileMenuFade {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Radial vignette to match site */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 70%, #000 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Items — centered (logo + nav + lang) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: langOpen ? 'flex-start' : 'center',
          gap: langOpen ? 10 : 24,
          padding: langOpen ? '12px 24px 16px' : '60px 24px 40px',
          position: 'relative',
          zIndex: 1,
          animation: 'mobileMenuFade 0.38s ease-out 0.08s both',
          transition: 'gap 0.32s ease, padding 0.32s ease, justify-content 0.32s ease',
        }}
      >
        {/* Centered circular logo — large, shrinks when language dropdown opens */}
        <Link
          to="/grid"
          onClick={onClose}
          aria-label="WALL — home"
          style={{
            display: 'inline-flex',
            transition: 'transform 0.32s ease, margin 0.32s ease',
            transform: langOpen ? 'scale(0.36)' : 'scale(1)',
            transformOrigin: 'top center',
            marginBottom: langOpen ? -68 : 4,
          }}
        >
          <div
            style={{
              width: 138,
              height: 138,
              borderRadius: 999,
              border: '2px solid rgba(201,154,63,0.70)',
              background: '#000',
              boxShadow:
                '0 0 44px rgba(201,154,63,0.42), inset 0 0 0 3px rgba(0,0,0,0.6)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              src={dogyptLogoRound}
              alt="DOGYPT"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </Link>
        {NAV_ITEMS.map(({ label, to }) => {
          const isActive =
            to === '/grid'
              ? pathname === '/grid' || pathname === '/gods' || pathname === '/'
              : pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: langOpen ? 14 : 22,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: isActive ? '#C99A3F' : 'rgba(242,234,214,0.85)',
                textDecoration: 'none',
                borderBottom: isActive
                  ? '1.5px solid #C99A3F'
                  : '1.5px solid transparent',
                paddingBottom: 3,
                WebkitTapHighlightColor: 'transparent',
                transition: 'font-size 0.32s ease',
              }}
            >
              {label}
            </Link>
          );
        })}

        {/* Language picker — stopPropagation so opening it doesn't close menu */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: langOpen ? 6 : 18,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            maxWidth: 280,
            flex: langOpen ? '1 1 auto' : '0 0 auto',
            minHeight: 0,
            transition: 'margin 0.32s ease',
          }}
        >
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 18px',
              background: 'rgba(250,243,225,0.06)',
              border: '1px solid rgba(201,154,63,0.55)',
              borderRadius: 999,
              cursor: 'pointer',
              color: '#FAF3E1',
              fontFamily: "'Cinzel', serif",
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{current.flag}</span>
            <span>{current.label}</span>
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              aria-hidden
              style={{
                transform: langOpen ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s',
              }}
            >
              <path
                d="M1 1 L5 5 L9 1"
                stroke="#C99A3F"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {langOpen && (
            <div
              role="listbox"
              style={{
                width: '100%',
                flex: '1 1 auto',
                minHeight: 0,
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gridTemplateRows: 'repeat(9, 1fr)',
                gridAutoFlow: 'column',
                gap: 6,
                padding: 8,
                background: 'rgba(250,243,225,0.04)',
                border: '1px solid rgba(201,154,63,0.30)',
                borderRadius: 10,
                animation: 'mobileMenuFade 0.2s ease-out',
              }}
            >
              {LANGS.map((l) => {
                const active = l.code === currentLang;
                return (
                  <button
                    key={l.code}
                    type="button"
                    role="option"
                    aria-selected={active}
                    aria-disabled={!l.enabled}
                    onClick={() => {
                      if (!l.enabled) return;
                      onSelectLang(l.code);
                      setLangOpen(false);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '7px 9px',
                      background: active ? 'rgba(201,154,63,0.22)' : 'transparent',
                      border: active
                        ? '1px solid #C99A3F'
                        : '1px solid rgba(201,154,63,0.25)',
                      borderRadius: 6,
                      cursor: l.enabled ? 'pointer' : 'not-allowed',
                      color: '#FAF3E1',
                      opacity: l.enabled ? 1 : 0.38,
                    }}
                  >
                    <span style={{ fontSize: 15, lineHeight: 1 }}>{l.flag}</span>
                    <span
                      style={{
                        fontFamily: "'Cinzel', serif",
                        fontWeight: 700,
                        fontSize: 10,
                        letterSpacing: '0.08em',
                      }}
                    >
                      {l.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
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
                aria-disabled={!l.enabled}
                onClick={() => { if (l.enabled) onSelect(l.code); }}
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
                  cursor: l.enabled ? 'pointer' : 'not-allowed',
                  opacity: l.enabled ? 1 : 0.42,
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!active && l.enabled)
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
