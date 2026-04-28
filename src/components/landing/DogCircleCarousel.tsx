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
  { count: 8, radius: 18, width: 84, height: 108, duration: 64, direction: 1, startAngle: -8, opacity: 1, zIndex: 3 },
  { count: 12, radius: 33, width: 112, height: 142, duration: 88, direction: 1, startAngle: 6, opacity: 1, zIndex: 4 },
  { count: 16, radius: 49, width: 146, height: 186, duration: 114, direction: 1, startAngle: 18, opacity: 1, zIndex: 5 },
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
        @keyframes dog-card-upright-cw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes dog-card-upright-ccw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
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
        .dog-card {
          position: absolute;
          top: 0;
          left: 0;
          width: var(--w);
          height: var(--h);
          transform: translate(-50%, -50%) rotate(var(--tilt));
          will-change: transform;
        }

        .dog-card-upright {
          width: 100%;
          height: 100%;
          will-change: transform;
        }
        .dog-card-upright.cw  { animation: dog-card-upright-cw  var(--dur) linear infinite; }
        .dog-card-upright.ccw { animation: dog-card-upright-ccw var(--dur) linear infinite; }

        .dog-card-visual {
          width: 100%;
          height: 100%;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 18px 40px rgba(0,0,0,0.44),
            0 4px 12px rgba(0,0,0,0.3);
          opacity: var(--opacity);
          will-change: opacity;
          backface-visibility: hidden;
        }

        .dog-card-visual img {
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
                  transform: `rotate(${angle}deg) translateX(calc(var(--scene) * ${ring.radius / 100}))`,
                } as CSSProperties;

                const cardStyle = {
                  '--tilt': `${tilt}deg`,
                  '--opacity': `${ring.opacity}`,
                  '--dur': `${ring.duration}s`,
                  '--w': `${w}px`,
                  '--h': `${h}px`,
                } as CSSProperties;

                return (
                  <div key={i} className="dog-card-wrap" style={wrapStyle}>
                    <div className="dog-card" style={cardStyle}>
                      <div className={`dog-card-upright ${cardClass}`} style={{ '--dur': `${ring.duration}s` } as CSSProperties}>
                        <div className="dog-card-visual">
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
