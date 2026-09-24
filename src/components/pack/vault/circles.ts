// ════════════════════════════════════════════════════════════════════════════
// MENÁ OKRUHOV VAULTU — mozog ich píše pri uzloch (2026-09-22, preskladané 2026-09-24)
// ────────────────────────────────────────────────────────────────────────────
// Matej 22. 9.: *„všetky svety môžu mať názvy okruhov, ďalej už nie"* — v mozgu
// sa píše meno SVETA a OKRUHU, zvitok ostáva bodom bez nápisu.
//
// 🔴 PRESKLADANÉ 24. 9. 2026 (Matej odsúhlasil): 62 → 46 okruhov. Okruh má TEST,
//    nie názov, a je to NÁDOBA, nie kapitola — dopĺňa sa navždy. Dôvod zlúčení a
//    testy sú v `plany/znalosti/svety/*.md` (ČASŤ 2) a v hárku
//    `plany/nakres-vault-okruhy-2026-09-24.html`.
//
// SK = nadpisy `### On · …` z `plany/znalosti/svety/*.md` (zdroj pravdy mien).
// EN = NÁVRH (DRAFT), nikto ho neodsúhlasil.
// ⚠️ Mená idú cez Matejovu tabuľku `plany/vault-nazvy-2026-09-22.html` — keď ich
//    prepíše, mení sa TENTO súbor a `.md` SPOLU, inak mozog a rozpad povedia dve veci.
//    Stráž `npm run check:vault` to meria.
// ⚠️ Nie je to i18n, lebo je to ZOZNAM ÚDAJOV s pevným poradím (poradie = uzol
//    v mozgu), nie veta rozhrania. Ostatné jazyky padajú na EN.
// ════════════════════════════════════════════════════════════════════════════
export interface CircleName { sk: string; en: string }

/** Kľúč = `VaultWorld.key`, poradie = poradie okruhu vo svete (O1, O2 …). */
export const VAULT_CIRCLES: Record<string, readonly CircleName[]> = {
  dogsPath: [
    { sk: 'Odkiaľ pes prišiel', en: 'Where the dog came from' },
    { sk: 'Rozhodnutie pred psom', en: 'The decision before the dog' },
    { sk: 'Odkiaľ ho vziať', en: 'Where to get one' },
    { sk: 'Príchod a prvý rok', en: 'Arrival and the first year' },
    { sk: 'Vzťah človek–pes', en: 'Human and dog' },
    { sk: 'Reprodukcia a kastrácia', en: 'Breeding and neutering' },
    { sk: 'Dospelosť a staroba', en: 'Adulthood and old age' },
    { sk: 'Odchod', en: 'Saying goodbye' },
  ],
  understanding: [
    { sk: 'Kto je pes a čo z neho máme', en: 'Who the dog is and what we take from him' },
    { sk: 'Vzhľad, ktorý rozhoduje', en: 'Looks that decide' },
    { sk: 'Pes, ktorý nemá čo robiť', en: 'A dog with nothing to do' },
    { sk: 'Čo sa o psovi nevie', en: 'What we no longer know about dogs' },
    { sk: 'Kto na psovi zarába', en: 'Who profits from the dog' },
    { sk: 'Zvládneš to sám', en: 'You can do this yourself' },
  ],
  anatomy: [
    { sk: 'Zuby a papuľa', en: 'Teeth and jaws' },
    { sk: 'Žalúdok a trávenie', en: 'Stomach and digestion' },
    { sk: 'Koža, srsť a zápach', en: 'Skin, coat and smell' },
    { sk: 'Hormóny', en: 'Hormones' },
    { sk: 'Pohyb a kostra', en: 'Movement and skeleton' },
    { sk: 'Zmysly', en: 'Senses' },
    { sk: 'Odpočinok', en: 'Rest' },
  ],
  nutrition: [
    { sk: 'Prirodzená strava, koľko čoho a kedy', en: 'Natural food: how much of what, and when' },
    { sk: 'Živiny', en: 'Nutrients' },
    { sk: 'Surové, varené, domáce', en: 'Raw, cooked, homemade' },
    { sk: 'Granule sú pre ľudí', en: 'Kibble is for humans' },
    { sk: 'Bezpečnosť jedla', en: 'Food safety' },
    { sk: 'Bylinky a záhrada', en: 'Herbs and the garden' },
    { sk: 'Doplnky', en: 'Supplements' },
  ],
  prevention: [
    { sk: 'Parazity', en: 'Parasites' },
    { sk: 'Očkovanie a titre', en: 'Vaccination and titres' },
    { sk: 'Jedy v domácnosti', en: 'Poisons at home' },
    { sk: 'Všímať si včas', en: 'Catching it early' },
    { sk: 'Alternatívne liečenie', en: 'Alternative treatment' },
  ],
  training: [
    { sk: 'Ako sa pes učí', en: 'How a dog learns' },
    { sk: 'Reč, ktorou pes hovorí', en: 'The language a dog speaks' },
    { sk: 'Základ, ktorý drží celý život', en: 'The basics that last a lifetime' },
    { sk: 'Záťaž každý deň', en: 'Work for every day' },
    { sk: 'Disciplíny', en: 'Disciplines' },
    { sk: 'Tréneri a hranice tréningu', en: 'Trainers and the limits of training' },
  ],
  problems: [
    { sk: 'Núdza — minúty rozhodujú', en: 'Emergency: minutes decide' },
    { sk: 'Pohyb a bolesť', en: 'Movement and pain' },
    { sk: 'Koža, uši, alergie', en: 'Skin, ears, allergies' },
    { sk: 'Tráviace problémy', en: 'Digestive problems' },
    { sk: 'Neurológia a epilepsia', en: 'Neurology and epilepsy' },
    { sk: 'Psychika', en: 'Mind and behaviour' },
    { sk: 'Rakovina', en: 'Cancer' },
  ],
};
