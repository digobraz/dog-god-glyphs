import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import hekthorHeroglyphPng from '@/assets/hekthor-heroglyph.png';

type SymbolMeaning = { label: string; value: string };

// Meanings sourced from the actual /heroglyph/<step> flow screens — same labels
// users see when picking values; Hektor I.'s heroglyph mirrors those selections.
const MEANINGS: Record<string, SymbolMeaning> = {
  // Whole-cartouche clicks (click on empty area inside a frame)
  __DOG:          { label: 'Dog',             value: 'Hekthor' },
  __OWNER:        { label: 'Owner',           value: 'Matej' },
  // Big cartouche (the dog) — all labels prefixed with "Dog"
  MALE:           { label: 'Dog Gender',      value: 'King' },
  DARK:           { label: 'Dog Colour',      value: 'Dark Coat' },
  'L---LABRADOR': { label: 'Dog Patron',      value: 'Hekthor' },
  FOUNDED:        { label: 'Dog Origin',      value: 'Rescued' },
  SAVAGE:         { label: 'Dog Bloodline',   value: 'Mutt' },
  TANIER:         { label: 'Dog Character I', value: "Favourite Frisbee" },
  WATER:          { label: 'Dog Character II', value: 'Water Lover' },
  // Small cartouche (the owner)
  MAN:            { label: 'Owner Gender',   value: 'Man' },
  LEO:            { label: 'Western Zodiac', value: 'Leo' },
  ROASTER:        { label: 'Chinese Zodiac', value: 'Rooster' },
  M:              { label: 'Owner Initial',  value: 'Matej' },
  _1:             { label: 'Ranking',        value: '#1 — First Dog' },
};

const SYMBOL_IDS = Object.keys(MEANINGS);
const SVG_URL = '/heroglyph/hektor-horizontal.svg';

// Original heroglyph viewBox: 0 0 3165 825.
// Extend bottom for meaning frame; pad sides for tentacle corridors.
const ART_W = 3165;
const ART_H = 825;
const SIDE_PAD = 90;
const TOP_PAD = 100;
const GUTTER_TOP = ART_H + 30;
const FRAME_X = 420;
const FRAME_TOP = 1040;
const FRAME_HEIGHT = 360;
const FRAME_W = ART_W - 2 * FRAME_X;
const FRAME_RX = 56;
const NEW_HEIGHT = FRAME_TOP + FRAME_HEIGHT + 60;
const ANCHOR_X = ART_W / 2;
const ANCHOR_Y = FRAME_TOP;

export default function Heroglyph() {
  const navigate = useNavigate();
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const [svgMarkup, setSvgMarkup] = useState<string>('');
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);
  const [showInteractive, setShowInteractive] = useState(false);

  // Preload SVG once on mount so the toggle feels instant.
  useEffect(() => {
    let cancelled = false;
    fetch(SVG_URL)
      .then((r) => r.text())
      .then((text) => { if (!cancelled) setSvgMarkup(text); });
    return () => { cancelled = true; };
  }, []);

  // Augment SVG only while interactive mode is visible.
  useEffect(() => {
    if (!showInteractive || !svgMarkup || !svgWrapRef.current) return;
    const root = svgWrapRef.current;
    const svg = root.querySelector('svg');
    if (!svg) return;

    svg.setAttribute(
      'viewBox',
      `${-SIDE_PAD} ${-TOP_PAD} ${ART_W + 2 * SIDE_PAD} ${NEW_HEIGHT + TOP_PAD}`,
    );
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const ns = 'http://www.w3.org/2000/svg';

    const dogPad = document.createElementNS(ns, 'rect');
    dogPad.setAttribute('x', '24');
    dogPad.setAttribute('y', '15');
    dogPad.setAttribute('width', String(3140 - 24));
    dogPad.setAttribute('height', String(810 - 15));
    dogPad.setAttribute('fill', 'rgba(0,0,0,0)');
    dogPad.setAttribute('pointer-events', 'all');
    dogPad.classList.add('cartouche-pad', 'cartouche-pad-dog');
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
    ownerPad.classList.add('cartouche-pad', 'cartouche-pad-owner');
    ownerPad.setAttribute('data-symbol', '__OWNER');
    (ownerPad as unknown as HTMLElement).style.cursor = 'pointer';
    svg.insertBefore(ownerPad, dogPad.nextSibling);

    const cartoucheClick = (id: string) => (e: Event) => {
      e.stopPropagation();
      setActiveSymbol((cur) => (cur === id ? null : id));
    };
    const dogClickFn = cartoucheClick('__DOG');
    const ownerClickFn = cartoucheClick('__OWNER');
    dogPad.addEventListener('click', dogClickFn);
    ownerPad.addEventListener('click', ownerClickFn);

    const tentacleGroup = document.createElementNS(ns, 'g');
    tentacleGroup.id = 'tentacles';

    const frameGroup = document.createElementNS(ns, 'g');
    frameGroup.id = 'meaning-frame';

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

    const TOP_BOTTOM_SPLIT = ART_H * 0.45;
    const bottomSymbols = symbolBBoxes
      .filter((s) => s.cy >= TOP_BOTTOM_SPLIT)
      .sort((a, b) => a.cx - b.cx);
    const topSymbols = symbolBBoxes
      .filter((s) => s.cy < TOP_BOTTOM_SPLIT)
      .sort((a, b) => a.cy - b.cy);

    const clickPads: Element[] = [];
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

      const pad = document.createElementNS(ns, 'rect');
      pad.setAttribute('x', String(s.bb.x));
      pad.setAttribute('y', String(s.bb.y));
      pad.setAttribute('width', String(s.bb.width));
      pad.setAttribute('height', String(s.bb.height));
      pad.setAttribute('fill', 'rgba(0,0,0,0)');
      pad.setAttribute('pointer-events', 'all');
      pad.classList.add('hero-click-pad');
      pad.setAttribute('data-symbol', s.id);
      (pad as unknown as HTMLElement).style.cursor = 'pointer';
      s.el.parentNode?.insertBefore(pad, s.el);
      pad.addEventListener('click', click);
      handlers.push({ el: pad, type: 'click', fn: click });
      clickPads.push(pad);
    };

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

    const LATERAL_TOP_SYMBOLS = new Set(['MALE']);
    topSymbols.forEach((s, i) => {
      const isLeft = s.cx < ANCHOR_X;
      const sideX = isLeft
        ? -SIDE_PAD + 26 + i * 8
        : ART_W + SIDE_PAD - 26 - i * 8;
      const gutterY = GUTTER_TOP + 4 + i * 8;
      let pts: number[][];
      if (LATERAL_TOP_SYMBOLS.has(s.id)) {
        pts = [
          [s.cx, s.cy],
          [sideX, s.cy],
          [sideX, gutterY],
          [ANCHOR_X, gutterY],
          [ANCHOR_X, ANCHOR_Y],
        ];
      } else {
        const topY = -TOP_PAD + 22 + i * 10;
        pts = [
          [s.cx, s.cy],
          [s.cx, topY],
          [sideX, topY],
          [sideX, gutterY],
          [ANCHOR_X, gutterY],
          [ANCHOR_X, ANCHOR_Y],
        ];
      }
      attachSymbol(s, bottomSymbols.length + i, pts);
    });

    svg.appendChild(tentacleGroup);
    svg.appendChild(frameGroup);

    return () => {
      handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
      clickPads.forEach((p) => p.remove());
      dogPad.removeEventListener('click', dogClickFn);
      ownerPad.removeEventListener('click', ownerClickFn);
      dogPad.remove();
      ownerPad.remove();
      tentacleGroup.remove();
      frameGroup.remove();
    };
  }, [svgMarkup, showInteractive]);

  // Tap outside resets active symbol (interactive mode only)
  useEffect(() => {
    if (!showInteractive) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.heroglyph-svg-wrap')) {
        setActiveSymbol(null);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [showInteractive]);

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
  }, [activeSymbol, svgMarkup, showInteractive]);

  // Reset active symbol when leaving interactive mode
  useEffect(() => {
    if (!showInteractive) setActiveSymbol(null);
  }, [showInteractive]);

  const meaning = activeSymbol ? MEANINGS[activeSymbol] : null;

  const FULL_W = ART_W + 2 * SIDE_PAD;
  const FULL_H = NEW_HEIGHT + TOP_PAD;
  const FRAME_LEFT_PX = SIDE_PAD + FRAME_X;
  const FRAME_X_PCT = (FRAME_LEFT_PX / FULL_W) * 100;
  const FRAME_RIGHT_PCT = FRAME_X_PCT;
  const FRAME_TOP_PCT = ((FRAME_TOP + TOP_PAD) / FULL_H) * 100;
  const FRAME_H_PCT = (FRAME_HEIGHT / FULL_H) * 100;

  return (
    <div className="dark-bg flex flex-col min-h-[100dvh] relative">
      {/* Dark overlay over bg-dark.png texture for legibility */}
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
        .heroglyph-svg-wrap svg rect:not([id="Artboard1"]):not(.mf-rect):not(.hero-click-pad):not(.cartouche-pad) {
          fill: #C99A3F !important;
          stroke: #C99A3F !important;
        }
        .heroglyph-svg-wrap .hero-click-pad,
        .heroglyph-svg-wrap .cartouche-pad {
          fill: transparent !important;
          stroke: none !important;
        }
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
        .heroglyph-svg-wrap .hero-zone {
          cursor: pointer;
          fill: #C99A3F !important;
          stroke: #C99A3F !important;
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
        .manifest-icon img {
          filter: brightness(0) saturate(100%) invert(58%) sepia(56%) saturate(481%) hue-rotate(2deg) brightness(91%) contrast(86%);
        }
      `}</style>

      {/* Top logo */}
      <div className="flex-shrink-0 flex justify-center pt-3 pb-2 md:pt-5">
        <img src={dogyptLogo} alt="DOGYPT" className="h-8 md:h-12 object-contain" />
      </div>

      {/* Free-flowing content on dark bg (no card) */}
      <div className="flex-1 flex flex-col items-center px-5 pt-2 pb-10 md:justify-center md:pt-6">
        <div className="w-full max-w-2xl flex flex-col items-center text-center">

          {/* HERO TITLE — gold-orange glow */}
          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
              fontSize: 'clamp(2.1rem, 6.5vw, 4.2rem)',
              letterSpacing: '0.04em',
              lineHeight: 1.05,
              margin: 0,
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 24px rgba(245,199,61,0.45)) drop-shadow(0 0 8px rgba(230,158,26,0.55))',
            }}
          >
            The Symbol That<br />Changes History
          </h1>

          {/* Body — short, two lines */}
          <p
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(0.95rem, 1.7vw, 1.15rem)',
              letterSpacing: '0.02em',
              color: 'rgba(250,244,236,0.82)',
              lineHeight: 1.55,
              margin: '24px 0 0',
              maxWidth: 540,
            }}
          >
            A unique symbol — your ticket to the place<br />
            where DOG is GOD.
          </p>

          <p
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(0.78rem, 1.3vw, 0.92rem)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#C99A3F',
              margin: '14px 0 0',
              fontWeight: 700,
            }}
          >
            12 questions · 3 minutes
          </p>

          {/* Heroglyph (smaller) with (i) toggle */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 420, marginTop: 26 }}>
            {/* (i) toggle */}
            <button
              className="flex items-center justify-center"
              style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 40, zIndex: 30 }}
              aria-label={showInteractive ? 'Close interactive heroglyph' : 'Open interactive heroglyph'}
              onClick={() => setShowInteractive((p) => !p)}
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{
                  border: '1.5px solid rgba(201,154,63,0.55)',
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {showInteractive
                  ? <X className="h-4 w-4" style={{ color: '#E6A435' }} />
                  : <Info className="h-4 w-4" style={{ color: '#E6A435' }} />}
              </span>
            </button>
            {/* Heroglyph image / interactive */}
            <div style={{ position: 'relative' }}>
                <AnimatePresence mode="wait">
                  {!showInteractive ? (
                    <motion.div
                      key="static"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                    >
                      <img
                        src={hekthorHeroglyphPng}
                        alt="Hekthor I. heroglyph — the first ever made"
                        style={{
                          width: '100%',
                          maxWidth: 520,
                          height: 'auto',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="interactive"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ width: '100%' }}
                    >
                      <div
                        ref={svgWrapRef}
                        className={`heroglyph-svg-wrap ${activeSymbol ? 'has-active' : ''}`}
                        style={{ width: '100%', display: 'block', position: 'relative' }}
                        dangerouslySetInnerHTML={{ __html: svgMarkup }}
                      />
                      {/* Meaning text overlay */}
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
                              justifyContent: 'center',
                              textAlign: 'center',
                              gap: 10,
                              width: '100%',
                              animation: 'meaning-fade-in 240ms ease',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "'Cinzel', serif",
                                fontSize: 'clamp(0.55rem, 1.25vw, 0.68rem)',
                                letterSpacing: '0.28em',
                                textTransform: 'uppercase',
                                color: 'hsl(var(--gold-deep))',
                                fontWeight: 700,
                                lineHeight: 1.1,
                              }}
                            >
                              {meaning.label}
                            </span>
                            <span
                              style={{
                                fontFamily: "'Cinzel', serif",
                                fontWeight: 700,
                                fontSize: 'clamp(0.85rem, 2.1vw, 1.15rem)',
                                letterSpacing: '0.04em',
                                color: '#1a0a05',
                                lineHeight: 1.05,
                                whiteSpace: 'nowrap',
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {meaning.value}
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            {/* Caption under heroglyph (only in interactive mode) */}
            {showInteractive && (
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(0.62rem, 1.2vw, 0.72rem)',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: 'rgba(201,154,63,0.7)',
                  textAlign: 'center',
                  marginTop: 6,
                }}
              >
                Tap a symbol — see its meaning
              </div>
            )}
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
              marginTop: 30,
              border: '1.5px solid rgba(0,0,0,0.12)',
            }}
          >
            Build My Heroglyph →
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

          {!svgMarkup && showInteractive && (
            <div style={{ padding: 40, color: 'rgba(201,154,63,0.6)', textAlign: 'center' }}>
              Loading…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
