import { useMemo } from 'react';
import { patroniImages } from '@/assets/patroni';

const GLOW_COLOR = '#E8B547';
const DROP_COUNT = 28;

export function MatrixRain() {
  const drops = useMemo(
    () =>
      Array.from({ length: DROP_COUNT }, (_, index) => ({
        id: index,
        image: patroniImages[index % patroniImages.length],
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 34 + Math.random() * 38,
        duration: 18 + Math.random() * 18,
        delay: -Math.random() * 24,
        opacity: 0.38 + Math.random() * 0.45,
        blur: 10 + Math.random() * 12,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <style>{`
        @keyframes patron-fall {
          0% { transform: translate3d(0, -14vh, 0); opacity: 0; }
          10% { opacity: var(--drop-opacity); }
          90% { opacity: var(--drop-opacity); }
          100% { transform: translate3d(0, 118vh, 0); opacity: 0; }
        }

        @keyframes patron-flicker {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 8px rgba(232,181,71,0.45)) drop-shadow(0 0 18px rgba(232,181,71,0.25)); }
          50% { filter: brightness(1.22) drop-shadow(0 0 12px rgba(232,181,71,0.8)) drop-shadow(0 0 28px rgba(232,181,71,0.45)); }
        }

        @media (prefers-reduced-motion: reduce) {
          .patron-rain-drop {
            animation: patron-flicker 4s ease-in-out infinite !important;
          }
        }
      `}</style>

      {drops.map((drop) => (
        <div
          key={drop.id}
          className="patron-rain-drop absolute"
          style={{
            left: `${drop.left}%`,
            top: `${drop.top}%`,
            width: `${drop.size}px`,
            height: `${drop.size}px`,
            backgroundColor: GLOW_COLOR,
            opacity: drop.opacity,
            boxShadow: `0 0 ${drop.blur}px rgba(232, 181, 71, 0.45), 0 0 ${drop.blur * 2}px rgba(232, 181, 71, 0.18)`,
            WebkitMaskImage: `url(${drop.image})`,
            maskImage: `url(${drop.image})`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            ['--drop-opacity' as string]: String(drop.opacity),
            animation: `patron-fall ${drop.duration}s linear ${drop.delay}s infinite, patron-flicker ${3.6 + Math.random() * 2.8}s ease-in-out ${drop.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
