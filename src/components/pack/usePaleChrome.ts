// Je práve chrome mapy bledý? — JS dvojička CSS podmienky `@media (min-width: PALE_PC_MIN)`.
//
// Potrebujú to komponenty, ktoré si farbu nesú v INLINE štýle a z CSS sa teda prebiť nedajú
// bez !important (dnes `PawRating` cez svoj prepínač `onDark`). Všetko ostatné rieš v CSS —
// tento hook je výnimka pre inline štýly, nie druhá cesta k tej istej veci.
//
// ⚠️ Hranica sa NEPÍŠE sem natvrdo: berie sa `PALE_PC_MIN` z `navGoldSkin.ts`, ten istý
// zdroj, ktorý používajú aj všetky CSS bloky bledého skinu.
import { useEffect, useState } from 'react';
import { MAP_SKIN, PALE_PC_MIN } from './navGoldSkin';

const QUERY = `(min-width: ${PALE_PC_MIN}px)`;

export function useIsPaleChrome(): boolean {
  const [wide, setWide] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return MAP_SKIN === 'pale' && wide;
}
