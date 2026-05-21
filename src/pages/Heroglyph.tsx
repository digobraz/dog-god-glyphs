import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';

type SymbolMeaning = { label: string; name: string; value: string };

const MEANINGS: Record<string, SymbolMeaning> = {
  MALE:           { label: 'Gender',          name: "Man Figure",      value: 'Male' },
  'L---LABRADOR': { label: 'Breed',           name: 'Hound',           value: 'Labrador' },
  DARK:           { label: 'Coat',            name: 'Crescent Moon',   value: 'Dark' },
  WATER:          { label: 'Element',         name: 'Wave',            value: 'Water' },
  LEO:            { label: 'Western Zodiac',  name: 'Lion',            value: 'Leo' },
  ROASTER:        { label: 'Chinese Zodiac',  name: 'Rooster',         value: 'Year of the Rooster' },
  SAVAGE:         { label: 'Trait I',         name: 'Fang',            value: 'Savage' },
  TANIER:         { label: 'Trait II',        name: 'Bowl',            value: 'Loyal' },
  MAN:            { label: 'Owner',           name: 'Figure',          value: 'Male' },
  M:              { label: 'Owner Initial',   name: 'Letter M',        value: 'Matej' },
  FOUNDED:        { label: 'Rank',            name: 'Ankh',            value: '#1 — Founder' },
  _1:             { label: 'Rank',            name: 'Numeral',         value: '#1 — Founder' },
};

const SYMBOL_IDS = Object.keys(MEANINGS);
const SVG_URL = '/heroglyph/hektor-horizontal.svg';

export default function Heroglyph() {
  const navigate = useNavigate();
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const [svgMarkup, setSvgMarkup] = useState<string>('');
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(SVG_URL)
      .then((r) => r.text())
      .then((text) => { if (!cancelled) setSvgMarkup(text); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!svgMarkup || !svgWrapRef.current) return;
    const root = svgWrapRef.current;
    const handlers: Array<{ el: Element; type: string; fn: (e: Event) => void }> = [];

    SYMBOL_IDS.forEach((id, idx) => {
      const el = root.querySelector(`[id="${CSS.escape(id)}"]`);
      if (!el) return;
      el.classList.add('hero-zone');
      (el as SVGElement).style.animationDelay = `${(idx * 0.28).toFixed(2)}s`;

      const click = (e: Event) => {
        e.stopPropagation();
        setActiveSymbol((cur) => (cur === id ? null : id));
      };
      el.addEventListener('click', click);
      handlers.push({ el, type: 'click', fn: click });
    });

    return () => {
      handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    };
  }, [svgMarkup]);

  // Tap outside resets
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.heroglyph-svg-wrap') && !target.closest('.heroglyph-pill')) {
        setActiveSymbol(null);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // Toggle is-active class on the matching symbol
  useEffect(() => {
    if (!svgWrapRef.current) return;
    const root = svgWrapRef.current;
    root.querySelectorAll('.hero-zone.is-active').forEach((el) => el.classList.remove('is-active'));
    if (activeSymbol) {
      const el = root.querySelector(`[id="${CSS.escape(activeSymbol)}"]`);
      if (el) el.classList.add('is-active');
    }
  }, [activeSymbol, svgMarkup]);

  const meaning = activeSymbol ? MEANINGS[activeSymbol] : null;

  return (
    <div className="dark-bg flex flex-col min-h-[100dvh]">
      <style>{`
        .heroglyph-svg-wrap svg {
          width: 100%;
          height: auto;
          display: block;
          max-height: 280px;
        }
        .heroglyph-svg-wrap svg path,
        .heroglyph-svg-wrap svg rect:not([id="Artboard1"]) {
          fill: hsl(var(--gold-deep)) !important;
          stroke: hsl(var(--gold-deep)) !important;
        }
        .heroglyph-svg-wrap .hero-zone {
          cursor: pointer;
          fill: hsl(var(--gold-deep)) !important;
          stroke: hsl(var(--gold-deep)) !important;
          transition: opacity 0.22s ease, filter 0.22s ease, transform 0.22s ease;
          transform-box: fill-box;
          transform-origin: center;
          animation: hero-pulse 2.8s ease-in-out infinite;
        }
        .heroglyph-svg-wrap.has-active .hero-zone {
          opacity: 0.32;
          animation: none;
        }
        .heroglyph-svg-wrap.has-active .hero-zone.is-active {
          opacity: 1;
          fill: hsl(var(--gold)) !important;
          stroke: hsl(var(--gold)) !important;
          filter: drop-shadow(0 0 10px hsl(var(--gold) / 0.65)) drop-shadow(0 0 20px hsl(var(--gold) / 0.35));
          animation: hero-tap 0.4s ease-out;
        }
        @keyframes hero-pulse {
          0%, 100% { opacity: 0.7; }
          50%      { opacity: 1; filter: drop-shadow(0 0 4px hsl(var(--gold) / 0.35)); }
        }
        @keyframes hero-tap {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.10); }
          100% { transform: scale(1); }
        }
        @keyframes pill-pop {
          0%   { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.92); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>

      {/* Top logo */}
      <div className="flex-shrink-0 flex justify-center pt-3 pb-2 md:pt-5">
        <img src={dogyptLogo} alt="DOGYPT" className="h-8 md:h-12 object-contain" />
      </div>

      {/* Centered content stack: 2 papyrus blocks */}
      <div className="flex-1 flex flex-col items-center px-4 pb-8 md:justify-center md:pb-12">
        <div className="w-full flex flex-col items-center gap-4 md:gap-5" style={{ maxWidth: 640 }}>

          {/* Block 1 — Heroglyph card (papyrus) */}
          <div
            className="w-full papyrus-bg rounded-2xl border-2 relative overflow-hidden"
            style={{
              borderColor: 'hsl(var(--gold) / 0.45)',
              boxShadow: '0 10px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}
          >
            <div
              ref={svgWrapRef}
              className={`heroglyph-svg-wrap ${activeSymbol ? 'has-active' : ''}`}
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                padding: '22px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />

            {/* Pill tooltip overlay */}
            {meaning && (
              <div
                className="heroglyph-pill"
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: 12,
                  transform: 'translateX(-50%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 18px',
                  background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-deep)))',
                  color: '#1a0a05',
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  letterSpacing: '0.04em',
                  borderRadius: 999,
                  boxShadow: '0 6px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  whiteSpace: 'nowrap',
                  maxWidth: 'calc(100% - 32px)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  animation: 'pill-pop 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  zIndex: 2,
                }}
              >
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.14em', color: '#4a2a05' }}>
                  {meaning.label}:
                </span>
                <span>{meaning.name}</span>
                <span style={{ opacity: 0.78 }}>({meaning.value})</span>
              </div>
            )}

            {!svgMarkup && (
              <div style={{ padding: 60, color: 'hsl(var(--gold-deep) / 0.6)', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                Loading…
              </div>
            )}
          </div>

          {/* Block 2 — Text + CTA card (papyrus) */}
          <div
            className="w-full papyrus-bg rounded-2xl border-2 relative overflow-hidden"
            style={{
              borderColor: 'hsl(var(--gold) / 0.45)',
              boxShadow: '0 10px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}
          >
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 14,
              }}
            >
              <h1
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 700,
                  fontSize: 'clamp(1.7rem, 4.2vw, 2.4rem)',
                  letterSpacing: '0.1em',
                  color: 'hsl(var(--gold-deep))',
                  margin: 0,
                  lineHeight: 1.05,
                }}
              >
                THE HEROGLYPH
              </h1>

              <div style={{ width: 56, height: 1, background: 'hsl(var(--gold-deep) / 0.4)' }} />

              <p
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(0.92rem, 1.4vw, 1.05rem)',
                  letterSpacing: '0.02em',
                  color: 'hsl(var(--foreground) / 0.85)',
                  lineHeight: 1.6,
                  margin: 0,
                  maxWidth: 480,
                }}
              >
                A symbol for those unashamed to love their dog.
                <br />
                Your ticket into a worldwide movement that worships them back.
              </p>

              <Button
                onClick={() => navigate('/heroglyph/name')}
                className="rounded-xl gap-2 h-11 font-bold tracking-wider hover:scale-[1.02] transition-transform mt-2"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                  color: '#000',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
                  letterSpacing: '0.18em',
                  padding: '0 28px',
                  minWidth: 260,
                }}
              >
                Claim Your Heroglyph →
              </Button>

              <div
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.22em',
                  color: 'hsl(var(--gold-deep) / 0.7)',
                  textTransform: 'uppercase',
                  fontFamily: "'Cinzel', serif",
                }}
              >
                $11 · Permanent Symbol · 1 of 1
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
