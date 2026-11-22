// ── KLÁVESNICA NESMIE ZAKRYŤ TLAČIDLÁ OKNA (audit appky 30. 10. 2026, D·5) ──────────────────────
// iOS klávesnica nemení `dvh` ani layout viewport, takže šuplík prilepený k spodku okna zostane POD ňou
// a ZAPÍSAŤ nie je vidno. `visualViewport` povie, koľko okna klávesnica zožrala; hodnotu dáme do
// `--dia-kb` a CSS okna (`.dia-sheet`, `.dvt-pop`) ňou zdvihne spodok a skráti výšku.
// Zdvihnutie robí rodič `.ppu-root` cez `:has()` — PackPopup (cudzí súbor) sa tým nemení.
import { useEffect } from 'react';
import { keyboardInset, markKeyboard } from '@/lib/keyboardInset';

export function useKeyboardLift() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;
    // Len pri skutočnej zmene: iOS hlási resize/scroll počas celej animácie klávesnice aj pri písaní
    // a každý zápis premennej preskladá obrazovku (Matej 19. 11. 2026: „pri písaní to seká“).
    let last = '';
    const sync = () => {
      // meranie proti 100dvh, nie proti innerHeight — novší iOS mení oba (lib/keyboardInset.ts, 22. 11. 2026)
      const kb = keyboardInset();
      const v = `${kb}px`;
      if (v === last) return;
      last = v;
      root.style.setProperty('--dia-kb', v);
      markKeyboard(kb > 0);
    };
    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
      root.style.removeProperty('--dia-kb');
      markKeyboard(false);
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
