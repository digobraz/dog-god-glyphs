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
// ⚠️ Mená okruhov sem zámerne NEIDÚ. V nákrese sú slovenské a neodsúhlasené;
//    kým svet nemá obsah, okruh je v mozgu len uzol bez nápisu.
// ════════════════════════════════════════════════════════════════════════════
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

export const VAULT_WORLDS: readonly VaultWorld[] = [
  { key: 'dogsPath', ic: 'dogsphinx', en: 'Dog’s path', circles: 10, scrolls: 92,
    tease: 'Where the wolf now asleep on your sofa came from.' },
  { key: 'understanding', ic: 'idea', en: 'Understanding', circles: 9, scrolls: 83,
    tease: 'What your dog says with its body long before it opens its mouth — and why we mostly miss it.' },
  { key: 'anatomy', ic: 'nose', en: 'Anatomy', circles: 8, scrolls: 73,
    tease: 'The dog’s body from the inside: what keeps working while it pretends to sleep.' },
  { key: 'nutrition', ic: 'bow', en: 'Nutrition', circles: 13, scrolls: 119,
    tease: 'The bowl, from ship’s biscuit to extruder. A hundred years of decisions in which the dog never had a single line.' },
  { key: 'prevention', ic: 'vet', en: 'Prevention', circles: 6, scrolls: 55,
    tease: 'What you can do today so it isn’t a diagnosis five years from now.' },
  { key: 'training', ic: 'bolt', en: 'Training', circles: 9, scrolls: 83,
    tease: 'Learning without a broken dog — and without a broken human.' },
  { key: 'problems', ic: 'alert', en: 'Problems', circles: 7, scrolls: 64,
    tease: 'When something goes wrong: what is urgent, what can wait and what the forums made up.' },
];
