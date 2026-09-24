// ⚠️ GENEROVANÉ — needituj ručne.
// Zdroj: plany/znalosti/svety/*.md · generátor: plany/ainubis/gen-vault-register.mjs
// Prepísané pri každom behu; stráž `npm run check:vault` zhodí build, keď sa rozídu.
//
// Do 24. 9. 2026 stáli tieto počty RUKOU vo `worlds.ts` a nesedeli ani v jednom
// svete (Cesta psa 92 proti 124, Výživa 119 proti 111) — pričom súčet sedel presne.
// Mozog kreslil nepravdivú hustotu. [[feedback_rucny_zoznam_v_locku_zostarne_ticho]]

/** Okruhy a zvitky na svet — spočítané z rozpadu, nie odhadnuté. */
export const VAULT_COUNTS: Record<string, { circles: number; scrolls: number }> = {
  dogsPath: { circles: 10, scrolls: 124 },
  understanding: { circles: 9, scrolls: 61 },
  anatomy: { circles: 8, scrolls: 67 },
  nutrition: { circles: 13, scrolls: 111 },
  prevention: { circles: 6, scrolls: 49 },
  training: { circles: 9, scrolls: 92 },
  problems: { circles: 7, scrolls: 65 },
};

/** Chunkov korpusu, ktoré má AINUBIS naozaj k dispozícii (`ainubis_kb_bodies`). */
export const CORPUS_CHUNKS = 675;

/** Zvitkov, ktoré už majú pod sebou chunk korpusu. Kým je to 0, VAULT nemá
 *  čím zobraziť ani jeden zvitok — hoci korpus má 675 chunkov. */
export const PAIRED_SCROLLS = 0;
