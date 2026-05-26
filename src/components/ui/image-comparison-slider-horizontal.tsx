import * as React from 'react';
import { cn } from '@/lib/utils';

interface ImageComparisonSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  leftImage: string;
  rightImage: string;
  altLeft?: string;
  altRight?: string;
  initialPosition?: number;
  handleLogo?: string;
  /** Optional mobile variant of the handle logo (e.g. text-only without silhouette). Shown only on <768px. */
  mobileHandleLogo?: string;
}

export const ImageComparisonSlider = React.forwardRef<
  HTMLDivElement,
  ImageComparisonSliderProps
>(
  (
    {
      className,
      leftImage,
      rightImage,
      altLeft = 'Before',
      altRight = 'After',
      initialPosition = 50,
      handleLogo = '/images/mission/dogypt-circle-logo.png',
      mobileHandleLogo,
      ...props
    },
    ref,
  ) => {
    const [sliderPosition, setSliderPosition] = React.useState(initialPosition);
    const [isDragging, setIsDragging] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      let newPosition = (x / rect.width) * 100;
      newPosition = Math.max(0, Math.min(100, newPosition));
      setSliderPosition(newPosition);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    };
    const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      setIsDragging(true);
    };
    const handleInteractionEnd = () => setIsDragging(false);

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('mouseup', handleInteractionEnd);
        document.addEventListener('touchend', handleInteractionEnd);
        document.body.style.cursor = 'ew-resize';
      } else {
        document.body.style.cursor = '';
      }
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('mouseup', handleInteractionEnd);
        document.removeEventListener('touchend', handleInteractionEnd);
        document.body.style.cursor = '';
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDragging]);

    return (
      <>
        <style>{`
          @keyframes dogyptHandlePulse {
            0%, 100% {
              box-shadow:
                0 0 20px rgba(255, 200, 90, 0.55),
                0 0 48px rgba(230, 158, 26, 0.40),
                0 0 90px rgba(230, 158, 26, 0.22);
            }
            50% {
              box-shadow:
                0 0 32px rgba(255, 215, 110, 0.85),
                0 0 72px rgba(230, 158, 26, 0.62),
                0 0 130px rgba(230, 158, 26, 0.36);
            }
          }
          @keyframes dogyptHandlePulseMobile {
            0%, 100% {
              box-shadow:
                0 0 24px rgba(255, 215, 110, 0.85),
                0 0 56px rgba(245, 199, 61, 0.65),
                0 0 110px rgba(230, 158, 26, 0.40),
                inset 0 0 0 1px rgba(255, 235, 180, 0.55);
            }
            50% {
              box-shadow:
                0 0 38px rgba(255, 230, 150, 1),
                0 0 84px rgba(245, 199, 61, 0.90),
                0 0 160px rgba(230, 158, 26, 0.55),
                inset 0 0 0 1px rgba(255, 245, 210, 0.75);
            }
          }
          @keyframes sliderArrowLeft {
            0%, 100% { transform: translate(0, -50%); opacity: 0.5; }
            50%      { transform: translate(-6px, -50%); opacity: 1; }
          }
          @keyframes sliderArrowRight {
            0%, 100% { transform: translate(0, -50%); opacity: 0.5; }
            50%      { transform: translate(6px, -50%); opacity: 1; }
          }
          .handle-logo-mobile { display: none; }
          .slider-arrow { display: none; }
          @media (max-width: 767px) {
            .dogypt-slider-handle {
              width: 76px !important;
              height: 76px !important;
              background: #000 !important;
              border: 2px solid #F5C73D !important;
              animation-name: dogyptHandlePulseMobile !important;
              animation-duration: 2.4s !important;
            }
            .handle-logo-desktop { display: none; }
            .handle-logo-mobile {
              display: block;
              width: 72%;
              height: auto;
              filter: drop-shadow(0 0 6px rgba(245,199,61,0.55));
            }
            .slider-arrow {
              position: absolute;
              top: 50%;
              display: inline-flex;
              pointer-events: none;
            }
            .slider-arrow svg {
              filter: drop-shadow(0 0 6px rgba(245,199,61,0.7));
            }
            .slider-arrow-left {
              right: calc(100% + 6px);
              animation: sliderArrowLeft 1.4s ease-in-out infinite;
            }
            .slider-arrow-right {
              left: calc(100% + 6px);
              animation: sliderArrowRight 1.4s ease-in-out infinite;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .dogypt-slider-handle { animation: none !important; }
            .slider-arrow { animation: none !important; }
          }
        `}</style>
        <div
          ref={ref ?? containerRef}
          className={cn(
            'relative w-full h-full overflow-hidden select-none group',
            className,
          )}
          {...props}
        >
          {/* RIGHT image (AFTER) — bottom layer */}
          <img
            src={rightImage}
            alt={altRight}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable={false}
          />

          {/* LEFT image (BEFORE) — top layer, clipped */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
            style={{
              clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
            }}
          >
            <img
              src={leftImage}
              alt={altLeft}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          {/* Slider divider + handle */}
          <div
            className="absolute top-0 h-full pointer-events-none"
            style={{ left: `calc(${sliderPosition}% - 1px)`, width: '2px' }}
          >
            {/* Gold hairline divider */}
            <div
              className="absolute inset-y-0 w-full"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(245,199,61,0.30) 0%, rgba(245,199,61,0.85) 30%, rgba(245,199,61,0.85) 70%, rgba(245,199,61,0.30) 100%)',
                boxShadow: '0 0 12px rgba(245,199,61,0.45)',
              }}
            />

            {/* DOGYPT logo handle — logo PNG is already circular with its own ring + BG */}
            <div
              className={cn(
                'dogypt-slider-handle',
                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                'flex items-center justify-center rounded-full',
                'transition-transform duration-200 ease-out',
                'group-hover:scale-105',
                isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab',
              )}
              style={{
                width: 'clamp(56px, 6vw, 72px)',
                height: 'clamp(56px, 6vw, 72px)',
                background: 'transparent',
                animation: 'dogyptHandlePulse 3.2s ease-in-out infinite',
                touchAction: 'none',
                pointerEvents: 'auto',
              }}
              onMouseDown={handleInteractionStart}
              onTouchStart={handleInteractionStart}
              role="slider"
              aria-valuenow={sliderPosition}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-orientation="horizontal"
              aria-label="Image comparison slider"
            >
              {/* Desktop: original circle-logo PNG (silhouette + text in own ring) */}
              <img
                src={handleLogo}
                alt=""
                draggable={false}
                className="handle-logo-desktop"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />

              {/* Mobile: text-only logo (silhouette žije v PageTopBar), v gold ring */}
              {mobileHandleLogo && (
                <img
                  src={mobileHandleLogo}
                  alt=""
                  draggable={false}
                  className="handle-logo-mobile"
                  style={{
                    objectFit: 'contain',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Mobile: pulzujúce drag indikátory */}
              <span className="slider-arrow slider-arrow-left" aria-hidden>
                <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
                  <path
                    d="M11 2 L3 11 L11 20"
                    stroke="#F5C73D"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </span>
              <span className="slider-arrow slider-arrow-right" aria-hidden>
                <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
                  <path
                    d="M3 2 L11 11 L3 20"
                    stroke="#F5C73D"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </>
    );
  },
);

ImageComparisonSlider.displayName = 'ImageComparisonSlider';
