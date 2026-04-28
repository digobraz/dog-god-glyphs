import type { CSSProperties } from 'react';
import dogPhoto from '@/assets/hero-dog-placeholder.jpeg';

// Free-floating cards spread across the hero, à la cosmos.so.
// Positions are hand-tuned so cards live around the edges (avoiding the
// central headline area), with size, tilt, float distance and timing varying
// per card to feel organic — not on a ring.
type FloatItem = {
  id: number;
  // viewport-relative coordinates of the card center
  top: string;
  left: string;
  width: number;       // px (desktop)
  aspect: number;      // height = width * aspect
  tilt: number;        // deg
  floatX: number;      // px drift
  floatY: number;      // px drift
  duration: number;    // s — float loop
  delay: number;       // s — float offset
  fadeDuration: number;// s — opacity loop
  fadeDelay: number;   // s — opacity offset
  peakOpacity: number; // 0..1
  objectPosition: string;
  zIndex: number;
};

const FLOAT_ITEMS: FloatItem[] = [
  // top band
  { id: 1,  top: '8%',  left: '6%',  width: 150, aspect: 1.15, tilt: -14, floatX: 18, floatY: 22, duration: 14, delay: 0,    fadeDuration: 11, fadeDelay: 0,    peakOpacity: 0.85, objectPosition: '50% 35%', zIndex: 5 },
  { id: 2,  top: '4%',  left: '22%', width: 110, aspect: 0.9,  tilt: 9,   floatX: -14, floatY: 18, duration: 16, delay: -3,  fadeDuration: 13, fadeDelay: -2,  peakOpacity: 0.7,  objectPosition: '40% 40%', zIndex: 4 },
  { id: 3,  top: '12%', left: '38%', width: 90,  aspect: 1.2,  tilt: -6,  floatX: 12,  floatY: -16, duration: 13, delay: -5, fadeDuration: 10, fadeDelay: -4,  peakOpacity: 0.55, objectPosition: '55% 30%', zIndex: 3 },
  { id: 4,  top: '6%',  left: '58%', width: 100, aspect: 1.0,  tilt: 12,  floatX: -16, floatY: 14, duration: 15, delay: -1,  fadeDuration: 12, fadeDelay: -6,  peakOpacity: 0.6,  objectPosition: '50% 45%', zIndex: 3 },
  { id: 5,  top: '3%',  left: '74%', width: 130, aspect: 0.95, tilt: -10, floatX: 20,  floatY: 16, duration: 17, delay: -7,  fadeDuration: 14, fadeDelay: -1,  peakOpacity: 0.78, objectPosition: '45% 38%', zIndex: 4 },
  { id: 6,  top: '10%', left: '90%', width: 160, aspect: 1.1,  tilt: 8,   floatX: -22, floatY: 20, duration: 15, delay: -4,  fadeDuration: 12, fadeDelay: -3,  peakOpacity: 0.9,  objectPosition: '52% 32%', zIndex: 6 },

  // upper-mid band
  { id: 7,  top: '26%', left: '2%',  width: 140, aspect: 1.05, tilt: -8,  floatX: 16,  floatY: -18, duration: 16, delay: -2, fadeDuration: 13, fadeDelay: -5,  peakOpacity: 0.82, objectPosition: '45% 40%', zIndex: 5 },
  { id: 8,  top: '32%', left: '14%', width: 95,  aspect: 1.18, tilt: 11,  floatX: -10, floatY: 14,  duration: 13, delay: -6, fadeDuration: 11, fadeDelay: 0,   peakOpacity: 0.5,  objectPosition: '50% 35%', zIndex: 3 },
  { id: 9,  top: '28%', left: '82%', width: 105, aspect: 0.92, tilt: -12, floatX: 18,  floatY: 16,  duration: 14, delay: -8, fadeDuration: 12, fadeDelay: -2,  peakOpacity: 0.6,  objectPosition: '55% 42%', zIndex: 4 },
  { id: 10, top: '24%', left: '94%', width: 120, aspect: 1.08, tilt: 7,   floatX: -14, floatY: -20, duration: 15, delay: -3, fadeDuration: 13, fadeDelay: -7,  peakOpacity: 0.78, objectPosition: '48% 38%', zIndex: 5 },

  // mid band (kept far from center to avoid headline)
  { id: 11, top: '50%', left: '-2%', width: 145, aspect: 1.0,  tilt: -9,  floatX: 22,  floatY: 18,  duration: 17, delay: -5, fadeDuration: 14, fadeDelay: -1,  peakOpacity: 0.86, objectPosition: '50% 40%', zIndex: 6 },
  { id: 12, top: '46%', left: '12%', width: 95,  aspect: 1.22, tilt: 13,  floatX: -12, floatY: -16, duration: 14, delay: -1, fadeDuration: 12, fadeDelay: -4,  peakOpacity: 0.55, objectPosition: '45% 35%', zIndex: 3 },
  { id: 13, top: '54%', left: '88%', width: 100, aspect: 0.95, tilt: -11, floatX: 16,  floatY: 14,  duration: 15, delay: -7, fadeDuration: 12, fadeDelay: -2,  peakOpacity: 0.6,  objectPosition: '52% 38%', zIndex: 4 },
  { id: 14, top: '48%', left: '96%', width: 155, aspect: 1.1,  tilt: 10,  floatX: -20, floatY: 18,  duration: 16, delay: -4, fadeDuration: 13, fadeDelay: -6,  peakOpacity: 0.9,  objectPosition: '48% 36%', zIndex: 6 },

  // lower-mid band
  { id: 15, top: '70%', left: '4%',  width: 135, aspect: 1.06, tilt: 8,   floatX: 18,  floatY: -16, duration: 15, delay: -2, fadeDuration: 13, fadeDelay: -3,  peakOpacity: 0.82, objectPosition: '50% 42%', zIndex: 5 },
  { id: 16, top: '74%', left: '20%', width: 100, aspect: 0.92, tilt: -12, floatX: -14, floatY: 16,  duration: 14, delay: -5, fadeDuration: 11, fadeDelay: -1,  peakOpacity: 0.6,  objectPosition: '46% 38%', zIndex: 3 },
  { id: 17, top: '78%', left: '78%', width: 115, aspect: 1.18, tilt: 9,   floatX: 16,  floatY: 18,  duration: 16, delay: -3, fadeDuration: 13, fadeDelay: -5,  peakOpacity: 0.7,  objectPosition: '52% 40%', zIndex: 4 },
  { id: 18, top: '72%', left: '92%', width: 145, aspect: 1.0,  tilt: -10, floatX: -18, floatY: -14, duration: 17, delay: -6, fadeDuration: 14, fadeDelay: 0,   peakOpacity: 0.85, objectPosition: '50% 36%', zIndex: 5 },

  // bottom band
  { id: 19, top: '90%', left: '10%', width: 120, aspect: 1.05, tilt: 11,  floatX: 14,  floatY: 18,  duration: 15, delay: -4, fadeDuration: 12, fadeDelay: -2,  peakOpacity: 0.75, objectPosition: '48% 35%', zIndex: 4 },
  { id: 20, top: '94%', left: '32%', width: 90,  aspect: 1.2,  tilt: -8,  floatX: -12, floatY: -16, duration: 13, delay: -1, fadeDuration: 10, fadeDelay: -6,  peakOpacity: 0.55, objectPosition: '50% 40%', zIndex: 3 },
  { id: 21, top: '92%', left: '50%', width: 100, aspect: 0.95, tilt: 6,   floatX: 16,  floatY: 14,  duration: 14, delay: -7, fadeDuration: 11, fadeDelay: -3,  peakOpacity: 0.6,  objectPosition: '54% 38%', zIndex: 3 },
  { id: 22, top: '96%', left: '68%', width: 110, aspect: 1.1,  tilt: -9,  floatX: -14, floatY: 16,  duration: 16, delay: -2, fadeDuration: 13, fadeDelay: -5,  peakOpacity: 0.7,  objectPosition: '46% 42%', zIndex: 4 },
  { id: 23, top: '88%', left: '88%', width: 130, aspect: 1.0,  tilt: 12,  floatX: -16, floatY: -14, duration: 15, delay: -5, fadeDuration: 12, fadeDelay: -1,  peakOpacity: 0.8,  objectPosition: '50% 38%', zIndex: 5 },
];

export function DogCircleCarousel() {
  return (
    <div
      className="dog-spiral-root pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        .dog-spiral-root { contain: layout paint style; }

        @keyframes dog-float {
          0%   { transform: translate(-50%, -50%) translate(0px, 0px) rotate(var(--tilt)); }
          50%  { transform: translate(-50%, -50%) translate(var(--fx), var(--fy)) rotate(calc(var(--tilt) + 4deg)); }
          100% { transform: translate(-50%, -50%) translate(0px, 0px) rotate(var(--tilt)); }
        }

        @keyframes dog-fade {
          0%   { opacity: 0; }
          25%  { opacity: var(--peak); }
          70%  { opacity: var(--peak); }
          100% { opacity: 0; }
        }

        .dog-float-card {
          position: absolute;
          border-radius: 18px;
          overflow: hidden;
          box-shadow:
            0 12px 30px rgba(0,0,0,0.45),
            0 2px 6px rgba(0,0,0,0.3);
          animation: dog-float var(--dur) ease-in-out infinite,
                     dog-fade var(--fade-dur) ease-in-out infinite;
          animation-delay: var(--delay), var(--fade-delay);
          will-change: transform, opacity;
          transform: translate(-50%, -50%) rotate(var(--tilt));
        }

        .dog-float-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        @media (max-width: 768px) {
          .dog-float-card { border-radius: 14px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .dog-float-card { animation: none !important; opacity: var(--peak) !important; }
        }
      `}</style>

      {FLOAT_ITEMS.map((item) => {
        const style = {
          top: item.top,
          left: item.left,
          width: `${item.width}px`,
          height: `${item.width * item.aspect}px`,
          zIndex: item.zIndex,
          '--tilt': `${item.tilt}deg`,
          '--fx': `${item.floatX}px`,
          '--fy': `${item.floatY}px`,
          '--dur': `${item.duration}s`,
          '--delay': `${item.delay}s`,
          '--fade-dur': `${item.fadeDuration}s`,
          '--fade-delay': `${item.fadeDelay}s`,
          '--peak': `${item.peakOpacity}`,
        } as CSSProperties;

        return (
          <div key={item.id} className="dog-float-card" style={style}>
            <img
              src={dogPhoto}
              alt=""
              aria-hidden="true"
              className="dog-float-image"
              draggable={false}
              loading="eager"
              decoding="async"
              style={{ objectPosition: item.objectPosition }}
            />
          </div>
        );
      })}
    </div>
  );
}
