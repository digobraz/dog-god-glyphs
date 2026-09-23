// ════════════════════════════════════════════════════════════════════════════
// MAKETA CHATU — DEMO DÁTA (23. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Prepis `CHATS` a `ZV` z nákresu `plany/nakres-vault-fasada-v5-2026-09-20.html`
// (rovina 2 · CHAT). Je to MAKETA: odpovede sú napísané, nie vygenerované.
// Skutočné odpovede rieši korpus `ainubis_kb_*` a konzola — tu ide o POVRCH.
//
// ⚠️ OTÁZKY SÚ VYBRANÉ TAK, ABY NA NE DEMO ZVITKY NAOZAJ ODPOVEDALI. Keby sa
//    otázka pýtala na kožu a zdroj ukazoval na „dve žobrá navyše denne", maketa
//    by klamala práve o tom jedinom, čo má dokázať: že odpoveď má pôvod.
// ⚠️ TEXTY SÚ EN. Nákres je SK (interná reč), appka je EN (pravidlo 7 v
//    CLAUDE.md) — preklad je tu, nie v i18n, lebo demo obsah maketu neprežije.
// ════════════════════════════════════════════════════════════════════════════

/** Zvitok, na ktorý sa odpoveď odvoláva. `id` = poradie v demo mozgu. */
export interface DemoScroll {
  id: number;
  /** Svet, do ktorého zvitok patrí — rovnaké poradie ako `VAULT_WORLDS`. */
  world: number;
  title: string;
  circle: string;
}

/**
 * Dvanásť zvitkov z nákresu (z cieľových 569). Menované sú všetky, na ktoré
 * ukazuje aspoň jedna odpoveď — zvyšok mozgu ostáva stlmený.
 */
export const DEMO_SCROLLS: DemoScroll[] = [
  { id: 0, world: 3, circle: 'The story of the bowl', title: 'James Spratt and the ship biscuit' },
  { id: 1, world: 3, circle: 'The story of the bowl', title: '1908 · Bennet and the bone shape' },
  { id: 2, world: 3, circle: 'The story of the bowl', title: '1931 · Nabisco and 3,000 salesmen' },
  { id: 3, world: 3, circle: 'The story of the bowl', title: 'Podcast · the whole story of the bowl' },
  { id: 4, world: 3, circle: 'The story of the bowl', title: '1950 · Purina and extrusion' },
  { id: 5, world: 3, circle: 'What ended up in the tin', title: '1922 · Ken-L-Ration' },
  { id: 6, world: 3, circle: 'What ended up in the tin', title: 'Nobody ever asked the dogs' },
  { id: 7, world: 4, circle: 'Parasites', title: 'A tick is not an event, it is a season' },
  { id: 8, world: 4, circle: 'Teeth', title: 'Tartar shows up late' },
  { id: 9, world: 4, circle: 'Weight', title: 'Two extra treats a day' },
  { id: 10, world: 0, circle: 'Before the dog arrives', title: 'Before they come home' },
  { id: 11, world: 0, circle: 'The last years', title: 'An older dog has less strength, not less appetite' },
];

export interface DemoAnswer {
  /** Odseky odpovede. `<b>` je jediná značka — zvýraznenie tvrdenia. */
  paragraphs: string[];
  /** JEDNA vec, ktorú má človek urobiť. Bez nej je z odpovede prednáška. */
  advice: string;
  /** Zvitky, z ktorých odpoveď je. Poradie = poradie dôležitosti. */
  sources: number[];
}

export type DemoMessage = { me: string } | { ai: DemoAnswer };

export interface DemoChat {
  id: number;
  /** Deň, pod ktorý rozhovor v páse histórie patrí. Maketa ho nepočíta. */
  day: string;
  title: string;
  msgs: DemoMessage[];
}

export const DEMO_CHATS: DemoChat[] = [
  {
    id: 1,
    day: 'today',
    title: 'Why is kibble shaped like a bone?',
    msgs: [
      { me: 'Why are kibble and treats shaped like bones? Is it for the teeth?' },
      {
        ai: {
          paragraphs: [
            'No. The bone shape was born in 1908 as <b>packaging for the human</b>, not as a tool for the dog — so that one glance at the shelf tells you it is for a dog.',
            'The shape says nothing about what is inside. The ingredient list does — and so does the question of whose problem that bowl solved.',
          ],
          advice: 'Next time you shop, read the first three ingredients. Ignore the shape.',
          sources: [1, 0],
        },
      },
    ],
  },
  {
    id: 2,
    day: 'today',
    title: 'How much should a nine-year-old eat?',
    msgs: [
      { me: 'Hekthor is nine and looks like he is gaining weight. How much should he actually eat?' },
      {
        ai: {
          paragraphs: [
            'An older dog has <b>less strength, not less appetite</b> — what dropped is the output, not the hunger.',
            'The usual source of extra weight is not the bowl but what does not belong in it: two extra treats a day are a tenth of the daily ration for a medium dog.',
          ],
          advice: 'For two weeks weigh the kibble instead of guessing, and subtract treats from the ration rather than adding them on top.',
          sources: [11, 9],
        },
      },
    ],
  },
  {
    id: 3,
    day: 'yesterday',
    title: 'Tick on the ear — pull it or see a vet?',
    msgs: [
      { me: 'I found a tick on his ear. Should I pull it myself or go to the vet?' },
      {
        ai: {
          paragraphs: [
            'Pull it now and pull it whole — every extra hour raises the risk of transmission. A tick is not an event, it is a <b>season</b>: if you found one, look for the others.',
          ],
          advice: 'Pull straight up, no twisting and no oil. Note the spot in DOG ID and watch it for 14 days.',
          sources: [7],
        },
      },
    ],
  },
  {
    id: 4,
    day: '12 Sep',
    title: 'Tartar — when does it need treating?',
    msgs: [
      { me: 'I can see brown film on his teeth. Is it already a procedure?' },
      {
        ai: {
          paragraphs: [
            'Tartar becomes visible only once the process has been running for years. What you see is its end, not its beginning.',
          ],
          advice: 'Photograph the teeth once a month from the same side. You will see the change in the photos before you see it in the mouth.',
          sources: [8],
        },
      },
    ],
  },
  {
    id: 5,
    day: '12 Sep',
    title: 'Is kibble "ultra-processed"?',
    msgs: [
      { me: 'I heard kibble is ultra-processed. Is that true?' },
      {
        ai: {
          paragraphs: [
            'The technology comes from making human breakfast cereal: an extruder forces the mix through a die under pressure and heat. <b>Heat and pressure change the protein</b> — that is a fact, not an opinion.',
            'What it means for one particular dog is already an opinion, and it depends on the rest of the ration.',
          ],
          advice: 'If you want one change you can actually evaluate: add a fresh component to one meal a day.',
          sources: [4, 2],
        },
      },
    ],
  },
];

/** Čo má AINUBIS pred sebou, keď odpovedá. Bez toho je to všeobecný chatbot. */
export const DEMO_CONTEXT = {
  dog: 'HEKTHOR · 9 y · mixed breed',
  dogId: 'DOG ID 68 %',
  scrolls: '12 scrolls',
};
