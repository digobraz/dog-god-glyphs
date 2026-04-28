const DOG_PHOTOS = [
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=240&h=240&fit=crop&auto=format&q=70',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=240&h=240&fit=crop&auto=format&q=70',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=240&h=240&fit=crop&auto=format&q=70',
  'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=240&h=240&fit=crop&auto=format&q=70',
  'https://images.unsplash.com/photo-1530041539828-114de669390e?w=240&h=240&fit=crop&auto=format&q=70',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=240&h=240&fit=crop&auto=format&q=70',
  'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=240&h=240&fit=crop&auto=format&q=70',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=240&h=240&fit=crop&auto=format&q=70',
  'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=240&h=240&fit=crop&auto=format&q=70',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=240&h=240&fit=crop&auto=format&q=70',
  'https://images.unsplash.com/photo-1592769606554-fcb47e6dc012?w=240&h=240&fit=crop&auto=format&q=70',
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=240&h=240&fit=crop&auto=format&q=70',
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
          width: clamp(360px, 64vw, 680px);
          height: clamp(360px, 64vw, 680px);
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
          width: clamp(64px, 9vw, 110px);
          height: clamp(64px, 9vw, 110px);
          border-radius: 9999px;
          object-fit: cover;
          border: 1px solid rgba(196, 155, 66, 0.45);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45),
                      0 0 0 1px rgba(0, 0, 0, 0.2);
          opacity: 0.72;
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
                transform: `rotate(${angle}deg) translateY(calc(clamp(360px, 64vw, 680px) / -2))`,
              }}
            >
              <img
                className="dog-circle-photo"
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
