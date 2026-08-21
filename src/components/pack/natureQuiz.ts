// OSOBNOSTNÝ KVÍZ PSA — dataset + scoring. Zdroj pravdy pre `/pack/nature`.
// Zadanie: plany/zadanie-osobnostny-kviz-2026-08-06.md
//
// DVE OSI, JEDEN KVÍZ. Každá odpoveď nesie váhy na obe naraz — preto 14 otázok
// namiesto 2× 10:
//   OS 1 ELEMENT (5, TČM)  — z čoho je pes stvorený → výživa, longevity, AINUBIS
//   OS 2 ÚLOHA   (9, WDDC) — čo pes robí pre svorku → pack, buddy matching
//
// LOCKY, ktoré tento súbor drží:
//  • Kvíz NEDÁVA „povahu". Povaha = 2 z 8 heroglyf charakterov (majiteľ si VYBERIE)
//    + 16 DOG_TEMPERAMENT_TAGS (naklikne). Toto je TRETIA vrstva: diagnostika.
//    Mená sa preto nesmú prekrývať — viď MENÁ nižšie.
//  • Meno úlohy nesmie byť orgán elementu (na tom padlo SRDCE = orgán Ohňa).
//  • Kombinácia sa píše v GENITÍVE: „OBRANCA VODY", nie „VODNÝ OBRANCA" —
//    „Drevený" v SK znamená aj nemotorný.
//  • Zvláštna úloha sa v UI NIKDY nezobrazuje ako samotný chip vedľa tagov povahy,
//    vždy s prefixom „zvláštna úloha" — `SAMOTÁR` sa inak zrazí s tagom `loner`,
//    ktorý má rovnaký SK label (`pack.dogTag.loner` = „Samotár“). Vedomé riziko,
//    Matej 2026-08-06.
//  • Žiadne zdravotné tvrdenia. `watch` je „na čo dávať pozor a o čom hovoriť
//    s veterinárom", nie diagnóza — rovnaký disclaimer majú aj zdrojové PDF.
//
// MENÁ — prečo tieto (debata Matej + Claude + Fable 5, LOCKED 2026-08-06).
// Obsadené a preto zakázané: `Strážca` = heroglyf `guardian` AJ rang
// `pack.ladder.sentinel` · `Ochranca` ≈ tag `protective` · `Pútnik` = rang
// `pack.ladder.wanderer` · `Správca` = rang `pack.ladder.steward` · `Starešina` =
// rang `pack.ladder.elder` · `Vládca/Faraón` = DOGMA 5.1–5.3 + rang.
// EN míny, na ktorých padli kandidáti: `The Siren` (zvodkyňa), `the throne`
// (záchod), `The Brain` (water on the brain = hydrocefalus), `The Helm` (aj
// prilba), `The Knot` (psí slang), `Rainbow` (Rainbow Bridge = smrť psa).
//
// ZDROJ SA PRIZNÁVA. Vrstva úloh stojí na výskume Wolf and Dog Development Centre
// („The 9 Social Identities“). Pätička je POVINNÁ na každom povrchu, kde sa úlohy
// zobrazujú — `NATURE_ATTRIBUTION` nižšie. Attribution legalizuje mená a fakty,
// NIE prevzatie textov: definície nižšie sú naše, doslovné citácie zo zdroja sú
// krátke a v úvodzovkách.

// ── OS 1: ELEMENT ────────────────────────────────────────────────────────────
export type ElementKey = 'fire' | 'earth' | 'metal' | 'water' | 'wood';

export interface NatureElement {
  key: ElementKey;
  /** Genitív do titulu: „OBRANCA VODY". i18n `pack.nature.el.<key>.of`. */
  ofEN: string;
  labelEN: string;
  i18n: string;
  /** Jedna veta — aký ten pes je. */
  summaryEN: string;
  /** Telesný obraz (z Dr. Judy Morgan + doggietudes). */
  bodyEN: string;
  /** „Na čo dávať pozor" — NIE diagnóza. */
  watchEN: string;
  /** Odznak. Kruh so zlatou obručou, 256 px webp s alfou. */
  art: string;
}

export const NATURE_ELEMENTS: Record<ElementKey, NatureElement> = {
  fire: {
    key: 'fire', labelEN: 'Fire', ofEN: 'of Fire', i18n: 'pack.nature.el.fire',
    art: '/images/nature/el-fire.webp',
    summaryEN: 'The life of the party — loud, affectionate, needs to be seen, and hard to switch off.',
    bodyEN: 'Strong compact body, small head, restless sleeper, seeks out cold tiles and shade.',
    watchEN: 'Heat, restlessness, separation distress. Cooling food suits them better than warming meat.',
  },
  earth: {
    key: 'earth', labelEN: 'Earth', ofEN: 'of Earth', i18n: 'pack.nature.el.earth',
    art: '/images/nature/el-earth.webp',
    summaryEN: 'Calm, loyal, motherly — and lives for food.',
    bodyEN: 'Round and large, big head, slow deliberate movement, relaxes anywhere.',
    watchEN: 'Digestion, appetite, teeth and gums, putting on weight. Damp and cold food does not suit them.',
  },
  metal: {
    key: 'metal', labelEN: 'Metal', ofEN: 'of Metal', i18n: 'pack.nature.el.metal',
    art: '/images/nature/el-metal.webp',
    summaryEN: 'Orderly, reserved, disciplined — affection on their own schedule.',
    bodyEN: 'Broad chest and forehead, good coat, sleeps still, learns by repetition.',
    watchEN: 'Breathing, skin dryness, brittle nails. Moisture in the diet matters for them.',
  },
  water: {
    key: 'water', labelEN: 'Water', ofEN: 'of Water', i18n: 'pack.nature.el.water',
    art: '/images/nature/el-water.webp',
    summaryEN: 'Cautious, quiet, watchful — retreats before the unfamiliar rather than facing it.',
    bodyEN: 'Thin to mid-size, quiet on their feet, feels the cold, wakes often at night.',
    watchEN: 'Bladder and kidneys, bones and hind end, hearing. Warmth and a hideaway help them.',
  },
  wood: {
    key: 'wood', labelEN: 'Wood', ofEN: 'of Wood', i18n: 'pack.nature.el.wood',
    art: '/images/nature/el-wood.webp',
    summaryEN: 'Out in front — competitive, impatient, fast, and needs to win.',
    bodyEN: 'Lean, quick movements, big eyes, sleep comes second to whatever needs doing.',
    watchEN: 'Liver, ligaments, eyes and ears. Wind and weather changes unsettle them.',
  },
};

export const ELEMENT_KEYS: ElementKey[] = ['fire', 'earth', 'metal', 'water', 'wood'];

// ── OS 2: ÚLOHA V SVORKE ─────────────────────────────────────────────────────
// 5 základných + 4 zvláštne. TOTO DELENIE JE ZDROJOVÉ, nie naše — WDDC má sekcie
// „The 5 Core Social Characters" a „The 4 Specialist Roles", k druhej píše
// „you won't always see them in every dog family". Zvláštne úlohy SEDIA NA
// základných navrch, nie sú ich súperi. Zliať to do 9 rovnocenných výsledkov by
// zdroj skreslilo: Nanny „can come from any of the Social Characters", Lone Wolf
// „sometimes that's not identity — it's adaptation".
export type RoleKey = 'companion' | 'herald' | 'diviner' | 'defender' | 'captain';
export type SpecialKey = 'loner' | 'hunter' | 'peacemaker' | 'nurturer';

export interface NatureRole {
  key: RoleKey;
  labelEN: string;
  i18n: string;
  /** Meno v origináli WDDC — zobrazuje sa pri popise úlohy (attribution). */
  originEN: string;
  functionEN: string;
  /** „Poznáš ho podľa" — 4–6 bodov. */
  signsEN: string[];
  /** Čo sa deje pod tlakom / keď má vývoj dieru. */
  pressureEN: string;
  /** EMOČNÝ ZÁSAH: veta, ktorú majiteľ o svojom psovi celý život slýcha — vyvrátená. */
  mythEN: string;
  mythAnswerEN: string;
  /** Odznak. U štít so zlatým povrazom, 256 px webp s alfou. */
  art: string;
}

export const NATURE_ROLES: Record<RoleKey, NatureRole> = {
  companion: {
    key: 'companion', labelEN: 'The Companion', i18n: 'pack.nature.role.companion',
    art: '/images/nature/role-companion.webp',
    originEN: 'Pro-Social',
    functionEN: 'Emotional support and enrichment — the glue of the family.',
    signsEN: [
      'Middle of the road — neither the boldest nor the one hiding in the corner',
      'Takes on the energy of whoever they are with',
      'Loves everybody and everything, and is a little greedy about all of it',
      'Learns by repetition',
      'Technically an adult, still behaves like a six-month-old',
    ],
    pressureEN: 'Separation distress, clinginess, and taking on roles that were never theirs.',
    mythEN: 'They are needy and clingy.',
    mythAnswerEN: 'Connection is not their flaw — it is their function. Take it away and the whole family loses its chemistry.',
  },
  herald: {
    key: 'herald', labelEN: 'The Herald', i18n: 'pack.nature.role.herald',
    art: '/images/nature/role-herald.webp',
    originEN: 'Early Warner',
    functionEN: 'Notices change first and announces it.',
    signsEN: [
      'Sits slightly to the side and scans instead of joining in',
      'Very vocal — really very vocal',
      'Alerts to movement, sound, wind, leaves, the neighbour breathing',
      'Cannot switch off even when nothing is happening',
    ],
    pressureEN: 'Obsessive alerting and barking at everything — or the opposite: freezing and hiding.',
    mythEN: 'They are submissive and soft.',
    mythAnswerEN: 'They are an alarm system, not a soft dog. They are trying to keep the world safe by noticing it first.',
  },
  diviner: {
    key: 'diviner', labelEN: 'The Diviner', i18n: 'pack.nature.role.diviner',
    art: '/images/nature/role-diviner.webp',
    originEN: 'Seer',
    functionEN: "The family's quality controller — finds what does not add up.",
    signsEN: [
      'Intense to live with, and you have thought: why can you not just be normal',
      'Reacts to things you cannot see',
      'People label them fast — something must be wrong with that dog',
      'You have been through every trainer and behaviourist',
    ],
    pressureEN: 'Cannot rest. Tests, provokes a reaction, stirs things up — not out of mischief, but because they cannot ignore what feels off.',
    mythEN: 'That dog is broken.',
    mythAnswerEN: 'They are doing their job in a world that is emotionally chaotic and socially inconsistent. The problem is rarely the dog.',
  },
  defender: {
    key: 'defender', labelEN: 'The Defender', i18n: 'pack.nature.role.defender',
    art: '/images/nature/role-defender.webp',
    originEN: 'Protector',
    functionEN: 'Holds safety — physical and emotional.',
    signsEN: [
      'Puts themselves between you and the danger, real or imagined',
      'Felt like a bodyguard even as a youngster',
      'The fun police — when play gets too intense, they shut it down',
      'Businesslike, switched on, aware of everything around them',
    ],
    pressureEN: 'Policing the house like a full-time job — doorways, windows, visitors, the vibe. In its distorted form, protection through power over others.',
    mythEN: 'They are dominant.',
    mythAnswerEN: 'They are a Defender who was never taught how to do the job properly in a human world, so it comes out messy.',
  },
  captain: {
    key: 'captain', labelEN: 'The Captain', i18n: 'pack.nature.role.captain',
    art: '/images/nature/role-captain.webp',
    originEN: 'Decision Maker',
    functionEN: 'Sets the emotional tone and decides what is safe for the family.',
    signsEN: [
      'You picked the quiet little one from the litter and months later realised you brought home a diva',
      'Unsure around unfamiliar people and places, completely self-assured once things are familiar',
      'A fussy eater',
      'Impossibly nosy — a 20-minute walk becomes a three-hour investigation',
    ],
    pressureEN: 'Safety comes above all else. If they do not trust that someone else is holding it, they take it on themselves — barking and lunging at things they would rather have avoided entirely.',
    mythEN: 'They have a split personality.',
    mythAnswerEN: 'You are seeing the same dog inside and outside their comfort zone. Familiar means confident. Unfamiliar means unsure.',
  },
};

export const ROLE_KEYS: RoleKey[] = ['companion', 'herald', 'diviner', 'defender', 'captain'];

export interface NatureSpecial {
  key: SpecialKey;
  labelEN: string;
  i18n: string;
  originEN: string;
  descEN: string;
  /** Doplnková otázka na konci kvízu (áno / niekedy / nie). */
  questionEN: string;
  qI18n: string;
  /** Odznak. U štít s BRONZOVÝM povrazom a 0,88× — zvláštna úloha sedí na
   *  základnej navrch, nie je jej súper, a veľkosť to má priznať. */
  art: string;
}

export const NATURE_SPECIALS: Record<SpecialKey, NatureSpecial> = {
  peacemaker: {
    key: 'peacemaker', labelEN: 'The Peacemaker', i18n: 'pack.nature.special.peacemaker',
    art: '/images/nature/spec-peacemaker.webp',
    originEN: 'Diffuser',
    // Meno má oporu priamo v ústave — DOGMA 2.1: „Pes vždy odpustí… Pes je živé zmierenie."
    descEN: 'Tension dissolves around them without them doing anything at all. Rare — because these days humans usually do this job for the dog.',
    questionEN: 'People and dogs relax around them — without your dog doing anything.',
    qI18n: 'pack.nature.q.peacemaker',
  },
  nurturer: {
    key: 'nurturer', labelEN: 'The Nurturer', i18n: 'pack.nature.special.nurturer',
    art: '/images/nature/spec-nurturer.webp',
    originEN: 'Nanny',
    descEN: 'Takes anything puppies and children throw at them. Gentle, forgiving, steady. This is earned rather than born — it can sit on top of any of the five roles.',
    questionEN: 'They tolerate things from puppies and children that another dog would not.',
    qI18n: 'pack.nature.q.nurturer',
  },
  hunter: {
    key: 'hunter', labelEN: 'The Hunter', i18n: 'pack.nature.special.hunter',
    art: '/images/nature/spec-hunter.webp',
    originEN: 'Hunter',
    descEN: 'Built for pursuit — locks on and commits. They do not need more mileage; they need purpose and regulation.',
    questionEN: 'Movement — a bird, a bike, a cat — flips a switch and they stop hearing you.',
    qI18n: 'pack.nature.q.hunter',
  },
  loner: {
    key: 'loner', labelEN: 'The Loner', i18n: 'pack.nature.special.loner',
    art: '/images/nature/spec-loner.webp',
    originEN: 'Lone Wolf',
    // ⚠️ Zdroj je tu dôrazný a text výsledku to MUSÍ povedať:
    // „Sometimes that's not identity — it's adaptation." Nie hrdý titul.
    descEN: 'Operates alone and is hard to reach. Read this one carefully: it is often not who your dog is, but what they became after carrying too much on their own.',
    questionEN: 'Sometimes it feels like they do not need you — like they manage on their own.',
    qI18n: 'pack.nature.q.loner',
  },
};

export const SPECIAL_KEYS: SpecialKey[] = ['peacemaker', 'nurturer', 'hunter', 'loner'];

/**
 * Cesta k odznaku pre HODNOTU ULOŽENÚ NA KARTE PSA (`nature.role` = 'captain'…).
 *
 * Existuje preto, že doklad DOG ID nevie, ktorá z troch tabuliek k poľu patrí —
 * má v ruke len názov poľa a reťazec. `null` je legitímna odpoveď: pole môže byť
 * prázdne alebo niesť kľúč, ktorý sa medzitým z datasetu stratil.
 *
 * ⚠️ Kľúče sa NESMÚ premenovať bez premenovania súborov v `public/images/nature/` —
 * väzba je názvom, nie odkazom, a rozpadne sa ticho (obrázok proste nepríde).
 */
export function natureArt(field: string, value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  if (field === 'nature.role') return NATURE_ROLES[value as RoleKey]?.art ?? null;
  if (field === 'nature.element') return NATURE_ELEMENTS[value as ElementKey]?.art ?? null;
  if (field === 'nature.specials') return NATURE_SPECIALS[value as SpecialKey]?.art ?? null;
  return null;
}

// ── OTÁZKY ───────────────────────────────────────────────────────────────────
// Váhy: elementy pod `el`, základné úlohy pod `role`, zvláštne pod `spec`.
// Pokrytie (kontrolované): každý element má 6 čistých signálov (Q1,5,6,7,11,12);
// companion 8 · captain 8 · herald 6 · defender 6 · diviner 5 (najvzácnejší zámerne).
export interface NatureOption {
  id: string;
  labelEN: string;
  i18n: string;
  el?: Partial<Record<ElementKey, number>>;
  role?: Partial<Record<RoleKey, number>>;
  spec?: Partial<Record<SpecialKey, number>>;
}

export interface NatureQuestion {
  id: string;
  labelEN: string;
  i18n: string;
  options: NatureOption[];
}

export const NATURE_QUESTIONS: NatureQuestion[] = [
  {
    id: 'q1', labelEN: 'How does your dog treat food?', i18n: 'pack.nature.q1',
    options: [
      { id: 'a', labelEN: 'Wolfs it down, counter-surfs, begs for every bite', i18n: 'pack.nature.q1.a', el: { earth: 3 } },
      { id: 'b', labelEN: 'Eats calmly, even with commotion around', i18n: 'pack.nature.q1.b', el: { metal: 3 } },
      { id: 'c', labelEN: 'Picky — needs company or coaxing', i18n: 'pack.nature.q1.c', el: { water: 2, fire: 1 }, role: { captain: 2 } },
      { id: 'd', labelEN: 'Growls over the bowl — the food is theirs', i18n: 'pack.nature.q1.d', el: { wood: 3 }, role: { defender: 1 } },
      { id: 'e', labelEN: 'Would rather play than eat', i18n: 'pack.nature.q1.e', el: { fire: 3 } },
    ],
  },
  {
    id: 'q2', labelEN: 'The doorbell rings. What happens?', i18n: 'pack.nature.q2',
    options: [
      { id: 'a', labelEN: 'Announces it before anyone touches the handle — and does not stop', i18n: 'pack.nature.q2.a', el: { water: 1 }, role: { herald: 3 } },
      { id: 'b', labelEN: 'Puts themselves between you and the door, face serious', i18n: 'pack.nature.q2.b', el: { wood: 2 }, role: { defender: 3 } },
      { id: 'c', labelEN: 'Flies over to greet, dances around', i18n: 'pack.nature.q2.c', el: { fire: 2 }, role: { companion: 3 } },
      { id: 'd', labelEN: 'Disappears and waits until the coast is clear', i18n: 'pack.nature.q2.d', el: { water: 3 }, role: { captain: 1 } },
      { id: 'e', labelEN: 'Looks at YOU — what are you going to do about it', i18n: 'pack.nature.q2.e', el: { metal: 1 }, role: { captain: 3 } },
    ],
  },
  {
    id: 'q3', labelEN: 'On a walk — who leads?', i18n: 'pack.nature.q3',
    options: [
      { id: 'a', labelEN: 'Pulls ahead, picks the direction, you follow', i18n: 'pack.nature.q3.a', el: { wood: 2 }, role: { captain: 2 } },
      { id: 'b', labelEN: 'Stays close, watches where you are going', i18n: 'pack.nature.q3.b', el: { earth: 2 }, role: { companion: 2 } },
      { id: 'c', labelEN: 'Walks slightly to the side or behind, scanning', i18n: 'pack.nature.q3.c', el: { water: 1 }, role: { herald: 3 } },
      { id: 'd', labelEN: 'Twenty minutes turns into a three-hour neighbourhood investigation', i18n: 'pack.nature.q3.d', el: { metal: 1 }, role: { captain: 3 } },
      { id: 'e', labelEN: 'First movement in the bushes and they are gone — no recall works', i18n: 'pack.nature.q3.e', el: { wood: 2 }, spec: { hunter: 3 } },
    ],
  },
  {
    id: 'q4', labelEN: 'Two strange dogs are playing chase. Yours sees them.', i18n: 'pack.nature.q4',
    options: [
      { id: 'a', labelEN: 'Joins in and makes the chaos bigger', i18n: 'pack.nature.q4.a', el: { fire: 2 }, role: { companion: 2 } },
      { id: 'b', labelEN: 'Walks over and shuts it down — that is enough', i18n: 'pack.nature.q4.b', el: { wood: 1 }, role: { defender: 3 } },
      { id: 'c', labelEN: 'Not interested, goes their own way', i18n: 'pack.nature.q4.c', el: { metal: 2 }, spec: { loner: 2 } },
      { id: 'd', labelEN: 'Watches from a distance and comments', i18n: 'pack.nature.q4.d', el: { water: 1 }, role: { herald: 2 } },
      { id: 'e', labelEN: 'The tension somehow dissolves and everyone settles', i18n: 'pack.nature.q4.e', el: { earth: 1 }, spec: { peacemaker: 3 } },
    ],
  },
  {
    id: 'q5', labelEN: 'What do they look like?', i18n: 'pack.nature.q5',
    options: [
      { id: 'a', labelEN: 'Strong compact body, small head, hard to calm down', i18n: 'pack.nature.q5.a', el: { fire: 3 } },
      { id: 'b', labelEN: 'Round, big head, slow-moving', i18n: 'pack.nature.q5.b', el: { earth: 3 } },
      { id: 'c', labelEN: 'Lean, quick movements, big eyes', i18n: 'pack.nature.q5.c', el: { wood: 3 } },
      { id: 'd', labelEN: 'Thin to mid-size, quiet on their feet, feels the cold', i18n: 'pack.nature.q5.d', el: { water: 3 } },
      { id: 'e', labelEN: 'Broad chest and forehead, good coat, well groomed', i18n: 'pack.nature.q5.e', el: { metal: 3 } },
    ],
  },
  {
    id: 'q6', labelEN: 'How do they sleep?', i18n: 'pack.nature.q6',
    options: [
      { id: 'a', labelEN: 'Relaxes instantly, sleeps anywhere', i18n: 'pack.nature.q6.a', el: { earth: 3 } },
      { id: 'b', labelEN: 'Sleeps still, barely changes position', i18n: 'pack.nature.q6.b', el: { metal: 3 } },
      { id: 'c', labelEN: 'Wakes often, needs to go out at night', i18n: 'pack.nature.q6.c', el: { water: 3 } },
      { id: 'd', labelEN: 'Sleep comes second when there is something to do', i18n: 'pack.nature.q6.d', el: { wood: 3 } },
      { id: 'e', labelEN: 'Restless, whines, runs in their sleep', i18n: 'pack.nature.q6.e', el: { fire: 3 } },
    ],
  },
  {
    id: 'q7', labelEN: 'Heat, cold, weather.', i18n: 'pack.nature.q7',
    options: [
      { id: 'a', labelEN: 'Seeks out cold tiles and shade; suffers in the heat', i18n: 'pack.nature.q7.a', el: { fire: 3 } },
      { id: 'b', labelEN: 'Feels the cold — looks for blankets, sun, warm spots', i18n: 'pack.nature.q7.b', el: { water: 3 } },
      { id: 'c', labelEN: 'Dry coat and skin, brittle nails, sneezing and coughing', i18n: 'pack.nature.q7.c', el: { metal: 3 } },
      { id: 'd', labelEN: 'Damp and cold do not suit them; heavy after meals', i18n: 'pack.nature.q7.d', el: { earth: 3 } },
      { id: 'e', labelEN: 'Wind and weather changes unsettle them, often tense', i18n: 'pack.nature.q7.e', el: { wood: 3 } },
    ],
  },
  {
    id: 'q8', labelEN: 'You are low, or there is tension at home. What do they do?', i18n: 'pack.nature.q8',
    options: [
      { id: 'a', labelEN: 'Comes over and will not leave you until you feel better', i18n: 'pack.nature.q8.a', role: { companion: 3 } },
      { id: 'b', labelEN: 'Just lies down next to you and suddenly it is quiet', i18n: 'pack.nature.q8.b', el: { earth: 1 }, spec: { peacemaker: 3 } },
      { id: 'c', labelEN: 'Gets unsettled and starts patrolling the house for what is wrong', i18n: 'pack.nature.q8.c', el: { water: 1 }, role: { diviner: 3 } },
      { id: 'd', labelEN: 'Ramps up — goes to the door, guards, checks', i18n: 'pack.nature.q8.d', role: { defender: 2, herald: 1 } },
      { id: 'e', labelEN: 'Leaves for another room', i18n: 'pack.nature.q8.e', el: { metal: 2 }, spec: { loner: 2 } },
    ],
  },
  {
    id: 'q9', labelEN: 'A stranger in your home.', i18n: 'pack.nature.q9',
    options: [
      { id: 'a', labelEN: 'Delighted, licking, someone new at last', i18n: 'pack.nature.q9.a', el: { fire: 1 }, role: { companion: 3 } },
      { id: 'b', labelEN: 'Does not trust them, keeps distance, maybe in time', i18n: 'pack.nature.q9.b', el: { metal: 3 }, role: { diviner: 1 } },
      { id: 'c', labelEN: 'Watches them the whole time and reports every move', i18n: 'pack.nature.q9.c', role: { herald: 3 } },
      { id: 'd', labelEN: 'Avoids them — but if pushed, might snap', i18n: 'pack.nature.q9.d', el: { water: 2 }, role: { captain: 3 } },
      { id: 'e', labelEN: 'Reacts differently to one specific person, for no visible reason', i18n: 'pack.nature.q9.e', role: { diviner: 3 } },
    ],
  },
  {
    id: 'q10', labelEN: 'Training and learning.', i18n: 'pack.nature.q10',
    options: [
      { id: 'a', labelEN: 'Wants to be part of a team, laid-back pace', i18n: 'pack.nature.q10.a', el: { earth: 2 }, role: { companion: 2 } },
      { id: 'b', labelEN: 'Needs repetition and routine — then has it forever', i18n: 'pack.nature.q10.b', el: { metal: 3 } },
      { id: 'c', labelEN: 'Gets it instantly, forgets just as fast, charms their way out', i18n: 'pack.nature.q10.c', el: { water: 2, fire: 1 } },
      { id: 'd', labelEN: 'Has to win, needs success, sulks without it', i18n: 'pack.nature.q10.d', el: { wood: 3 }, role: { captain: 1 } },
      { id: 'e', labelEN: 'Only does it when they can see the point', i18n: 'pack.nature.q10.e', el: { metal: 2 }, role: { diviner: 2 } },
    ],
  },
  {
    id: 'q11', labelEN: 'Play and energy.', i18n: 'pack.nature.q11',
    options: [
      { id: 'a', labelEN: 'Curious and active, chases anything that moves', i18n: 'pack.nature.q11.a', el: { fire: 3 } },
      { id: 'b', labelEN: 'Would rather nap', i18n: 'pack.nature.q11.b', el: { earth: 3 } },
      { id: 'c', labelEN: 'Fetch forever — cannot stop', i18n: 'pack.nature.q11.c', el: { wood: 2 }, spec: { hunter: 2 } },
      { id: 'd', labelEN: 'Loses interest quickly', i18n: 'pack.nature.q11.d', el: { water: 2, fire: 1 } },
      { id: 'e', labelEN: 'Takes play seriously, needs a reason, tires quickly', i18n: 'pack.nature.q11.e', el: { metal: 3 } },
    ],
  },
  {
    id: 'q12', labelEN: 'Touch, brushing, grooming.', i18n: 'pack.nature.q12',
    options: [
      { id: 'a', labelEN: 'Demands petting, climbs into your hands', i18n: 'pack.nature.q12.a', el: { fire: 3 } },
      { id: 'b', labelEN: 'Accepts it around family, or for a treat', i18n: 'pack.nature.q12.b', el: { earth: 3 } },
      { id: 'c', labelEN: 'Runs from the brush', i18n: 'pack.nature.q12.c', el: { water: 3 } },
      { id: 'd', labelEN: 'Only tolerates being touched in certain places', i18n: 'pack.nature.q12.d', el: { wood: 3 } },
      { id: 'e', labelEN: 'Yes — but on their own schedule', i18n: 'pack.nature.q12.e', el: { metal: 3 } },
    ],
  },
  {
    id: 'q13', labelEN: 'You leave them alone for two or three hours.', i18n: 'pack.nature.q13',
    options: [
      { id: 'a', labelEN: 'Cannot bear it — whines, destroys, waits at the door', i18n: 'pack.nature.q13.a', el: { fire: 1 }, role: { companion: 3 } },
      { id: 'b', labelEN: 'Copes, but reports every sound from the hallway', i18n: 'pack.nature.q13.b', el: { water: 1 }, role: { herald: 2 } },
      { id: 'c', labelEN: 'Fine — just checks that everything is where it should be', i18n: 'pack.nature.q13.c', el: { metal: 1 }, role: { defender: 2 } },
      { id: 'd', labelEN: 'Cannot settle, paces, sniffs, hunts for what is off', i18n: 'pack.nature.q13.d', role: { diviner: 2 } },
      { id: 'e', labelEN: 'Does not mind at all, as if they did not need you', i18n: 'pack.nature.q13.e', el: { metal: 2 }, spec: { loner: 3 } },
    ],
  },
  {
    id: 'q14', labelEN: 'Puppies, children, young dogs.', i18n: 'pack.nature.q14',
    options: [
      { id: 'a', labelEN: 'Patience itself — takes anything from them', i18n: 'pack.nature.q14.a', el: { earth: 1 }, spec: { nurturer: 3 } },
      { id: 'b', labelEN: 'Plays with them as an equal', i18n: 'pack.nature.q14.b', el: { fire: 1 }, role: { companion: 2 } },
      { id: 'c', labelEN: 'Sets a boundary and makes sure it holds', i18n: 'pack.nature.q14.c', role: { defender: 2 } },
      { id: 'd', labelEN: 'Avoids them', i18n: 'pack.nature.q14.d', el: { metal: 2, water: 1 } },
      { id: 'e', labelEN: 'Would never hurt them — just gets up and walks away', i18n: 'pack.nature.q14.e', role: { captain: 2 } },
    ],
  },
];

/** Doplnkové otázky na zvláštne úlohy: áno / niekedy / nie → +3 / +1 / 0. */
export const SPECIAL_ANSWER_WEIGHTS = { yes: 3, sometimes: 1, no: 0 } as const;
export type SpecialAnswer = keyof typeof SPECIAL_ANSWER_WEIGHTS;

// ── SCORING ──────────────────────────────────────────────────────────────────
export interface NatureResult {
  element: ElementKey;
  /** Druhý element, ak dosiahol ≥ 80 % prvého — obe zdrojové metodiky dualitu pripúšťajú. */
  elementSecond: ElementKey | null;
  role: RoleKey;
  roleSecond: RoleKey | null;
  /** Zvláštne úlohy, ktoré prekročili prah. Môže byť viac aj žiadna. */
  specials: SpecialKey[];
  scores: {
    el: Record<ElementKey, number>;
    role: Record<RoleKey, number>;
    spec: Record<SpecialKey, number>;
  };
}

/** Dualita sa priznáva, keď druhý dosiahne aspoň tento podiel prvého. */
const DUAL_RATIO = 0.8;
/** Zvláštna úloha z jadra kvízu (bez dedikovanej otázky) potrebuje aspoň toľko bodov. */
const SPECIAL_THRESHOLD = 3;

export function scoreNature(
  answers: Record<string, string>,
  specialAnswers: Partial<Record<SpecialKey, SpecialAnswer>> = {},
): NatureResult {
  const el: Record<ElementKey, number> = { fire: 0, earth: 0, metal: 0, water: 0, wood: 0 };
  const role: Record<RoleKey, number> = { companion: 0, herald: 0, diviner: 0, defender: 0, captain: 0 };
  const spec: Record<SpecialKey, number> = { loner: 0, hunter: 0, peacemaker: 0, nurturer: 0 };

  for (const q of NATURE_QUESTIONS) {
    const picked = answers[q.id];
    if (!picked) continue;
    const opt = q.options.find((o) => o.id === picked);
    if (!opt) continue;
    for (const [k, v] of Object.entries(opt.el ?? {})) el[k as ElementKey] += v;
    for (const [k, v] of Object.entries(opt.role ?? {})) role[k as RoleKey] += v;
    for (const [k, v] of Object.entries(opt.spec ?? {})) spec[k as SpecialKey] += v;
  }

  // Dedikované otázky sa pripočítavajú k signálom z jadra.
  for (const [k, a] of Object.entries(specialAnswers)) {
    if (a) spec[k as SpecialKey] += SPECIAL_ANSWER_WEIGHTS[a];
  }

  const rank = <K extends string>(s: Record<K, number>, keys: K[]) =>
    [...keys].sort((a, b) => s[b] - s[a] || keys.indexOf(a) - keys.indexOf(b));

  const elOrder = rank(el, ELEMENT_KEYS);
  const roleOrder = rank(role, ROLE_KEYS);

  const dual = <K extends string>(order: K[], s: Record<K, number>) =>
    s[order[0]] > 0 && s[order[1]] >= s[order[0]] * DUAL_RATIO ? order[1] : null;

  // Zvláštna úloha padne, ak ju potvrdila dedikovaná otázka („áno“) alebo ak sa
  // nasbieralo dosť signálov z jadra. „Niekedy“ samo o sebe nestačí.
  const specials = SPECIAL_KEYS.filter(
    (k) => specialAnswers[k] === 'yes' || spec[k] >= SPECIAL_THRESHOLD,
  );

  return {
    element: elOrder[0],
    elementSecond: dual(elOrder, el),
    role: roleOrder[0],
    roleSecond: dual(roleOrder, role),
    specials,
    scores: { el, role, spec },
  };
}

// Titul sa NEZLUČUJE do jednej frázy (Matej 2026-08-06: „nedavajme to dokopy dajme
// defender/metal… nezlučujme to"). Dve osi = dva samostatné pojmy oddelené lomkou.
// Tým padá aj potreba genitívu — „Drevený Kompas" vzniklo len zo zlučovania.
export function natureTitleEN(r: NatureResult): { role: string; element: string } {
  return {
    role: NATURE_ROLES[r.role].labelEN,
    element: NATURE_ELEMENTS[r.element].labelEN,
  };
}

// ── ATTRIBUTION (povinná pätička) ────────────────────────────────────────────
// Matej 2026-08-06: „nemusíme sa schovávať a kopírovať… použime to a spomeňme,
// dajme odkaz". V duchu DOGMY 1.4 („nie je konkurenciou… je nadstavba").
// ⚠️ `url` doplniť pred nasadením — v zdrojovom PDF je len kajabi storefront.
export const NATURE_ATTRIBUTION = {
  textEN:
    'The pack-role layer builds on research by the Wolf and Dog Development Centre — The 9 Social Identities. With thanks for their work. The elements draw on Traditional Chinese Medicine.',
  i18n: 'pack.nature.attribution',
  sourceName: 'Wolf and Dog Development Centre',
  url: '',
} as const;
