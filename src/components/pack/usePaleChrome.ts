// Je práve chrome mapy bledý? — JS dvojička CSS bledého skinu.
//
// Potrebujú to komponenty, ktoré si farbu nesú v INLINE štýle a z CSS sa teda prebiť nedajú
// bez !important (dnes `PawRating` cez svoj prepínač `onDark`). Všetko ostatné rieš v CSS —
// tento hook je výnimka pre inline štýly, nie druhá cesta k tej istej veci.
//
// ⚠️ ŠÍRKA SA UŽ NEPÝTA (2026-08-28). Do vtedy to bola dvojička podmienky
// `@media (min-width: PALE_PC_MIN)`, lebo mobilný chrome mapy bol tmavý. Odkedy je bledá aj
// mobilná hlavička, filter, spodná dvojica tlačidiel a celý tok pridávania, je odpoveď na
// každej šírke tá istá a `matchMedia` by len vyrábal pásmo, kde je povrch papyrusový, ale
// komponent si o sebe ešte myslí, že je tmavý.
//
// ⚠️ `PALE_PC_MIN` NEZANIKOL — naďalej drží rozdiel v TVARE a ROZMEROCH (plávajúci panel so
// zlatým lemom vs. celá obrazovka). Rozdeľuje sa tým otázka „akej je to farby" od otázky
// „akej je to veľkosti"; boli to dve otázky, ktoré len dovtedy mali zhodou okolností
// rovnakú odpoveď.
import { MAP_SKIN } from './navGoldSkin';

export function useIsPaleChrome(): boolean {
  return MAP_SKIN === 'pale';
}
