// ZELENÁ FAJKA „PREJDENÉ" — jeden zdieľaný tvar (Matej 11. 11. 2026, nákres packy-prejdene kolo2, A1 + L1).
// Kresba z továrne ikoniek (zelený medailón so zlatým lemom, plany/ikonky/varianty/sys-fajka/k22-d),
// nie SVG ani textový znak ✓ — Matej: „checkmark nie je v brande… ako keby z druhej apky".
export function WalkedCheck({ size = 24 }: { size?: number }) {
  return (
    <img
      aria-hidden="true"
      alt=""
      draggable={false}
      src="/icons/sys/fajka-zelena.webp"
      style={{ width: size, height: size, flex: `0 0 ${size}px`, maxWidth: 'none', display: 'block', objectFit: 'contain' }}
    />
  );
}
