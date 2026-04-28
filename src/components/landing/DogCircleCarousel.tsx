import type { CSSProperties } from 'react';
import dogPhoto from '@/assets/hero-dog-placeholder.jpeg';

// Three concentric symmetric rings of dog photos, à la cosmos.so.
// Each ring rotates as a whole; cards counter-rotate to stay upright,
// with a slight per-card tilt for organic feel.
type Ring = {
  count: number;
  radius: number;        // % of scene size
  cardSize: number;      // px (desktop) — base width
  duration: number;      // s — full rotation
  direction: 1 | -1;     // rotation direction
  startAngle: number;    // deg — initial offset
  tiltVariance: number;  // deg — random tilt range
  peakOpacity: number;
  zIndex: number;
};

const RINGS: Ring[] = [
  { count: 8,  radius: 16, cardSize: 90,  duration: 70,  direction:  1, startAngle: 0,  tiltVariance: 10, peakOpacity: 0.55, zIndex: 3 }, // inner — small, faint
  { count: 12, radius: 30, cardSize: 120, duration: 95,  direction: -1, startAngle: 15, tiltVariance: 12, peakOpacity: 0.78, zIndex: 4 }, // middle
  { count: 16, radius: 46, cardSize: 150, duration: 120, direction:  1, startAngle: 8,  tiltVariance: 14, peakOpacity: 0.95, zIndex: 5 }, // outer — large, vivid
];

// Deterministic pseudo-random for stable per-card variance.
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const ASPECTS = [0.92, 1.08, 1.0, 1.18, 0.88, 1.12];
const OBJECT_POSITIONS = ['50% 35%', '45% 40%', '55% 38%', '48% 42%', '52% 36%'];

export function DogCircleCarousel() {
  return (
    <div
      className="dog-rings-root pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        .dog-rings-root { contain: layout paint style; }

        @keyframes dog-ring-spin-cw {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes dog-ring-spin-ccw {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes dog-card-counter-cw {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(var(--r)) rotate(var(--tilt)); }
          to   { transform: translate(-50%, -50%) rotate(-360deg) translateX(var(--r)) rotate(var(--tilt)); }
        }
        @keyframes dog-card-counter-ccw {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(var(--r)) rotate(var(--tilt)); }
          to   { transform: translate(-50%, -50%) rotate(360deg) translateX(var(--r)) rotate(var(--tilt)); }
        }

        .dog-scene {
          --scene: clamp(1100px, 130vw, 1700px);
          position: absolute;
          top: 50%;
          left: 50%;
          width: var(--scene);
          height: var(--scene);
          transform: translate(-50%, -50%);
        }

        .dog-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          will-change: transform;
        }
        .dog-ring.cw  { animation: dog-ring-spin-cw  var(--dur) linear infinite; }
        .dog-ring.ccw { animation: dog-ring-spin-ccw var(--dur) linear infinite; }

        .dog-card-wrap {
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 0;
          transform-origin: 0 0;
        }
        /* Each card sits on the ring; its inner element counter-rotates so
           the photo stays upright while the ring spins. */
        .dog-card {
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 18px;
          overflow: hidden;
          opacity: var(--peak);
          box-shadow:
            0 14px 34px rgba(0,0,0,0.55),
            0 3px 8px rgba(0,0,0,0.35);
          will-change: transform;
          backface-visibility: hidden;
        }
        .dog-card.cw  { animation: dog-card-counter-cw  var(--dur) linear infinite; }
        .dog-card.ccw { animation: dog-card-counter-ccw var(--dur) linear infinite; }

        .dog-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        @media (max-width: 768px) {
          .dog-scene { --scene: clamp(820px, 180vw, 1200px); }
          .dog-card { border-radius: 14px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .dog-ring, .dog-card { animation: none !important; }
        }
      `}</style>

      <div className="dog-scene">
        {RINGS.map((ring, ringIdx) => {
          const ringClass = ring.direction === 1 ? 'cw' : 'ccw';
          const cardClass = ring.direction === 1 ? 'cw' : 'ccw';
          const ringStyle = {
            '--dur': `${ring.duration}s`,
            zIndex: ring.zIndex,
          } as CSSProperties;

          return (
            <div key={ringIdx} className={`dog-ring ${ringClass}`} style={ringStyle}>
              {Array.from({ length: ring.count }, (_, i) => {
                const angle = ring.startAngle + (360 / ring.count) * i;
                const seed = ringIdx * 100 + i;
                const r = rand(seed);
                const aspect = ASPECTS[i % ASPECTS.length];
                const tilt = (rand(seed + 1) * 2 - 1) * ring.tiltVariance;
                const sizeJitter = 0.85 + rand(seed + 2) * 0.3; // 0.85–1.15
                const w = ring.cardSize * sizeJitter;
                const h = w * aspect;
                const objPos = OBJECT_POSITIONS[i % OBJECT_POSITIONS.length];

                // Wrap places the card at the correct angle around the ring;
                // .dog-card then translates outward by --r and counter-rotates.
                const wrapStyle = {
                  transform: `rotate(${angle}deg)`,
                } as CSSProperties;

                const cardStyle = {
                  '--r': `calc(var(--scene) * ${ring.radius / 100})`,
                  '--tilt': `${tilt}deg`,
                  '--peak': `${ring.peakOpacity}`,
                  '--dur': `${ring.duration}s`,
                  width: `${w}px`,
                  height: `${h}px`,
                  marginLeft: `${-w / 2}px`,
                  marginTop: `${-h / 2}px`,
                } as CSSProperties;

                return (
                  <div key={i} className="dog-card-wrap" style={wrapStyle}>
                    <div className={`dog-card ${cardClass}`} style={cardStyle}>
                      <img
                        src={dogPhoto}
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                        loading="eager"
                        decoding="async"
                        style={{ objectPosition: objPos }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
