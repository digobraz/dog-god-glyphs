// ZELENÁ FAJKA „PREJDENÉ" — jeden zdieľaný tvar (Matej 11. 11. 2026, nákres packy-prejdene kolo2, A1 + L1).
// Plný zelený kruh + biela fajka, inline SVG (nie textový znak ✓). Zelená SPLNENÉ = T.growGreen.
import { PACK_THEME as T } from '@/components/pack/packTheme';

export function WalkedCheck({ size = 24 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, flex: `0 0 ${size}px`, borderRadius: '50%', background: T.growGreen, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg viewBox="0 0 24 24" width="62%" height="62%" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}
