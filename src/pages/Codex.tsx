import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import dogyptSeal from '@/assets/dogypt-seal.png';
import { PageNav } from '@/components/PageNav';

type ChapterRow = {
  num: string;
  name: string;
  desc: string;
  subs: string[];
};

const SACRED_INDEX: ChapterRow[] = [
  { num: 'I.',    name: 'CANON',          desc: 'who we are',
    subs: ['The Founding Myth', 'GOD is DOG', 'The Age of the Dog', 'The Syncretic Clause'] },
  { num: 'II.',   name: 'CREDO',          desc: 'what we believe',
    subs: ['Seven Truths About Dogs', 'The DOG-GOD Philosophy', 'The Present Moment'] },
  { num: 'III.',  name: 'COMMANDMENTS',   desc: 'how we act',
    subs: ['The Ten Duties of a Dogyptian', 'The Seven Sins', 'The Seven Virtues', 'Duties to the Dog Race', 'Mantra of the Community', 'The Proud Dogyptian'] },
  { num: 'IV.',   name: 'SACRAMENTS',     desc: 'how we pray',
    subs: ['The Sacraments', 'The Prayers', 'Feasts & Calendar', 'Life Rituals'] },
  { num: 'V.',    name: 'HIERARCHY',      desc: 'who is who',
    subs: ['HEKTHOR I.', 'The Pharaoh', 'The Dogyptian Council', 'The Conscious Dog Person'] },
  { num: 'VI.',   name: 'SACRED PLACES',  desc: 'where we gather',
    subs: ['dogypt.com — The Virtual Temple', 'DOGYPT Centres', 'DOGYPTLAND', 'Local Circles'] },
  { num: 'VII.',  name: 'TEXTS',          desc: 'what we read',
    subs: ['The DOGYPT Constitution', 'The Heroglyph Manual', 'Cesta s Hrdinom (The Hero’s Journey)'] },
  { num: 'VIII.', name: 'LANGUAGE',       desc: 'how we speak',
    subs: ['Dogyptish', 'The Heroglyph', 'Liturgical Colours', 'Identification', 'The DOGYPT Logo'] },
  { num: 'IX.',   name: 'ECONOMY',        desc: 'how we sustain',
    subs: ['Principles Binding From Day One', 'Deferred for Later Revision'] },
  { num: 'X.',    name: 'INSTITUTIONS',   desc: 'how we govern',
    subs: ['Layer 1 — The Movement', 'Layer 2 — Slovak Civic Association', 'Layer 3 — USA 501(c)(3) Nonprofit', 'Layer 4 — Church of Slovakia', 'Layer 5 — International Umbrella'] },
  { num: 'XI.',   name: 'EXPANSION',      desc: 'how we grow',
    subs: ['Phase Slovakia (2026)', 'Phase USA (2027)', 'Phase Europe (2027–2028)', 'Phase World (2028+)', 'The “Same Story” Principle'] },
  { num: 'XII.',  name: 'ANTI-DOCTRINES', desc: 'what we are not',
    subs: ['Not a Personality Cult', 'Not a Competitor to Other Faiths', 'Not Anti-Veterinary', 'Not Empty MLM', 'Not Vegan / Anti-Meat Ideology', 'Not a Political Project'] },
];

const TOTAL_SLIDES = 3;

function Dots({ slide, setSlide }: { slide: number; setSlide: (i: number) => void }) {
  return (
    <div className="codex-dots" aria-hidden>
      {[0, 1, 2].map((i) => (
        <button
          key={i}
          type="button"
          className={`codex-dot ${i === slide ? 'active' : ''}`}
          onClick={() => setSlide(i)}
          aria-label={`Slide ${i + 1}`}
          aria-current={i === slide}
        />
      ))}
    </div>
  );
}

export default function Codex() {
  const [slide, setSlide] = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const dragAccum = useRef(0);
  const wheelAccum = useRef(0);
  const wheelLock = useRef(false);

  const next = () => setSlide((s) => (s + 1) % TOTAL_SLIDES);
  const prev = () => setSlide((s) => (s - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Pointer (touch + mouse + pen) swipe
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    // Skip swipe gesture if pointer lands on an interactive child (accordion button, CTA, etc.)
    if ((e.target as HTMLElement).closest('button, a')) return;
    dragStartX.current = e.clientX;
    dragAccum.current = 0;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    dragAccum.current = e.clientX - dragStartX.current;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const dx = dragAccum.current;
    const threshold = 50;
    if (dx <= -threshold) next();
    else if (dx >= threshold) prev();
    dragStartX.current = null;
    dragAccum.current = 0;
    setDragging(false);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  // Trackpad horizontal scroll → one slide per gesture (debounced, hard-locked)
  const onWheel = (e: React.WheelEvent) => {
    const dx = e.deltaX;
    const dy = e.deltaY;
    // Prefer horizontal intent
    if (Math.abs(dx) <= Math.abs(dy) * 1.2) return;
    // Hard lock during cooldown — discard inertial residue
    if (wheelLock.current) {
      wheelAccum.current = 0;
      return;
    }
    wheelAccum.current += dx;
    if (wheelAccum.current >= 60) {
      next();
      wheelLock.current = true;
      wheelAccum.current = 0;
      setTimeout(() => { wheelLock.current = false; }, 700);
    } else if (wheelAccum.current <= -60) {
      prev();
      wheelLock.current = true;
      wheelAccum.current = 0;
      setTimeout(() => { wheelLock.current = false; }, 700);
    }
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden relative">
      {/* Radial vignette — lighter on slide 3 so BG mosaic stays visible around PNGs */}
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

      {/* Slide 3 bleed PNGs — rendered at page level so they extend past slider edges */}
      <div className={`codex-bleed ${slide === 2 ? 'active' : ''}`} aria-hidden>
        <img src="/images/codex3-cow.png" alt="" className="codex-cow" />
        <img src="/images/codex3-hektor-v1.png" alt="" className="codex-hektor" />
      </div>

      <style>{`
        .codex-slider {
          position: relative;
          width: 100%;
          max-width: 880px;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          padding: 0 clamp(12px, 2vw, 24px);
        }
        .codex-viewport {
          flex: 0 0 auto;
          width: 100%;
          overflow: hidden;
          position: relative;
          touch-action: pan-y;
          cursor: grab;
          user-select: none;
        }
        .codex-viewport.dragging {
          cursor: grabbing;
        }
        .codex-track {
          display: flex;
          width: 100%;
          align-items: stretch;
          transition: transform 420ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .codex-slide {
          flex: 0 0 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(20px, 3vh, 40px) clamp(8px, 2vw, 24px);
          text-align: center;
        }
        .codex-slider .codex-slide > * + * {
          margin-top: clamp(28px, 4.5vh, 48px);
        }
        .codex-slider > .codex-dots {
          flex-shrink: 0;
          margin-top: 30px;
        }

        /* ── Slide 1 ── */
        .codex-headline {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(3rem, 7.2vw, 5.6rem);
          letter-spacing: 0.04em;
          line-height: 1.02;
          margin: 0;
          text-transform: uppercase;
          color: rgba(250,244,236,0.95);
        }
        .codex-headline .grad {
          display: block;
          background:
            linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter:
            drop-shadow(0 0 22px rgba(245,199,61,0.42))
            drop-shadow(0 0 7px rgba(230,158,26,0.5));
        }
        .codex-headline .line {
          display: block;
        }
        .codex-preamble-wrap {
          position: relative;
          width: 100%;
          max-width: 820px;
          padding: clamp(26px, 3.6vh, 44px) clamp(34px, 5vw, 60px);
        }
        /* Sacred frame — 4 double-line L corners + diamond accent */
        .codex-frame {
          position: absolute;
          width: clamp(32px, 4.6vw, 48px);
          height: clamp(32px, 4.6vw, 48px);
          pointer-events: none;
          filter: drop-shadow(0 0 6px rgba(245,199,61,0.35));
        }
        .codex-frame.tl { top: 0; left: 0;
          border-top: 1.5px solid #C99A3F; border-left: 1.5px solid #C99A3F;
        }
        .codex-frame.tr { top: 0; right: 0;
          border-top: 1.5px solid #C99A3F; border-right: 1.5px solid #C99A3F;
        }
        .codex-frame.bl { bottom: 0; left: 0;
          border-bottom: 1.5px solid #C99A3F; border-left: 1.5px solid #C99A3F;
        }
        .codex-frame.br { bottom: 0; right: 0;
          border-bottom: 1.5px solid #C99A3F; border-right: 1.5px solid #C99A3F;
        }
        /* inner offset L — second parallel line */
        .codex-frame::before {
          content: '';
          position: absolute;
          width: calc(100% - 12px);
          height: calc(100% - 12px);
          border-style: solid;
          border-color: rgba(201,154,63,0.72);
          border-width: 0;
        }
        .codex-frame.tl::before { top: 5px; left: 5px;
          border-top-width: 1px; border-left-width: 1px;
        }
        .codex-frame.tr::before { top: 5px; right: 5px;
          border-top-width: 1px; border-right-width: 1px;
        }
        .codex-frame.bl::before { bottom: 5px; left: 5px;
          border-bottom-width: 1px; border-left-width: 1px;
        }
        .codex-frame.br::before { bottom: 5px; right: 5px;
          border-bottom-width: 1px; border-right-width: 1px;
        }
        /* outer diamond accent at the corner vertex */
        .codex-frame::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          background: #F5C73D;
          transform: rotate(45deg);
          box-shadow: 0 0 10px rgba(245,199,61,0.7), 0 0 3px rgba(255,184,64,0.9);
        }
        .codex-frame.tl::after { top: -3.5px; left: -3.5px; }
        .codex-frame.tr::after { top: -3.5px; right: -3.5px; }
        .codex-frame.bl::after { bottom: -3.5px; left: -3.5px; }
        .codex-frame.br::after { bottom: -3.5px; right: -3.5px; }
        @media (max-width: 767px) {
          .codex-preamble-wrap { padding: 22px 22px; }
          .codex-frame { width: 24px; height: 24px; }
          .codex-frame::before { width: calc(100% - 10px); height: calc(100% - 10px); }
          .codex-frame.tl::before { top: 4px; left: 4px; }
          .codex-frame.tr::before { top: 4px; right: 4px; }
          .codex-frame.bl::before { bottom: 4px; left: 4px; }
          .codex-frame.br::before { bottom: 4px; right: 4px; }
        }
        .codex-preamble-text {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-style: italic;
          font-size: clamp(1.15rem, 1.75vw, 1.55rem);
          line-height: 1.55;
          letter-spacing: 0.02em;
          color: rgba(250,244,236,0.92);
          margin: 0;
          text-wrap: balance;
        }
        .codex-oath-label {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.62rem, 0.95vw, 0.76rem);
          letter-spacing: 0.36em;
          color: rgba(201,154,63,0.7);
          text-transform: uppercase;
          margin: 0;
          display: inline-flex;
          align-items: center;
          gap: clamp(10px, 1.6vw, 16px);
        }
        .codex-oath-label::before,
        .codex-oath-label::after {
          content: '';
          height: 1px;
          width: clamp(22px, 3.4vw, 40px);
          background: rgba(201,154,63,0.5);
        }
        .codex-slider .codex-slide > .codex-oath-label {
          margin-top: clamp(14px, 2vh, 22px);
        }
        @media (max-width: 767px) {
          .codex-preamble-text { font-size: 20px; line-height: 1.45; }
          .codex-headline { font-size: 3.8rem; letter-spacing: 0.03em; line-height: 1.04; }
          .codex-slider { padding: 0 clamp(8px, 2vw, 16px); }
          .codex-slide { padding: clamp(12px, 2vh, 24px) clamp(4px, 1.5vw, 12px); }
        }

        /* ── Slide 2: papyrus + index ── */
        .codex-paper {
          position: relative;
          width: 100%;
          max-width: 980px;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 14px;
          padding: clamp(22px, 3vh, 34px) clamp(26px, 4.5vw, 48px) clamp(20px, 2.6vh, 28px);
          box-shadow:
            0 12px 36px rgba(0,0,0,0.6),
            0 0 0 3px rgba(201,154,63,0.20);
        }
        /* Inner double-border cert frame */
        .codex-paper::after {
          content: '';
          position: absolute;
          inset: 7px;
          border: 1px solid rgba(201,154,63,0.5);
          border-radius: 9px;
          pointer-events: none;
        }
        .codex-paper-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(16px, 2.6vw, 28px);
          padding-bottom: clamp(14px, 1.8vh, 22px);
          margin-bottom: clamp(12px, 1.6vh, 18px);
          border-bottom: 1px solid rgba(138,90,20,0.28);
          position: relative;
        }
        /* Decorative diamond on the divider line */
        .codex-paper-header::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          width: 7px;
          height: 7px;
          background: #C99A3F;
          transform: translateX(-50%) rotate(45deg);
          box-shadow:
            0 0 8px rgba(201,154,63,0.6),
            inset 0 0 0 1px rgba(255,236,200,0.5);
        }
        .codex-seal-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        /* Radial gold aura behind seal */
        .codex-seal-wrap::before {
          content: '';
          position: absolute;
          inset: -18%;
          background:
            radial-gradient(closest-side,
              rgba(245,199,61,0.32) 0%,
              rgba(245,199,61,0.18) 38%,
              rgba(245,199,61,0) 72%);
          z-index: 0;
          pointer-events: none;
        }
        .codex-seal {
          position: relative;
          z-index: 1;
          width: clamp(108px, 13vw, 144px);
          height: auto;
          filter: drop-shadow(0 2px 5px rgba(110,71,16,0.45));
        }
        .codex-paper-titles {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .codex-paper-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.95rem, 3.6vw, 2.95rem);
          letter-spacing: 0.04em;
          line-height: 0.98;
          color: #5a3a0c;
          margin: 0;
        }
        .codex-paper-title span {
          display: block;
          white-space: nowrap;
        }
        .codex-paper-title .title-decor {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-style: normal;
          font-weight: 700;
        }
        .codex-paper-subtitle {
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 400;
          font-size: clamp(0.7rem, 0.92vw, 0.82rem);
          letter-spacing: 0.02em;
          line-height: 1.35;
          color: rgba(110,71,16,0.78);
          margin: clamp(8px, 1vh, 12px) 0 0;
          text-align: left;
          white-space: nowrap;
        }
        @media (max-width: 767px) {
          .codex-paper { padding: 18px 16px 16px; }
          .codex-paper::after { inset: 5px; border-radius: 8px; }
          .codex-paper-header { gap: 14px; padding-bottom: 12px; margin-bottom: 12px; }
          .codex-seal { width: 88px; }
          .codex-paper-title { font-size: 1.7rem; letter-spacing: 0.03em; }
          .codex-paper-subtitle { font-size: 0.6rem; margin-top: 6px; letter-spacing: 0.01em; }
        }

        .codex-index {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: clamp(20px, 3vw, 40px);
          font-family: 'Cinzel', serif;
          font-size: clamp(0.74rem, 1vw, 0.86rem);
          letter-spacing: 0.04em;
          text-align: left;
        }
        .codex-index .col {
          display: flex;
          flex-direction: column;
        }
        .codex-row {
          border-bottom: 1px solid rgba(138,90,20,0.20);
        }
        .codex-index .col .codex-row:last-child { border-bottom: none; }
        .codex-row-head {
          appearance: none;
          background: transparent;
          border: none;
          padding: 5px 6px;
          width: 100%;
          cursor: pointer;
          display: grid;
          grid-template-columns: 2.4em 1fr auto;
          align-items: baseline;
          column-gap: 0.4em;
          text-align: left;
          font: inherit;
          color: inherit;
          border-radius: 4px;
          transition: background 160ms ease;
          white-space: nowrap;
        }
        .codex-row-head:hover {
          background: rgba(201,154,63,0.10);
        }
        .codex-row.open .codex-row-head {
          background: rgba(201,154,63,0.14);
        }
        .codex-index .num {
          color: rgba(138,90,20,0.62);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .codex-index .item {
          display: inline;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }
        .codex-index .item .name {
          color: #6e4710;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .codex-index .item .desc {
          color: rgba(38,22,4,0.62);
          font-weight: 400;
          font-style: italic;
          letter-spacing: 0.02em;
          text-transform: none;
        }
        .codex-index .item .dash {
          color: rgba(38,22,4,0.34);
          margin: 0 0.32em;
        }
        .codex-row-head .caret {
          color: rgba(138,90,20,0.5);
          font-size: 0.8em;
          line-height: 1;
          transition: transform 220ms ease, color 220ms ease;
          align-self: center;
        }
        .codex-row.open .codex-row-head .caret {
          transform: rotate(180deg);
          color: #8a5a14;
        }
        /* Accordion body — grid-template-rows trick keeps container width stable */
        .codex-row-body {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 280ms ease;
        }
        .codex-row.open .codex-row-body {
          grid-template-rows: 1fr;
        }
        .codex-row-body-inner {
          overflow: hidden;
        }
        .codex-row-body ul {
          list-style: none;
          margin: 0;
          padding: 4px 0 8px 2.8em;
        }
        .codex-row-body li {
          font-family: 'Cinzel', serif;
          font-size: 0.78em;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: rgba(90,58,12,0.85);
          padding: 2px 0;
          position: relative;
        }
        .codex-row-body li::before {
          content: '·';
          color: rgba(201,154,63,0.7);
          position: absolute;
          left: -0.9em;
          font-weight: 700;
        }
        @media (max-width: 767px) {
          .codex-index {
            font-size: 11.5px;
            column-gap: 12px;
          }
          .codex-row-head {
            grid-template-columns: 2em 1fr auto;
            padding: 4px 4px;
          }
          .codex-index .item .dash { margin: 0 0.22em; }
          .codex-row-body ul { padding: 3px 0 6px 2em; }
        }

        /* CTA button — Read Full Constitution */
        .codex-cta-wrap {
          display: flex;
          justify-content: center;
          margin-top: clamp(16px, 2.2vh, 24px);
        }
        .codex-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: clamp(11px, 1.5vh, 15px) clamp(26px, 4.5vw, 42px);
          background: linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%);
          color: #3a2204;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.74rem, 1vw, 0.9rem);
          letter-spacing: 0.24em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 8px;
          border: 1.5px solid rgba(110,71,16,0.45);
          box-shadow:
            0 5px 16px rgba(110,71,16,0.4),
            inset 0 1px 0 rgba(255,255,255,0.45),
            inset 0 -1px 0 rgba(110,71,16,0.2);
          transition: transform 200ms ease, box-shadow 200ms ease, filter 200ms ease;
          cursor: pointer;
          white-space: nowrap;
        }
        .codex-cta:hover {
          transform: translateY(-1px);
          box-shadow:
            0 8px 22px rgba(110,71,16,0.55),
            inset 0 1px 0 rgba(255,255,255,0.6),
            inset 0 -1px 0 rgba(110,71,16,0.2);
          filter: brightness(1.06);
        }
        .codex-cta:active {
          transform: translateY(0);
        }
        @media (max-width: 767px) {
          .codex-cta-wrap { margin-top: 14px; }
          .codex-cta {
            padding: 10px 22px;
            font-size: 0.72rem;
            letter-spacing: 0.2em;
          }
        }

        /* ── Slide 3: the question (cow vs dog visual) ── */
        .codex-slide-3 {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 0 !important;
          overflow: visible;
        }
        /* PNGs rendered at page level (outside viewport's overflow:hidden) */
        .codex-bleed {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0;
          transition: opacity 380ms ease 80ms;
          z-index: 1;
        }
        .codex-bleed.active {
          opacity: 1;
        }
        .codex-cow,
        .codex-hektor {
          position: absolute;
          top: 50%;
          width: auto;
          object-fit: contain;
          /* black BG of PNG blends with page BG */
        }
        .codex-cow {
          height: clamp(95vh, 110vh, 126vh);
          top: 0;
          left: -16vw;
          transform: none;
        }
        .codex-hektor {
          height: clamp(95vh, 110vh, 126vh);
          top: 0;
          right: -18vw;
          transform: none;
        }
        .codex-3-overlay {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(18px, 2.8vh, 32px);
          width: 100%;
          max-width: 540px;
          margin: 0 auto;
          padding: clamp(20px, 4vh, 40px) clamp(12px, 2vw, 20px);
          height: 100%;
        }
        .codex-stat-number {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(2.4rem, 6.4vw, 4.8rem);
          letter-spacing: 0.04em;
          line-height: 1;
          margin: 0;
          background:
            linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter:
            drop-shadow(0 0 22px rgba(245,199,61,0.42))
            drop-shadow(0 0 7px rgba(230,158,26,0.5));
        }
        .codex-stat-sub {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-style: italic;
          font-size: clamp(0.78rem, 1.1vw, 0.95rem);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(201,154,63,0.78);
          margin: -8px 0 0;
        }
        .codex-question-big {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-style: italic;
          font-size: clamp(1.05rem, 1.8vw, 1.5rem);
          line-height: 1.4;
          letter-spacing: 0.02em;
          margin: 0;
          max-width: 460px;
          text-wrap: balance;
          color: rgba(250,244,236,0.92);
        }
        .codex-question-big .accent {
          display: block;
          margin-top: 0.4em;
          background:
            linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter:
            drop-shadow(0 0 14px rgba(245,199,61,0.32))
            drop-shadow(0 0 5px rgba(230,158,26,0.36));
        }
        @media (max-width: 767px) {
          .codex-cow { height: clamp(72vh, 90vh, 106vh); left: -14vw; top: 0; }
          .codex-hektor { height: clamp(72vh, 90vh, 106vh); right: -14vw; top: 0; }
          .codex-3-overlay { max-width: 320px; gap: 14px; }
          .codex-stat-number { font-size: clamp(2rem, 12vw, 3rem); }
          .codex-stat-sub { font-size: 0.7rem; letter-spacing: 0.12em; }
          .codex-question-big { font-size: 15px; line-height: 1.35; }
        }

        /* ── Dots ── */
        .codex-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }
        .codex-dot {
          appearance: none;
          background: rgba(201,154,63,0.55);
          border: 1px solid rgba(201,154,63,0.85);
          width: 11px;
          height: 11px;
          border-radius: 50%;
          padding: 0;
          cursor: pointer;
          transition: background 180ms ease, transform 180ms ease, box-shadow 180ms ease;
          box-shadow: 0 0 6px rgba(201,154,63,0.35);
        }
        .codex-dot.active {
          background: #F5C73D;
          border-color: #F5C73D;
          transform: scale(1.35);
          box-shadow: 0 0 14px rgba(245,199,61,0.7);
        }
        .codex-dot:hover:not(.active) {
          background: rgba(201,154,63,0.85);
          transform: scale(1.15);
        }
        @media (max-width: 767px) {
          .codex-dot { width: 10px; height: 10px; }
        }
      `}</style>

      {/* Top bar */}
      <div
        className="flex-shrink-0 relative flex flex-row md:flex-col items-center justify-center gap-3 md:gap-0 px-5 md:px-0 pb-1 md:pb-2 pt-[39px] md:pt-[34px]"
        style={{ zIndex: 2 }}
      >
        <Link to="/grid" aria-label="WALL" className="flex-shrink-0 md:mb-1">
          <img
            src={dogyptLogo}
            alt="DOGYPT"
            className="h-9 md:h-10 object-contain"
          />
        </Link>
        <PageNav />
      </div>

      {/* Slider */}
      <div
        className="flex-1 flex items-center justify-center px-5 md:px-10 relative min-h-0"
        style={{ zIndex: 2 }}
      >
        <div className="codex-slider">
          <div
            className={`codex-viewport ${dragging ? 'dragging' : ''}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
          >
            <div
              className="codex-track"
              style={{ transform: `translateX(-${slide * 100}%)` }}
            >
              {/* Slide 1: headline + preamble */}
              <div className="codex-slide" aria-label="Preamble">
                <h1 className="codex-headline">
                  <span className="grad">In Dog</span>
                  <span className="line">We Trust</span>
                </h1>
                <div className="codex-preamble-wrap">
                  <span className="codex-frame tl" aria-hidden />
                  <span className="codex-frame tr" aria-hidden />
                  <span className="codex-frame bl" aria-hidden />
                  <span className="codex-frame br" aria-hidden />
                  <p className="codex-preamble-text">
                    We, the nation of doglovers — knowing the infinite loyalty, the true love and the pure soul of every dog on Earth — in order to lift the standing of dogs in human society, build them a community, better their lives, and rewrite the fate of every dog in need, do give ourselves this constitution.
                  </p>
                </div>
                <p className="codex-oath-label">The Oath of the Pack</p>
              </div>

              {/* Slide 2: Sacred Index in papyrus */}
              <div className="codex-slide" aria-label="Sacred Index">
                <div className="codex-paper">
                  <div className="codex-paper-header">
                    <div className="codex-seal-wrap">
                      <img src={dogyptSeal} alt="" className="codex-seal" aria-hidden />
                    </div>
                    <div className="codex-paper-titles">
                      <h2 className="codex-paper-title">
                        <span>The <em className="title-decor">Dogyptian</em></span>
                        <span>Constitution</span>
                      </h2>
                      <p className="codex-paper-subtitle">
                        Required reading for every doglover to become a Dogyptian.
                      </p>
                    </div>
                  </div>
                  <div className="codex-index" role="list">
                    {[0, 1].map((col) => (
                      <div className="col" key={col}>
                        {SACRED_INDEX.slice(col * 6, col * 6 + 6).map((row, idx) => {
                          const globalIdx = col * 6 + idx;
                          const open = openIdx === globalIdx;
                          return (
                            <div className={`codex-row ${open ? 'open' : ''}`} role="listitem" key={row.num}>
                              <button
                                type="button"
                                className="codex-row-head"
                                aria-expanded={open}
                                onClick={() => setOpenIdx(open ? null : globalIdx)}
                              >
                                <span className="num">{row.num}</span>
                                <span className="item">
                                  <span className="name">{row.name}</span>
                                  <span className="dash">—</span>
                                  <span className="desc">{row.desc}</span>
                                </span>
                                <span className="caret" aria-hidden>▾</span>
                              </button>
                              <div className="codex-row-body">
                                <div className="codex-row-body-inner">
                                  <ul>
                                    {row.subs.map((s) => <li key={s}>{s}</li>)}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="codex-cta-wrap">
                    <a
                      href="https://dogyptism.dogypt.com"
                      target="_blank"
                      rel="noreferrer"
                      className="codex-cta"
                    >
                      Read Full Constitution
                    </a>
                  </div>
                </div>
              </div>

              {/* Slide 3: cow vs dog — visual (PNGs rendered at page-level below) */}
              <div className="codex-slide codex-slide-3" aria-label="The Question">
                <div className="codex-3-overlay">
                  <p className="codex-stat-number">1.2 BILLION</p>
                  <p className="codex-stat-sub">hold the cow sacred</p>
                  <p className="codex-question-big">
                    Will enough of us
                    <span className="accent">stand for the dog?</span>
                  </p>
                  <Link to="/heroglyph" className="codex-cta">
                    Claim Your Heroglyph
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Static dots — single instance under viewport, only `active` mutates */}
          <Dots slide={slide} setSlide={setSlide} />
        </div>
      </div>
    </div>
  );
}
