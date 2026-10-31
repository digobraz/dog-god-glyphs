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
export function openAinubis(prefill?: string, topic?: string): void {
  if (typeof window === 'undefined') return;
  // `prefill` = začiatok správy · `topic` = téma z dlaždice (idea | problem | help, karta
  // LIVE STATUS na /onepage) — chat po uvítaní ukáže voľbu a AINUBISOVU otázku k nej.
  const detail = prefill || topic ? { prefill, topic } : undefined;
  window.dispatchEvent(new CustomEvent(AINUBIS_OPEN_EVENT, { detail }));
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

// ── POKRAČUJ V PODCASTE N/M ─────────────────────────────────────────────────
// Položka v paneli „+" na AINUBIS (Matej 26. 10. 2026) nesie číslo ďalšieho nevypočutého podcastu.
// Počíta ho `PackAinubis` (má zvitky aj stav vypočutia), panel ho len číta. `null` = nie je čo počúvať
// alebo AINUBIS nie je otvorený — vtedy panel položku neukáže.
let podcastNext: string | null = null;
export function setPodcastNext(v: string | null): void { podcastNext = v; }
export function getPodcastNext(): string | null { return podcastNext; }

// ── ROVINA CHAT (appka MVP, 31. 10. 2026) ───────────────────────────────────
// `/pack/ainubis?plane=chat` a šuplík sprava sú JEDEN komponent: `AinubisWidget` (root singleton).
// Rovina mu len podá miesto, kam sa má vykresliť — widget panel pošle cez portál do tohto prvku
// (bez šuplíkového závoja, bez zatvárania). Prvok registruje `PackAinubis`; keď zmizne (odchod z roviny),
// widget sa vráti do šuplíka.
export const AINUBIS_PLANE_EVENT = 'dogypt:ainubis-plane';
let planeHost: HTMLElement | null = null;

/** Volá `PackAinubis` (ref callback) — `null` pri odchode z roviny. */
export function setAinubisPlaneHost(el: HTMLElement | null): void {
  if (el === planeHost) return;
  planeHost = el;
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AINUBIS_PLANE_EVENT));
}

export function getAinubisPlaneHost(): HTMLElement | null {
  return planeHost;
}

export function onAinubisPlaneHost(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(AINUBIS_PLANE_EVENT, cb);
  return () => window.removeEventListener(AINUBIS_PLANE_EVENT, cb);
}

/** Šípka späť v hlavičke panela v rovine → `PackAinubis` vráti rovinu na ZVITKY. */
export const AINUBIS_PLANE_BACK_EVENT = 'dogypt:ainubis-plane-back';
export function requestAinubisPlaneBack(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AINUBIS_PLANE_BACK_EVENT));
}
export function onAinubisPlaneBack(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(AINUBIS_PLANE_BACK_EVENT, cb);
  return () => window.removeEventListener(AINUBIS_PLANE_BACK_EVENT, cb);
}
