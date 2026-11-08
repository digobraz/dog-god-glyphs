// JEDNOTNÝ KRUH hornej lišty — SOS, správy, upozornenia (Matej 8. 11. 2026, továreň `plany/ikonky/`, verzia C).
// Okrúhle TLAČIDLO, nie medailón. Rám je z kódu, v obrázku je len kresba s dvojitým lemom. Zatiaľ len appka (APP_NEW).
import { PACK_THEME as T, PACK_R, PAPER_BG } from './packTheme';

export const TOP_CIRCLE_PX = 36;

export function TopCircle({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={className}
      style={{ width: TOP_CIRCLE_PX, height: TOP_CIRCLE_PX, borderRadius: PACK_R.pill, border: `2px solid ${T.accentGold}`, background: PAPER_BG, display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}
    >
      <img src={`/icons/kruhy/${name}.webp`} alt="" draggable={false} style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
    </span>
  );
}
