import type { CSSProperties } from 'react';
import dogPhoto from '@/assets/hero-dog-placeholder.jpeg';

const TOTAL_ITEMS = 26;
const LOOP_DURATION = 22;

const spiralItems = Array.from({ length: TOTAL_ITEMS }, (_, i) => {
  const slot = i / TOTAL_ITEMS;
  const wave = (Math.sin(slot * Math.PI * 2) + 1) / 2;

  return {
    id: i,
    fromAngle: -150 + slot * 150,
    toAngle: 390 + slot * 150 + wave * 22,
    delay: -(slot * LOOP_DURATION),
    size: 84 + wave * 54,
    aspect: [0.82, 1.08, 0.92, 1.2][i % 4],
    tilt: [-19, -12, -7, 9, 14, 18][i % 6],
    peakOpacity: 0.42 + wave * 0.34,
    objectPosition: `${50 + ((i % 5) - 2) * 4}% ${34 + (i % 4) * 3}%`,
    zIndex: i + 1,
  };
});

export function DogCircleCarousel() {
  return (
    <div
      className="dog-spiral-root pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        @keyframes dog-spiral-flow {
          0% {
            transform: translate(-50%, -50%) rotate(var(--from-angle)) translateY(calc(var(--scene-size) * -0.055));
          opacity: 0;
          }
          10% {
            opacity: 0;
          }
          22% {
            opacity: calc(var(--peak-opacity) * 0.45);
          }
          62% {
            opacity: var(--peak-opacity);
          }
          86% {
            opacity: calc(var(--peak-opacity) * 0.78);
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--to-angle)) translateY(calc(var(--scene-size) * -0.72));
            opacity: 0;
          }
        }

        @keyframes dog-spiral-card-life {
          0% {
            transform: translate(-50%, -50%) rotate(var(--tilt)) scale(0.16);
            opacity: 0;
            filter: blur(3px) saturate(0.9);
          }
          20% {
            transform: translate(-50%, -50%) rotate(var(--tilt)) scale(0.24);
            opacity: 0.24;
            filter: blur(1.8px) saturate(0.94);
          }
          58% {
            transform: translate(-50%, -50%) rotate(var(--tilt)) scale(0.68);
            opacity: 0.88;
            filter: blur(0.6px) saturate(1);
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--tilt)) scale(1.08);
            opacity: 0;
            filter: blur(0px) saturate(1.02);
          }
        }

        .dog-spiral-root {
          contain: layout paint style;
        }

        .dog-spiral-mask {
          position: absolute;
          inset: -8%;
          -webkit-mask-image: radial-gradient(
            ellipse 74% 68% at 50% 54%,
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0) 16%,
            rgba(0,0,0,0.92) 29%,
            #000 72%,
            rgba(0,0,0,0.15) 92%,
            rgba(0,0,0,0) 100%
          );
          mask-image: radial-gradient(
            ellipse 74% 68% at 50% 54%,
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0) 16%,
            rgba(0,0,0,0.92) 29%,
            #000 72%,
            rgba(0,0,0,0.15) 92%,
            rgba(0,0,0,0) 100%
          );
        }

        .dog-spiral-scene {
          --scene-size: clamp(1120px, 136vw, 1760px);
          position: absolute;
          top: 52%;
          left: 50%;
          width: var(--scene-size);
          height: var(--scene-size);
        }

        .dog-spiral-track {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          animation: dog-spiral-flow ${LOOP_DURATION}s linear infinite;
          will-change: transform, opacity;
        }

        .dog-spiral-card {
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 10px 30px hsl(var(--foreground) / 0.08);
          animation: dog-spiral-card-life ${LOOP_DURATION}s linear infinite;
          will-change: transform, opacity, filter;
          backface-visibility: hidden;
          transform-origin: center center;
        }

        .dog-spiral-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        @media (max-width: 768px) {
          .dog-spiral-scene {
            --scene-size: clamp(880px, 176vw, 1240px);
            top: 54%;
          }
          .dog-spiral-card { border-radius: 18px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .dog-spiral-track,
          .dog-spiral-card {
            animation: none !important;
          }
        }
      `}</style>

      <div className="dog-spiral-mask">
        <div className="dog-spiral-scene">
          {spiralItems.map((item) => {
            const trackStyle = {
              '--from-angle': `${item.fromAngle}deg`,
              '--to-angle': `${item.toAngle}deg`,
              '--peak-opacity': `${item.peakOpacity}`,
              animationDelay: `${item.delay}s`,
              zIndex: item.zIndex,
            } as CSSProperties;

            const cardStyle = {
              '--tilt': `${item.tilt}deg`,
              width: `${item.size * item.aspect}px`,
              height: `${item.size}px`,
              animationDelay: `${item.delay}s`,
            } as CSSProperties;

            return (
              <div key={item.id} className="dog-spiral-track" style={trackStyle}>
                <div className="dog-spiral-card" style={cardStyle}>
                  <img
                    src={dogPhoto}
                    alt=""
                    aria-hidden="true"
                    className="dog-spiral-image"
                    draggable={false}
                    loading="eager"
                    decoding="async"
                    style={{ objectPosition: item.objectPosition }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
