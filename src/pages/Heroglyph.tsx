import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTopBar } from '@/components/PageTopBar';
import { useT } from '@/i18n/LanguageContext';
import { track } from '@/lib/analytics';
import { Seo } from '@/components/Seo';

// label/value sú i18n KĽÚČE (module-level const nemôže volať t()); preklad pri renderi.
type SymbolMeaning = { label: string; value: string };

const MEANINGS: Record<string, SymbolMeaning> = {
  __DOG:          { label: 'heroglyph.intro.meaning.dog.label',           value: 'heroglyph.intro.meaning.dog.value' },
  __OWNER:        { label: 'heroglyph.intro.meaning.owner.label',         value: 'heroglyph.intro.meaning.owner.value' },
  MALE:           { label: 'heroglyph.intro.meaning.dogGender.label',     value: 'heroglyph.intro.meaning.dogGender.value' },
  DARK:           { label: 'heroglyph.intro.meaning.dogColour.label',     value: 'heroglyph.intro.meaning.dogColour.value' },
  'L---LABRADOR': { label: 'heroglyph.intro.meaning.dogPatron.label',     value: 'heroglyph.intro.meaning.dogPatron.value' },
  FOUNDED:        { label: 'heroglyph.intro.meaning.dogOrigin.label',     value: 'heroglyph.intro.meaning.dogOrigin.value' },
  SAVAGE:         { label: 'heroglyph.intro.meaning.dogBloodline.label',  value: 'heroglyph.intro.meaning.dogBloodline.value' },
  TANIER:         { label: 'heroglyph.intro.meaning.dogCharacter1.label', value: 'heroglyph.intro.meaning.dogCharacter1.value' },
  WATER:          { label: 'heroglyph.intro.meaning.dogCharacter2.label', value: 'heroglyph.intro.meaning.dogCharacter2.value' },
  MAN:            { label: 'heroglyph.intro.meaning.ownerGender.label',   value: 'heroglyph.intro.meaning.ownerGender.value' },
  LEO:            { label: 'heroglyph.intro.meaning.westernZodiac.label', value: 'heroglyph.intro.meaning.westernZodiac.value' },
  ROASTER:        { label: 'heroglyph.intro.meaning.chineseZodiac.label', value: 'heroglyph.intro.meaning.chineseZodiac.value' },
  M:              { label: 'heroglyph.intro.meaning.ownerInitial.label',  value: 'heroglyph.intro.meaning.ownerInitial.value' },
  _1:             { label: 'heroglyph.intro.meaning.ranking.label',       value: 'heroglyph.intro.meaning.ranking.value' },
};

const SYMBOL_IDS = Object.keys(MEANINGS);
const SVG_URL = '/heroglyph/hektor-horizontal.svg';

// Pills keep rotating (marquee), but hover/tap tooltip is switched off for now.
// Flip to `true` to re-enable pill tooltips — gates handlers in renderPill() +
// tooltip bubble rendering below. Does NOT affect the heroglyph symbol tooltip
// (MEANINGS / attachInteractivity) — that stays independent.
const PILL_TOOLTIPS_ENABLED = false;

const ART_W = 3165;
const ART_H = 825;
const SIDE_PAD = 60;
const TOP_PAD = 60;
const BOTTOM_PAD = 60;

type PillData = { icon: string; label: string; tooltip: string; tooltipSub?: string };

// label/tooltip/tooltipSub sú i18n KĽÚČE (module-level const nemôže volať t());
// pred odovzdaním do PillMarquee / setPillTooltip sa preložia cez t() v komponente.
const PILLS_ROW_1: PillData[] = [
  {
    icon: '/icons/heroglyph-page/clipboard.svg',
    label: 'heroglyph.intro.pill.questions.label',
    tooltip: 'heroglyph.intro.pill.questions.tooltip',
  },
  {
    icon: '/icons/heroglyph-page/sandclock.svg',
    label: 'heroglyph.intro.pill.minutes.label',
    tooltip: 'heroglyph.intro.pill.minutes.tooltip',
  },
  {
    icon: '/icons/heroglyph-page/scarab.svg',
    label: 'heroglyph.intro.pill.forever.label',
    tooltip: 'heroglyph.intro.pill.forever.tooltip',
  },
];

const PILLS_ROW_2: PillData[] = [
  {
    icon: '/icons/heroglyph-page/star.svg',
    label: 'heroglyph.intro.pill.unique.label',
    tooltip: 'heroglyph.intro.pill.unique.tooltip',
  },
  {
    icon: '/icons/heroglyph-page/ankh.svg',
    label: 'heroglyph.intro.pill.vow.label',
    tooltip: 'heroglyph.intro.pill.vow.tooltip',
  },
  {
    icon: '/icons/heroglyph-page/heartpaw.svg',
    label: 'heroglyph.intro.pill.bond.label',
    tooltip: 'heroglyph.intro.pill.bond.tooltip',
  },
  {
    icon: '/icons/heroglyph-page/eye.svg',
    label: 'heroglyph.intro.pill.payment.label',
    tooltip: 'heroglyph.intro.pill.payment.tooltip',
  },
];

// Preloží PillData kľúče → text (volá sa v komponente, kde je dostupné t()).
function translatePills(pills: PillData[], t: (k: string) => string): PillData[] {
  return pills.map((p) => ({
    ...p,
    label: t(p.label),
    tooltip: t(p.tooltip),
    tooltipSub: p.tooltipSub ? t(p.tooltipSub) : undefined,
  }));
}

export default function Heroglyph() {
  const navigate = useNavigate();
  const t = useT();
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const [svgMarkup, setSvgMarkup] = useState<string>('');
  const [tooltipSymbol, setTooltipSymbol] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pillTooltip, setPillTooltip] = useState<PillData | null>(null);
  const [pillTooltipPos, setPillTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  const [defOpen, setDefOpen] = useState<boolean>(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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
          // Toggle: same symbol tapped again → close
          setTooltipSymbol((prev) => (prev === id ? null : id));
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
  const pillsRow1 = translatePills(PILLS_ROW_1, t);
  const pillsRow2 = translatePills(PILLS_ROW_2, t);

  return (
    <div className="dark-bg flex flex-col min-h-[100dvh] relative">
      <Seo
        path="/heroglyph"
        type="product"
        title="HEROGLYPH — Your Dog's Eternal Symbol | DOGYPT"
        description="Every dog carries a story. Turn your dog's essence into a HEROGLYPH — twelve sacred symbols, one eternal legacy."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "HEROGLYPH",
          "description": "A unique sacred symbol for your dog — twelve symbols encoding its essence, origin and character.",
          "image": "https://dogypt.com/images/hekthor-heroglyph.webp",
          "brand": { "@type": "Brand", "name": "DOGYPT" },
          "offers": { "@type": "Offer", "price": "11", "priceCurrency": "EUR", "availability": "https://schema.org/InStock", "url": "https://dogypt.com/heroglyph" }
        }}
      />
      {/* Mild radial overlay over bg-dark.webp texture */}
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
        .heroglyph-svg-wrap {
          /* Reserve box height BEFORE the SVG fetch resolves — viewBox becomes
             (ART_W + 2*SIDE_PAD) x (ART_H + TOP_PAD + BOTTOM_PAD) = 3285 x 945.
             Without this the wrap has 0 height until injected, causing a layout
             "pop"/jump once fetch(SVG_URL) resolves. Width stays 100% of the
             parent (clamped by inline maxWidth: 342 mobile / 320 desktop). */
          width: 100%;
          aspect-ratio: 3285 / 945;
          position: relative;
          filter:
            drop-shadow(0 0 18px rgba(255, 215, 110, 0.95))
            drop-shadow(0 0 42px rgba(201, 154, 63, 0.70))
            drop-shadow(0 0 90px rgba(201, 154, 63, 0.35));
          animation: heroglyph-aura-pulse 3.2s ease-in-out infinite;
        }
        .heroglyph-svg-wrap-inner {
          opacity: 0;
          transition: opacity 220ms ease;
        }
        .heroglyph-svg-wrap-inner.is-loaded {
          opacity: 1;
        }
        .heroglyph-svg-wrap-loading {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 16px;
          color: rgba(201,154,63,0.6);
        }
        @keyframes heroglyph-aura-pulse {
          0%, 100% {
            filter:
              drop-shadow(0 0 18px rgba(255, 215, 110, 0.90))
              drop-shadow(0 0 42px rgba(201, 154, 63, 0.65))
              drop-shadow(0 0 90px rgba(201, 154, 63, 0.30));
          }
          50% {
            filter:
              drop-shadow(0 0 24px rgba(255, 230, 140, 1))
              drop-shadow(0 0 56px rgba(216, 130, 31, 0.80))
              drop-shadow(0 0 120px rgba(216, 130, 31, 0.40));
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .heroglyph-svg-wrap { animation: none; }
        }
        .heroglyph-svg-wrap svg {
          width: 100%;
          height: auto;
          display: block;
        }
        .heroglyph-svg-wrap svg path,
        .heroglyph-svg-wrap svg rect:not([id="Artboard1"]):not(.hero-click-pad):not(.cartouche-pad) {
          fill: #FFD566 !important;
          stroke: #FFD566 !important;
        }
        .heroglyph-svg-wrap .hero-click-pad,
        .heroglyph-svg-wrap .cartouche-pad {
          fill: transparent !important;
          stroke: none !important;
        }
        .heroglyph-svg-wrap .hero-zone {
          cursor: pointer;
          fill: #FFD566 !important;
          stroke: #FFD566 !important;
          filter: drop-shadow(0 0 3px rgba(255,250,235,0.95)) drop-shadow(0 0 8px rgba(255,228,170,0.6));
          transition: filter 0.2s ease, transform 0.2s ease, fill 0.2s ease;
          transform-box: fill-box;
          transform-origin: center;
          animation: hero-pulse 2.6s ease-in-out infinite;
        }
        .heroglyph-svg-wrap .hero-zone:hover {
          fill: #FFF4C2 !important;
          stroke: #FFF4C2 !important;
          filter: drop-shadow(0 0 4px #FFFFFF) drop-shadow(0 0 12px rgba(255,235,160,1));
          transform: scale(1.08);
        }
        .heroglyph-svg-wrap .cartouche-pad:hover {
          cursor: pointer;
        }
        @keyframes hero-pulse {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(255,250,235,0.8)) drop-shadow(0 0 6px rgba(255,245,220,0.55)); }
          50%      { filter: drop-shadow(0 0 4px rgba(255,253,240,1)) drop-shadow(0 0 11px rgba(255,248,225,0.85)); }
        }
        @keyframes tooltip-fade-in {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        /* Dictionary block: 2 columns on ALL viewports — mobile auto-sized, desktop fixed ratio */
        .dict-block {
          grid-template-columns: minmax(auto, max-content) minmax(0, 1fr);
        }
        .dict-block .dict-right {
          padding-left: clamp(10px, 2.2vw, 22px);
          border-left: 1px solid rgba(201,154,63,0.45);
        }
        @media (min-width: 640px) {
          .dict-block {
            grid-template-columns: minmax(0, 0.62fr) minmax(0, 1.38fr);
          }
        }

        /* Pills marquee — moving track inside container, fade edges */
        .pill-marquee {
          width: 100%;
          max-width: 640px;
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent 0, black 7%, black 93%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0, black 7%, black 93%, transparent 100%);
        }
        .pill-marquee-track {
          display: inline-flex;
          gap: 10px;
          padding: 4px 0;
          white-space: nowrap;
          animation: pill-scroll-left 38s linear infinite;
          will-change: transform;
        }
        .pill-marquee-track.reverse {
          animation: pill-scroll-right 38s linear infinite;
        }
        .pill-marquee:hover .pill-marquee-track {
          animation-play-state: paused;
        }
        /* On touch devices marquee never pauses — tap shows tooltip without stopping the scroll */
        @media (hover: none) {
          .pill-marquee:hover .pill-marquee-track,
          .pill-marquee .pill-marquee-track {
            animation-play-state: running;
          }
        }
        @keyframes pill-scroll-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pill-scroll-right {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pill-marquee-track,
          .pill-marquee-track.reverse {
            animation: none;
            transform: translateX(0);
          }
        }

        /* Outline pill — papyrus-cream border/text, 15% papyrus tint fill */
        .pill-outline {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.58rem, 0.95vw, 0.7rem);
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #FAF3E1;
          background: rgba(250, 243, 225, 0.10);
          border: 1px solid rgba(250, 243, 225, 0.55);
          border-radius: 999px;
          padding: 5px 12px;
          white-space: nowrap;
          cursor: pointer;
          transition: color 0.18s ease, border-color 0.18s ease, background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
          flex-shrink: 0;
        }
        .pill-outline:hover {
          color: #FFFCF1;
          border-color: rgba(250, 243, 225, 0.95);
          background: rgba(250, 243, 225, 0.20);
          transform: translateY(-1px);
          box-shadow: 0 0 0 3px rgba(250, 243, 225, 0.08);
        }
        .pill-outline-icon {
          width: 13px;
          height: 13px;
          object-fit: contain;
          /* Black SVG → papyrus cream (#FAF3E1) */
          filter: brightness(0) saturate(100%) invert(96%) sepia(7%)
                  saturate(382%) hue-rotate(355deg) brightness(101%) contrast(96%);
          opacity: 0.85;
          transition: opacity 0.18s ease;
        }
        .pill-outline:hover .pill-outline-icon {
          opacity: 1;
        }

        /* CTA — replicates /grid .join-btn */
        .heroglyph-cta {
          margin-top: 24px;
          padding: 14px 38px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250, 244, 236, 0.40);
          border-radius: 8px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: 0.98rem;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          box-shadow:
            0 0 24px rgba(255, 200, 90, 0.65),
            0 0 60px rgba(230, 158, 26, 0.50),
            0 0 110px rgba(230, 158, 26, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.45);
          text-shadow: 0 1px 0 rgba(255, 240, 200, 0.45);
          transition: transform 0.2s, box-shadow 0.25s, opacity 0.22s;
          animation: heroglyphCtaPulse 3.2s ease-in-out infinite;
        }
        .heroglyph-cta:hover {
          transform: scale(1.05);
          box-shadow:
            0 0 36px rgba(255, 215, 110, 0.85),
            0 0 90px rgba(230, 158, 26, 0.70),
            0 0 150px rgba(230, 158, 26, 0.40),
            inset 0 1px 0 rgba(255, 255, 255, 0.55);
        }
        .heroglyph-cta:active { transform: scale(0.98); }
        @keyframes heroglyphCtaPulse {
          0%, 100% {
            box-shadow:
              0 0 24px rgba(255, 200, 90, 0.55),
              0 0 60px rgba(230, 158, 26, 0.42),
              0 0 110px rgba(230, 158, 26, 0.22),
              inset 0 1px 0 rgba(255, 255, 255, 0.45);
          }
          50% {
            box-shadow:
              0 0 34px rgba(255, 215, 110, 0.85),
              0 0 84px rgba(230, 158, 26, 0.62),
              0 0 140px rgba(230, 158, 26, 0.38),
              inset 0 1px 0 rgba(255, 255, 255, 0.55);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .heroglyph-cta { animation: none; }
        }
        /* Mobile compact CTA — width matches the heroglyph (SVG max-width 342px),
           reduced padding so it's a tidy block, wraps if text is tight. */
        @media (max-width: 639px) {
          .heroglyph-cta {
            margin-top: 18px;
            padding: 13px 18px;
            font-size: 0.9rem;
            letter-spacing: 0.12em;
            width: 100%;
            max-width: 342px;
            min-width: 0;
            box-sizing: border-box;
            white-space: normal;
            line-height: 1.25;
          }
        }
      `}</style>

      <PageTopBar withNav />

      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-6 pb-6 md:pt-8 md:pb-8 relative" style={{ zIndex: 2 }}>
        <div className="w-full max-w-3xl flex flex-col items-center text-center">

          {/* HERO TITLE — Mobile: "THE / SYMBOL" stacked (big gold) + "THAT CHANGES HISTORY" subline (Vision-style, weight 500, uppercase, single row).
              Desktop: "THE SYMBOL THAT / CHANGES HISTORY" (locked). */}
          {isMobile ? (
            <>
              <h1
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 700,
                  fontSize: 'clamp(3rem, 14vw, 4.6rem)',
                  letterSpacing: '0.04em',
                  lineHeight: 0.95,
                  margin: 0,
                  textTransform: 'uppercase',
                }}
              >
                <span
                  style={{
                    background: 'linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 24px rgba(245,199,61,0.45)) drop-shadow(0 0 8px rgba(230,158,26,0.55))',
                  }}
                >
                  {t('heroglyph.intro.title.line1')}
                  {t('heroglyph.intro.title.line2') && (
                    <>
                      <br />
                      {t('heroglyph.intro.title.line2')}
                    </>
                  )}
                </span>
              </h1>
              <p
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: 'clamp(1.05rem, 4.4vw, 1.45rem)',
                  letterSpacing: '0.04em',
                  color: 'rgba(250,244,236,0.92)',
                  textTransform: 'none',
                  margin: '12px 0 0',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                }}
              >
                {t('heroglyph.intro.title.sub')}
              </p>
            </>
          ) : (
            <>
              <h1
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 700,
                  fontSize: 'clamp(2.1rem, 4.6vw, 2.8rem)',
                  letterSpacing: '0.04em',
                  lineHeight: 1.06,
                  margin: 0,
                  textTransform: 'uppercase',
                }}
              >
                <span
                  style={{
                    background: 'linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 24px rgba(245,199,61,0.45)) drop-shadow(0 0 8px rgba(230,158,26,0.55))',
                  }}
                >
                  {t('heroglyph.intro.title.desktop')}
                </span>
              </h1>
              <p
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 'clamp(1rem, 1.9vw, 1.3rem)',
                  letterSpacing: '0.04em',
                  color: '#FAF4EC',
                  textTransform: 'none',
                  margin: 'clamp(4px, 0.6vw, 8px) 0 0',
                  lineHeight: 1.1,
                }}
              >
                {t('heroglyph.intro.title.sub')}
              </p>
            </>
          )}

          {isMobile ? (
            <>
              {/* MOBILE: SVG first (−10% size), then clickable label, IPA, accordion definition */}
              <div
                ref={svgWrapRef}
                className="heroglyph-svg-wrap"
                style={{
                  maxWidth: 342,
                  marginTop: 14,
                }}
              >
                <div
                  className={`heroglyph-svg-wrap-inner${svgMarkup ? ' is-loaded' : ''}`}
                  dangerouslySetInnerHTML={{ __html: svgMarkup }}
                />
                {!svgMarkup && (
                  <div className="heroglyph-svg-wrap-loading">
                    {t('heroglyph.intro.loading')}
                  </div>
                )}
              </div>

              {/* Symbol meaning bubble — inline pod heroglyph SVG (in-flow, posúva obsah nadol).
                  Mobile only. Desktop ostáva cursor-follow nižšie v JSX. */}
              {meaning && (
                <div
                  style={{
                    marginTop: 14,
                    width: '100%',
                    maxWidth: 320,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%)',
                    border: '1.5px solid #C99A3F',
                    borderRadius: 10,
                    padding: '10px 16px',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.55), 0 0 0 3px rgba(201,154,63,0.18)',
                    fontFamily: "'Cinzel', serif",
                    color: '#1a0a05',
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
                    {t(meaning.label)}
                  </div>
                  <div
                    style={{
                      fontSize: '0.98rem',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      lineHeight: 1.15,
                    }}
                  >
                    {t(meaning.value)}
                  </div>
                </div>
              )}

              {/* Heroglyph word — clickable, chevron + dashed underline hint */}
              <button
                type="button"
                onClick={() => setDefOpen((o) => !o)}
                aria-expanded={defOpen}
                aria-controls="heroglyph-def"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  marginTop: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontWeight: 600,
                    fontSize: '1.2rem',
                    letterSpacing: '0.02em',
                    lineHeight: 1.05,
                    color: 'rgba(250,244,236,0.92)',
                    borderBottom: '1px dashed rgba(250,244,236,0.45)',
                    paddingBottom: 2,
                  }}
                >
                  {t('heroglyph.intro.word')}
                </span>
                <ChevronDown
                  size={16}
                  color="rgba(250,244,236,0.85)"
                  strokeWidth={2.2}
                  style={{
                    transition: 'transform 280ms ease',
                    transform: defOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {/* IPA + noun */}
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '0.8rem',
                  color: 'rgba(250,244,236,0.78)',
                  marginTop: 6,
                  fontStyle: 'italic',
                  letterSpacing: '0.02em',
                }}
              >
                {t('heroglyph.intro.ipa')}{' '}
                <span style={{ fontWeight: 700, fontStyle: 'normal' }}>{t('heroglyph.intro.noun')}</span>
              </div>

              {/* Accordion: definition expands on click */}
              <div
                id="heroglyph-def"
                style={{
                  display: 'grid',
                  gridTemplateRows: defOpen ? '1fr' : '0fr',
                  transition: 'grid-template-rows 320ms ease, margin-top 320ms ease',
                  width: '100%',
                  maxWidth: 460,
                  marginTop: defOpen ? 14 : 0,
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '0.92rem',
                      fontWeight: 400,
                      color: '#FAF4EC',
                      lineHeight: 1.5,
                      letterSpacing: '0.005em',
                      margin: 0,
                      padding: '12px 14px',
                      background: 'rgba(250,244,236,0.04)',
                      border: '1px solid rgba(245,199,61,0.22)',
                      borderRadius: 8,
                      textAlign: 'left',
                    }}
                  >
                    {t('heroglyph.intro.definition')}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* DESKTOP: original dict-block (2-col) above SVG (LOCKED) */}
              <div
                className="dict-block"
                style={{
                  marginTop: 18,
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
                <div className="dict-left">
                  <div
                    onMouseEnter={(e) => {
                      setPillTooltip({
                        icon: '',
                        label: t('heroglyph.intro.word'),
                        tooltip: t('heroglyph.intro.wordTooltip'),
                        tooltipSub: t('heroglyph.intro.wordTooltipSub'),
                      });
                      setPillTooltipPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseMove={(e) => setPillTooltipPos({ x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setPillTooltip(null)}
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontWeight: 700,
                      fontSize: 'clamp(1.45rem, 3vw, 1.95rem)',
                      letterSpacing: 0,
                      lineHeight: 1.05,
                      margin: 0,
                      whiteSpace: 'nowrap',
                      cursor: 'help',
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 0 16px rgba(245,199,61,0.4)) drop-shadow(0 0 5px rgba(230,158,26,0.5))',
                    }}
                  >
                    {t('heroglyph.intro.word')}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 'clamp(0.72rem, 1.2vw, 0.84rem)',
                      color: 'rgba(250,244,236,0.78)',
                      marginTop: 6,
                      fontStyle: 'italic',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {t('heroglyph.intro.ipa')}{' '}
                    <span style={{ fontWeight: 700, fontStyle: 'normal' }}>{t('heroglyph.intro.noun')}</span>
                  </div>
                </div>

                <p
                  className="dict-right"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 'clamp(0.85rem, 1.3vw, 0.98rem)',
                    fontWeight: 400,
                    color: '#FAF4EC',
                    lineHeight: 1.5,
                    letterSpacing: '0.005em',
                    margin: 0,
                  }}
                >
                  {t('heroglyph.intro.definition')}
                </p>
              </div>

              <div
                ref={svgWrapRef}
                className="heroglyph-svg-wrap"
                style={{
                  maxWidth: 320,
                  marginTop: 18,
                }}
              >
                <div
                  className={`heroglyph-svg-wrap-inner${svgMarkup ? ' is-loaded' : ''}`}
                  dangerouslySetInnerHTML={{ __html: svgMarkup }}
                />
                {!svgMarkup && (
                  <div className="heroglyph-svg-wrap-loading">
                    {t('heroglyph.intro.loading')}
                  </div>
                )}
              </div>
            </>
          )}

          {isMobile ? (
            <>
              {/* MOBILE order: CTA → outro → pills last (CTA above the fold) */}
              <button
                onClick={() => {
                  track('cta_become_dogyptian_click', { location: 'heroglyph_sales' });
                  navigate('/heroglyph/intro');
                }}
                className="heroglyph-cta"
              >
                {t('heroglyph.intro.cta')}
              </button>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'rgba(250,244,236,0.5)',
                  marginTop: 10,
                  textAlign: 'center',
                }}
              >
                {t('heroglyph.intro.outro')}
              </div>
              <PillMarquee
                pills={[...pillsRow1, ...pillsRow2]}
                reverse={false}
                onEnter={(p, x, y) => { setPillTooltip(p); setPillTooltipPos({ x, y }); }}
                onMove={(x, y) => setPillTooltipPos({ x, y })}
                onLeave={() => setPillTooltip(null)}
                onTap={(p, x, y) => {
                  setPillTooltip((prev) => (prev?.label === p.label ? null : p));
                  setPillTooltipPos({ x, y });
                }}
                marginTop={16}
              />
            </>
          ) : (
            <>
              {/* DESKTOP order: pills (single row) → CTA → outro */}
              <PillMarquee
                pills={[...pillsRow1, ...pillsRow2]}
                reverse={false}
                onEnter={(p, x, y) => { setPillTooltip(p); setPillTooltipPos({ x, y }); }}
                onMove={(x, y) => setPillTooltipPos({ x, y })}
                onLeave={() => setPillTooltip(null)}
                marginTop={20}
              />
              <button
                onClick={() => {
                  track('cta_become_dogyptian_click', { location: 'heroglyph_sales' });
                  navigate('/heroglyph/intro');
                }}
                className="heroglyph-cta"
              >
                {t('heroglyph.intro.cta')}
              </button>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 'clamp(0.7rem, 1.15vw, 0.8rem)',
                  fontWeight: 500,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: 'rgba(250,244,236,0.5)',
                  marginTop: 14,
                  textAlign: 'center',
                }}
              >
                {t('heroglyph.intro.outro')}
              </div>
            </>
          )}

        </div>
      </div>

      {/* Symbol meaning tooltip — desktop only (cursor-follow, viewport-clamped).
          Mobile má vlastný inline render hneď pod SVG (in-flow, posúva content nadol). */}
      {meaning && !isMobile && (
        <div
          style={{
            position: 'fixed',
            left: Math.min(tooltipPos.x + 14, window.innerWidth - 296),
            top: Math.min(tooltipPos.y + 14, window.innerHeight - 120),
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
            {t(meaning.label)}
          </div>
          <div
            style={{
              fontSize: '0.98rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              lineHeight: 1.15,
            }}
          >
            {t(meaning.value)}
          </div>
        </div>
      )}

      {/* Pill tooltip — mobile: bottom-center bubble + tap-outside close; desktop: cursor-follow.
          Mobile bubble is ONLY ever fed by pills (renderPill above), so it's fully gated by the flag. */}
      {PILL_TOOLTIPS_ENABLED && pillTooltip && isMobile && (
        <>
          {/* invisible backdrop for tap-outside dismiss */}
          <div
            onClick={() => setPillTooltip(null)}
            onTouchStart={() => setPillTooltip(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
              background: 'transparent',
            }}
          />
          <div
            style={{
              position: 'fixed',
              left: '50%',
              bottom: 18,
              transform: 'translateX(-50%)',
              zIndex: 100,
              pointerEvents: 'none',
              background: 'linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%)',
              border: '1.5px solid #C99A3F',
              borderRadius: 10,
              padding: '10px 16px',
              boxShadow: '0 6px 24px rgba(0,0,0,0.55), 0 0 0 3px rgba(201,154,63,0.18)',
              color: '#1a0a05',
              minWidth: 180,
              maxWidth: '85vw',
              textAlign: 'center',
              animation: 'tooltip-fade-in 160ms ease',
            }}
          >
            {pillTooltip.tooltipSub ? (
              <>
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    lineHeight: 1.25,
                    color: '#1a0a05',
                  }}
                >
                  {pillTooltip.tooltip}
                </div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.78rem',
                    fontWeight: 400,
                    letterSpacing: '0.005em',
                    lineHeight: 1.4,
                    marginTop: 4,
                    color: '#5c3e10',
                  }}
                >
                  {pillTooltip.tooltipSub}
                </div>
              </>
            ) : (
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '0.88rem',
                  fontWeight: 400,
                  letterSpacing: '0.005em',
                  lineHeight: 1.4,
                }}
              >
                {pillTooltip.tooltip}
              </div>
            )}
          </div>
        </>
      )}
      {/* Desktop bubble is shared with the "heroglyph.intro.word" hover tooltip
          (dict-left, sets pillTooltip with icon: '') — that one must keep working
          even when pill tooltips are off, so gate only actual pills (icon set). */}
      {pillTooltip && !isMobile && (PILL_TOOLTIPS_ENABLED || pillTooltip.icon === '') && (
        <div
          style={{
            position: 'fixed',
            left: pillTooltipPos.x + 14,
            top: pillTooltipPos.y + 14,
            zIndex: 100,
            pointerEvents: 'none',
            background: 'linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%)',
            border: '1.5px solid #C99A3F',
            borderRadius: 10,
            padding: '8px 14px',
            boxShadow: '0 6px 24px rgba(0,0,0,0.55), 0 0 0 3px rgba(201,154,63,0.18)',
            color: '#1a0a05',
            minWidth: 180,
            maxWidth: 300,
            animation: 'tooltip-fade-in 160ms ease',
          }}
        >
          {pillTooltip.tooltipSub ? (
            <>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  lineHeight: 1.25,
                  color: '#1a0a05',
                }}
              >
                {pillTooltip.tooltip}
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '0.74rem',
                  fontWeight: 400,
                  letterSpacing: '0.005em',
                  lineHeight: 1.4,
                  marginTop: 4,
                  color: '#5c3e10',
                }}
              >
                {pillTooltip.tooltipSub}
              </div>
            </>
          ) : (
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.86rem',
                fontWeight: 400,
                letterSpacing: '0.005em',
                lineHeight: 1.4,
              }}
            >
              {pillTooltip.tooltip}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Marquee row of outline pills — duplicated content for seamless loop,
// fade-mask on container edges (NOT page edges), pause on hover.
function PillMarquee({
  pills,
  reverse,
  onEnter,
  onMove,
  onLeave,
  onTap,
  marginTop,
}: {
  pills: PillData[];
  reverse: boolean;
  onEnter: (p: PillData, x: number, y: number) => void;
  onMove: (x: number, y: number) => void;
  onLeave: () => void;
  onTap?: (p: PillData, x: number, y: number) => void;
  marginTop: number;
}) {
  const renderPill = (p: PillData, key: string) => (
    <div
      key={key}
      className="pill-outline"
      style={{ cursor: PILL_TOOLTIPS_ENABLED ? 'pointer' : 'default' }}
      onMouseEnter={PILL_TOOLTIPS_ENABLED ? (e) => onEnter(p, e.clientX, e.clientY) : undefined}
      onMouseMove={PILL_TOOLTIPS_ENABLED ? (e) => onMove(e.clientX, e.clientY) : undefined}
      onMouseLeave={PILL_TOOLTIPS_ENABLED ? onLeave : undefined}
      onTouchStart={PILL_TOOLTIPS_ENABLED ? (e) => {
        const t = e.touches[0];
        if (!t) return;
        if (onTap) onTap(p, t.clientX, t.clientY);
        else onEnter(p, t.clientX, t.clientY);
      } : undefined}
    >
      <img src={p.icon} alt="" className="pill-outline-icon" />
      {p.label}
    </div>
  );

  return (
    <div className="pill-marquee" style={{ marginTop }}>
      <div className={`pill-marquee-track${reverse ? ' reverse' : ''}`}>
        {pills.map((p, i) => renderPill(p, `a-${i}`))}
        {pills.map((p, i) => renderPill(p, `b-${i}`))}
      </div>
    </div>
  );
}
