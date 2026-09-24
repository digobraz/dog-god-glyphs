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

// ════════════════════════════════════════════════════════════════════════════
// HEKTHOROV HEROGLYF AKO PODMALBA (24. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej: *„do heroglyfu by som dal Hektorove symboly úplne, nech sú slabo vidno,
// priesvitné, nech to nepôsobí prázdne"*.
//
// 🔑 JE TO PODMALBA, NIE ÚDAJ. Kreslí sa len do slotov, ktoré človek ešte
//    nevyplnil, a v krytí ~13 %. Keď vyberie svoju voľbu, podmalba pod ňou
//    zmizne — takže rám nikdy neukazuje dve odpovede na tú istú otázku.
//
// 🔴 ČO TU NIE JE, TO NEVIEM — A NEVYMÝŠĽAM SI TO. Zapísané sú len hodnoty,
//    ktoré o Hektorovi stoja v repe (čierny kríženec zo záchrany, samec,
//    zakladateľ #1, majiteľ Matej). Silueta plemena, dva znaky povahy a oba
//    horoskopy majiteľa v repe NIE SÚ; tie sloty preto ostávajú prerušovanou
//    čiarou, kým ich Matej nepovie. Vyplniť ich „nejako" by bol výmysel, ktorý
//    si ktokoľvek prečíta ako Hektorove dáta.
// ⚠️ Kľúče sú zhodné s `selections` (`dogyptStore`), aby ich rám vedel použiť
//    bez prekladovej tabuľky.
// ════════════════════════════════════════════════════════════════════════════
export const HEKTHOR_GLYPH: Record<string, string> = {
  /** Samec. */
  dogGender: 'king',
  /** Čierny kožuch → Mesiac. */
  dogColour: 'dark',
  /** *„Rescued from the streets and adopted from a shelter"* (text kroku 2). */
  dogFate: 'rescued',
  /** Kríženec, nie chovateľský papier. */
  dogBloodline: 'mutt',
  /**
   * Silueta plemena. `08-06.svg` je Hektorov patrón — nie odhad: stojí v
   * `plany/zadanie-heroglyf-hekthor-FRESH-SESSION.md` pri dátach zo servera
   * (*„#1 · Hekthor · Matej · SVK · patron_svg 08-06.svg"*).
   */
  patronSvg: '08-06.svg',
  /** Majiteľ je Matej. */
  ownerGender: 'man',
  ownerInitial: 'M',
  /** Zakladateľ — poradové číslo 1 (Hektorova karta na stene, col=0, row=-1). */
  ranking: '1',
};
