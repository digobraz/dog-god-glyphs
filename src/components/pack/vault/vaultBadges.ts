// ════════════════════════════════════════════════════════════════════════════
// ODZNAKY VAULTU — NÁVRH (4. 10. 2026), čaká na Matejovo OK
// ────────────────────────────────────────────────────────────────────────────
// Matej 4. 10.: *„…štatistiky, obľúbené zvitky, prečítané, vypočuté, % atď. a vymyslíme
// aj odznaky"*. Vzor = odznaky výletov (HeroBadges: míľnik → odomknuté). Tu sa
// ODVODZUJÚ z postupu (`vault_reads`) a žiadostí (`vault_requests`) — vlastná tabuľka
// netreba: zvitok sa „neodčíta". Výnimka je `heart` (srdiečko sa dá vziať späť ⇒ odznak
// zhasne); ak to Matej nechce, dostane trvalý zápis ako `hero_badges_earned`.
//
// 🚩 NÁVRH: mená, míľniky aj kresby sú moje. Kresby sú dočasne ikonky z kitu
//    (`/icons/pack/`), výletné odznaky majú vlastné ilustrácie — VAULT ich zatiaľ nemá.
// ════════════════════════════════════════════════════════════════════════════
import type { DemoScroll, ReadRow, VaultRequest } from './vaultScrolls';

type L3 = { sk: string; cs: string; en: string };
export type BadgeInput = { reads: ReadRow[]; scrolls: DemoScroll[]; requests: VaultRequest[] };
export type VaultBadge = {
  id: string; ic: string; goal: number;
  name: L3; how: L3;
  /** Koľko z `goal` má člen dnes. */
  have: (x: BadgeInput) => number;
};

const done = (r: ReadRow) => !!(r.read_at || r.listened_at);
const doneN = (x: BadgeInput) => x.reads.filter(done).length;

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
    have: (x) => x.reads.filter((r) => r.liked).length },
  { id: 'voice', ic: 'idea', goal: 1,
    name: { sk: 'Hlas pre AINUBISA', cs: 'Hlas pro AINUBISE', en: 'A voice for AINUBIS' },
    how: { sk: 'Navrhni zmenu alebo požiadaj o nový jazyk.', cs: 'Navrhni změnu nebo požádej o nový jazyk.', en: 'Suggest a change or ask for a new language.' },
    have: (x) => x.requests.length },
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
