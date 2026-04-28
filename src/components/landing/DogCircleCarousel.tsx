const DOG_PHOTOS = [
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=240&h=240&fit=crop&auto=format&q=70', // golden
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=240&h=240&fit=crop&auto=format&q=70', // shiba
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=240&h=240&fit=crop&auto=format&q=70', // husky
  'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=240&h=240&fit=crop&auto=format&q=70', // golden pup
  'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=240&h=240&fit=crop&auto=format&q=70', // labrador
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=240&h=240&fit=crop&auto=format&q=70', // pug
  'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=240&h=240&fit=crop&auto=format&q=70', // border collie
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=240&h=240&fit=crop&auto=format&q=70', // corgi
  'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=240&h=240&fit=crop&auto=format&q=70', // beagle
  'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=240&h=240&fit=crop&auto=format&q=70', // doberman
  'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=240&h=240&fit=crop&auto=format&q=70', // dachshund
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=240&h=240&fit=crop&auto=format&q=70', // poodle
];

export function DogCircleCarousel() {
  const count = DOG_PHOTOS.length;
  const step = 360 / count;

  return (
    <div
      className="dog-circle-wrapper pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <style>{`
        @keyframes dog-circle-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes dog-circle-spin-reverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        .dog-circle-ring {
          --ring-size: clamp(420px, 78vw, 880px);
          width: var(--ring-size);
          height: var(--ring-size);
          position: relative;
          animation: dog-circle-spin 40s linear infinite;
          will-change: transform;
        }
        .dog-circle-wrapper:hover .dog-circle-ring,
        .dog-circle-wrapper:hover .dog-circle-photo {
          animation-play-state: paused;
        }
        .dog-circle-slot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
        }
        .dog-circle-photo {
          width: clamp(72px, 10vw, 124px);
          height: clamp(72px, 10vw, 124px);
          border-radius: 9999px;
          object-fit: cover;
          background: linear-gradient(135deg, #1a1208, #C49B42);
          border: 2px solid rgba(196, 155, 66, 0.55);
          box-shadow: 0 10px 36px rgba(0, 0, 0, 0.55),
                      0 0 24px rgba(196, 155, 66, 0.18);
          opacity: 0.95;
          transform: translate(-50%, -50%);
          animation: dog-circle-spin-reverse 40s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .dog-circle-ring,
          .dog-circle-photo {
            animation: none !important;
          }
        }
      `}</style>

      <div className="dog-circle-ring">
        {DOG_PHOTOS.map((src, i) => {
          const angle = i * step;
          return (
            <div
              key={i}
              className="dog-circle-slot"
              style={{
                transform: `rotate(${angle}deg) translateY(calc(var(--ring-size, 600px) / -2))`,
              }}
            >
              <img
                className="dog-circle-photo"
                src={src}
                alt=""
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Hide broken img tag, keep gold gradient circle as fallback
                  (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
