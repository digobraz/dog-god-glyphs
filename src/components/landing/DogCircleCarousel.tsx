import dogPhoto from '@/assets/hero-dog-placeholder.jpeg';

/**
 * Rotating SPIRAL of dog photos behind the hero text — cosmos.so style.
 * Multiple full turns of items where the radius grows with index, so the
 * composition reads as a hypnotic spiral, not a single ring.
 *
 * All slots share the same local placeholder image (duplicated) so nothing
 * depends on external URLs.
 */

const TOTAL_ITEMS = 64;          // density of the spiral
const ITEMS_PER_TURN = 11;       // how many slots per full rotation
const BASE_RADIUS_RATIO = 0.12;  // ratio of ring size, innermost slot
const RADIUS_STEP_RATIO = 0.014; // growth per slot — controls spiral tightness

export function DogCircleCarousel() {
  const items = Array.from({ length: TOTAL_ITEMS });

  return (
    <div
      className="dog-spiral-wrapper pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <style>{`
        @keyframes dog-spiral-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes dog-spiral-counter {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        .dog-spiral-ring {
          --ring-size: clamp(520px, 92vw, 1100px);
          width: var(--ring-size);
          height: var(--ring-size);
          position: relative;
          animation: dog-spiral-spin 60s linear infinite;
          will-change: transform;
        }
        .dog-spiral-wrapper:hover .dog-spiral-ring,
        .dog-spiral-wrapper:hover .dog-spiral-photo {
          animation-play-state: paused;
        }
        .dog-spiral-slot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          transform-origin: center center;
        }
        .dog-spiral-photo {
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 9999px;
          object-fit: cover;
          background: #1a1208;
          border: 2px solid rgba(196, 155, 66, 0.55);
          box-shadow:
            0 10px 32px rgba(0, 0, 0, 0.55),
            0 0 22px rgba(196, 155, 66, 0.20);
          transform: translate(-50%, -50%);
          animation: dog-spiral-counter 60s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .dog-spiral-ring,
          .dog-spiral-photo {
            animation: none !important;
          }
        }
      `}</style>

      <div className="dog-spiral-ring">
        {items.map((_, i) => {
          // Spiral math: angle accumulates, radius grows linearly with index.
          const angle = (i * 360) / ITEMS_PER_TURN;
          const radiusRatio = BASE_RADIUS_RATIO + i * RADIUS_STEP_RATIO;

          // Size shrinks slightly toward the outside for depth.
          const t = i / TOTAL_ITEMS; // 0 -> 1
          const sizePx = 116 - t * 56; // 116px innermost -> ~60px outermost
          const opacity = 0.95 - t * 0.5; // fade outer edges

          return (
            <div
              key={i}
              className="dog-spiral-slot"
              style={{
                transform: `rotate(${angle}deg) translateY(calc(var(--ring-size) * -${radiusRatio}))`,
              }}
            >
              <img
                className="dog-spiral-photo"
                src={dogPhoto}
                alt=""
                loading="eager"
                decoding="async"
                style={{
                  width: `${sizePx}px`,
                  height: `${sizePx}px`,
                  opacity,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
