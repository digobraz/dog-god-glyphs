import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTopBar } from '@/components/PageTopBar';
import { useT } from '@/i18n/LanguageContext';
import { track } from '@/lib/analytics';
import { Seo } from '@/components/Seo';
import { TRANSPARENCY_SPLIT } from '@/lib/transparency';

// ─────────────────────────────────────────────────────────────────────────
//  /heroglyph — sales page. REDESIGN 2026-07-13 (Matej): "heroglyph is your
//  ticket into DOGYPT" — plain papyrus card, BLACK line-art heroglyph on
//  papyrus, price, 3 benefit tiles, CTA. Copy = EN-first HARDCODED (i18n
//  fan-out only after copy lock — matches Entry.tsx pattern).
//
//  Per-symbol meaning tooltips (MEANINGS below) stay on the existing i18n
//  keys — those are already translated in all 18 locales and independent
//  from this page's new hardcoded copy.
// ─────────────────────────────────────────────────────────────────────────

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

const ART_W = 3165;
const ART_H = 825;
const SIDE_PAD = 60;
const TOP_PAD = 60;
const BOTTOM_PAD = 60;

// 3 benefit tiles — what the heroglyph unlocks. White cards, icon + title,
// unified Egypt-ink blue accent (v5A 2026-07-13). On hover (PC) / tap (mobile)
// a bubble reveals a preview mockup + one-line note. Copy = DRAFT (copy lock TBD).
// title/note sú i18n KĽÚČE (module-level const nemôže volať t()); preklad pri renderi. id = stabilný React key + alt.
const BLOCKS: { id: string; icon: string; title: string; preview: string; note: string; accent: string; brd: string }[] = [
  { id: 'cert',    icon: '/icons/heroglyph-page/poster-blue.svg',      title: 'heroglyph.sales.card.cert.title',    preview: '/images/heroglyph-preview/hover-cert.png',    note: 'heroglyph.sales.card.cert.note',    accent: '#2E5FD0', brd: 'rgba(46,95,208,0.35)' },
  { id: 'wall',    icon: '/icons/heroglyph-page/wall-grid-blue.svg',   title: 'heroglyph.sales.card.wall.title',    preview: '/images/heroglyph-preview/hover-wall.png',    note: 'heroglyph.sales.card.wall.note',    accent: '#2E5FD0', brd: 'rgba(46,95,208,0.35)' },
  { id: 'profile', icon: '/icons/heroglyph-page/profile-home-blue.svg', title: 'heroglyph.sales.card.profile.title', preview: '/images/heroglyph-preview/hover-profile.png', note: 'heroglyph.sales.card.profile.note', accent: '#2E5FD0', brd: 'rgba(46,95,208,0.35)' },
];

export default function Heroglyph() {
  const navigate = useNavigate();
  const t = useT();
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const [svgMarkup, setSvgMarkup] = useState<string>('');
  const [tooltipSymbol, setTooltipSymbol] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  const [flipped, setFlipped] = useState(false);
  const [openBenefit, setOpenBenefit] = useState<number | null>(null); // mobil tap-to-reveal benefit bublinu
  const [activeSplit, setActiveSplit] = useState<number | null>(null); // transparency pipeline — hover/tap odhalí vysvetlenie

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

    // Reassigned nižšie pri setupe attract pulzu; prvý dotyk symbolu ho navždy vypne.
    let stopAttract = () => {};

    const attachInteractivity = (el: Element, id: string) => {
      const enter = (e: Event) => {
        stopAttract();
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
        stopAttract();
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

    // ── Ambient "attract" pulz — náhodne rozsvieti symbol na gold (pomaly, jemne),
    //    aby oko šlo myšou na heroglyf. Prvý dotyk KTORÉHOKOĽVEK symbolu (enter/tap)
    //    ho navždy vypne → ostane len hover-vysvietenie ako doteraz. ──────────────
    let attractStartDelay: number | undefined;
    let attractTimer: number | undefined;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const zones = Array.from(svg.querySelectorAll('.hero-zone')) as SVGElement[];
    if (!reduceMotion && zones.length) {
      root.classList.add('hg-attracting');
      const pulseOne = () => {
        const el = zones[Math.floor(Math.random() * zones.length)];
        if (!el || el.classList.contains('hg-attract')) return;
        el.classList.add('hg-attract');
        window.setTimeout(() => el.classList.remove('hg-attract'), 1200);
      };
      attractStartDelay = window.setTimeout(() => {
        pulseOne();
        attractTimer = window.setInterval(pulseOne, 1100);
      }, 1000);
      stopAttract = () => {
        if (attractStartDelay) window.clearTimeout(attractStartDelay);
        if (attractTimer) window.clearInterval(attractTimer);
        attractStartDelay = undefined;
        attractTimer = undefined;
        root.classList.remove('hg-attracting');
        zones.forEach((z) => z.classList.remove('hg-attract'));
        stopAttract = () => {};
      };
    }

    return () => {
      if (attractStartDelay) window.clearTimeout(attractStartDelay);
      if (attractTimer) window.clearInterval(attractTimer);
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

  const enterFlow = () => {
    track('cta_become_dogyptian_click', { location: 'heroglyph_sales' });
    navigate('/heroglyph/intro');
  };

  return (
    <div className="hg-page dark-bg flex flex-col min-h-[100dvh] relative">
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
        /* Pozadie ODVIAZANÉ od obsahu — fixed na viewport, žiadne rescale
           pri rozbalení papyrusovej karty (bg-dark.webp inak preškáluje
           s výškou .dark-bg). Scoped LEN na /heroglyph. */
        .hg-page.dark-bg::before { position: fixed; }

        /* ── Papyrusová karta (parita s /entry .religion-section/.religion-card) ── */
        .hg-section {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 14px 18px 20px;
        }
        .hg-card {
          position: relative;
          width: 100%;
          max-width: 620px;
          background: linear-gradient(160deg, #FBF5E6 0%, #F3E4C4 55%, #EAD6A6 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 16px;
          box-shadow:
            0 14px 44px rgba(0,0,0,0.55),
            0 0 0 4px rgba(201,154,63,0.12),
            inset 0 1px 0 rgba(255,255,255,0.5);
          padding: clamp(18px, 3.5vw, 24px) clamp(16px, 4.5vw, 32px);
        }

        /* ── WHY €11? reveal (v5C 2026-07-13): 3D flip ZRUŠENÝ (nevyzeral pekne) —
           namiesto neho fade-in overlay cez kartu, rovnaký princíp odhalenia
           ako info reveal vo flow (HeroglyphRevealScreen) a v /pack. ── */
        .hg-flip {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .hg-flip-inner {
          position: relative;
          width: 100%;
          max-width: 620px;
        }
        /* Zadná strana = absolútny overlay cez front, fade + jemný scale-in.
           z-index: 10 > front .hg-why (z-index 5), inak by front WHY pill
           presvital cez overlay (je pozicovaný nad z-index:auto súrodencom). */
        .hg-card.back {
          position: absolute;
          inset: 0;
          z-index: 10;
          opacity: 0;
          visibility: hidden;
          transform: scale(0.985);
          pointer-events: none;
          transition: opacity 0.32s ease, transform 0.32s ease, visibility 0.32s;
        }
        .hg-card.back.is-open {
          opacity: 1;
          visibility: visible;
          transform: scale(1);
          pointer-events: auto;
        }
        @media (prefers-reduced-motion: reduce) {
          .hg-card.back { transition: opacity 0.15s ease, visibility 0.15s; transform: none; }
          .hg-card.back.is-open { transform: none; }
        }

        /* "Why €11?" / "← Back" — top-right corner button */
        .hg-why {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 5;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #8a6420;
          border: 1.5px solid rgba(201,154,63,0.75);
          background: transparent;
          border-radius: 999px;
          padding: 5px 12px;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .hg-why:hover {
          background: rgba(201,154,63,0.1);
          border-color: rgba(201,154,63,1);
        }
        /* Narrow mobile — eyebrow row would run under the WHY €11? pill; give it
           breathing room on the right so text stays clear of the button. */
        @media (max-width: 639px) {
          .hg-card .religion-eyebrow { padding-right: 66px; }
        }
        /* Back face — "100% TRANSPARENCY" pipeline (v5D 2026-07-13) */
        .hg-back-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.3rem, 5vw, 1.6rem);
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: #2a1608;
          margin: 0;
        }
        .hg-your11-pill {
          display: inline-block;
          margin: 8px auto 0;
          padding: 4px 14px;
          background: linear-gradient(135deg, #F5C73D 0%, #D9A227 100%);
          border-radius: 999px;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #2a1608;
          box-shadow: 0 2px 8px rgba(160,116,35,0.35), inset 0 1px 0 rgba(255,255,255,0.4);
        }
        /* Vertikálna pipeline — bubliny spojené linkou */
        .hg-pipeline {
          position: relative;
          width: 100%;
          max-width: 360px;
          margin: 18px auto 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .hg-pipe-row {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 8px 12px;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(201,154,63,0.4);
          border-radius: 12px;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .hg-pipe-bubble {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--pc);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.86rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.3);
          transition: transform 0.18s ease;
        }
        .hg-pipe-label {
          flex: 1;
          font-family: 'Cinzel', serif;
          font-size: 0.9rem;
          color: #2a1608;
        }
        .hg-pipe-caret {
          color: var(--pc);
          font-weight: 700;
          font-size: 1rem;
          opacity: 0.6;
        }
        /* Plávajúca bublina s vysvetlením (parita s /entry .crit-pop) — absolútna,
           0 posunu layoutu → obsah ostáva centrovaný. Default hore, .dir-down nadol. */
        .hg-pipe-pop {
          position: absolute;
          bottom: calc(100% + 9px);
          left: 50%;
          width: min(320px, 82vw);
          z-index: 30;
          background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
          border: 1.5px solid #C99A3F;
          border-left: 3px solid var(--pc);
          border-radius: 10px;
          padding: 10px 13px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.45), 0 0 0 3px rgba(201,154,63,0.15);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.7rem;
          line-height: 1.45;
          color: #5c3e10;
          text-align: left;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform: translateX(-50%) translateY(4px);
          transition: opacity 140ms ease, transform 140ms ease, visibility 140ms;
        }
        .hg-pipe-pop::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 7px solid transparent;
          border-top-color: #C99A3F;
        }
        /* 1. blok → bublina nadol (inak prekryje pill/nadpis) */
        .hg-pipe-pop.dir-down {
          bottom: auto;
          top: calc(100% + 9px);
          transform: translateX(-50%) translateY(-4px);
        }
        .hg-pipe-pop.dir-down::after {
          top: auto;
          bottom: 100%;
          border-top-color: transparent;
          border-bottom-color: #C99A3F;
        }
        /* Reveal — PC = hover, mobil = tap (is-active gated na hover:none, aby klik
           na desktope bublinu „nelepil"). */
        @media (hover: hover) {
          .hg-pipe-row:hover {
            z-index: 40; /* vyzdvihni nad súrodencov → bublina (najmä dir-down) nespadne za ďalší blok */
            background: color-mix(in srgb, var(--pc) 12%, #fff);
            border-color: var(--pc);
            box-shadow: 0 3px 10px rgba(0,0,0,0.12);
          }
          .hg-pipe-row:hover .hg-pipe-bubble { transform: scale(1.08); }
          .hg-pipe-row:hover .hg-pipe-pop {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transform: translateX(-50%) translateY(0);
          }
        }
        @media (hover: none) {
          .hg-pipe-row.is-active {
            z-index: 40;
            background: color-mix(in srgb, var(--pc) 12%, #fff);
            border-color: var(--pc);
            box-shadow: 0 3px 10px rgba(0,0,0,0.12);
          }
          .hg-pipe-row.is-active .hg-pipe-bubble { transform: scale(1.08); }
          .hg-pipe-row.is-active .hg-pipe-pop {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transform: translateX(-50%) translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hg-pipe-pop { transition: opacity 140ms ease, visibility 140ms; transform: translateX(-50%); }
          .hg-pipe-pop.dir-down { transform: translateX(-50%); }
        }
        .hg-pipe-footer {
          margin: 14px auto 0;
          max-width: 380px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.72rem;
          font-style: italic;
          line-height: 1.4;
          color: #9c6f1f;
          text-align: center;
        }

        /* "What you get" pill — binds the 3 benefit blocks below via dashed
           connector (v5A 2026-07-13). €11 moved off the front of the card. */
        .hg-what-pill {
          display: inline-block;
          margin: 8px auto 0;
          padding: 6px 18px;
          background: #2E5FD0;
          border-radius: 999px;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(46,95,208,0.35);
        }

        /* Dashed connector — pill → 3 benefit blocks (vejárovito). Scales with
           the grid width via viewBox 0 0 300 30 (matches the 3-col grid). */
        .hg-connector {
          display: block;
          width: 100%;
          max-width: 100%;
          height: 20px;
          margin-top: 0;
          overflow: visible;
        }
        .hg-connector path {
          fill: none;
          stroke: #2E5FD0;
          stroke-width: 1.2;
          stroke-dasharray: 4 4;
          stroke-linecap: round;
          opacity: 0.6;
          vector-effect: non-scaling-stroke;
        }

        /* Eyebrow / title / rule / sub — parity s /entry tokens */
        .religion-eyebrow {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.62rem, 1.7vw, 0.72rem);
          font-weight: 500;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #C99A3F;
          margin: 0 0 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .eyebrow-icon {
          width: 15px;
          height: 15px;
          flex-shrink: 0;
          transform: rotate(-12deg);
          opacity: 0.92;
        }
        .religion-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.6rem, 6vw, 2.15rem);
          letter-spacing: 0.03em;
          text-transform: uppercase;
          text-align: center;
          color: #2a1608;
          margin: 0;
          line-height: 1.15;
        }
        .hg-caption {
          font-family: 'Space Grotesk', sans-serif;
          font-style: italic;
          font-size: clamp(0.46rem, 1.5vw, 0.56rem);
          letter-spacing: 0;
          color: #9c6f1f;
          text-align: center;
          margin: 8px auto 0;
          max-width: 360px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.35;
        }
        @media (min-width: 640px) {
          .hg-caption { max-width: 340px; }
        }
        .religion-rule {
          width: 54px;
          height: 2px;
          margin: 7px auto 4px;
          background: linear-gradient(90deg, transparent, #C99A3F, transparent);
          border: none;
        }
        .religion-sub {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.8rem, 2.2vw, 0.9rem);
          color: #7a5a2a;
          text-align: center;
          line-height: 1.5;
          margin: 8px auto 4px;
          max-width: 100%;
        }

        /* Heroglyph SVG — plain BLACK line-art directly on papyrus (NO glow,
           NO dark relic panel — removed 2026-07-13 per brand: "black, not
           neon, on a pale block"). */
        .heroglyph-svg-wrap {
          /* Reserve box height BEFORE the SVG fetch resolves — viewBox becomes
             (ART_W + 2*SIDE_PAD) x (ART_H + TOP_PAD + BOTTOM_PAD) = 3285 x 945.
             Without this the wrap has 0 height until injected, causing a layout
             "pop"/jump once fetch(SVG_URL) resolves. */
          width: 100%;
          max-width: 360px;
          margin: 10px auto 0;
          aspect-ratio: 3285 / 945;
          position: relative;
        }
        @media (min-width: 640px) {
          .heroglyph-svg-wrap { max-width: 340px; }
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
          color: rgba(122,90,42,0.6);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.85rem;
        }
        .heroglyph-svg-wrap svg {
          width: 100%;
          height: auto;
          display: block;
        }
        .heroglyph-svg-wrap svg path,
        .heroglyph-svg-wrap svg rect:not([id="Artboard1"]):not(.hero-click-pad):not(.cartouche-pad) {
          fill: #1a0a05 !important;
          stroke: #1a0a05 !important;
        }
        .heroglyph-svg-wrap .hero-click-pad,
        .heroglyph-svg-wrap .cartouche-pad {
          fill: transparent !important;
          stroke: none !important;
        }
        .heroglyph-svg-wrap .hero-zone {
          cursor: pointer;
          fill: #1a0a05 !important;
          stroke: #1a0a05 !important;
          transition: fill 0.2s ease, stroke 0.2s ease, transform 0.2s ease;
          transform-box: fill-box;
          transform-origin: center;
        }
        .heroglyph-svg-wrap .hero-zone:hover {
          fill: #C99A3F !important;
          stroke: #C99A3F !important;
          transform: scale(1.06);
        }
        /* Attract pulz — počas attract módu majú symboly pomalý prechod farby,
           JS toggluje .hg-attract (gold) na náhodných. Transitions bijú aj !important
           (vyššie v kaskáde než !important deklarácie), takže farba plynie ink↔gold. */
        .heroglyph-svg-wrap.hg-attracting .hero-zone,
        .heroglyph-svg-wrap.hg-attracting .hero-zone path,
        .heroglyph-svg-wrap.hg-attracting .hero-zone rect {
          transition: fill 1.1s ease-in-out, stroke 1.1s ease-in-out, transform 0.2s ease;
        }
        .heroglyph-svg-wrap .hero-zone.hg-attract,
        .heroglyph-svg-wrap .hero-zone.hg-attract path,
        .heroglyph-svg-wrap .hero-zone.hg-attract rect {
          fill: #C99A3F !important;
          stroke: #C99A3F !important;
        }
        .heroglyph-svg-wrap .cartouche-pad:hover {
          cursor: pointer;
        }
        @keyframes tooltip-fade-in {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* 3 benefit tiles — white cards, per-tile colour accent, hover lift */
        .hg-benefits {
          margin-top: 8px;
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          align-items: stretch;
          gap: 12px;
        }
        .hg-benefit {
          position: relative;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          min-width: 0;
          background: #FFFFFF;
          border: 1.5px solid;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
          padding: 10px 8px;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .hg-benefit:hover,
        .hg-benefit.is-active {
          transform: translateY(-5px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.16);
          border-color: var(--accent);
        }
        @media (prefers-reduced-motion: reduce) {
          .hg-benefit { transition: none; }
          .hg-benefit:hover,
          .hg-benefit.is-active { transform: none; }
        }

        /* Hover/tap bublina — preview mockup + jednoriadkový popis. Absolútna nad kartou. */
        .hg-benefit-pop {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          width: min(250px, 80vw);
          z-index: 30;
          display: block;
          background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 10px;
          padding: 9px 9px 10px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.45), 0 0 0 3px rgba(201,154,63,0.15);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform: translateX(-50%) translateY(4px);
          transition: opacity 140ms ease, transform 140ms ease, visibility 140ms;
        }
        /* Vyššia špecificita (.hg-benefit …) + max-height:none — inak globálne
           pravidlo .dark-bg button img (max-height 3rem, krátke obrazovky)
           oreže preview na 48px, keďže tile je button. */
        .hg-benefit .hg-benefit-pop-img {
          display: block;
          width: 100%;
          height: 132px;
          max-height: none;
          object-fit: cover;    /* zdroj 800×600 (4:3) ≈ box → žiadna deformácia, minim. crop */
          border-radius: 7px;
          margin-bottom: 7px;
        }
        .hg-benefit-pop-note {
          display: block;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          line-height: 1.3;
          color: #5c3e10;
          text-align: center;
        }
        .hg-benefit-pop::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 7px solid transparent;
          border-top-color: #C99A3F;
        }
        /* PC = LEN hover (klik nič nelepí). Dotyk = tap toggle (is-active).
           is-active reveal gated na hover:none — inak by klik na desktope
           bublinu „prilepil" a ostala otvorená aj po odsune kurzora. */
        @media (hover: hover) {
          .hg-benefit:hover .hg-benefit-pop {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transform: translateX(-50%) translateY(0);
          }
        }
        @media (hover: none) {
          .hg-benefit.is-active .hg-benefit-pop {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transform: translateX(-50%) translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hg-benefit-pop { transition: none; transform: translateX(-50%); }
        }
        .hg-benefit-icon {
          width: clamp(32px, 10vw, 40px);
          height: clamp(32px, 10vw, 40px);
          object-fit: contain;
          flex-shrink: 0;
        }
        .hg-benefit-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.74rem, 2.4vw, 0.9rem);
          line-height: 1.2;
        }

        /* CTA — parita s /entry .entry-cta (flow tlačidlo) */
        .entry-cta {
          margin-top: 14px;
          width: auto;
          max-width: 340px;
          padding: 13px 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          background: linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)));
          border: none;
          border-radius: 12px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35);
          transition: transform 0.2s;
        }
        .cta-feather {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          transform: rotate(-12deg);
          filter: brightness(0); /* zlaté SVG → čierne, sadne na čierny CTA text */
        }
        .entry-cta:hover { transform: scale(1.02); }
        .entry-cta:active { transform: scale(0.98); }
        /* Mobile compact CTA — width matches the heroglyph (SVG max-width 360px) */
        @media (max-width: 639px) {
          .entry-cta {
            margin-top: 20px;
            width: 100%;
            max-width: 360px;
            box-sizing: border-box;
          }
        }
      `}</style>

      <PageTopBar />

      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-6 pb-6 md:pt-8 md:pb-8 relative" style={{ zIndex: 2 }}>
        <section className="hg-section">
        <div className="hg-flip">
        <div className="hg-flip-inner">

        <div className="hg-card hg-face front flex flex-col items-center text-center" style={{ pointerEvents: flipped ? 'none' : 'auto' }}>

          <button
            type="button"
            className="hg-why"
            onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
          >
            {t('heroglyph.sales.why')}
          </button>

          <p className="religion-eyebrow">
            <img src="/icons/heroglyph-page/ticket-gold.svg" alt="" className="eyebrow-icon" style={{ transform: 'none' }} />
            {t('heroglyph.sales.eyebrow')}
          </p>
          <h1 className="religion-title">{t('heroglyph.sales.title')}</h1>
          <hr className="religion-rule" />
          <p className="religion-sub">
            {t('heroglyph.sales.subtitle')}
          </p>

          <div ref={svgWrapRef} className="heroglyph-svg-wrap">
            <div
              className={`heroglyph-svg-wrap-inner${svgMarkup ? ' is-loaded' : ''}`}
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
            {!svgMarkup && (
              <div className="heroglyph-svg-wrap-loading">
                {t('heroglyph.sales.loading')}
              </div>
            )}
          </div>

          {/* Symbol meaning bubble — inline pod heroglyph SVG (in-flow, posúva obsah nadol).
              Mobile only. Desktop ostáva cursor-follow nižšie v JSX. */}
          {meaning && isMobile && (
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

          <span className="hg-what-pill">{t('heroglyph.sales.pricePill')}</span>

          <svg className="hg-connector" viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden="true">
            <path d="M150 0 V8" />
            <path d="M50 16 H250" />
            <path d="M50 16 V30" />
            <path d="M150 8 V30" />
            <path d="M250 16 V30" />
          </svg>

          <div className="hg-benefits">
            {BLOCKS.map((b, i) => (
              <button
                key={b.id}
                type="button"
                className={`hg-benefit${openBenefit === i ? ' is-active' : ''}`}
                style={{ borderColor: b.brd, ['--accent' as string]: b.accent }}
                aria-pressed={openBenefit === i}
                onClick={() => setOpenBenefit((o) => (o === i ? null : i))}
              >
                <img src={b.icon} alt="" className="hg-benefit-icon" />
                <div className="hg-benefit-title" style={{ color: b.accent }}>{t(b.title)}</div>
                {/* Vždy v DOM (skryté) → hover na PC (hover:hover), tap (is-active) na mobile.
                    Absolútna bublina = 0 posunu layoutu. Obrázok + jednoriadkový popis. */}
                <span className="hg-benefit-pop" role="tooltip">
                  <img src={b.preview} alt={t(b.title)} className="hg-benefit-pop-img" loading="lazy" />
                  <span className="hg-benefit-pop-note">{t(b.note)}</span>
                </span>
              </button>
            ))}
          </div>

          <button onClick={enterFlow} className="entry-cta">
            {t('heroglyph.sales.cta')}
          </button>

        </div>

        <div className={`hg-card hg-face back flex flex-col items-center justify-center text-center${flipped ? ' is-open' : ''}`}>

          <button
            type="button"
            className="hg-why"
            onClick={(e) => { e.stopPropagation(); setFlipped(false); setActiveSplit(null); }}
          >
            ← {t('heroglyph.sales.back')}
          </button>

          <h2 className="hg-back-title">{t('heroglyph.sales.transparency.title')}</h2>
          <span className="hg-your11-pill">{t('heroglyph.sales.transparency.tribute')}</span>

          {/* Pipeline — bublina so sumou; vysvetlenie sa rozbalí PRIAMO POD blokom
              (accordion grid 0fr→1fr): PC = hover, mobil = tap (is-active gated na
              hover:none). Dáta+copy = kanonický TRANSPARENCY_SPLIT + i18n (ako /payment). */}
          <div className="hg-pipeline">
            {TRANSPARENCY_SPLIT.map((s, i) => (
              <button
                key={s.labelKey}
                type="button"
                className={`hg-pipe-row${activeSplit === i ? ' is-active' : ''}`}
                style={{ ['--pc' as string]: s.color }}
                onClick={() => setActiveSplit((a) => (a === i ? null : i))}
              >
                <span className="hg-pipe-bubble">€{s.share}</span>
                <span className="hg-pipe-label">{t(s.labelKey)}</span>
                <span className="hg-pipe-caret" aria-hidden>›</span>
                {/* Plávajúca bublina (parita s /entry .crit-pop) — 0 posunu layoutu.
                    Odchýlka pre 1. blok: otvor NADOL (dir-down), inak prekryje pill. */}
                <span className={`hg-pipe-pop${i === 0 ? ' dir-down' : ''}`} role="tooltip">
                  {t(s.noteKey)}
                </span>
              </button>
            ))}
          </div>

          <p className="hg-pipe-footer">{t('heroglyph.sales.transparency.footer')}</p>

        </div>

        </div>
        </div>
        </section>
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
    </div>
  );
}
