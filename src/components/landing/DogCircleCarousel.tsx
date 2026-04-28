import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

// Pool of varied dog portraits from Unsplash. Each card picks a different one so
// no two visible photos repeat side-by-side. Sized to ~400px to keep payload light.
const DOG_PHOTOS = [
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583511655802-41f6ff9d5dc7?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1546238232-20216dec9f72?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1605897472359-85e4b94c5b3a?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1444212477490-ca407925329e?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1532009324734-20a7a5813719?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551730459-92db2a308d6a?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1597633425046-08f5110420b5?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583390999d39-7fef34cb2c3e?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583512603806-077fc70b8a9c?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1577175025007-ff5dab081e98?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583336663277-620dc1996580?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1546975490-a79bbc91f3b5?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494947665470-20322015e3a8?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1602250797626-5f4f4ff6c5be?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583337130417-2346a1be7dee?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518155317743-a8ff43ea6a5f?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1577175025007-ff5dab081e98?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583511666445-775f1f2116f5?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1567014543648-e4391c989aab?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500995617113-cf789362a3e1?w=400&q=70&auto=format&fit=crop',
];

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
  // Spiral "snail": 4 concentric rings with progressively growing radius, card size, and count.
  // All rings rotate the same direction at slightly different speeds so the pattern reads as
  // one continuous spiral rather than independent orbits. Outer & inner spin ~15% faster
  // than the middle pair. Sizes/radii are tuned so neighbouring rings *touch* (no visible gap).
  { count: 6,  radius: 8,  width: 56,  height: 72,  duration: 70, direction: 1, startAngle: 0,  opacity: 1, zIndex: 6 },
  { count: 10, radius: 19, width: 80,  height: 102, duration: 82, direction: 1, startAngle: 12, opacity: 1, zIndex: 5 },
  { count: 14, radius: 32, width: 104, height: 132, duration: 82, direction: 1, startAngle: 24, opacity: 1, zIndex: 4 },
  { count: 18, radius: 47, width: 132, height: 168, duration: 70, direction: 1, startAngle: 36, opacity: 1, zIndex: 3 },
];

// Mobile: fewer cards per ring → bigger gaps between photos so the spiral can breathe.
// Sizes are slightly smaller so the layout still reads as a tight snail, just airier.
const RINGS_MOBILE: Ring[] = [
  // Smaller cards but more of them per ring → fills dark gaps without crowding.
  { count: 6,  radius: 8,  width: 36,  height: 46,  duration: 70, direction: 1, startAngle: 0,  opacity: 1, zIndex: 6 },
  { count: 9,  radius: 19, width: 50,  height: 64,  duration: 82, direction: 1, startAngle: 18, opacity: 1, zIndex: 5 },
  { count: 12, radius: 32, width: 64,  height: 82,  duration: 82, direction: 1, startAngle: 28, opacity: 1, zIndex: 4 },
  { count: 16, radius: 47, width: 80,  height: 102, duration: 70, direction: 1, startAngle: 36, opacity: 1, zIndex: 3 },
];

const TILT_PATTERN = [-12, -7, -3, 4, 8, 12, 6, -5];
const OBJECT_POSITIONS = ['50% 34%', '48% 40%', '54% 37%', '46% 42%'];

export function DogCircleCarousel() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const rings = isMobile ? RINGS_MOBILE : RINGS;

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
        .dog-ring.cw  { animation: dog-ring-spin-cw  calc(var(--dur) / var(--speed, 1)) linear infinite; }
        .dog-ring.ccw { animation: dog-ring-spin-ccw calc(var(--dur) / var(--speed, 1)) linear infinite; }

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
        .dog-card-upright.cw  { animation: dog-card-upright-cw  calc(var(--dur) / var(--speed, 1)) linear infinite; }
        .dog-card-upright.ccw { animation: dog-card-upright-ccw calc(var(--dur) / var(--speed, 1)) linear infinite; }

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
        {rings.map((ring, ringIdx) => {
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
                // Spread photos across rings so neighbours never repeat.
                const photoIdx =
                  (ringIdx * 7 + i * 3) % DOG_PHOTOS.length;
                const photo = DOG_PHOTOS[photoIdx];

                const wrapStyle = {
                  transform: `rotate(${angle}deg) translateX(calc(var(--scene) * ${ring.radius / 100}))`,
                } as CSSProperties;

                // Orient card edge toward center: rotate -90° relative to the radial direction.
                // The wrap is rotated by `angle`; counter-rotate the upright by the same angle so
                // each card faces the center regardless of its orbital position. We bake that
                // orientation into the card tilt instead of using the spin-counter animation.
                const cardStyle = {
                  '--tilt': `${tilt - 90}deg`,
                  '--opacity': `${ring.opacity}`,
                  '--dur': `${ring.duration}s`,
                  '--w': `${w}px`,
                  '--h': `${h}px`,
                } as CSSProperties;

                return (
                  <div key={i} className="dog-card-wrap" style={wrapStyle}>
                    <div className="dog-card" style={cardStyle}>
                      <div className="dog-card-visual">
                        <img
                          src={photo}
                          alt=""
                          aria-hidden="true"
                          draggable={false}
                          loading="lazy"
                          decoding="async"
                          style={{ objectPosition: objPos }}
                        />
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
