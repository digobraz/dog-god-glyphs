import type { CSSProperties } from 'react';
import dogPhoto from '@/assets/hero-dog-placeholder.jpeg';

// cosmos.so-like spiral: small near center, larger at edges, fading into the
// background gradient. No frames/borders — just rounded photo tiles.
const TOTAL_ITEMS = 36;
const TOTAL_TURNS = 4.25;
const START_RADIUS_RATIO = 0.06;
const END_RADIUS_RATIO = 0.52;

export function DogCircleCarousel() {
  const items = Array.from({ length: TOTAL_ITEMS }, (_, i) => {
    const t = i / (TOTAL_ITEMS - 1);
    // ease-out so density is higher near the center
    const eased = Math.pow(t, 0.78);
    const angle = -110 + eased * 360 * TOTAL_TURNS;
    const radiusRatio = START_RADIUS_RATIO + eased * (END_RADIUS_RATIO - START_RADIUS_RATIO);
    // small in the middle, big on the outside (like cosmos.so)
    const sizePx = 44 + eased * 168; // 44 → 212
    // fade out as photos approach the center so they vanish behind the text
    const opacity = 0.18 + eased * 0.78; // 0.18 (center) → 0.96 (edge)
    const blurPx = (1 - eased) * 1.8;
    const delay = i * -0.18;
    const zIndex = i; // bigger (outer) on top

    return { angle, radiusRatio, sizePx, opacity, blurPx, delay, zIndex };
  });

  return (
    <div
      className="dog-spiral-root pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        @keyframes dog-spiral-orbit {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes dog-spiral-counter {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(-360deg); }
        }

        .dog-spiral-root {
          contain: layout paint style;
        }

        /* Soft radial mask so the spiral fades into the background gradient
           and disappears behind the central text — no hard edge. */
        .dog-spiral-mask {
          position: absolute;
          inset: -8%;
          -webkit-mask-image: radial-gradient(
            ellipse 62% 58% at 50% 54%,
            #000 18%,
            rgba(0,0,0,0.85) 38%,
            rgba(0,0,0,0.45) 62%,
            rgba(0,0,0,0) 86%
          );
                  mask-image: radial-gradient(
            ellipse 62% 58% at 50% 54%,
            #000 18%,
            rgba(0,0,0,0.85) 38%,
            rgba(0,0,0,0.45) 62%,
            rgba(0,0,0,0) 86%
          );
        }

        .dog-spiral-scene {
          --scene-size: clamp(1100px, 130vw, 1800px);
          position: absolute;
          top: 52%;
          left: 50%;
          width: var(--scene-size);
          height: var(--scene-size);
          animation: dog-spiral-orbit 38s linear infinite;
          will-change: transform;
        }

        .dog-spiral-node {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          transform-origin: center center;
        }

        /* Counter-rotate so each photo stays upright while the ring spins. */
        .dog-spiral-thumb {
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 22px;
          overflow: hidden;
          background-size: cover;
          background-position: center 34%;
          background-repeat: no-repeat;
          box-shadow: 0 18px 46px hsl(0 0% 0% / 0.45);
          animation: dog-spiral-counter 38s linear infinite;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        @media (max-width: 768px) {
          .dog-spiral-scene {
            --scene-size: clamp(900px, 180vw, 1300px);
            top: 54%;
          }
          .dog-spiral-thumb { border-radius: 16px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .dog-spiral-scene,
          .dog-spiral-thumb {
            animation: none !important;
          }
        }
      `}</style>

      <div className="dog-spiral-mask">
        <div className="dog-spiral-scene">
          {items.map((item, i) => {
            const nodeStyle: CSSProperties = {
              transform: `rotate(${item.angle}deg) translateY(calc(var(--scene-size) * -${item.radiusRatio}))`,
              zIndex: item.zIndex,
            };

            const thumbStyle: CSSProperties = {
              width: `${item.sizePx}px`,
              height: `${item.sizePx}px`,
              opacity: item.opacity,
              filter: `saturate(1.05) contrast(1.05) blur(${item.blurPx}px)`,
              backgroundImage: `url(${dogPhoto})`,
              animationDelay: `${item.delay}s`,
              transform: 'translate(-50%, -50%)',
            };

            return (
              <div key={i} className="dog-spiral-node" style={nodeStyle}>
                <div className="dog-spiral-thumb" style={thumbStyle} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
