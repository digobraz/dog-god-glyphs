// JEDNOTNÝ KRUH hornej lišty — SOS, správy, upozornenia (Matej 8. 11. 2026, továreň `plany/ikonky/`, verzia C).
// 🔁 Bez kruhu, kresba väčšia (Matej 8. 11. 2026: *„nedávaj do kruhu a tým ich mierne zväčši"*). Zatiaľ len appka (APP_NEW).
export const TOP_CIRCLE_PX = 36;

export function TopCircle({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={className}
      style={{ width: TOP_CIRCLE_PX, height: TOP_CIRCLE_PX, display: 'grid', placeItems: 'center' }}
    >
      <img src={`/icons/kruhy/${name}.webp`} alt="" draggable={false} style={{ width: 34, height: 34, objectFit: 'contain', display: 'block' }} />
    </span>
  );
}
