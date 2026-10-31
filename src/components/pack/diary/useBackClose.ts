// ── GESTO SPÄŤ ZAVRIE OKNO, NIE STRÁNKU (audit appky 30. 10. 2026, D·6) ─────────────────────────
// Okno zápisu je prekryv nad stránkou (lock §4.2) — gesto späť (iOS swipe, Android tlačidlo) malo
// predtým odniesť človeka preč z obrazovky aj s rozpísaným textom. Okno si preto pri otvorení
// pridá jeden záznam do histórie; „späť" ho len odoberie a zavolá `onBack`.
// ⚠️ Zásobník: pri dvoch oknách nad sebou (zápis + jeho vnorené okno) reaguje len horné.
// ⚠️ `onBack` smie okno zavrieť ALEBO ho nechať (otázka „Zahodiť?") — záznam sa po každom „späť"
//    vráti, a pri odmontovaní okna sa odoberie, takže história ostáva vyrovnaná.
// ⚠️ Keď okno po zavretí hneď naviguje (DevotionToday → /pack/add), horný záznam už nie je náš
//    a neodoberá sa — navigácia by sa inak vrátila späť.
import { useEffect, useRef } from 'react';

const MARK = 'dgOverlay';
let seq = 0;
const stack: number[] = [];
// Vlastné `history.back()` pri odmontovaní okna vyvolá `popstate` — ten nesmie zavrieť okno pod ním.
let swallow = 0;
let swallowed: Event | null = null;   // jedna udalosť = jedno odpočítanie, aj keď ju počúva viac okien

export function useBackClose(onBack: () => void) {
  const cb = useRef(onBack);
  cb.current = onBack;

  useEffect(() => {
    const id = ++seq;
    stack.push(id);
    const push = () => { try { window.history.pushState({ ...(window.history.state ?? {}), [MARK]: id }, ''); } catch { /* iframe / súkromné okno */ } };
    push();
    const onPop = (e: Event) => {
      if (swallow > 0 || swallowed === e) { if (swallowed !== e) { swallowed = e; swallow--; } return; }
      if (stack[stack.length - 1] !== id) return;   // horné okno je iné
      push();                                        // vráť záznam, okno ho potrebuje, kým žije
      cb.current();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      const i = stack.lastIndexOf(id);
      if (i >= 0) stack.splice(i, 1);
      if ((window.history.state as Record<string, unknown> | null)?.[MARK] === id) {
        swallow++;
        window.setTimeout(() => { if (swallow > 0) swallow--; }, 400);   // back() bez záznamu popstate nevyvolá
        try { window.history.back(); } catch { swallow = Math.max(0, swallow - 1); }
      }
    };
  }, []);
}
