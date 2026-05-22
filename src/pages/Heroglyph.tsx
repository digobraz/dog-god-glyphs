import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';

type SymbolMeaning = { label: string; value: string };

const MEANINGS: Record<string, SymbolMeaning> = {
  __DOG:          { label: 'Dog',              value: 'Hekthor' },
  __OWNER:        { label: 'Owner',            value: 'Matej' },
  MALE:           { label: 'Dog Gender',       value: 'King' },
  DARK:           { label: 'Dog Colour',       value: 'Dark Coat' },
  'L---LABRADOR': { label: 'Dog Patron',       value: 'Hekthor' },
  FOUNDED:        { label: 'Dog Origin',       value: 'Rescued' },
  SAVAGE:         { label: 'Dog Bloodline',    value: 'Mutt' },
  TANIER:         { label: 'Dog Character I',  value: 'Favourite Frisbee' },
  WATER:          { label: 'Dog Character II', value: 'Water Lover' },
  MAN:            { label: 'Owner Gender',     value: 'Man' },
  LEO:            { label: 'Western Zodiac',   value: 'Leo' },
  ROASTER:        { label: 'Chinese Zodiac',   value: 'Rooster' },
  M:              { label: 'Owner Initial',    value: 'Matej' },
  _1:             { label: 'Ranking',          value: '#1 — First Dog' },
};

const SYMBOL_IDS = Object.keys(MEANINGS);
const SVG_URL = '/heroglyph/hektor-horizontal.svg';

const ART_W = 3165;
const ART_H = 825;
const SIDE_PAD = 60;
const TOP_PAD = 60;
const BOTTOM_PAD = 60;

const PILLS = [
  '12 Questions',
  '3 Minutes',
  'Forever in DOGYPT',
];

const MANIFEST_PILLS: Array<{ icon: string; label: string }> = [
  { icon: '/icons/heroglyph-page/star.svg',     label: 'One of a Kind' },
  { icon: '/icons/heroglyph-page/ankh.svg',     label: 'Vow of Faith' },
  { icon: '/icons/heroglyph-page/heartpaw.svg', label: 'Eternal Bond' },
  { icon: '/icons/heroglyph-page/pack.svg',     label: 'Global Pack' },
];

export default function Heroglyph() {
  const navigate = useNavigate();
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const [svgMarkup, setSvgMarkup] = useState<string>('');
  const [tooltipSymbol, setTooltipSymbol] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Load SVG markup once
  useEffect(() => {
    let cancelled = false;
    fetch(SVG_URL)
      .then((r) => r.text())
      .then((text) => { if (!cancelled) setSvgMarkup(text); });
    return () => { cancelled = true; };
  }, []);

  // Augment SVG: extend viewBox slightly + attach hover/click handlers per symbol
  useEffect(() => {
    if (!svgMarkup || !svgWrapRef.current) return;
    const root = svgWrapRef.current;
    const svg = root.querySelector('svg');
    if (!svg) return;

    svg.setAttribute(
      'viewBox',
      `${-SIDE_PAD} ${-TOP_PAD} ${ART_W + 2 * SIDE_PAD} ${ART_H + TOP_PAD + BOTTOM_PAD}`,
    );
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const ns = 'http://www.w3.org/2000/svg';

    // Heroglyph fill = flat metallic gold (matches PNG canonical look)

    // Cartouche-wide click/hover pads (Dog + Owner whole frames)
    const dogPad = document.createElementNS(ns, 'rect');
    dogPad.setAttribute('x', '24');
    dogPad.setAttribute('y', '15');
    dogPad.setAttribute('width', String(3140 - 24));
    dogPad.setAttribute('height', String(810 - 15));
    dogPad.setAttribute('fill', 'rgba(0,0,0,0)');
    dogPad.setAttribute('pointer-events', 'all');
    dogPad.classList.add('cartouche-pad');
    dogPad.setAttribute('data-symbol', '__DOG');
    (dogPad as unknown as HTMLElement).style.cursor = 'pointer';
    svg.insertBefore(dogPad, svg.firstChild);

    const ownerPad = document.createElementNS(ns, 'rect');
    ownerPad.setAttribute('x', '1674');
    ownerPad.setAttribute('y', '118');
    ownerPad.setAttribute('width', '789');
    ownerPad.setAttribute('height', '589');
    ownerPad.setAttribute('fill', 'rgba(0,0,0,0)');
    ownerPad.setAttribute('pointer-events', 'all');
    ownerPad.classList.add('cartouche-pad');
    ownerPad.setAttribute('data-symbol', '__OWNER');
    (ownerPad as unknown as HTMLElement).style.cursor = 'pointer';
    svg.insertBefore(ownerPad, dogPad.nextSibling);

    const handlers: Array<{ el: Element; type: string; fn: EventListener }> = [];
    const clickPads: Element[] = [];

    const attachInteractivity = (el: Element, id: string) => {
      const enter = (e: Event) => {
        const ev = e as MouseEvent;
        setTooltipSymbol(id);
        setTooltipPos({ x: ev.clientX, y: ev.clientY });
      };
      const move = (e: Event) => {
        const ev = e as MouseEvent;
        setTooltipPos({ x: ev.clientX, y: ev.clientY });
      };
      const leave = () => setTooltipSymbol(null);
      const tap = (e: Event) => {
        e.stopPropagation();
        const touch = (e as TouchEvent).touches?.[0];
        if (touch) {
          setTooltipSymbol(id);
          setTooltipPos({ x: touch.clientX, y: touch.clientY });
        }
      };
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
      el.addEventListener('touchstart', tap, { passive: true } as AddEventListenerOptions);
      handlers.push({ el, type: 'mouseenter', fn: enter });
      handlers.push({ el, type: 'mousemove', fn: move });
      handlers.push({ el, type: 'mouseleave', fn: leave });
      handlers.push({ el, type: 'touchstart', fn: tap });
    };

    attachInteractivity(dogPad, '__DOG');
    attachInteractivity(ownerPad, '__OWNER');

    // Per-symbol bbox click-pads + interactivity on the symbol itself
    SYMBOL_IDS.forEach((id) => {
      if (id.startsWith('__')) return; // cartouche pads already attached
      const el = svg.querySelector(`[id="${CSS.escape(id)}"]`) as SVGGraphicsElement | null;
      if (!el) return;

      el.classList.add('hero-zone');
      attachInteractivity(el, id);

      try {
        const bb = el.getBBox() as unknown as DOMRect;
        const pad = document.createElementNS(ns, 'rect');
        pad.setAttribute('x', String(bb.x));
        pad.setAttribute('y', String(bb.y));
        pad.setAttribute('width', String(bb.width));
        pad.setAttribute('height', String(bb.height));
        pad.setAttribute('fill', 'rgba(0,0,0,0)');
        pad.setAttribute('pointer-events', 'all');
        pad.classList.add('hero-click-pad');
        pad.setAttribute('data-symbol', id);
        (pad as unknown as HTMLElement).style.cursor = 'pointer';
        el.parentNode?.insertBefore(pad, el);
        attachInteractivity(pad, id);
        clickPads.push(pad);
      } catch { /* skip */ }
    });

    return () => {
      handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
      clickPads.forEach((p) => p.remove());
      dogPad.remove();
      ownerPad.remove();
    };
  }, [svgMarkup]);

  // Tap outside SVG clears sticky tooltip (touch)
  useEffect(() => {
    const onDocTap = (e: TouchEvent | MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.heroglyph-svg-wrap')) {
        setTooltipSymbol(null);
      }
    };
    document.addEventListener('touchstart', onDocTap, { passive: true });
    document.addEventListener('click', onDocTap);
    return () => {
      document.removeEventListener('touchstart', onDocTap);
      document.removeEventListener('click', onDocTap);
    };
  }, []);

  const meaning = tooltipSymbol ? MEANINGS[tooltipSymbol] : null;

  return (
    <div className="dark-bg flex flex-col min-h-[100dvh] relative">
      {/* Mild radial overlay over bg-dark.png texture */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.5) 100%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <style>{`
        .heroglyph-svg-wrap svg {
          width: 100%;
          height: auto;
          display: block;
        }
        .heroglyph-svg-wrap svg path,
        .heroglyph-svg-wrap svg rect:not([id="Artboard1"]):not(.hero-click-pad):not(.cartouche-pad) {
          fill: #E6A435 !important;
          stroke: #E6A435 !important;
        }
        .heroglyph-svg-wrap .hero-click-pad,
        .heroglyph-svg-wrap .cartouche-pad {
          fill: transparent !important;
          stroke: none !important;
        }
        .heroglyph-svg-wrap .hero-zone {
          cursor: pointer;
          fill: #E6A435 !important;
          stroke: #E6A435 !important;
          filter: drop-shadow(0 0 2px rgba(255,250,235,0.85)) drop-shadow(0 0 5px rgba(255,228,170,0.4));
          transition: filter 0.2s ease, transform 0.2s ease, fill 0.2s ease;
          transform-box: fill-box;
          transform-origin: center;
          animation: hero-pulse 2.6s ease-in-out infinite;
        }
        .heroglyph-svg-wrap .hero-zone:hover {
          fill: #FFD566 !important;
          stroke: #FFD566 !important;
          filter: drop-shadow(0 0 3px #FFFFFF) drop-shadow(0 0 8px rgba(255,250,235,0.95));
          transform: scale(1.08);
        }
        .heroglyph-svg-wrap .cartouche-pad:hover {
          cursor: pointer;
        }
        @keyframes hero-pulse {
          0%, 100% { filter: drop-shadow(0 0 1.5px rgba(255,250,235,0.7)) drop-shadow(0 0 4px rgba(255,245,220,0.4)); }
          50%      { filter: drop-shadow(0 0 2.5px rgba(255,253,240,1)) drop-shadow(0 0 7px rgba(255,248,225,0.7)); }
        }
        @keyframes tooltip-fade-in {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        /* Dictionary block: stack on mobile, 2 columns + divider on desktop */
        .dict-block {
          grid-template-columns: 1fr;
        }
        .dict-block .dict-right {
          padding-top: 12px;
          border-top: 1px solid rgba(201,154,63,0.45);
        }
        @media (min-width: 640px) {
          .dict-block {
            grid-template-columns: 1fr 1fr;
          }
          .dict-block .dict-right {
            padding-top: 0;
            padding-left: clamp(14px, 2.4vw, 24px);
            border-top: none;
            border-left: 1px solid rgba(201,154,63,0.45);
          }
        }
      `}</style>

      {/* Top logo */}
      <div className="flex-shrink-0 flex justify-center pt-3 pb-2 md:pt-5 relative" style={{ zIndex: 2 }}>
        <img src={dogyptLogo} alt="DOGYPT" className="h-8 md:h-12 object-contain" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-4 pb-10 md:pt-6 relative" style={{ zIndex: 2 }}>
        <div className="w-full max-w-2xl flex flex-col items-center text-center">

          {/* HERO TITLE — "THE SYMBOL" gold-orange glow, rest in white */}
          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
              fontSize: 'clamp(2.1rem, 6.5vw, 4.2rem)',
              letterSpacing: '0.04em',
              lineHeight: 1.05,
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                display: 'block',
                background: 'linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 24px rgba(245,199,61,0.45)) drop-shadow(0 0 8px rgba(230,158,26,0.55))',
              }}
            >
              The Symbol
            </span>
            <span
              style={{
                display: 'block',
                color: '#FAF4EC',
                marginTop: 'clamp(2px, 0.4vw, 6px)',
              }}
            >
              That Changes History
            </span>
          </h1>

          {/* Dictionary-style definition — 2 columns with vertical divider */}
          <div
            className="dict-block"
            style={{
              marginTop: 28,
              width: '100%',
              maxWidth: 640,
              display: 'grid',
              alignItems: 'center',
              gap: 'clamp(14px, 3vw, 28px)',
              textAlign: 'left',
              paddingLeft: 'clamp(8px, 2vw, 16px)',
              paddingRight: 'clamp(8px, 2vw, 16px)',
            }}
          >
            {/* Left column: name + IPA */}
            <div className="dict-left">
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 700,
                  fontSize: 'clamp(1.8rem, 4.5vw, 2.6rem)',
                  letterSpacing: '0.01em',
                  lineHeight: 1.05,
                  color: '#E6A435',
                  margin: 0,
                }}
              >
                Heroglyph
              </div>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(0.78rem, 1.3vw, 0.92rem)',
                  color: 'rgba(250,244,236,0.75)',
                  marginTop: 4,
                  fontStyle: 'italic',
                }}
              >
                [ˈhe-roʊ-ɡlɪf]{' '}
                <span style={{ fontWeight: 700, fontStyle: 'normal' }}>noun</span>
              </div>
            </div>

            {/* Right column: definition */}
            <p
              className="dict-right"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(0.95rem, 1.5vw, 1.08rem)',
                color: 'rgba(250,244,236,0.88)',
                lineHeight: 1.55,
                margin: 0,
                letterSpacing: '0.01em',
              }}
            >
              A unique symbol — your ticket to the place where DOG is GOD.
            </p>
          </div>

          {/* Heroglyph — always interactive, no toggle */}
          <div
            ref={svgWrapRef}
            className="heroglyph-svg-wrap"
            style={{
              width: '100%',
              maxWidth: 440,
              marginTop: 28,
              position: 'relative',
            }}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />

          {/* Pills row 1 — flagship features (solid gold) */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 8,
              marginTop: 24,
            }}
          >
            {PILLS.map((p) => (
              <div
                key={p}
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(0.65rem, 1.1vw, 0.78rem)',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#1a0a05',
                  background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 999,
                  padding: '7px 16px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 10px rgba(201,154,63,0.45), inset 0 1px 0 rgba(255,255,255,0.32)',
                }}
              >
                {p}
              </div>
            ))}
          </div>

          {/* Pills row 2 — manifest (icon + label) */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 8,
              marginTop: 10,
            }}
          >
            {MANIFEST_PILLS.map((m) => (
              <div
                key={m.label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(0.62rem, 1.05vw, 0.74rem)',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#1a0a05',
                  background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 999,
                  padding: '6px 14px 6px 10px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 10px rgba(201,154,63,0.45), inset 0 1px 0 rgba(255,255,255,0.32)',
                }}
              >
                <img
                  src={m.icon}
                  alt=""
                  style={{
                    width: 16,
                    height: 16,
                    objectFit: 'contain',
                    filter: 'brightness(0)',
                  }}
                />
                {m.label}
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            onClick={() => navigate('/heroglyph/name')}
            className="rounded-xl gap-2 h-14 font-bold tracking-wider hover:scale-[1.02] transition-transform"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
              color: '#000',
              boxShadow: '0 4px 32px rgba(201,154,63,0.6), 0 0 0 5px rgba(245,199,61,0.15), inset 0 1px 0 rgba(255,255,255,0.35)',
              letterSpacing: '0.2em',
              padding: '0 36px',
              minWidth: 280,
              marginTop: 22,
              border: '1.5px solid rgba(0,0,0,0.12)',
            }}
          >
            Enter The Dogypt →
          </Button>

          {/* Sub-text under CTA */}
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(0.72rem, 1.2vw, 0.82rem)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(250,244,236,0.55)',
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            Every dog owner is needed
          </div>

          {!svgMarkup && (
            <div style={{ padding: 40, color: 'rgba(201,154,63,0.6)', textAlign: 'center' }}>
              Loading…
            </div>
          )}
        </div>
      </div>

      {/* Floating tooltip following cursor */}
      {meaning && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPos.x + 14,
            top: tooltipPos.y + 14,
            zIndex: 100,
            pointerEvents: 'none',
            background: 'linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%)',
            border: '1.5px solid #C99A3F',
            borderRadius: 10,
            padding: '8px 14px',
            boxShadow: '0 6px 24px rgba(0,0,0,0.55), 0 0 0 3px rgba(201,154,63,0.18)',
            fontFamily: "'Cinzel', serif",
            color: '#1a0a05',
            minWidth: 140,
            maxWidth: 280,
            animation: 'tooltip-fade-in 160ms ease',
          }}
        >
          <div
            style={{
              fontSize: '0.62rem',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#9c6f1f',
              fontWeight: 700,
              marginBottom: 3,
            }}
          >
            {meaning.label}
          </div>
          <div
            style={{
              fontSize: '0.98rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              lineHeight: 1.15,
            }}
          >
            {meaning.value}
          </div>
        </div>
      )}
    </div>
  );
}
