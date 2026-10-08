// ════════════════════════════════════════════════════════════════════════════
// ODZNAKY VAULTU — NÁVRH (4. 10. 2026), čaká na Matejovo OK
// ────────────────────────────────────────────────────────────────────────────
// Matej 4. 10.: *„…štatistiky, obľúbené zvitky, prečítané, vypočuté, % atď. a vymyslíme
// aj odznaky"*. Vzor = odznaky výletov (HeroBadges: míľnik → odomknuté).
//
// MECHANIKA (8. 10. 2026, Matej: *„treba si pamätať každú interakciu, nie že to zmizne"*):
//  · `have(x)` počíta „KEDY VÔBEC", nie „teraz": srdiečko raz dané sa ráta aj po unlike.
//    Zdroj je denník `vault_events` (súhrn `x.ev`) a trvalé stavy `vault_reads` (`x.reads`).
//  · Keď `have ≥ goal`, `awardBadges()` (vaultScrolls.ts) zapíše odznak do
//    `vault_badges_earned` PRVÝKRÁT — odtiaľ ho UI číta a už nezhasne.
//  · NOVÝ ODZNAK = jeden objekt v `VAULT_BADGES` (id, ic, goal, name, how, have). Nič iné sa
//    nemení: žiadna migrácia, žiadny zápis. Pomocníci nižšie (`evScrolls`, `evTimes`,
//    `doneIn`, `closedCircles`, `closedWorlds`) pokrývajú počty podľa svetov, okruhov a druhov.
//
// 🚩 NÁVRH: mená, míľniky aj kresby sú moje. Kresby sú dočasne ikonky z kitu
//    (`/icons/pack/`), výletné odznaky majú vlastné ilustrácie — VAULT ich zatiaľ nemá.
// ════════════════════════════════════════════════════════════════════════════
import type { DemoScroll, EventSum, ReadRow, VaultRequest } from './vaultScrolls';

type L3 = { sk: string; cs: string; en: string };
export type BadgeInput = { reads: ReadRow[]; scrolls: DemoScroll[]; requests: VaultRequest[]; ev: EventSum[] };
export type VaultBadge = {
  id: string; ic: string; goal: number;
  name: L3; how: L3;
  /** Koľko z `goal` má člen dnes. */
  have: (x: BadgeInput) => number;
};

const done = (r: ReadRow) => !!(r.read_at || r.listened_at);
const doneN = (x: BadgeInput) => x.reads.filter(done).length;

/** Na koľkých RÔZNYCH zvitkoch som kedykoľvek urobil (druh) — unlike to neodoberie. */
export const evScrolls = (x: BadgeInput, ...kinds: string[]) =>
  new Set(x.ev.filter((e) => kinds.includes(e.kind)).map((e) => e.scroll_id)).size;
/** Koľkokrát celkovo som (druh) urobil. */
export const evTimes = (x: BadgeInput, ...kinds: string[]) =>
  x.ev.filter((e) => kinds.includes(e.kind)).reduce((n, e) => n + e.n, 0);
/** Hotové zvitky v danom svete (a voliteľne okruhu) — pre odznaky typu „Svet X“, „Okruh Y“. */
export const doneIn = (x: BadgeInput, world: string, okruh?: number) => {
  const ids = new Set(x.scrolls.filter((z) => z.world === world && (okruh == null || z.okruh === okruh)).map((z) => z.id));
  return x.reads.filter((r) => done(r) && ids.has(r.scroll_id)).length;
};

export const VAULT_BADGES: VaultBadge[] = [
  { id: 'first', ic: 'feather', goal: 1,
    name: { sk: 'Prvý zvitok', cs: 'První svitek', en: 'First scroll' },
    how: { sk: 'Prečítaj alebo dopočúvaj prvý zvitok.', cs: 'Přečti nebo doposlechni první svitek.', en: 'Read or finish listening to your first scroll.' },
    have: doneN },
  { id: 'ear', ic: 'play', goal: 3,
    name: { sk: 'Ucho AINUBISA', cs: 'Ucho AINUBISE', en: 'AINUBIS’s ear' },
    how: { sk: 'Dopočúvaj tri podcasty do konca.', cs: 'Doposlechni tři podcasty do konce.', en: 'Listen to three podcasts to the end.' },
    have: (x) => x.reads.filter((r) => r.listened_at).length },
  { id: 'seven', ic: 'ankh', goal: 7,
    name: { sk: 'Sedem pečatí', cs: 'Sedm pečetí', en: 'Seven seals' },
    how: { sk: 'Uzavri sedem zvitkov.', cs: 'Uzavři sedm svitků.', en: 'Close seven scrolls.' },
    have: doneN },
  { id: 'circle', ic: 'target', goal: 1,
    name: { sk: 'Okruh uzavretý', cs: 'Okruh uzavřen', en: 'Circle closed' },
    how: { sk: 'Uzavri všetky zvitky jedného okruhu.', cs: 'Uzavři všechny svitky jednoho okruhu.', en: 'Close every scroll of one circle.' },
    have: (x) => closedCircles(x) },
  { id: 'heart', ic: 'heart', goal: 5,
    name: { sk: 'Srdce svorky', cs: 'Srdce smečky', en: 'Heart of the pack' },
    how: { sk: 'Daj srdiečko piatim zvitkom.', cs: 'Dej srdíčko pěti svitkům.', en: 'Give a heart to five scrolls.' },
    have: (x) => Math.max(evScrolls(x, 'like'), x.reads.filter((r) => r.liked).length) },
  { id: 'voice', ic: 'idea', goal: 1,
    name: { sk: 'Hlas pre AINUBISA', cs: 'Hlas pro AINUBISE', en: 'A voice for AINUBIS' },
    how: { sk: 'Navrhni zmenu alebo požiadaj o nový jazyk.', cs: 'Navrhni změnu nebo požádej o nový jazyk.', en: 'Suggest a change or ask for a new language.' },
    have: (x) => Math.max(evTimes(x, 'suggest', 'lang_request'), x.requests.length) },
  { id: 'tongues', ic: 'globe', goal: 2,
    name: { sk: 'Dva jazyky', cs: 'Dva jazyky', en: 'Two tongues' },
    how: { sk: 'Počúvaj podcasty v dvoch jazykoch.', cs: 'Poslouchej podcasty ve dvou jazycích.', en: 'Listen to podcasts in two languages.' },
    have: (x) => new Set(x.reads.flatMap((r) => r.listen_langs || [])).size },
  // 42 = dni Cesty s Hrdinom (kniha, z ktorej DOGYPT vyrástol).
  { id: 'hero42', ic: 'dogsphinx', goal: 42,
    name: { sk: 'Cesta s Hrdinom', cs: 'Cesta s Hrdinou', en: 'The Hero’s path' },
    how: { sk: 'Uzavri 42 zvitkov — toľko dní trvala Cesta s Hrdinom.', cs: 'Uzavři 42 svitků — tolik dní trvala Cesta s Hrdinou.', en: 'Close 42 scrolls — as many as the days of the Hero’s journey.' },
    have: doneN },
];

/** Okruhy, v ktorých má člen hotové VŠETKY zvitky (len okruhy, ktoré už vo VAULTE sú celé). */
export function closedCircles(x: BadgeInput): number {
  const doneIds = new Set(x.reads.filter(done).map((r) => r.scroll_id));
  const by = new Map<string, DemoScroll[]>();
  for (const z of x.scrolls) {
    const k = `${z.world}-${z.okruh}`;
    by.set(k, [...(by.get(k) || []), z]);
  }
  let n = 0;
  for (const list of by.values()) {
    if (list.length >= (list[0]?.total || Infinity) && list.every((z) => doneIds.has(z.id))) n++;
  }
  return n;
}

/** Svety, v ktorých má člen hotové VŠETKY zvitky, ktoré v DB sú (pre budúce odznaky „svet uzavretý“). */
export function closedWorlds(x: BadgeInput): number {
  const doneIds = new Set(x.reads.filter(done).map((r) => r.scroll_id));
  const by = new Map<string, DemoScroll[]>();
  for (const z of x.scrolls) by.set(z.world, [...(by.get(z.world) || []), z]);
  return [...by.values()].filter((l) => l.every((z) => doneIds.has(z.id))).length;
}
