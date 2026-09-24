// ════════════════════════════════════════════════════════════════════════════
// AINUBIS · ROVINA NÁSTENKA — DEMO OBSAH (24. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Nákres `plany/nakres-nastenka-zdroje-2026-09-24.html`, blok 0. Matej nad ním
// vybral **A1 · B2 · C2 · D2 · E2 · F1**.
//
// 🔴 PRÍSPEVOK NEMÁ TYP, MÁ ŠTÍTKY (voľba B2, lock `architektura-pack.md` §4.3).
//    Preto tu nie je pole `kind` ani vetva podľa neho: druh nesie PRVÝ ŠTÍTOK
//    v rade a od ostatných sa líši len farbou. Nový feed = nový štítok, nie nová
//    tabuľka a nová obrazovka.
//
// 🔴 MAKETA RADŠEJ PRIZNÁ, ŽE MOZOG O TOM NIČ NEMÁ.
//    Dva zo štyroch demo príspevkov sú z tém, ktoré korpus naozaj pokrýva
//    (výživa, telesné systémy, parazity — `plany/ainubis/kb/`). Príspevok
//    o tréningu pokrytý NIE JE: svet TRÉNING nemá dnes ani jeden zvitok, takže
//    odpoveď to povie nahlas (`blank`) namiesto vymysleného zdroja. Je to to
//    jediné, čím sa nástenka líši od diskusného fóra.
//    [[feedback_maketa_radsej_prizna_ze_nehlada]]
// ════════════════════════════════════════════════════════════════════════════

/** Tri polohy pečate (voľba D2). Percentá sa NEPÍŠU — „na 64 % overené"
 *  predstiera presnosť, ktorú nemáme. */
export type SealKind = 'fits' | 'unknown' | 'differs';

export interface WallReply {
  who: string;
  text: string;
  seal: SealKind;
  /** Prečo to vault vidí inak — rozbalí sa pod pečaťou. Pri `fits` sa nepíše. */
  why?: string;
}

/** Odpoveď AINUBISA pod príspevkom. */
export interface WallAnswer {
  body: string;
  /** Jedna vec, ktorú má človek urobiť. Zlatá, lebo je to výzva, nie fakt. */
  advice?: string;
  /** Riadok FROM — koľko zvitkov a odkiaľ. Pri `blank` ostáva prázdny zámerne. */
  scrolls: number;
  world: string;
  circle: string;
  /** Mozog o téme nemá nič. Vtedy `scrolls === 0` a odpoveď to povie. */
  blank?: boolean;
}

export interface WallPost {
  id: string;
  who: string;
  initial: string;
  /** Pes pod menom — „Ajka · 7 y · German shepherd". Jeden riadok, nie pilulky. */
  dog: string;
  text: string;
  /** 🔴 PRVÝ ŠTÍTOK NESIE DRUH (B2). Zvyšok je téma. */
  tags: string[];
  ai: WallAnswer;
  replies: WallReply[];
  /** Koľko ďalších odpovedí je pod ním. */
  moreReplies: number;
  paws: number;
}

/**
 * Štyri príspevky. Dva s odpoveďou z korpusu, jeden bez pokrytia, jeden, kde
 * si vault s radou človeka NESEDÍ — bez neho by pečať vyzerala ako ozdoba.
 */
export const DEMO_WALL: WallPost[] = [
  {
    id: 'w1',
    who: 'Tomáš B.', initial: 'T', dog: 'Ajka · 7 y · German shepherd',
    text: 'After a longer hike she limps on a hind leg. By morning it is gone. Should I be dealing with this, or is it normal tiredness?',
    tags: ['problem', 'movement', 'looking for advice'],
    ai: {
      body: 'Limping that disappears overnight usually comes from overloaded soft tissue, not from the joint itself. What matters is the pattern: if it returns after every hike beyond a certain distance, that distance is not tiredness — it is her limit. A limp that lasts into a second day, or that shows up after rest rather than after effort, is a different animal and belongs to a vet.',
      advice: 'Write down the distance and the day after, three hikes in a row. The number is what the vet will ask for first.',
      scrolls: 3, world: 'Problems', circle: 'Movement and pain',
    },
    replies: [
      { who: 'Veronika S.', text: 'For us it turned out to be the joints, an X-ray showed it straight away.', seal: 'fits' },
      {
        who: 'Peter M.', text: 'Give her turmeric, it worked for us in two days.', seal: 'differs',
        why: 'The vault carries turmeric as a supporting herb with a slow onset, not as a two-day painkiller — and not without knowing what the pain is.',
      },
    ],
    moreReplies: 12,
    paws: 31,
  },
  {
    id: 'w2',
    who: 'Martina D.', initial: 'M', dog: 'Bodo · 2 y · Border collie',
    text: 'I stopped using his name when telling him off and his recall got better within a week.',
    tags: ['experience', 'training'],
    ai: {
      body: 'The vault has nothing on this yet. Training is one of the seven worlds and not a single scroll of it is written — the brain today knows feeding, the body, herbs and parasites. I am not going to dress an opinion up as knowledge.',
      scrolls: 0, world: 'Training', circle: '', blank: true,
    },
    replies: [
      { who: 'Jana K.', text: 'Same here. The name is now only the good news.', seal: 'unknown' },
    ],
    moreReplies: 6,
    paws: 58,
  },
  {
    id: 'w3',
    who: 'Lukáš H.', initial: 'L', dog: 'Cyra · 4 y · Mixed breed',
    text: 'I pulled a tick off her head this morning and the spot is red. How long do I watch it?',
    tags: ['problem', 'prevention', 'parasites'],
    ai: {
      body: 'A red ring at the site right after removal is usually a reaction to the bite itself and settles within a day or two. What you are watching for is the opposite of fast: a spreading ring days later, a dog that is flat, off food, warm, or stiff in the joints. Those are weeks-later signs, not hours-later ones.',
      advice: 'Mark today in the calendar. If she changes in the next six weeks, the vet needs this date more than the tick.',
      scrolls: 4, world: 'Prevention', circle: 'Fleas, ticks and heartworm',
    },
    replies: [
      { who: 'Erika P.', text: 'We keep the tick in a jar for a few days — the vet asked us for it once.', seal: 'unknown' },
    ],
    moreReplies: 9,
    paws: 24,
  },
  {
    id: 'w4',
    who: 'Zuzana R.', initial: 'Z', dog: 'Bary · 9 y · Labrador',
    text: 'He throws up yellow bile in the morning before his first meal. Is that a stomach problem?',
    tags: ['problem', 'nutrition', 'looking for advice'],
    ai: {
      body: 'An empty stomach for long hours is the common explanation — bile collects and irritates it. The usual answer is not a different food but a different clock: the same daily ration split so the night gap is shorter. If it keeps happening after that, or if there is weight loss behind it, the vomiting stops being about the gap.',
      advice: 'Move part of his dinner to late evening for two weeks and watch the mornings.',
      scrolls: 6, world: 'Nutrition', circle: 'Practical feeding',
    },
    replies: [
      { who: 'Dana V.', text: 'A late-evening handful fixed it for us.', seal: 'fits' },
      {
        who: 'Milan T.', text: 'Milk in the morning coats the stomach.', seal: 'differs',
        why: 'The vault treats milk as a common trigger of loose stool in adult dogs, not as protection for the stomach lining.',
      },
    ],
    moreReplies: 4,
    paws: 17,
  },
];

/**
 * Filtre nad nástenkou. 🔴 JE TO FILTER NAD ŠTÍTKAMI, nie zoznam rubrík —
 * preto je hodnota holý štítok a pribudnutie feedu je jeden riadok.
 */
export const WALL_FILTERS = ['nutrition', 'problem', 'training', 'prevention'];
