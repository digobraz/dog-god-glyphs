import type { CSSProperties } from 'react';
import dogPhoto from '@/assets/hero-dog-placeholder.jpeg';

const TOTAL_ITEMS = 28;
const TOTAL_TURNS = 3.75;
const START_RADIUS_RATIO = 0.14;
const END_RADIUS_RATIO = 0.78;

export function DogCircleCarousel() {
  const items = Array.from({ length: TOTAL_ITEMS }, (_, i) => {
    const t = i / (TOTAL_ITEMS - 1);
    const eased = Math.pow(t, 0.92);
    const angle = -110 + eased * 360 * TOTAL_TURNS;
    const radiusRatio = START_RADIUS_RATIO + eased * (END_RADIUS_RATIO - START_RADIUS_RATIO);
    const sizePx = 138 - eased * 78;
    const opacity = 1 - eased * 0.42;
    const brightness = 1.18 - eased * 0.12;
    const scale = 1 - eased * 0.18;

    return { angle, radiusRatio, sizePx, opacity, brightness, scale, delay: i * -0.22, zIndex: TOTAL_ITEMS - i };
  });

  return (
    <div
      className="dog-spiral-root pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        @keyframes dog-spiral-orbit {
          from { transform: translate(-50%, -50%) rotate(0deg) scale(1.04); }
          to { transform: translate(-50%, -50%) rotate(360deg) scale(1.04); }
        }

        @keyframes dog-spiral-breathe {
          0%, 100% { transform: translate(-50%, -50%) scale(var(--thumb-scale, 1)); }
          50% { transform: translate(-50%, -50%) scale(calc(var(--thumb-scale, 1) + 0.035)); }
        }

        .dog-spiral-root {
          contain: layout paint style;
        }

        .dog-spiral-scene {
          --scene-size: clamp(920px, 112vw, 1500px);
          position: absolute;
          top: 54%;
          left: 50%;
          width: var(--scene-size);
          height: var(--scene-size);
          animation: dog-spiral-orbit 22s linear infinite;
          will-change: transform;
        }

        .hero-spiral-host:hover .dog-spiral-scene,
        .hero-spiral-host:hover .dog-spiral-thumb {
          animation-play-state: paused;
        }

        .dog-spiral-node {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          transform-origin: center center;
        }

        .dog-spiral-thumb {
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 9999px;
          overflow: hidden;
          background-size: cover;
          background-position: center 34%;
          background-repeat: no-repeat;
          border: 2px solid hsl(var(--primary) / 0.62);
          box-shadow:
            0 0 0 1px hsl(var(--papyrus) / 0.18),
            0 14px 36px hsl(0 0% 0% / 0.5),
            0 0 26px hsl(var(--primary) / 0.24);
          animation: dog-spiral-breathe 5.5s ease-in-out infinite;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        .dog-spiral-thumb::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 40% 30%, hsl(var(--papyrus) / 0.18), transparent 38%),
            linear-gradient(180deg, transparent 35%, hsl(0 0% 0% / 0.16) 100%);
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .dog-spiral-scene {
            --scene-size: clamp(760px, 160vw, 1100px);
            top: 56%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dog-spiral-scene,
          .dog-spiral-thumb {
            animation: none !important;
          }
        }
      `}</style>

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
            filter: `saturate(1.1) contrast(1.08) brightness(${item.brightness})`,
            backgroundImage: `linear-gradient(135deg, hsl(var(--papyrus) / 0.08), transparent 65%), url(${dogPhoto})`,
            animationDelay: `${item.delay}s`,
            ['--thumb-scale' as string]: String(item.scale),
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
  );
}
