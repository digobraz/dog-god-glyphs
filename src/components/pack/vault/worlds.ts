// ════════════════════════════════════════════════════════════════════════════
// SEDEM SVETOV VAULTU — jeden zoznam pre mozog aj DOGSCROLL (2026-09-21)
// ────────────────────────────────────────────────────────────────────────────
// Kópia `SVETY[]` z nákresu `plany/nakres-vault-fasada-v5-2026-09-20.html`
// (poradie, ikonky vybral Matej 20. 9.). Pri dolaďovaní mien (`v-mena` na
// nástenke) sa mení TENTO zoznam a nákres SPOLU.
//
// ⚠️ `circles` a `scrolls` NIE SÚ ÚDAJ PRE ČLOVEKA. Sú to počty z rozpadu
//    `plany/znalosti/svety/*.md`, ktorý Matej ešte neodsúhlasil — mozog z nich
//    berie len HUSTOTU (koľko zŕn má ktorý výsek), aby mal tvar z nákresu.
//    Na obrazovku sa nepíšu: sľub „119 zvitkov" by bol číslo bez obsahu.
// 🔴 OD 24. 9. 2026 SA POČTY NEPÍŠU RUKOU — berú sa z `vaultRegister.ts`, ktorý
//    generuje `plany/ainubis/gen-vault-register.mjs` priamo z rozpadu.
//    Dovtedy tu stáli ručne a NESEDELI ANI V JEDNOM SVETE (Cesta psa 92 proti 124,
//    Výživa 119 proti 111) — pričom SÚČET sedel presne, 569 = 569. Čísla neboli
//    spočítané, boli rozdelené do súčtu, takže mozog kreslil nepravdivú hustotu.
//    Stráž `npm run check:vault` zhodí build, keď sa register a rozpad rozídu.
// ⚠️ Mená okruhov sem zámerne NEIDÚ. V nákrese sú slovenské a neodsúhlasené;
//    kým svet nemá obsah, okruh je v mozgu len uzol bez nápisu.
// ════════════════════════════════════════════════════════════════════════════
import { VAULT_COUNTS } from './vaultRegister';

export interface VaultWorld {
  /** i18n kľúč `pack.ainubis.world.<key>` a kotva karty v DOGSCROLLE. */
  key: string;
  /** Hand-drawn ikonka z `public/icons/pack/<ic>.svg`. */
  ic: string;
  /** EN fallback mena. */
  en: string;
  /** EN fallback upútavky (kľúč `pack.ainubis.tease.<key>`). */
  tease: string;
  circles: number;
  scrolls: number;
}

const WORLDS_BASE: readonly Omit<VaultWorld, 'circles' | 'scrolls'>[] = [
  { key: 'dogsPath', ic: 'dogsphinx', en: 'Dog’s path',
    tease: 'Where the wolf now asleep on your sofa came from.' },
  { key: 'understanding', ic: 'idea', en: 'Understanding',
    tease: 'What your dog says with its body long before it opens its mouth — and why we mostly miss it.' },
  { key: 'anatomy', ic: 'nose', en: 'Anatomy',
    tease: 'The dog’s body from the inside: what keeps working while it pretends to sleep.' },
  { key: 'nutrition', ic: 'bow', en: 'Nutrition',
    tease: 'The bowl, from ship’s biscuit to extruder. A hundred years of decisions in which the dog never had a single line.' },
  { key: 'prevention', ic: 'vet', en: 'Prevention',
    tease: 'What you can do today so it isn’t a diagnosis five years from now.' },
  { key: 'training', ic: 'bolt', en: 'Training',
    tease: 'Learning without a broken dog — and without a broken human.' },
  { key: 'problems', ic: 'alert', en: 'Problems',
    tease: 'When something goes wrong: what is urgent, what can wait and what the forums made up.' },
];

/** Počty prilepí register — v zozname vyššie zámerne NIE SÚ, aby sa nedali
 *  prepísať rukou. Svet, ktorý register nepozná, by dostal nulu; taký svet
 *  neexistuje a stráž `check:vault` by to zhodila skôr, než sa to zobrazí. */
export const VAULT_WORLDS: readonly VaultWorld[] = WORLDS_BASE.map((w) => ({
  ...w,
  circles: VAULT_COUNTS[w.key]?.circles ?? 0,
  scrolls: VAULT_COUNTS[w.key]?.scrolls ?? 0,
}));
