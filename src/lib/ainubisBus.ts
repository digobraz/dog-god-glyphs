// ainubisBus — jediný spôsob, ako otvoriť AINUBISA zvonku (dlaždica na homepage,
// neskôr wizard, prípadne „spýtaj sa" odkazy v článkoch).
//
// Prečo event a nie prop/context: `AinubisWidget` je lazy-loaded root-level singleton
// v `App.tsx` (mimo `/pack` stromu) a drží si vlastný `open` stav v localStorage.
// Prevliekať cezeň context by znamenalo obaliť celú appku providerom kvôli jednému
// tlačidlu. Window event je tu lacnejší aj bezpečnejší — keď widget nie je namountovaný
// (render/heroglyph routy si ho sám skrýva), klik jednoducho nič neurobí.
export const AINUBIS_OPEN_EVENT = 'dogypt:ainubis-open';

/** Otvorí panel AINUBISA. Bez efektu, ak widget na danej route nebeží. */
export function openAinubis(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AINUBIS_OPEN_EVENT));
}
