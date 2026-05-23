import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import { PageNav } from '@/components/PageNav';

const SACRED_INDEX: ReadonlyArray<readonly [string, string, string]> = [
  ['I.',    'CANON',           'who we are'],
  ['II.',   'CREDO',           'what we believe'],
  ['III.',  'COMMANDMENTS',    'how we act'],
  ['IV.',   'SACRAMENTS',      'how we pray'],
  ['V.',    'HIERARCHY',       'who is who'],
  ['VI.',   'SACRED PLACES',   'where we gather'],
  ['VII.',  'TEXTS',           'what we read'],
  ['VIII.', 'LANGUAGE',        'how we speak'],
  ['IX.',   'ECONOMY',         'how we sustain'],
  ['X.',    'INSTITUTIONS',    'how we govern'],
  ['XI.',   'EXPANSION',       'how we grow'],
  ['XII.',  'ANTI-DOCTRINES',  'what we are not'],
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
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const dragAccum = useRef(0);
  const wheelAccum = useRef(0);
  const wheelLock = useRef(false);

  const next = () => setSlide((s) => Math.min(s + 1, TOTAL_SLIDES - 1));
  const prev = () => setSlide((s) => Math.max(s - 1, 0));

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

  // Trackpad horizontal scroll → slide change (debounced, locked per swipe)
  const onWheel = (e: React.WheelEvent) => {
    const dx = e.deltaX;
    const dy = e.deltaY;
    // Prefer horizontal intent
    if (Math.abs(dx) <= Math.abs(dy) * 1.2) return;
    if (wheelLock.current) return;
    wheelAccum.current += dx;
    if (wheelAccum.current >= 40) {
      next();
      wheelLock.current = true;
      wheelAccum.current = 0;
      setTimeout(() => { wheelLock.current = false; }, 500);
    } else if (wheelAccum.current <= -40) {
      prev();
      wheelLock.current = true;
      wheelAccum.current = 0;
      setTimeout(() => { wheelLock.current = false; }, 500);
    }
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden relative">
      {/* Radial vignette */}
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
        .codex-slider {
          position: relative;
          width: 100%;
          max-width: 940px;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 0 clamp(48px, 6vw, 64px);
        }
        .codex-viewport {
          flex: 1;
          overflow: hidden;
          min-height: 0;
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
          height: 100%;
          transition: transform 420ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .codex-slide {
          flex: 0 0 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 clamp(8px, 2vw, 24px);
          text-align: center;
        }
        .codex-slider .codex-slide > * + * {
          margin-top: clamp(28px, 4.5vh, 48px);
        }
        .codex-slider .codex-slide > .codex-dots {
          margin-top: clamp(32px, 5vh, 56px);
        }

        /* ── Slide 1 ── */
        .codex-headline {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(2.2rem, 5.4vw, 4rem);
          letter-spacing: 0.04em;
          line-height: 1;
          margin: 0;
          text-transform: uppercase;
          color: rgba(250,244,236,0.95);
        }
        .codex-headline .grad {
          background:
            linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter:
            drop-shadow(0 0 22px rgba(245,199,61,0.42))
            drop-shadow(0 0 7px rgba(230,158,26,0.5));
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
          max-width: 820px;
          text-wrap: balance;
        }
        @media (max-width: 767px) {
          .codex-preamble-text { font-size: 15px; line-height: 1.5; }
          .codex-headline { font-size: 1.8rem; }
        }

        /* ── Slide 2: papyrus + index ── */
        .codex-paper {
          width: 100%;
          max-width: 720px;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 12px;
          padding: clamp(18px, 2.6vh, 28px) clamp(22px, 4vw, 36px);
          box-shadow:
            0 8px 28px rgba(0,0,0,0.55),
            0 0 0 3px rgba(201,154,63,0.18);
        }
        .codex-paper-label {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.62rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #8a5a14;
          margin: 0 0 clamp(10px, 1.6vh, 16px);
          text-align: center;
        }
        @media (max-width: 767px) {
          .codex-paper { padding: 14px 16px; }
          .codex-paper-label { font-size: 0.58rem; margin: 0 0 8px; }
        }

        .codex-index {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: clamp(24px, 4vw, 56px);
          font-family: 'Cinzel', serif;
          font-size: clamp(0.78rem, 1.05vw, 0.92rem);
          letter-spacing: 0.04em;
          text-align: left;
        }
        .codex-index .col {
          display: flex;
          flex-direction: column;
        }
        .codex-index .row {
          display: grid;
          grid-template-columns: 2.6em auto;
          align-items: baseline;
          column-gap: 0.5em;
          padding: 4px 0;
          border-bottom: 1px solid rgba(138,90,20,0.20);
        }
        .codex-index .col .row:last-child { border-bottom: none; }
        .codex-index .num {
          color: rgba(138,90,20,0.62);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .codex-index .item { display: inline; }
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
          margin: 0 0.35em;
        }
        @media (max-width: 767px) {
          .codex-index {
            font-size: 11.5px;
            column-gap: 14px;
          }
          .codex-index .row {
            grid-template-columns: 2.2em auto;
            padding: 3px 0;
          }
          .codex-index .item .dash { margin: 0 0.25em; }
        }

        .codex-paper-link {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.62rem, 0.9vw, 0.72rem);
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #8a5a14;
          margin: clamp(12px, 1.8vh, 18px) 0 0;
          text-align: center;
        }
        .codex-paper-link .accent {
          color: #C99A3F;
        }

        /* ── Slide 3: the question ── */
        .codex-question-big {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-style: italic;
          font-size: clamp(1.3rem, 2.4vw, 1.95rem);
          line-height: 1.4;
          letter-spacing: 0.02em;
          margin: 0;
          max-width: 760px;
          text-wrap: balance;
          color: rgba(250,244,236,0.92);
        }
        .codex-question-big .accent {
          display: block;
          margin-top: 0.5em;
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
          .codex-question-big { font-size: 17px; line-height: 1.35; }
        }

        /* ── Nav ── */
        .codex-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 3;
          appearance: none;
          background: none;
          border: 1px solid rgba(201,154,63,0.45);
          color: #C99A3F;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          font-family: 'Cinzel', serif;
          font-size: 1.6rem;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 180ms ease, border-color 180ms ease, transform 180ms ease, opacity 180ms ease;
        }
        .codex-nav-btn.prev { left: clamp(2px, 0.6vw, 10px); }
        .codex-nav-btn.next { right: clamp(2px, 0.6vw, 10px); }
        .codex-nav-btn:hover:not(:disabled) {
          background: rgba(201,154,63,0.12);
          border-color: rgba(201,154,63,0.85);
          transform: translateY(-50%) scale(1.05);
        }
        .codex-nav-btn:disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }
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
          .codex-nav-btn { width: 38px; height: 38px; font-size: 1.3rem; }
          .codex-dot { width: 10px; height: 10px; }
        }
      `}</style>

      {/* Top bar */}
      <div
        className="flex-shrink-0 relative flex flex-row md:flex-col items-center justify-center gap-3 md:gap-0 px-5 md:px-0 pb-1 md:pb-2 pt-[19px] md:pt-[14px]"
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
          <button
            className="codex-nav-btn prev"
            onClick={prev}
            disabled={slide === 0}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            className="codex-nav-btn next"
            onClick={next}
            disabled={slide === TOTAL_SLIDES - 1}
            aria-label="Next"
          >
            ›
          </button>
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
                  <span className="grad">In Dog</span> We Trust
                </h1>
                <p className="codex-preamble-text">
                  "We, the nation of doglovers — knowing the infinite loyalty, the true love and the pure soul of every dog on Earth — in order to lift the standing of dogs in human society, build them a community, better their lives, and rewrite the fate of every dog in need, do give ourselves this constitution."
                </p>
                <Dots slide={slide} setSlide={setSlide} />
              </div>

              {/* Slide 2: Sacred Index in papyrus */}
              <div className="codex-slide" aria-label="Sacred Index">
                <div className="codex-paper">
                  <p className="codex-paper-label">Sacred Index</p>
                  <div className="codex-index" role="list">
                    {[0, 1].map((col) => (
                      <div className="col" key={col}>
                        {SACRED_INDEX.slice(col * 6, col * 6 + 6).map(([num, name, desc]) => (
                          <div className="row" role="listitem" key={num}>
                            <span className="num">{num}</span>
                            <span className="item">
                              <span className="name">{name}</span>
                              <span className="dash">—</span>
                              <span className="desc">{desc}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p className="codex-paper-link">
                    Full Constitution — <span className="accent">coming 06.06.2026</span>
                  </p>
                </div>
                <Dots slide={slide} setSlide={setSlide} />
              </div>

              {/* Slide 3: the question */}
              <div className="codex-slide" aria-label="The Question">
                <p className="codex-question-big">
                  A billion people hold the cow sacred.
                  <span className="accent">Will enough of us stand for the dog?</span>
                </p>
                <Dots slide={slide} setSlide={setSlide} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
