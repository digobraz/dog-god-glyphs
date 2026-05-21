import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';

type SymbolMeaning = { label: string; name: string; value: string };

// Meanings sourced from the actual /heroglyph/<step> flow screens — same labels
// users see when picking values; Hektor I.'s heroglyph mirrors those selections.
const MEANINGS: Record<string, SymbolMeaning> = {
  // Big cartouche (the dog)
  MALE:           { label: 'Dog Gender',     name: "King's Crown",   value: 'King · Male' },
  DARK:           { label: 'Dog Colour',     name: 'Crescent Moon',  value: 'Dark Coat' },
  'L---LABRADOR': { label: 'The Patron',     name: 'Labrador',       value: 'Labrador · Hound' },
  FOUNDED:        { label: 'The Origin',     name: 'Ankh',           value: 'Raised · Safe Home' },
  SAVAGE:         { label: 'Dog Bloodline',  name: 'Papyrus Scroll', value: 'Pure Lineage' },
  TANIER:         { label: 'Character I',    name: 'Winged Spirit',  value: 'Maverick' },
  WATER:          { label: 'Character II',   name: 'Wave',           value: 'Water Lover' },
  // Small cartouche (the owner)
  MAN:            { label: 'Owner Gender',   name: 'Figure',         value: 'Male' },
  LEO:            { label: 'Western Zodiac', name: 'Lion',           value: 'Leo' },
  ROASTER:        { label: 'Chinese Zodiac', name: 'Rooster',        value: 'Year of the Rooster' },
  M:              { label: 'Owner Initial',  name: 'Letter M',       value: 'For Matej' },
  _1:             { label: 'Ranking',        name: 'Numeral I',      value: '#1 — Founder' },
};

const SYMBOL_IDS = Object.keys(MEANINGS);
const SVG_URL = '/heroglyph/hektor-horizontal.svg';

// Original heroglyph viewBox: 0 0 3165 825.
// Extend bottom for meaning frame; pad sides for tentacle corridors.
const ART_W = 3165;
const ART_H = 825;
const SIDE_PAD = 90;                 // left/right corridor outside heroglyph
const TOP_PAD = 100;                 // top corridor outside heroglyph
const GUTTER_TOP = ART_H + 30;       // 855 — top of routing gutter
const FRAME_X = 420;                 // narrower meaning frame
const FRAME_TOP = 1040;
const FRAME_HEIGHT = 360;
const FRAME_W = ART_W - 2 * FRAME_X; // 2325
const FRAME_RX = 56;                 // round corners
const NEW_HEIGHT = FRAME_TOP + FRAME_HEIGHT + 60; // 1460 (height of art zone below origin)
const ANCHOR_X = ART_W / 2;          // 1582.5
const ANCHOR_Y = FRAME_TOP;          // 1040

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

    // 1. Extend viewBox: add side corridors + top corridor + bottom frame area
    svg.setAttribute(
      'viewBox',
      `${-SIDE_PAD} ${-TOP_PAD} ${ART_W + 2 * SIDE_PAD} ${NEW_HEIGHT + TOP_PAD}`,
    );
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const ns = 'http://www.w3.org/2000/svg';

    // 2. Build tentacles group (rendered ABOVE heroglyph for visibility)
    const tentacleGroup = document.createElementNS(ns, 'g');
    tentacleGroup.id = 'tentacles';

    // 3. Build meaning frame group (rendered above tentacles so it sits cleanly)
    const frameGroup = document.createElementNS(ns, 'g');
    frameGroup.id = 'meaning-frame';

    // Defs for soft gradient + glow
    const defs = document.createElementNS(ns, 'defs');
    defs.innerHTML = `
      <linearGradient id="frameFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#FAF3E1" stop-opacity="0.92"/>
        <stop offset="50%"  stop-color="#F2E2BD" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#E8D29C" stop-opacity="0.92"/>
      </linearGradient>
      <filter id="frameGlow" x="-10%" y="-30%" width="120%" height="160%">
        <feGaussianBlur stdDeviation="8" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    `;
    frameGroup.appendChild(defs);

    // Outer soft shadow ring
    const frameShadow = document.createElementNS(ns, 'rect');
    frameShadow.setAttribute('x', String(FRAME_X - 6));
    frameShadow.setAttribute('y', String(FRAME_TOP - 6));
    frameShadow.setAttribute('width', String(FRAME_W + 12));
    frameShadow.setAttribute('height', String(FRAME_HEIGHT + 12));
    frameShadow.setAttribute('rx', String(FRAME_RX + 6));
    frameShadow.setAttribute('fill', 'rgba(201, 154, 63, 0.18)');
    frameShadow.setAttribute('stroke', 'none');
    frameShadow.setAttribute('filter', 'url(#frameGlow)');
    frameShadow.classList.add('mf-rect', 'mf-shadow');
    frameGroup.appendChild(frameShadow);

    // Main rect (rounded papyrus)
    const frameRect = document.createElementNS(ns, 'rect');
    frameRect.setAttribute('x', String(FRAME_X));
    frameRect.setAttribute('y', String(FRAME_TOP));
    frameRect.setAttribute('width', String(FRAME_W));
    frameRect.setAttribute('height', String(FRAME_HEIGHT));
    frameRect.setAttribute('rx', String(FRAME_RX));
    frameRect.setAttribute('fill', 'url(#frameFill)');
    frameRect.setAttribute('stroke', '#C99A3F');
    frameRect.setAttribute('stroke-width', '5');
    frameRect.classList.add('mf-rect', 'mf-main');
    frameGroup.appendChild(frameRect);

    // Inner thin gold hairline
    const frameInner = document.createElementNS(ns, 'rect');
    frameInner.setAttribute('x', String(FRAME_X + 14));
    frameInner.setAttribute('y', String(FRAME_TOP + 14));
    frameInner.setAttribute('width', String(FRAME_W - 28));
    frameInner.setAttribute('height', String(FRAME_HEIGHT - 28));
    frameInner.setAttribute('rx', String(FRAME_RX - 12));
    frameInner.setAttribute('fill', 'none');
    frameInner.setAttribute('stroke', '#C99A3F');
    frameInner.setAttribute('stroke-width', '1.5');
    frameInner.setAttribute('stroke-opacity', '0.55');
    frameInner.classList.add('mf-rect', 'mf-inner');
    frameGroup.appendChild(frameInner);

    const handlers: Array<{ el: Element; type: string; fn: (e: Event) => void }> = [];

    // Split symbols by left/right half (used to pick exit side)
    const symbolBBoxes: Array<{ id: string; el: SVGGraphicsElement; cx: number; cy: number; bb: DOMRect }> = [];
    SYMBOL_IDS.forEach((id) => {
      const el = svg.querySelector(`[id="${CSS.escape(id)}"]`) as SVGGraphicsElement | null;
      if (!el) return;
      try {
        const bb = el.getBBox() as unknown as DOMRect;
        symbolBBoxes.push({
          id,
          el,
          cx: bb.x + bb.width / 2,
          cy: bb.y + bb.height / 2,
          bb,
        });
      } catch {/* skip */}
    });

    // Split into TOP-half and BOTTOM-half (by symbol centroid cy).
    // Bottom-half symbols take the SHORTEST path — straight DOWN to gutter.
    // Top-half symbols route via the outer side corridor (around the heroglyph).
    const TOP_BOTTOM_SPLIT = ART_H * 0.45;
    const bottomSymbols = symbolBBoxes
      .filter((s) => s.cy >= TOP_BOTTOM_SPLIT)
      .sort((a, b) => a.cx - b.cx);
    const topSymbols = symbolBBoxes
      .filter((s) => s.cy < TOP_BOTTOM_SPLIT)
      .sort((a, b) => a.cy - b.cy);

    const attachSymbol = (s: typeof symbolBBoxes[number], idx: number, pts: number[][]) => {
      const poly = document.createElementNS(ns, 'polyline');
      poly.setAttribute('points', pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '));
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', '#E6A435');
      poly.setAttribute('stroke-width', '3');
      poly.setAttribute('stroke-dasharray', '10 8');
      poly.setAttribute('stroke-linecap', 'round');
      poly.setAttribute('stroke-linejoin', 'round');
      poly.classList.add('tentacle');
      poly.setAttribute('data-symbol', s.id);
      poly.style.animationDelay = `${(idx * 0.18).toFixed(2)}s`;
      tentacleGroup.appendChild(poly);

      s.el.classList.add('hero-zone');
      (s.el as unknown as HTMLElement).style.animationDelay = `${(idx * 0.22).toFixed(2)}s`;

      const click = (e: Event) => {
        e.stopPropagation();
        setActiveSymbol((cur) => (cur === s.id ? null : s.id));
      };
      s.el.addEventListener('click', click);
      handlers.push({ el: s.el, type: 'click', fn: click });
    };

    // BOTTOM-half symbols: straight DOWN → gutter → into frame top.
    //   (cx, cy) -> (cx, gutterY) -> (ANCHOR_X, gutterY) -> (ANCHOR_X, FRAME_TOP)
    // Stagger gutterY per symbol so horizontal lanes don't overlap.
    bottomSymbols.forEach((s, i) => {
      const gutterY = GUTTER_TOP + 24 + i * 12;
      const pts = [
        [s.cx, s.cy],
        [s.cx, gutterY],
        [ANCHOR_X, gutterY],
        [ANCHOR_X, ANCHOR_Y],
      ];
      attachSymbol(s, i, pts);
    });

    // TOP-half symbols: route UP through top corridor, around the perimeter,
    // down the side, across the gutter, and into the frame.
    //   (cx, cy) -> (cx, topY) -> (sideX, topY) -> (sideX, gutterY)
    //            -> (ANCHOR_X, gutterY) -> (ANCHOR_X, FRAME_TOP)
    topSymbols.forEach((s, i) => {
      const isLeft = s.cx < ANCHOR_X;
      const topY = -TOP_PAD + 22 + i * 10;   // staggered lanes in top corridor
      const sideX = isLeft
        ? -SIDE_PAD + 26 + i * 8
        : ART_W + SIDE_PAD - 26 - i * 8;
      // Upper portion of the gutter — keeps top-routed lanes above bottom-routed ones.
      const gutterY = GUTTER_TOP + 4 + i * 8;
      const pts = [
        [s.cx, s.cy],
        [s.cx, topY],
        [sideX, topY],
        [sideX, gutterY],
        [ANCHOR_X, gutterY],
        [ANCHOR_X, ANCHOR_Y],
      ];
      attachSymbol(s, bottomSymbols.length + i, pts);
    });

    // Tentacles UNDER frame (so frame sits on top), but ABOVE heroglyph art
    svg.appendChild(tentacleGroup);
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

  // Meaning overlay position — matches frame area in viewBox.
  // ViewBox: (-SIDE_PAD, -TOP_PAD, ART_W + 2*SIDE_PAD, NEW_HEIGHT + TOP_PAD).
  const FULL_W = ART_W + 2 * SIDE_PAD;
  const FULL_H = NEW_HEIGHT + TOP_PAD;
  const FRAME_LEFT_PX = SIDE_PAD + FRAME_X;
  const FRAME_X_PCT = (FRAME_LEFT_PX / FULL_W) * 100;
  const FRAME_RIGHT_PCT = FRAME_X_PCT;
  const FRAME_TOP_PCT = ((FRAME_TOP + TOP_PAD) / FULL_H) * 100;
  const FRAME_H_PCT = (FRAME_HEIGHT / FULL_H) * 100;

  return (
    <div className="dark-bg flex flex-col min-h-[100dvh]">
      <style>{`
        .heroglyph-svg-wrap svg {
          width: 100%;
          height: auto;
          display: block;
        }
        /* All original heroglyph content -> black silhouette
           (exclude meaning-frame rects via .mf-rect class) */
        .heroglyph-svg-wrap svg path,
        .heroglyph-svg-wrap svg rect:not([id="Artboard1"]):not(.mf-rect) {
          fill: #000 !important;
          stroke: #000 !important;
        }
        /* Meaning frame: papyrus gradient + gold stroke */
        .heroglyph-svg-wrap .mf-shadow {
          fill: rgba(201, 154, 63, 0.18) !important;
          stroke: none !important;
        }
        .heroglyph-svg-wrap .mf-main {
          fill: url(#frameFill) !important;
          stroke: #C99A3F !important;
        }
        .heroglyph-svg-wrap .mf-inner {
          fill: none !important;
          stroke: #C99A3F !important;
        }
        /* Symbols: black fill with gold-amber pulse glow */
        .heroglyph-svg-wrap .hero-zone {
          cursor: pointer;
          fill: #000 !important;
          stroke: #000 !important;
          filter: drop-shadow(0 0 6px #E6A435) drop-shadow(0 0 14px rgba(230, 164, 53, 0.55));
          transition: filter 0.25s ease, transform 0.25s ease;
          transform-box: fill-box;
          transform-origin: center;
          animation: hero-pulse 2.6s ease-in-out infinite;
        }
        .heroglyph-svg-wrap.has-active .hero-zone {
          filter: drop-shadow(0 0 3px rgba(230, 164, 53, 0.25));
          opacity: 0.55;
          animation: none;
        }
        .heroglyph-svg-wrap.has-active .hero-zone.is-active {
          opacity: 1;
          filter: drop-shadow(0 0 10px #C99A3F) drop-shadow(0 0 22px rgba(201, 154, 63, 0.75)) drop-shadow(0 0 4px #FFD566);
          animation: hero-tap 0.4s ease-out;
        }
        /* Tentacles (dashed polylines) — hidden in idle, visible only on active */
        .heroglyph-svg-wrap .tentacle {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease, stroke 0.25s ease, stroke-width 0.25s ease;
        }
        .heroglyph-svg-wrap.has-active .tentacle.is-active {
          stroke: #C99A3F !important;
          opacity: 1;
          stroke-width: 6 !important;
          filter: drop-shadow(0 0 6px rgba(201, 154, 63, 0.9)) drop-shadow(0 0 12px rgba(201, 154, 63, 0.5));
          animation: tentacle-flow 0.8s linear infinite;
        }
        @keyframes hero-pulse {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(230, 164, 53, 0.35)); }
          50%      { filter: drop-shadow(0 0 10px #E6A435) drop-shadow(0 0 20px rgba(230, 164, 53, 0.7)); }
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

      {/* Centered content stack: title + 2 cards (unified max-w-xl) */}
      <div className="flex-1 flex flex-col items-center px-4 pb-8 md:justify-center md:pb-12">
        <div className="w-full max-w-xl flex flex-col items-center gap-4 md:gap-5">

          {/* Block 1 — Heroglyph card (title inside, smaller) */}
          <div
            className="w-full papyrus-bg rounded-2xl border-2 relative overflow-hidden"
            style={{
              borderColor: 'hsl(var(--gold) / 0.45)',
              boxShadow: '0 10px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}
          >
            {/* Title (inside card, top) */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                paddingTop: 14,
                paddingBottom: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 700,
                  fontSize: 'clamp(0.78rem, 1.7vw, 0.95rem)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'hsl(var(--gold-deep))',
                  margin: 0,
                  lineHeight: 1.15,
                  textAlign: 'center',
                }}
              >
                Heroglyph of Hektor I.
              </h2>
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(0.54rem, 1.05vw, 0.62rem)',
                  letterSpacing: '0.34em',
                  textTransform: 'uppercase',
                  color: 'hsl(var(--gold-deep) / 0.7)',
                }}
              >
                First Dogyptian
              </span>
            </div>

            <div style={{ padding: '4px 14px 14px' }}>
              <div style={{ position: 'relative' }}>
                <div
                  ref={svgWrapRef}
                  className={`heroglyph-svg-wrap ${activeSymbol ? 'has-active' : ''}`}
                  style={{ width: '100%', display: 'block' }}
                  dangerouslySetInnerHTML={{ __html: svgMarkup }}
                />
                {/* Meaning text overlay — positioned over the SVG frame band */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${FRAME_X_PCT}%`,
                    right: `${FRAME_RIGHT_PCT}%`,
                    top: `${FRAME_TOP_PCT}%`,
                    height: `${FRAME_H_PCT}%`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 22px',
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
                    gap: 6,
                    animation: 'meaning-fade-in 240ms ease',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: 'clamp(0.6rem, 1.4vw, 0.75rem)',
                      letterSpacing: '0.28em',
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
                      fontSize: 'clamp(1rem, 2.6vw, 1.45rem)',
                      letterSpacing: '0.04em',
                      color: '#1a0a05',
                      lineHeight: 1.1,
                    }}
                  >
                    {meaning.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: 'clamp(0.7rem, 1.5vw, 0.88rem)',
                      letterSpacing: '0.06em',
                      color: 'hsl(var(--foreground) / 0.75)',
                    }}
                  >
                    ({meaning.value})
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 'clamp(0.62rem, 1.4vw, 0.78rem)',
                    letterSpacing: '0.24em',
                    textTransform: 'uppercase',
                    color: 'hsl(var(--gold-deep) / 0.6)',
                    textAlign: 'center',
                  }}
                >
                  Tap a symbol to reveal its meaning
                </div>
              )}
                </div>
              </div>
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
