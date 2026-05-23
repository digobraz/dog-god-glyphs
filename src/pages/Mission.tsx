import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider-horizontal';

type PillStatus = 'done' | 'progress' | 'future' | 'goal';
type PillData = { icon: string; label: string; tooltip: string; status: PillStatus };

const PILLARS: PillData[] = [
  {
    icon: '/icons/mission/ankh.svg',
    label: 'The Plan',
    tooltip:
      "Dogyptism is alive. The constitution written, the first doglovers gathering, the movement set in motion.",
    status: 'done',
  },
  {
    icon: '/icons/mission/pyramid.svg',
    label: 'One Million',
    tooltip:
      "One million doglovers, one million heroglyphs. The threshold where we stop being individuals and become unstoppable.",
    status: 'progress',
  },
  {
    icon: '/icons/mission/internet.svg',
    label: 'Digital Temple',
    tooltip:
      "One app, one sacred space, connecting every doglover, every dog, every act of kindness across the planet.",
    status: 'progress',
  },
  {
    icon: '/icons/mission/heartpaw.svg',
    label: 'The Mission',
    tooltip:
      "Not shelters but working solutions, fully backed by Dogypt. We fix the root, not the symptoms the system ignores.",
    status: 'future',
  },
  {
    icon: '/icons/mission/doghome.svg',
    label: 'Centers',
    tooltip:
      "Real Dogypt Centers on every continent. Shelters, sanctuaries and gathering places built by us, owned by us.",
    status: 'future',
  },
  {
    icon: '/icons/mission/chemical.svg',
    label: 'Research',
    tooltip:
      "Longevity research guided by Mother Nature, not the pharma machine. Helping every dog live longer, healthier.",
    status: 'future',
  },
  {
    icon: '/icons/mission/balance.svg',
    label: 'Goal',
    tooltip:
      "A home for every stray on Earth. The final vow of the pack: zero dogs left behind, every life returned.",
    status: 'goal',
  },
];

export default function Mission() {
  const navigate = useNavigate();
  const [hoveredPill, setHoveredPill] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden relative">
      {/* Mild radial overlay — identical to /heroglyph */}
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
        /* ── 2-col layout ── */
        .mission-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(14px, 2.4vh, 28px);
          width: 100%;
          max-width: 1120px;
          align-items: center;
        }
        @media (min-width: 768px) {
          .mission-grid {
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
            gap: clamp(28px, 4.5vw, 64px);
            align-items: start;
          }
        }

        /* Left column: eyebrow pinned to top (aligned with image top edge) */
        .mission-left {
          display: flex;
          flex-direction: column;
          gap: clamp(16px, 2.8vh, 28px);
        }
        @media (min-width: 768px) {
          .mission-left {
            gap: clamp(18px, 2.6vh, 28px);
            padding-top: 2px;
          }
        }
        .mission-left-middle {
          display: flex;
          flex-direction: column;
          gap: clamp(18px, 3.2vh, 34px);
        }
        .mission-bottom {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        @media (max-width: 767px) {
          .mission-bottom { align-items: center; }
        }
        .mission-subline {
          font-family: 'Inter', sans-serif;
          font-size: clamp(0.6rem, 0.85vw, 0.72rem);
          font-weight: 500;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(250,244,236,0.42);
          margin: 0;
        }

        /* ── PILLARS (ROADMAP) ── */
        .mission-pillars {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: clamp(4px, 0.55vw, 7px);
          justify-content: flex-start;
        }
        @media (max-width: 767px) {
          .mission-pillars { justify-content: center; }
        }
        .mission-pill {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.55rem, 0.85vw, 0.68rem);
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #FAF3E1;
          background: rgba(250, 243, 225, 0.10);
          border: 1px solid rgba(250, 243, 225, 0.55);
          border-radius: 999px;
          padding: 4px 10px;
          white-space: nowrap;
          cursor: default;
          transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
        }
        .mission-pill:hover {
          background: rgba(250, 243, 225, 0.20);
          border-color: rgba(250, 243, 225, 0.95);
          transform: translateY(-1px);
        }
        .mission-pill-icon {
          width: 13px;
          height: 13px;
          object-fit: contain;
          filter: brightness(0) saturate(100%) invert(96%) sepia(7%)
                  saturate(382%) hue-rotate(355deg) brightness(101%) contrast(96%);
          opacity: 0.85;
        }

        /* Status dot — done (green) / progress (orange pulsing) / future (red) */
        .pill-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .pill-status-dot.done {
          background: #4ADE80;
          box-shadow: 0 0 6px rgba(74, 222, 128, 0.65);
        }
        .pill-status-dot.progress {
          background: #F59E0B;
          box-shadow: 0 0 7px rgba(245, 158, 11, 0.75);
          animation: dotPulse 1.4s ease-in-out infinite;
        }
        .pill-status-dot.future {
          background: #EF4444;
          box-shadow: 0 0 5px rgba(239, 68, 68, 0.45);
          opacity: 0.75;
        }
        .pill-status-dot.goal {
          background: #8B5CF6;
          box-shadow: 0 0 7px rgba(139, 92, 246, 0.75);
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 7px rgba(245, 158, 11, 0.85); }
          50%      { opacity: 0.55; transform: scale(0.78); box-shadow: 0 0 4px rgba(245, 158, 11, 0.45); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pill-status-dot.progress { animation: none; }
        }

        /* Force row break after The App (pill #3) so The Mission starts row 2 */
        .pill-row-break {
          flex-basis: 100%;
          height: 0;
        }

        /* Roadmap connector — papyrus "···" inline */
        .pill-connector {
          display: inline-flex;
          align-items: center;
          font-family: 'Inter', sans-serif;
          font-size: clamp(0.55rem, 0.85vw, 0.7rem);
          color: rgba(250, 244, 236, 0.30);
          letter-spacing: 0.22em;
          padding: 0 2px;
          user-select: none;
          pointer-events: none;
        }

        /* Tooltip on hover */
        .pill-tooltip {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          width: clamp(220px, 22vw, 280px);
          background: rgba(14, 11, 7, 0.97);
          border: 1px solid rgba(201, 154, 63, 0.40);
          border-radius: 8px;
          padding: 9px 13px;
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          font-weight: 400;
          line-height: 1.45;
          letter-spacing: 0.01em;
          text-transform: none;
          color: rgba(250, 244, 236, 0.92);
          white-space: normal;
          text-align: left;
          z-index: 20;
          pointer-events: none;
          box-shadow:
            0 10px 28px rgba(0, 0, 0, 0.55),
            0 0 0 1px rgba(201, 154, 63, 0.10);
          animation: tooltipFade 0.18s ease-out;
        }
        .pill-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: rgba(201, 154, 63, 0.40);
        }
        @keyframes tooltipFade {
          from { opacity: 0; transform: translate(-50%, 4px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }

        /* ── SQUARE COMPARISON ── */
        .square-frame {
          position: relative;
          width: 100%;
          max-width: min(62vh, 560px);
          aspect-ratio: 1 / 1;
          border-radius: 14px;
          overflow: hidden;
          box-shadow:
            0 0 72px rgba(201,154,63,0.22),
            0 0 0 1px rgba(250,244,236,0.10) inset;
          margin: 0 auto;
        }
        @media (max-width: 767px) {
          .square-frame { max-width: min(44vh, 300px); }
        }
        .square-label {
          position: absolute;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.62rem, 0.95vw, 0.78rem);
          font-weight: 700;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          z-index: 4;
          text-shadow: 0 1px 8px rgba(0,0,0,0.85);
        }
        .square-label.today {
          top: 14px;
          left: 14px;
          color: rgba(250,244,236,0.72);
        }
        .square-label.dogypt {
          bottom: 14px;
          right: 14px;
          color: #F5C73D;
          text-shadow: 0 1px 8px rgba(0,0,0,0.85), 0 0 14px rgba(245,199,61,0.45);
        }

        /* ── CTA — same DNA as /heroglyph ── */
        .mission-cta {
          padding: clamp(11px, 1.7vh, 15px) clamp(28px, 4.4vw, 44px);
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250, 244, 236, 0.40);
          border-radius: 8px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.84rem, 1.2vw, 0.98rem);
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
          transition: transform 0.2s, box-shadow 0.25s;
          animation: missionCtaPulse 3.2s ease-in-out infinite;
          align-self: flex-start;
        }
        @media (max-width: 767px) {
          .mission-cta { align-self: center; }
        }
        .mission-cta:hover {
          transform: scale(1.05);
          box-shadow:
            0 0 36px rgba(255, 215, 110, 0.85),
            0 0 90px rgba(230, 158, 26, 0.70),
            0 0 150px rgba(230, 158, 26, 0.40),
            inset 0 1px 0 rgba(255, 255, 255, 0.55);
        }
        .mission-cta:active { transform: scale(0.98); }
        @keyframes missionCtaPulse {
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
          .mission-cta { animation: none; }
        }

        /* ── Eyebrow / overline ── */
        .eyebrow {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.62rem, 0.95vw, 0.74rem);
          letter-spacing: 0.36em;
          color: rgba(250,244,236,0.45);
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .eyebrow::before {
          content: '';
          height: 1px;
          width: clamp(20px, 3vw, 32px);
          background: rgba(201,154,63,0.45);
        }
      `}</style>

      {/* Top logo */}
      <div
        className="flex-shrink-0 flex justify-center pt-3 pb-1 md:pt-4 md:pb-2 relative"
        style={{ zIndex: 2 }}
      >
        <img src={dogyptLogo} alt="DOGYPT" className="h-7 md:h-10 object-contain" />
      </div>

      {/* Main 2-col area */}
      <div
        className="flex-1 flex items-center justify-center px-5 md:px-10 relative min-h-0"
        style={{ zIndex: 2 }}
      >
        <div className="mission-grid">
          {/* ── LEFT: 3-group flex (top eyebrow / middle group / bottom CTA) ── */}
          <div
            className="mission-left"
            style={{
              textAlign: isMobile ? 'center' : 'left',
              alignItems: isMobile ? 'center' : 'flex-start',
            }}
          >
            {/* TOP — aligns with top edge of square */}
            <span className="eyebrow">The Vision</span>

            {/* MIDDLE — headline + para + pillars, grouped with own gap */}
            <div
              className="mission-left-middle"
              style={{ alignItems: isMobile ? 'center' : 'flex-start' }}
            >
              <div className="mission-headline">
                <h1
                  className="headline-main"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontWeight: 700,
                    fontSize: 'clamp(2.4rem, 5.4vw, 4.2rem)',
                    letterSpacing: '0.02em',
                    lineHeight: 0.98,
                    margin: 0,
                    textTransform: 'uppercase',
                  }}
                >
                  <span
                    style={{
                      background:
                        'linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter:
                        'drop-shadow(0 0 22px rgba(245,199,61,0.42)) drop-shadow(0 0 7px rgba(230,158,26,0.5))',
                    }}
                  >
                    Imagine
                  </span>
                  <br />
                  <span style={{ color: '#FAF4EC' }}>A World</span>
                </h1>
                <p
                  className="headline-sub"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontStyle: 'italic',
                    fontWeight: 500,
                    fontSize: 'clamp(1.15rem, 2.2vw, 1.7rem)',
                    letterSpacing: '0.04em',
                    color: 'rgba(250,244,236,0.90)',
                    textTransform: 'none',
                    margin: '8px 0 0',
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Built By Doglovers.
                </p>
              </div>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 'clamp(0.85rem, 1.15vw, 0.98rem)',
                  fontWeight: 400,
                  color: 'rgba(250,244,236,0.78)',
                  lineHeight: 1.65,
                  letterSpacing: '0.005em',
                  margin: 0,
                  maxWidth: 480,
                }}
              >
                Beyond borders and politics — doglovers are Earth's kindest hidden force, the ones who always chose animals and nature. Together, we'll save millions, fix the system, change the world.
              </p>

              <div className="mission-pillars">
                {PILLARS.map((p, i) => (
                  <Fragment key={p.label}>
                    <div
                      className="mission-pill"
                      onMouseEnter={() => setHoveredPill(i)}
                      onMouseLeave={() =>
                        setHoveredPill((prev) => (prev === i ? null : prev))
                      }
                    >
                      <span className={`pill-status-dot ${p.status}`} aria-hidden />
                      <img src={p.icon} alt="" className="mission-pill-icon" />
                      {p.label}
                      {hoveredPill === i && (
                        <div className="pill-tooltip" role="tooltip">
                          {p.tooltip}
                        </div>
                      )}
                    </div>
                    {i === 2 && <span className="pill-row-break" aria-hidden />}
                  </Fragment>
                ))}
              </div>
            </div>

            {/* BOTTOM — CTA + subline */}
            <div className="mission-bottom">
              <button onClick={() => navigate('/heroglyph')} className="mission-cta">
                Become Dogyptian
              </button>
              <p className="mission-subline">Doglovers, assemble.</p>
            </div>
          </div>

          {/* ── RIGHT: image comparison slider ── */}
          <div className="square-frame" aria-label="Day One vs One Day">
            <ImageComparisonSlider
              leftImage="/images/mission/shelter-before.png"
              rightImage="/images/mission/shelter-after.png"
              altLeft="Day One — overwhelmed dog shelter"
              altRight="One Day — Dogypt Center"
              initialPosition={50}
              handleLogo="/images/mission/dogypt-circle-logo.png"
            />
            <div className="square-label today">Day One</div>
            <div className="square-label dogypt">One Day</div>
          </div>
        </div>
      </div>

    </div>
  );
}
