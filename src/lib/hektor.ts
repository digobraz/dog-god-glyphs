// ════════════════════════════════════════════════════════════════════════════
// HEKTHOR — údaje o zakladateľovi, ktoré sa nesmú prepisovať ručne
// ────────────────────────────────────────────────────────────────────────────
// Matej 28. 8. 2026: „20.05.2016 daj tam zatiaľ toto".
//
// 🔴 PREČO DÁTUM A NIE „10 ROKOV": vek je údaj ODVODITEĽNÝ z dátumu, takže
//    napísaný natvrdo začne na jeho ďalšie narodeniny ticho klamať a nikto si
//    to nevšimne — text bude ďalej vyzerať správne. Ukladá sa preto to, čo sa
//    nemení, a počíta sa to, čo áno.
//
// ⚠️ Dátum je JEDINÝ zdroj. Keby ho niekto potreboval aj inde (DOG ID, profil,
//    grid), berie ho ODTIAĽTO — druhá kópia sa rozíde v deň, keď sa jedna
//    spresní. Matejovo „zatiaľ" znamená, že presnosť ešte môže doladiť.
// ════════════════════════════════════════════════════════════════════════════

/** Narodenie Hektora. Mesiac je 1–12, nie index — je to zápis dátumu, nie API. */
export const HEKTHOR_BORN = { year: 2016, month: 5, day: 20 } as const;

/**
 * Koľko rokov má Hektor dnes. Celé roky, teda to, čo človek povie nahlas —
 * nie zaokrúhlený zlomok.
 *
 * Počíta sa porovnaním trojíc (rok, mesiac, deň), nie delením milisekúnd:
 * priestupné roky a letný čas robia z „ms / 365.25" hodnotu, ktorá sa raz za
 * štyri roky preklopí o deň skôr.
 */
export function hekthorAgeYears(now: Date = new Date()): number {
  const b = HEKTHOR_BORN;
  let age = now.getFullYear() - b.year;
  const m = now.getMonth() + 1;
  if (m < b.month || (m === b.month && now.getDate() < b.day)) age -= 1;
  return age;
}
