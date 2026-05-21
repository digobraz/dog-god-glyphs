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

// Original viewBox: 0 0 3165 825. Extend bottom for frame area.
const FRAME_TOP = 1020;
const FRAME_HEIGHT = 460;
const NEW_HEIGHT = FRAME_TOP + FRAME_HEIGHT + 60; // = 1540
const FRAME_X = 220;
const FRAME_WIDTH = 3165 - 2 * FRAME_X;
const ANCHOR_X = 3165 / 2;
const ANCHOR_Y = FRAME_TOP;

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

  // Augment SVG: extend viewBox, add tentacles + frame, attach click handlers
  useEffect(() => {
    if (!svgMarkup || !svgWrapRef.current) return;
    const root = svgWrapRef.current;
    const svg = root.querySelector('svg');
    if (!svg) return;

    // 1. Extend viewBox bottom for frame area
    svg.setAttribute('viewBox', `0 0 3165 ${NEW_HEIGHT}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // 2. Insert tentacles group BEFORE heroglyph content (under symbols)
    const ns = 'http://www.w3.org/2000/svg';
    const tentacleGroup = document.createElementNS(ns, 'g');
    tentacleGroup.id = 'tentacles';

    const handlers: Array<{ el: Element; type: string; fn: (e: Event) => void }> = [];
    const tentaclesByID: Record<string, SVGLineElement> = {};

    SYMBOL_IDS.forEach((id, idx) => {
      const el = svg.querySelector(`[id="${CSS.escape(id)}"]`) as SVGGraphicsElement | null;
      if (!el) return;
      el.classList.add('hero-zone');
      (el as unknown as HTMLElement).style.animationDelay = `${(idx * 0.28).toFixed(2)}s`;

      // Compute symbol centroid
      let cx = 1582, cy = 412;
      try {
        const bbox = el.getBBox();
        cx = bbox.x + bbox.width / 2;
        cy = bbox.y + bbox.height / 2;
      } catch {}

      // Create tentacle line
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', String(ANCHOR_X));
      line.setAttribute('y1', String(ANCHOR_Y));
      line.setAttribute('x2', String(cx));
      line.setAttribute('y2', String(cy));
      line.setAttribute('stroke', '#FF8C42');
      line.setAttribute('stroke-width', '3');
      line.setAttribute('stroke-dasharray', '10 8');
      line.setAttribute('stroke-linecap', 'round');
      line.classList.add('tentacle');
      line.setAttribute('data-symbol', id);
      line.style.animationDelay = `${(idx * 0.18).toFixed(2)}s`;
      tentacleGroup.appendChild(line);
      tentaclesByID[id] = line;

      // Click handler
      const click = (e: Event) => {
        e.stopPropagation();
        setActiveSymbol((cur) => (cur === id ? null : id));
      };
      el.addEventListener('click', click);
      handlers.push({ el, type: 'click', fn: click });
    });

    // Append tentacles AFTER heroglyph so they're visible on top
    svg.appendChild(tentacleGroup);

    // 3. Append frame rect at bottom
    const frameGroup = document.createElementNS(ns, 'g');
    frameGroup.id = 'meaning-frame';

    const frameRect = document.createElementNS(ns, 'rect');
    frameRect.setAttribute('x', String(FRAME_X));
    frameRect.setAttribute('y', String(FRAME_TOP));
    frameRect.setAttribute('width', String(FRAME_WIDTH));
    frameRect.setAttribute('height', String(FRAME_HEIGHT));
    frameRect.setAttribute('rx', '24');
    frameRect.setAttribute('fill', 'rgba(0,0,0,0.05)');
    frameRect.setAttribute('stroke', '#C99A3F');
    frameRect.setAttribute('stroke-width', '4');
    frameGroup.appendChild(frameRect);
    svg.appendChild(frameGroup);

    return () => {
      handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
      tentacleGroup.remove();
      frameGroup.remove();
    };
  }, [svgMarkup]);

  // Tap outside resets
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.heroglyph-svg-wrap')) {
        setActiveSymbol(null);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // Toggle is-active on symbol + matching tentacle
  useEffect(() => {
    if (!svgWrapRef.current) return;
    const root = svgWrapRef.current;
    root.querySelectorAll('.is-active').forEach((el) => el.classList.remove('is-active'));
    if (activeSymbol) {
      const sym = root.querySelector(`[id="${CSS.escape(activeSymbol)}"]`);
      if (sym) sym.classList.add('is-active');
      const tent = root.querySelector(`.tentacle[data-symbol="${activeSymbol}"]`);
      if (tent) tent.classList.add('is-active');
    }
  }, [activeSymbol, svgMarkup]);

  const meaning = activeSymbol ? MEANINGS[activeSymbol] : null;

  // Meaning overlay position — matches frame area in SVG (bottom band)
  // FRAME occupies y=[1020 .. 1480] in viewBox of total height 1540
  // = bottom 30.5% of card vertically
  const FRAME_BOTTOM_PCT = ((NEW_HEIGHT - FRAME_TOP) / NEW_HEIGHT) * 100;     // ~33.8%
  const FRAME_TOP_OFFSET_PCT = (FRAME_TOP / NEW_HEIGHT) * 100;                  // ~66.2%
  const FRAME_X_PCT = (FRAME_X / 3165) * 100;                                  // ~6.95%

  return (
    <div className="dark-bg flex flex-col min-h-[100dvh]">
      <style>{`
        .heroglyph-svg-wrap svg {
          width: 100%;
          height: auto;
          display: block;
        }
        /* All original heroglyph content -> black silhouette */
        .heroglyph-svg-wrap svg path,
        .heroglyph-svg-wrap svg rect:not([id="Artboard1"]):not([data-meta="frame"]) {
          fill: #000 !important;
          stroke: #000 !important;
        }
        /* Symbols: black fill but orange glow */
        .heroglyph-svg-wrap .hero-zone {
          cursor: pointer;
          fill: #000 !important;
          stroke: #000 !important;
          filter: drop-shadow(0 0 6px #FF8C42) drop-shadow(0 0 14px rgba(255, 140, 66, 0.55));
          transition: filter 0.25s ease, transform 0.25s ease;
          transform-box: fill-box;
          transform-origin: center;
          animation: hero-pulse 2.6s ease-in-out infinite;
        }
        .heroglyph-svg-wrap.has-active .hero-zone {
          filter: drop-shadow(0 0 3px rgba(255, 140, 66, 0.25));
          opacity: 0.55;
          animation: none;
        }
        .heroglyph-svg-wrap.has-active .hero-zone.is-active {
          opacity: 1;
          filter: drop-shadow(0 0 10px #C99A3F) drop-shadow(0 0 22px rgba(201, 154, 63, 0.75)) drop-shadow(0 0 4px #FFD566);
          animation: hero-tap 0.4s ease-out;
        }
        /* Tentacles (dashed lines) */
        .heroglyph-svg-wrap .tentacle {
          opacity: 0.7;
          animation: tentacle-flow 1.8s linear infinite;
          transition: stroke 0.25s ease, opacity 0.25s ease, stroke-width 0.25s ease;
        }
        .heroglyph-svg-wrap.has-active .tentacle {
          opacity: 0.22;
          animation-duration: 3s;
        }
        .heroglyph-svg-wrap.has-active .tentacle.is-active {
          stroke: #C99A3F !important;
          opacity: 1;
          stroke-width: 6 !important;
          filter: drop-shadow(0 0 6px rgba(201, 154, 63, 0.9)) drop-shadow(0 0 12px rgba(201, 154, 63, 0.5));
          animation-duration: 0.8s;
        }
        /* Meaning frame box (in SVG) */
        .heroglyph-svg-wrap #meaning-frame rect {
          fill: rgba(0,0,0,0.06) !important;
          stroke: #C99A3F !important;
        }
        @keyframes hero-pulse {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(255, 140, 66, 0.35)); }
          50%      { filter: drop-shadow(0 0 10px #FF8C42) drop-shadow(0 0 20px rgba(255, 140, 66, 0.7)); }
        }
        @keyframes hero-tap {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        @keyframes tentacle-flow {
          0%   { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -36; }
        }
        @keyframes meaning-fade-in {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Top logo */}
      <div className="flex-shrink-0 flex justify-center pt-3 pb-2 md:pt-5">
        <img src={dogyptLogo} alt="DOGYPT" className="h-8 md:h-12 object-contain" />
      </div>

      {/* Centered content stack: 2 papyrus blocks */}
      <div className="flex-1 flex flex-col items-center px-4 pb-8 md:justify-center md:pb-12">
        <div className="w-full flex flex-col items-center gap-4 md:gap-5" style={{ maxWidth: 760 }}>

          {/* Block 1 — Heroglyph card (papyrus, larger) */}
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
                padding: '20px 16px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />

            {/* Meaning text overlay — positioned over the SVG frame band */}
            <div
              style={{
                position: 'absolute',
                left: `${FRAME_X_PCT}%`,
                right: `${FRAME_X_PCT}%`,
                top: `${FRAME_TOP_OFFSET_PCT}%`,
                height: `${FRAME_BOTTOM_PCT}%`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 18px',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            >
              {meaning ? (
                <div
                  key={activeSymbol}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 4,
                    animation: 'meaning-fade-in 240ms ease',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: 'clamp(0.62rem, 1.4vw, 0.78rem)',
                      letterSpacing: '0.24em',
                      textTransform: 'uppercase',
                      color: 'hsl(var(--gold-deep))',
                      fontWeight: 700,
                    }}
                  >
                    {meaning.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontWeight: 700,
                      fontSize: 'clamp(0.95rem, 2.3vw, 1.35rem)',
                      letterSpacing: '0.04em',
                      color: '#1a0a05',
                    }}
                  >
                    {meaning.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                      letterSpacing: '0.06em',
                      color: 'hsl(var(--foreground) / 0.7)',
                    }}
                  >
                    ({meaning.value})
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 'clamp(0.65rem, 1.4vw, 0.82rem)',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'hsl(var(--gold-deep) / 0.55)',
                    textAlign: 'center',
                  }}
                >
                  Tap a symbol to reveal its meaning
                </div>
              )}
            </div>

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
