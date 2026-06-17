import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '@/i18n/LanguageContext';

type LangCode = 'en' | 'sk' | string;

type LangEntry = {
  code: string;        // 3-letter display code (ENG/SVK/CZE…)
  label: LangCode;     // app-level code stored in localStorage ('en'/'sk')
  countries: string[]; // ISO 3166-1 alpha-2 codes pre flagcdn; viaceré = vertical-slice composite
  enabled: boolean;
};

// 18 jazykov — poradie matchuje vizuálne 2-col layout (left=world, right=EU+neighbors).
// Data array číta column-by-column (left celý zhora-dolu, potom right) — funguje s
// `grid-auto-flow: column` + `grid-template-rows: repeat(9, auto)`.
const LANGS: LangEntry[] = [
  // ── LEFT column (world / Asian / global) ──
  { code: 'ENG', label: 'en',  countries: ['gb', 'us', 'ca'], enabled: true  },
  { code: 'ESP', label: 'esp', countries: ['es', 'mx', 'ar'], enabled: true  },
  { code: 'PRT', label: 'prt', countries: ['pt', 'br'],       enabled: true  },
  { code: 'CHN', label: 'chn', countries: ['cn'],             enabled: true  },
  { code: 'JPN', label: 'jpn', countries: ['jp'],             enabled: true  },
  { code: 'IND', label: 'ind', countries: ['in'],             enabled: true  },
  { code: 'ARA', label: 'ara', countries: ['sa', 'ae', 'eg'], enabled: true  },
  { code: 'RUS', label: 'rus', countries: ['ru'],             enabled: true  },
  { code: 'KOR', label: 'kor', countries: ['kr'],             enabled: true  },
  // ── RIGHT column (EU + neighbors) ──
  { code: 'SVK', label: 'sk',  countries: ['sk'],             enabled: true  },
  { code: 'CZE', label: 'cs',  countries: ['cz'],             enabled: true  },
  { code: 'DEU', label: 'deu', countries: ['de'],             enabled: true  },
  { code: 'NLD', label: 'nld', countries: ['nl'],             enabled: true  },
  { code: 'FRA', label: 'fra', countries: ['fr'],             enabled: true  },
  { code: 'ITA', label: 'ita', countries: ['it'],             enabled: true  },
  { code: 'POL', label: 'pol', countries: ['pl'],             enabled: true  },
  { code: 'UKR', label: 'ukr', countries: ['ua'],             enabled: true  },
  { code: 'TUR', label: 'tur', countries: ['tr'],             enabled: true  },
];

function FlagStack({ countries }: { countries: string[] }) {
  // Vertical-slice composite (per Matej ref image 2026-05-26): viaceré vlajky
  // sa zobrazia ako vertikálne pruhy vedľa seba, každý cropped na stred.
  // Single flag = normálny aspekt (široký pruh), multi = úzke slice (cca 1:2 aspect).
  return (
    <span className="lang-flag-stack" aria-hidden="true">
      {countries.map(cc => (
        <span
          key={cc}
          className="lang-flag-stack__item"
          style={{ backgroundImage: `url(https://flagcdn.com/w80/${cc}.png)` }}
        />
      ))}
    </span>
  );
}

/**
 * variant:
 *  - 'nav' (default): light pill-nav usage (GodsGrid). Black trigger, panel binds
 *    left:0/right:0 to fixed-width nav ancestor.
 *  - 'flow': dark-bg heroglyph flow (PageTopBar). Papyrus-cream trigger, panel is
 *    self-anchored to the trigger's right edge with its own width (drops down-left).
 */
export default function LanguagePicker({ variant = 'nav' }: { variant?: 'nav' | 'flow' } = {}) {
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useLang();
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    // 'flow' = modal s backdropom → zatvára sa klikom na scrim, nie outside-detekciou.
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (variant === 'flow') return;
      const target = e.target as Node;
      if (wrapRef.current && !wrapRef.current.contains(target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('touchstart', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('touchstart', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, variant]);

  const current = LANGS.find(l => l.label === lang) ?? LANGS[0];

  const pick = (entry: LangEntry) => {
    if (!entry.enabled) return;
    setLang(entry.label); // context zapíše do localStorage + re-renderuje appku
    setOpen(false);
  };

  const grid = (
    <div className="lang-grid">
      {LANGS.map(entry => {
        const isActive = entry.label === lang;
        const cls = `lang-btn${isActive ? ' is-active' : ''}${entry.enabled ? '' : ' is-disabled'}`;
        return (
          <button
            key={entry.code}
            type="button"
            className={cls}
            role="option"
            aria-selected={isActive}
            aria-disabled={!entry.enabled}
            onClick={() => pick(entry)}
          >
            <FlagStack countries={entry.countries} />
            <span className="lang-btn__code">{entry.code}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`lang-picker${variant === 'flow' ? ' lang-picker--flow' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className="lang-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${current.code}`}
        onClick={() => setOpen(o => !o)}
      >
        <FlagStack countries={current.countries} />
        <svg className={`lang-trigger__chev${open ? ' is-open' : ''}`} width="9" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1 L5 5 L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* nav variant = dropdown anchored to nav pill */}
      {open && variant === 'nav' && (
        <div className="lang-panel" role="listbox">{grid}</div>
      )}

      {/* flow variant = centered modal popup with dark scrim (portaled to body so it
          escapes the flow's stacking context — fixes "opens under Hektor block"). */}
      {open && variant === 'flow' && createPortal(
        <div className="lang-modal-root">
          <div className="lang-modal-backdrop" onClick={() => setOpen(false)} />
          <div className="lang-modal" role="listbox" aria-modal="true">{grid}</div>
        </div>,
        document.body,
      )}

      <style>{`
        /* Picker je STATIC — panel sa pozične viaže na .nav-left (position:fixed),
           čím sa šírka panelu = šírka pill nav-baru. */
        .lang-picker {
          display: inline-flex;
          align-items: center;
        }

        .lang-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          color: #000;
          font-size: 0.78rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }
        .lang-trigger:hover { opacity: 0.55; }
        .lang-trigger__chev {
          transition: transform 180ms ease;
          color: rgba(0,0,0,0.55);
        }
        .lang-trigger__chev.is-open { transform: rotate(180deg); }

        /* Flag stack — vertical-slice composite. Viaceré vlajky = úzke pruhy vedľa seba
           (každý cropped na stred PNG cez background-size:cover + center). Single flag = full aspect. */
        .lang-flag-stack {
          display: inline-flex;
          vertical-align: middle;
          height: 1.05em;
          border-radius: 2px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.18);
          background: rgba(0,0,0,0.06); /* fallback pred loadnutím PNG */
          flex-shrink: 0;
        }
        .lang-flag-stack__item {
          display: block;
          height: 100%;
          width: 0.55em;            /* slice width pre multi-flag */
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
        }
        .lang-flag-stack__item:only-child {
          width: 1.55em;             /* single flag = normálny 3:2 aspect */
        }

        /* Panel: position:absolute voči .nav-left (fixed parent = positioning context).
           left/right:0 → presne šírka pill. */
        .lang-panel {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          right: 0;
          z-index: 110;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.55);
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.35);
          animation: langPanelFade 180ms ease-out;
          max-height: calc(100dvh - 80px);
          overflow-y: auto;
        }
        @keyframes langPanelFade {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lang-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: repeat(9, auto);
          grid-auto-flow: column;
          gap: 4px;
        }

        .lang-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          padding: 6px 8px;
          cursor: pointer;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          color: #000;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: background 150ms ease, border-color 150ms ease, opacity 150ms ease;
          min-width: 0;
        }
        .lang-btn:hover:not(.is-disabled) {
          background: rgba(201,154,63,0.18);
          border-color: rgba(201,154,63,0.45);
        }
        .lang-btn.is-active {
          background: rgba(201,154,63,0.28);
          border-color: rgba(201,154,63,0.65);
        }
        .lang-btn.is-disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }
        .lang-btn__code { flex-shrink: 0; }

        /* FLOW variant — dark-bg heroglyph flow. Papyrus-cream trigger (+ tap padding)
           and a centered MODAL popup with dark scrim (portaled to <body>). */
        .lang-picker--flow .lang-trigger { color: rgba(250,244,236,0.92); padding: 4px; }
        .lang-picker--flow .lang-trigger:hover { opacity: 0.7; }
        .lang-picker--flow .lang-trigger__chev { color: rgba(250,244,236,0.7); }
        .lang-picker--flow .lang-flag-stack { border-color: rgba(250,244,236,0.35); }

        .lang-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: rgba(0, 0, 0, 0.72);
          -webkit-backdrop-filter: blur(2px);
          backdrop-filter: blur(2px);
          animation: langModalFade 160ms ease-out;
        }
        .lang-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2001;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201, 154, 63, 0.55);
          border-radius: 14px;
          padding: 16px;
          box-shadow: 0 18px 60px rgba(0, 0, 0, 0.6);
          max-width: min(420px, 88vw);
          max-height: 84dvh;
          overflow-y: auto;
          animation: langModalPop 200ms cubic-bezier(0.2, 0.8, 0.3, 1.15);
        }
        @keyframes langModalFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes langModalPop {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
