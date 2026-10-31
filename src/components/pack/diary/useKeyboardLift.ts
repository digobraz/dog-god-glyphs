// ── KLÁVESNICA NESMIE ZAKRYŤ TLAČIDLÁ OKNA (audit appky 30. 10. 2026, D·5) ──────────────────────
// iOS klávesnica nemení `dvh` ani layout viewport, takže šuplík prilepený k spodku okna zostane POD ňou
// a ZAPÍSAŤ nie je vidno. `visualViewport` povie, koľko okna klávesnica zožrala; hodnotu dáme do
// `--dia-kb` a CSS okna (`.dia-sheet`, `.dvt-pop`) ňou zdvihne spodok a skráti výšku.
// Zdvihnutie robí rodič `.ppu-root` cez `:has()` — PackPopup (cudzí súbor) sa tým nemení.
import { useEffect } from 'react';

export function useKeyboardLift() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;
    const sync = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty('--dia-kb', kb > 80 ? `${Math.round(kb)}px` : '0px');
    };
    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
      root.style.removeProperty('--dia-kb');
    };
  }, []);
}

/** CSS pre okno s PackPopup: zdvih nad klávesnicu (len mobil — na PC okno stojí v strede). `sheetClass` = trieda na `.ppu-sheet`. */
export const kbLiftCSS = (sheetClass: string, maxH: string) => `
@media (max-width:767px){
  .ppu-root.pk-veil:has(.${sheetClass}){padding-bottom:var(--dia-kb,0px)}
  .${sheetClass}{max-height:calc(${maxH} - var(--dia-kb,0px))}
}
`;
