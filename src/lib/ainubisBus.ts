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

// ── NEPREČÍTANÉ SPRÁVY ──────────────────────────────────────────────────────
// Odkedy AINUBIS sedí v spodnom nave `/pack` (4. 9. 2026), jeho plávajúca guľa je
// tam skrytá — a s ňou by zmizol aj červený odznak nad ňou. Bublina „máš odo mňa
// správu", ktorú nikto neuvidí, je horšia než žiadna, preto widget svoje číslo
// publikuje sem a medailón v lište si ho odoberá.
//
// ⚠️ Posledná hodnota sa DRŽÍ v module, nielen posiela eventom. Medailón sa mountuje
// pri prechode na `/pack`, teda spravidla NESKÔR než widget spočíta neprečítané —
// bez pamäti by na prvý render ukázal nulu a odznak by naskočil až pri ďalšej zmene.
export const AINUBIS_UNREAD_EVENT = 'dogypt:ainubis-unread';

let unread = 0;

/** Volá `AinubisWidget`, keď sa počet neprečítaných zmení. */
export function setAinubisUnread(n: number): void {
  if (n === unread) return;
  unread = n;
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AINUBIS_UNREAD_EVENT, { detail: n }));
}

/** Aktuálny počet — pre prvý render odberateľa. */
export function getAinubisUnread(): number {
  return unread;
}

/** Odber zmien. Vracia funkciu na odhlásenie. */
export function onAinubisUnread(cb: (n: number) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const h = (e: Event) => cb((e as CustomEvent<number>).detail);
  window.addEventListener(AINUBIS_UNREAD_EVENT, h);
  return () => window.removeEventListener(AINUBIS_UNREAD_EVENT, h);
}
