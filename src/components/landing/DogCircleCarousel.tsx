import type { CSSProperties } from 'react';
import dogPhoto from '@/assets/hero-dog-placeholder.jpeg';

type Ring = {
  count: number;
  radius: number;
  width: number;
  height: number;
  duration: number;
  direction: 1 | -1;
  startAngle: number;
  opacity: number;
  zIndex: number;
};

const RINGS: Ring[] = [
  { count: 8, radius: 18, width: 84, height: 108, duration: 64, direction: 1, startAngle: 0, opacity: 0.34, zIndex: 3 },
  { count: 12, radius: 33, width: 112, height: 142, duration: 88, direction: 1, startAngle: 15, opacity: 0.56, zIndex: 4 },
  { count: 16, radius: 49, width: 146, height: 186, duration: 114, direction: 1, startAngle: 8, opacity: 0.82, zIndex: 5 },
];

const TILT_PATTERN = [-12, -7, -3, 4, 8, 12, 6, -5];
const OBJECT_POSITIONS = ['50% 34%', '48% 40%', '54% 37%', '46% 42%'];

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
          border-radius: 20px;
          overflow: hidden;
          opacity: var(--opacity);
          box-shadow:
            0 18px 40px rgba(0,0,0,0.44),
            0 4px 12px rgba(0,0,0,0.3);
          will-change: transform;
          backface-visibility: hidden;
          filter: saturate(0.9);
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
          .dog-card { border-radius: 16px; }
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
                const tilt = TILT_PATTERN[(ringIdx * 3 + i) % TILT_PATTERN.length];
                const w = ring.width;
                const h = ring.height;
                const objPos = OBJECT_POSITIONS[i % OBJECT_POSITIONS.length];

                const wrapStyle = {
                  transform: `rotate(${angle}deg)`,
                } as CSSProperties;

                const cardStyle = {
                  '--r': `calc(var(--scene) * ${ring.radius / 100})`,
                  '--tilt': `${tilt}deg`,
                  '--opacity': `${ring.opacity}`,
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
