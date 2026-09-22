// ════════════════════════════════════════════════════════════════════════════
// MENÁ OKRUHOV VAULTU — mozog ich píše pri uzloch (2026-09-22)
// ────────────────────────────────────────────────────────────────────────────
// Matej 22. 9.: *„všetky svety môžu mať názvy okruhov, ďalej už nie"* — v mozgu
// sa píše meno SVETA a OKRUHU, zvitok ostáva bodom bez nápisu.
//
// SK = nadpisy `### On · …` z `plany/znalosti/svety/*.md` (rozpad 17. 9., zdroj pravdy
// mien). EN = NÁVRH (DRAFT) z 22. 9., nikto ho neodsúhlasil.
// ⚠️ Mená idú cez Matejovu tabuľku `plany/vault-nazvy-2026-09-22.html` — keď ich
//    prepíše, mení sa TENTO súbor a `.md` SPOLU, inak mozog a rozpad povedia dve veci.
// ⚠️ Nie je to i18n, lebo je to ZOZNAM ÚDAJOV s pevným poradím (poradie = uzol
//    v mozgu), nie veta rozhrania. Ostatné jazyky padajú na EN.
// ════════════════════════════════════════════════════════════════════════════
export interface CircleName { sk: string; en: string }

/** Kľúč = `VaultWorld.key`, poradie = poradie okruhu vo svete (O1, O2 …). */
export const VAULT_CIRCLES: Record<string, readonly CircleName[]> = {
  dogsPath: [
    { sk: 'Odkiaľ pes prišiel', en: 'Where the dog came from' },
    { sk: 'Prečo chcem psa', en: 'Why I want a dog' },
    { sk: 'Zvládnem to plemeno?', en: 'Can I handle this breed?' },
    { sk: 'Odkiaľ ho vziať', en: 'Where to get one' },
    { sk: 'Než príde domov', en: 'Before it comes home' },
    { sk: 'Prvý rok', en: 'The first year' },
    { sk: 'Spokojný človek, spokojný pes', en: 'Calm human, calm dog' },
    { sk: 'Dospelý pes', en: 'The adult dog' },
    { sk: 'Starší pes', en: 'The older dog' },
    { sk: 'Odchod', en: 'Saying goodbye' },
  ],
  understanding: [
    { sk: 'Štyridsaťtisíc rokov po boku', en: 'Forty thousand years side by side' },
    { sk: 'Kedysi pracoval. Dnes leží.', en: 'Once he worked. Now he lies down.' },
    { sk: 'O psovi vieme menej', en: 'We know less about the dog' },
    { sk: 'Chyba pred psom', en: 'The mistake before the dog' },
    { sk: 'Krása, ktorá bolí', en: 'Beauty that hurts' },
    { sk: 'Pes zvládne všetko', en: 'A dog can take anything' },
    { sk: 'Granule vymyslel elektrikár', en: 'Kibble was invented by an electrician' },
    { sk: 'Vie operovať srdce', en: 'Can operate on a heart' },
    { sk: 'Nepotrebuješ šesť rokov', en: 'You don’t need six years' },
  ],
  anatomy: [
    { sk: 'Zuby a papuľa', en: 'Teeth and mouth' },
    { sk: 'Žalúdok', en: 'Stomach' },
    { sk: 'Trávenie', en: 'Digestion' },
    { sk: 'Koža/srsť', en: 'Skin and coat' },
    { sk: 'Hormóny', en: 'Hormones' },
    { sk: 'Pohyb a kostra', en: 'Movement and skeleton' },
    { sk: 'Zmysly', en: 'Senses' },
    { sk: 'Odpočinok', en: 'Rest' },
  ],
  nutrition: [
    { sk: 'Ako vzniká granula', en: 'How kibble is made' },
    { sk: 'Sacharidy', en: 'Carbohydrates' },
    { sk: 'Bielkovina', en: 'Protein' },
    { sk: 'Tuky', en: 'Fats' },
    { sk: 'Vitamíny a minerály', en: 'Vitamins and minerals' },
    { sk: 'Baktérie a chémia', en: 'Bacteria and chemistry' },
    { sk: 'Kto zarába', en: 'Who profits' },
    { sk: 'Surové či varené', en: 'Raw or cooked' },
    { sk: 'Dávka a miska', en: 'Portion and bowl' },
    { sk: 'Domáca kuchyňa', en: 'Home cooking' },
    { sk: 'Maškrty', en: 'Treats' },
    { sk: 'Lekáreň', en: 'Pharmacy' },
    { sk: 'Záhrada', en: 'Garden' },
  ],
  prevention: [
    { sk: 'Parazity', en: 'Parasites' },
    { sk: 'Očkovanie', en: 'Vaccination' },
    { sk: 'Domácnosť', en: 'Household' },
    { sk: 'Diagnostika', en: 'Diagnostics' },
    { sk: 'Alternatívne liečenie', en: 'Alternative healing' },
    { sk: 'Strava ako prevencia', en: 'Food as prevention' },
  ],
  training: [
    { sk: 'Ako sa pes učí', en: 'How a dog learns' },
    { sk: 'Školy a štýly', en: 'Schools and styles' },
    { sk: 'Reč, ktorou pes hovorí', en: 'The language a dog speaks' },
    { sk: 'Základ, ktorý drží celý život', en: 'Basics that last a lifetime' },
    { sk: 'Práca namiesto kilometrov', en: 'Work instead of miles' },
    { sk: 'Šport', en: 'Sport' },
    { sk: 'Nos', en: 'Nose' },
    { sk: 'Služobný a pracovný výcvik', en: 'Service and working training' },
    { sk: 'Keď tréning nestačí', en: 'When training isn’t enough' },
  ],
  problems: [
    { sk: 'Pohyb a bolesť', en: 'Movement and pain' },
    { sk: 'Rakovina', en: 'Cancer' },
    { sk: 'Prvá pomoc', en: 'First aid' },
    { sk: 'Psychika/strachy', en: 'Mind and fears' },
    { sk: 'Tráviace problémy', en: 'Digestive problems' },
    { sk: 'Alergie', en: 'Allergies' },
    { sk: 'Epilepsia', en: 'Epilepsy' },
  ],
};
