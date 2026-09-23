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

/**
 * Správa vo vlákne. Päť tvarov — otázka · odpoveď · rozpísaný formulár
 * príspevku · odoslaný príspevok · zoznam mojich príspevkov.
 * ⚠️ FORMULÁR A ZOZNAM SÚ SPRÁVY, NIE OKNO NAVRCHU. Matej 20. 9. nad nákresom
 *    v5 a lock §4.2: akcia nesmie odniesť človeka preč z miesta, kde je.
 */
export type DemoMessage =
  | { me: string }
  | { ai: DemoAnswer }
  | { form: FormKind }
  | { pend: DemoPending & { verdict: DemoVerdict } }
  | { mine: true };

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

/** Čo má AINUBIS pred sebou, keď odpovedá. Bez toho je to všeobecný chatbot.
 *  ⚠️ OD 23. 9. 2026 JE TO JEDEN RIADOK TEXTU, NIE RAD PILULEK. Tri pilulky sa
 *     na 390 px lámali do troch riadkov a zabrali 129 px z 844 — pätinu
 *     obrazovky na vetu, ktorá sa nedá stlačiť. Matej vybral A1 nad nákresom
 *     `plany/nakres-ainubis-chat-doladenie-2026-09-23.html`. Meno psa ostáva
 *     zvýraznené: je to jediné slovo, ktoré dokazuje, že AINUBIS pozná TOHTO psa. */
export const DEMO_CONTEXT = {
  name: 'HEKTHOR',
  rest: '9 y · mixed breed · DOG ID 68 % · 12 scrolls',
};

// ════════════════════════════════════════════════════════════════════════════
// PRISPIEVANIE DO MOZGU (23. 9. 2026) — formulár, posudok, stavy
// ────────────────────────────────────────────────────────────────────────────
// Prepis `FORMS`, `submitForm` a `PRISP` z nákresu v5 (r. 1750–1930), EN.
// Matej 20. 9.: „možnosť pridať nový poznatok, naskenovať knihu, priložiť odkaz
// do databázy — to by podliehalo schváleniu a následne by sa informácia
// doplnila… ak by bola relevantná."
//
// 🔴 PORADIE JE ČLOVEK → AINUBIS → MATEJ. Stroj PREDTRIEDI (relevancia, zdroj,
//    kam to patrí), pustí to Matej. Posudok je PODKLAD, NIE ROZSUDOK — preto má
//    vlastný blok a nie je napísaný ako rozhodnutie.
// ⚠️ IKONKY TU NIE SÚ. Matej 23. 9. nad nákresom doladenia: emoji sú mimo brandu
//    (hovorí nimi len mapa) a kresby do kitu zatiaľ nie sú ⇒ maketa ide BEZ
//    ikoniek, len slovom. Nedopĺňaj sem `ic: '📝'` z nákresu v5.
// ════════════════════════════════════════════════════════════════════════════

export type FormKind = 'insight' | 'link' | 'book' | 'video';

export interface DemoForm {
  /** Nadpis formulára. */
  name: string;
  /** Riadok v ponuke „+" pod menom. */
  menuSub: string;
  placeholder: string;
  /** Čo sa s tým stane — pod tlačidlom, aby to človek vedel PRED odoslaním. */
  sub: string;
  /** Okruh, ktorý AINUBIS navrhne. V makete je napísaný, nie vyrátaný. */
  circle: string;
}

export const DEMO_FORMS: Record<FormKind, DemoForm> = {
  insight: {
    name: 'Insight or experience',
    menuSub: '“I gave my dog x and he felt better”',
    placeholder: 'What did you find out? E.g. “After switching to twice-a-day feeding Hekthor stopped throwing up bile in the morning.”',
    sub: 'An experience is not a study — it reaches the brain once more people confirm it, or once a source does.',
    circle: 'NUTRITION › The bowl and the ration',
  },
  link: {
    name: 'Link',
    menuSub: 'article, study, thread — AINUBIS reads and judges it',
    placeholder: 'Paste the address of an article, a study or a thread…',
    sub: 'AINUBIS reads it, pulls out the claims and says which scrolls it confirms and which it contradicts.',
    circle: 'PREVENTION › Food as prevention',
  },
  book: {
    name: 'Book',
    menuSub: 'photograph the pages or upload a PDF',
    placeholder: 'Title and author. Photograph the pages or upload a PDF…',
    sub: 'A book turns into scrolls, not into a quote. The content goes into the brain, the book stays as the source.',
    circle: 'NUTRITION › How kibble is made',
  },
  video: {
    name: 'Video',
    menuSub: 'lecture, breakdown, training demo',
    placeholder: 'Link to the video + what matters in it…',
    sub: 'Saved with a timestamp, so you can jump straight to the part that matters.',
    circle: 'UNDERSTANDING › The language a dog speaks',
  },
};

/** Poradie položiek v ponuke „+". */
export const FORM_ORDER: FormKind[] = ['insight', 'link', 'book', 'video'];

export interface DemoPending {
  kind: FormKind;
  text: string;
  /** ⏳ čaká na Mateja · ✓ v mozgu · ✕ zamietnuté. */
  status: 'wait' | 'ok' | 'no';
  /** Čo sa s tým stalo — jedna veta, bez posudku.
   *  ⚠️ NEOPAKUJ V NEJ STAV. Pilulka vedľa už hovorí „in the brain"; veta
   *  „accepted · split into 9 scrolls" tvrdila to isté dvakrát. */
  note: string;
  when: string;
}

/**
 * Moje príspevky. Päť kusov z nákresu v5 — dva čakajú, dva prešli, jeden nie.
 * ⚠️ ZAMIETNUTÝ TAM MUSÍ BYŤ. Zoznam, kde všetko prejde, klame o tom jedinom,
 *    čo prispievanie drží pri živote: že to niekto naozaj číta.
 */
export const DEMO_PENDING: DemoPending[] = [
  {
    kind: 'link', status: 'wait', when: '2 days',
    text: 'A study on omega-3 in arthritis (JAVMA 2021)',
    note: 'relevant · source verified · suggested for PREVENTION › Food as prevention',
  },
  {
    kind: 'insight', status: 'wait', when: '5 days',
    text: 'After switching to a raised bowl Hekthor stopped coughing after meals',
    note: 'experience without a source · 3 people confirmed it on the board · 10 needed',
  },
  {
    kind: 'book', status: 'ok', when: '12 Sep',
    text: 'Feeding Dogs (Conor Brady) — chapter 7',
    note: 'split into 9 scrolls in NUTRITION',
  },
  {
    kind: 'video', status: 'ok', when: '9 Sep',
    text: 'A lecture on extrusion (YouTube, 41 min)',
    note: 'background for the circle How kibble is made',
  },
  {
    kind: 'link', status: 'no', when: '7 Sep',
    text: 'Blog “curing epilepsy with herbs”',
    note: 'claims without a source, contradicts the scroll on antiepileptics',
  },
];

/**
 * Odpoveď na otázku, ktorú človek napíše sám. Maketa NEGENERUJE a NEHĽADÁ —
 * ukazuje TVAR odpovede a priznáva, že je to maketa.
 *
 * 🔴 PRÁZDNY ZOZNAM ZDROJOV JE ZÁMER, NIE NEDOROBOK. Riadok FROM je to jediné,
 *    čím sa tento chat líši od každého iného chatbota; vypísať pod ľubovoľnú
 *    otázku dva náhodné zvitky by klamalo práve o ňom. Maketa preto povie, že
 *    nehľadala — a riadok ostáva na svojom mieste.
 */
export const DEMO_REPLY: DemoAnswer = {
  paragraphs: [
    '<b>Mock-up.</b> The answer from the vault belongs here. Its shape is always the same: what we know about it, what of that holds for your dog, and where it comes from.',
  ],
  advice: 'One concrete step for Hekthor — something you can do today and judge in two weeks.',
  sources: [],
};

/**
 * Otázky na jeden klik v prázdnom rozhovore.
 * ⚠️ KAŽDÁ MUSÍ MAŤ V DEMO MOZGU SVOJ ZVITOK. Mozog má 12 zvitkov (miska, váha,
 *    vek, parazity, zuby) — otázka o vôdzke by ukázala zdroj, ktorý o vôdzke nie
 *    je, a maketa by klamala o tom jedinom, čo má dokázať.
 */
export const DEMO_STARTERS: { q: string; sources: number[] }[] = [
  { q: 'How much should he eat', sources: [11, 9] },
  { q: 'Is a tick an emergency', sources: [7] },
  { q: 'Brown film on his teeth', sources: [8] },
  { q: 'What ended up in the tin', sources: [5, 6] },
];

/**
 * POSUDOK AINUBISA — čo si o príspevku myslí stroj, kým sa naň pozrie Matej.
 * ⚠️ JE TO PODKLAD, NIE ROZSUDOK. Preto je napísaný ako pozorovanie („sedí do
 *    okruhu, ktorý existuje") a poslednou vetou vždy priznáva, kto rozhoduje.
 */
export interface DemoVerdict {
  /** Prvá veta — tá sa vysadí tučne, aby bolo vidieť, KTO hovorí. */
  lead: string;
  /** Čo stroj videl. Posledná veta vždy priznáva, kto rozhoduje. */
  line: string;
  /** Štítky: relevancia · kam to patrí · aký je to zdroj. */
  tags: string[];
}

/** Posudok na čerstvo odoslaný príspevok. Maketa ho NERÁTA — má ho napísaný. */
export function demoVerdict(kind: FormKind): DemoVerdict {
  const f = DEMO_FORMS[kind];
  return {
    lead: 'AINUBIS read it in 4 s.',
    line: kind === 'insight'
      ? 'It fits a circle that already exists and contradicts no scroll. It needs more people to confirm it before it counts. Matej lets it into the brain.'
      : 'The source checks out and it contradicts no scroll. Matej lets it into the brain.',
    tags: [
      'relevance high',
      f.circle,
      kind === 'insight' ? 'source: your experience' : `source: ${f.name.toLowerCase()}`,
    ],
  };
}
