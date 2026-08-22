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
// ÚROVEŇ VÝŽIVY — LOCKED 2026-08-21 (Matej: „môžme ísť do hĺbky s disclaimerom,
// že to nenahrádza veterinárnu radu"). Štyri úrovne, píšeme prvé tri:
//   L1 sklon        „vlhkosť im robí dobre"                          ✅
//   L2 suroviny     „vývar, olejnatá ryba, chudšie mäso než jahňacie" ✅
//   L3 réžia misky  „dve dávky namiesto jednej", „váž, neodhaduj"     ✅
//   L4 dávky v g/mg · doplnky · liečba diagnózy · diéta pri chorobe   ⛔ NIKDY
// 🔑 KONTROLOVATEĽNÉ PRAVIDLO: **každý riadok `foodEN`/`avoidEN` musí obstáť aj
//    bez čínskej medicíny.** TČM dáva zoskupenie a jazyk, NIE odôvodnenie. Veta,
//    ktorá sa nedá obhájiť bežnou psou výživou, letí von — inak výsledok znie ako
//    veštba, nie ako posudok. Veterinárom predpísaná diéta má vždy prednosť
//    (`NUTRITION_DISCLAIMER` nižšie, vykresľuje sa priamo pri jedle).
//    Tá istá hranica platí pre AINUBISA — dve rôzne odpovede v `/pack` nedávajú zmysel.
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

/** TČM korešpondencie elementu. Štandardná tabuľka, nie naša výmyselnosť. */
export interface ElementFacts {
  seasonEN: string;
  organsEN: string;
  emotionEN: string;
  tasteEN: string;
  colourEN: string;
}

export interface NatureElement {
  key: ElementKey;
  /** Genitív do titulu: „OBRANCA VODY". i18n `pack.nature.el.<key>.of`. */
  ofEN: string;
  labelEN: string;
  i18n: string;
  /** Čínsky znak — najväčšie písmeno dokumentu po mene psa. */
  cn: string;
  pinyin: string;
  facts: ElementFacts;
  /** Jedna veta — aký ten pes je. */
  summaryEN: string;
  /** 5× ako sa element prejaví v BEŽNOM DNI — správanie, ktoré majiteľ vidí.
   *  NIE stavba tela (tá je v `bodyEN`) a NIE tréningová rada (tá patrí úlohe). */
  traitsEN: string[];
  /** 3× čo tejto konštitúcii robí dobre. ⚠️ Viď ÚROVEŇ VÝŽIVY v hlavičke súboru. */
  foodEN: string[];
  /** 3× čo proti nej pracuje. */
  avoidEN: string[];
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
    cn: '火', pinyin: 'huǒ',
    facts: {
      seasonEN: 'Summer', organsEN: 'Heart · small intestine',
      emotionEN: 'Joy — and not knowing where to put it',
      tasteEN: 'Bitter', colourEN: 'Red',
    },
    summaryEN: 'The life of the party — loud, affectionate, needs to be seen, and **hard to switch off**.',
    traitsEN: [
      'Greets everyone like a reunion — **the volume is their baseline, not their excitement**',
      'Comes up in a second and **takes an hour to come back down**',
      'Hunts out the cold spot: tiles, shade, the draught under the door',
      'Sleeps light, moves in their sleep, **wakes at the smallest thing**',
      'Picks things up in one go — and **loses them just as fast** without repetition',
    ],
    foodEN: [
      '**Leaner, cooler proteins** — rabbit, turkey, white fish sit better on them than lamb or venison',
      '**Water on the food, not just in the bowl** — a splash of broth or water on a dry meal is the easiest way in',
      'Summer is **their season**: appetite drops, restlessness rises, and both are worth watching in the same weeks',
    ],
    avoidEN: [
      '**Heavy warming meat through a hot month** — lamb, venison, duck',
      '**A full bowl either side of hard play** — give it an hour of daylight between',
      '**A room with nowhere cold to lie down**',
    ],
    bodyEN: 'Strong compact body, small head, **restless sleeper**, seeks out cold tiles and shade.',
    watchEN: 'Overheating, a racing heart, **restlessness at night**, distress when left alone. Their weak spots sit in the heart and circulation.',
  },
  earth: {
    key: 'earth', labelEN: 'Earth', ofEN: 'of Earth', i18n: 'pack.nature.el.earth',
    art: '/images/nature/el-earth.webp',
    cn: '土', pinyin: 'tǔ',
    facts: {
      seasonEN: 'Late summer', organsEN: 'Spleen · stomach',
      emotionEN: 'Worry — the household kind',
      tasteEN: 'Sweet', colourEN: 'Yellow',
    },
    summaryEN: 'Calm, loyal, motherly — and **lives for the bowl**.',
    traitsEN: [
      '**Food is the axis of the day.** Everything else is negotiable',
      'Settles anywhere within a minute, and **does not want to be moved again**',
      '**Carries the household mood in their gut** — a tense week shows up as a soft stool',
      'Slow and deliberate; **hurrying them costs more than it saves**',
      'Motherly with puppies, children, and other people’s problems',
    ],
    foodEN: [
      '**Weigh the food, do not eyeball it.** An Earth dog will convince you daily that they were never fed',
      '**Two or three smaller meals** rather than one large one — an empty stomach unsettles them more than another dog',
      '**Room temperature or gently warmed**, not straight from the fridge',
    ],
    avoidEN: [
      '**A bowl left down all day** — free feeding takes away the one structure they respond to',
      '**Treats used as conversation.** They will learn the currency and start trading in it',
      '**Rich, fatty leftovers** — the stomach is their weak point and it answers back quickly',
    ],
    bodyEN: 'Round and large, big head, **slow deliberate movement**, relaxes anywhere.',
    watchEN: 'Digestion, appetite swings, **weight**, teeth and gums. Their weak spots sit in the stomach and the gut.',
  },
  metal: {
    key: 'metal', labelEN: 'Metal', ofEN: 'of Metal', i18n: 'pack.nature.el.metal',
    art: '/images/nature/el-metal.webp',
    cn: '金', pinyin: 'jīn',
    facts: {
      seasonEN: 'Autumn', organsEN: 'Lungs · large intestine',
      emotionEN: 'Grief — and letting go',
      tasteEN: 'Pungent', colourEN: 'White',
    },
    summaryEN: 'Orderly, reserved, disciplined — **affection on their own schedule**.',
    traitsEN: [
      '**Routine is not a preference, it is a need** — the same walk, the same bowl, the same order',
      'Chaos in the house shows up on them **before it shows up on you**',
      '**Reserved with strangers**, and does not warm up on demand',
      'Recovers by **withdrawing**, not by being comforted',
      'Precise: learns slowly, but what they learn **stays learnt**',
    ],
    foodEN: [
      '**Moisture in every bowl** — broth, raw or soaked food. Dry-only feeding works against this constitution',
      '**Fat for the skin and coat** — oily fish, or fish oil alongside the meal',
      'Autumn is **their season**: it is when both the good and the weak side show most',
    ],
    avoidEN: [
      'Long stretches of **dry-only** food',
      '**Dry, overheated indoor air** in winter',
      '**Chaotic feeding times** — irregularity costs them more than another dog',
    ],
    bodyEN: 'Broad chest and forehead, good coat, **sleeps still**, **learns by repetition**.',
    watchEN: 'Breathing, **skin dryness**, brittle nails, hard stools. Their weak spots sit in the lungs and the large intestine.',
  },
  water: {
    key: 'water', labelEN: 'Water', ofEN: 'of Water', i18n: 'pack.nature.el.water',
    art: '/images/nature/el-water.webp',
    cn: '水', pinyin: 'shuǐ',
    facts: {
      seasonEN: 'Winter', organsEN: 'Kidneys · bladder',
      emotionEN: 'Fear — and caution that keeps them alive',
      tasteEN: 'Salty', colourEN: 'Black and blue',
    },
    summaryEN: 'Cautious, quiet, watchful — **retreats before the unfamiliar** rather than facing it.',
    traitsEN: [
      '**Retreats before they react** — the corner, the crate, behind your legs',
      'Needs a den, and it is **the one they chose**, not the one you bought',
      '**Feels the cold first and longest** — the last one off the warm floor',
      'Wakes in the night, and often needs to go out when they do',
      'Trusts slowly, then completely — **a new person is a project, not an event**',
    ],
    foodEN: [
      '**Warm food through winter** — theirs is the season that costs them most',
      '**Many Water dogs drink too little.** Broth or water poured on the meal fixes more than a bigger bowl does',
      '**Oily fish and eggs** — plain building blocks for bone, coat and the hind end',
    ],
    avoidEN: [
      '**Cold food straight from the fridge**, especially in the cold months',
      '**Long gaps between toilet breaks** — the bladder is where this constitution gives way first',
      '**A thin bed on a cold floor.** They will use it and pay for it in the hind end',
    ],
    bodyEN: 'Thin to mid-size, **quiet on their feet**, feels the cold, wakes often at night.',
    watchEN: 'Bladder and kidneys, **bones and the hind end**, hearing. Warmth and a hideaway do more for them than encouragement.',
  },
  wood: {
    key: 'wood', labelEN: 'Wood', ofEN: 'of Wood', i18n: 'pack.nature.el.wood',
    art: '/images/nature/el-wood.webp',
    cn: '木', pinyin: 'mù',
    facts: {
      seasonEN: 'Spring', organsEN: 'Liver · gallbladder',
      emotionEN: 'Anger — frustration with nowhere to go',
      tasteEN: 'Sour', colourEN: 'Green',
    },
    summaryEN: 'Out in front — competitive, impatient, fast, and **needs to win**.',
    traitsEN: [
      '**Frustration is their first emotion, not their last** — a blocked plan turns into noise fast',
      'First out of the door, first up the hill, **first to argue about it**',
      '**Sleep comes last.** They will hold out until the house does',
      'Wind and a change in the weather **wind them up** before anything happens',
      'Learns fast and **negotiates faster** — a rule enforced once is a rule tested twice',
    ],
    foodEN: [
      '**Lean over rich.** A heavy, fatty bowl shows on this constitution before it shows on any other',
      '**Feed after the effort, not before it** — a full stomach and a fast dog are a bad pairing',
      'Spring is **their season**: energy, appetite and itchy skin all climb in the same weeks',
    ],
    avoidEN: [
      '**High-sugar chews and sweetened treats** — winding up a dog who is already wound',
      '**Taking the bowl away to prove a point.** A Wood dog does not learn patience from it, they learn to defend',
      '**One big meal a day** where the wait itself becomes the frustration',
    ],
    bodyEN: 'Lean, **quick movements**, big eyes, sleep comes second to whatever needs doing.',
    watchEN: 'Liver, **ligaments and tendons**, eyes, itchy skin in spring. Weather changes unsettle them more than noise does.',
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
  /** ⚠️ Vypadlo z dokumentu výsledku 21. 8. (abstraktná definícia pred konkrétnymi
   *  príkladmi = zbytočné poschodie). Pole ostáva — používa ho ešte hub. */
  functionEN: string;
  /** „Poznáš ho podľa" — 4–6 bodov. */
  signsEN: string[];
  /** 3× čo si úloha žiada od DŇA — réžia práce a odpočinku.
   *  🔴 NIKDY jedlo. Miska patrí elementu — viď `reference_dogypt_element_vs_uloha_co_hovori_co`. */
  dutyEN: string[];
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
    dutyEN: [
      '**Practise the goodbye while nothing is wrong** — seconds at a time, daily, long before the day you actually have to leave.',
      '**One job that is theirs alone.** Carrying, finding, fetching the same thing every day. Connection with a task attached holds; connection on its own does not.',
      '**Time with other dogs, not only with you.** A Companion pointed at one person is a Companion with one point of failure.',
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
    dutyEN: [
      '**Let them announce, then release them.** Look, thank, done — a two-second ritual, every time. An unanswered alarm gets louder.',
      '**A seat with a view they are allowed to leave.** A Herald who cannot see starts to guess, and a guessing Herald barks at everything.',
      '**One hour where nothing is expected of them.** Somebody else has to hold the perimeter for a while, out loud, so they can hear it happen.',
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
    dutyEN: [
      '**Give them a problem with an answer at the end.** Scentwork, searching, a puzzle that finishes. Work without a finish line is what they already have.',
      '**The same rules from every person in the house.** Inconsistency is not a detail to a Diviner — it is the thing they have been reacting to all along.',
      '**Believe the flag first, check it second.** Dismiss enough of them and they escalate until dismissing is no longer an option.',
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
    dutyEN: [
      '**Give them a post.** A Defender without a job invents one — usually the front door, usually at the worst hour.',
      '**A fixed hour off duty, behind a closed door.** A guard does not stand down on their own; somebody has to end the shift.',
      '**Decide the greeting before it happens.** A Defender who is told what today’s rule is stops writing their own on the spot.',
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
    dutyEN: [
      '**Do the deciding out loud.** A Captain who watches you handle the situation stops quietly taking the job back.',
      '**Familiar first, new second.** Confidence is built on the route they know and spent on the one they do not — never the other way round.',
      '**The three-hour investigation is the work.** Slow self-paced ground does more for a Captain than distance ever will.',
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

// ── USMERNENIE = MATICA ──────────────────────────────────────────────────────
// ROZSAH LOCKED 2026-08-21 (Matej: „matrica musí byť čo najširšia a najhodnotnejšia"):
//   úloha × 4  = 20 · element × 3 = 15 · zvláštna × 2 = 8 · KOMBINÁCIA × 1 = 25 → 68.
// Pes dostane 8–16 riadkov podľa počtu zvláštnych úloh.
//
// 🔑 KOMBINAČNÁ VRSTVA JE JADRO, NIE DOPLNOK. Bez nej sú to dve sady vedľa seba,
// nie matica: „Obranca Kovu" a „Obranca Ohňa" majú iné časté omyly. Vykresľuje sa
// preto SAMOSTATNE (vlastná sekcia nad omylmi), nie zamiešaná do zoznamu — inak
// zanikne v šestnástich riadkoch presne tá veta, ktorá je na dokumente jedinečná.
// Zvláštna úloha × element (+20) do tejto vlny NEJDE — až keď sa ukáže, že
// kombinačná vrstva funguje. Písať 88 riadkov naslepo nemá zmysel.
//
// 🔴 `source` NIE JE OZDOBA, JE TO POISTKA. Rada zo `source:'role'` alebo
// `'special'` sa NIKDY nesmie objaviť v jedálnej téme, aj keby text sedel:
// ELEMENT hovorí o tele a miske, ÚLOHA o réžii dňa
// (`reference_dogypt_element_vs_uloha_co_hovori_co`). Stráži to `assertLanes()`
// nižšie — beží len v DEV a hlási do konzoly.
export type GuidanceLane = 'mistake' | 'detail';
export type GuidanceSource = 'element' | 'role' | 'special' | 'pair';
/** Kľúč kombinačného riadku. Poradie je `úloha:element`, nie naopak. */
export type PairKey = `${RoleKey}:${ElementKey}`;

export interface Guidance {
  titleEN: string;
  /** Môže obsahovať `**zvýraznenie**` — renderuje `<Bold>`, nie `innerHTML`. */
  textEN: string;
  lane: GuidanceLane;
  source: GuidanceSource;
  key: ElementKey | RoleKey | SpecialKey | PairKey;
  /**
   * Prefix prekladového kľúča. Dopĺňa ho `withI18n()` — ručne sa nepíše.
   *
   * ⚠️ MUSÍ byť odvodený z DÁT, nie z poradia vo vykreslenom zozname. Ten sa mení
   * podľa počtu zvláštnych úloh, takže pes so štyrmi by čítal preklady patriace
   * úplne iným riadkom — a nevyzeralo by to ako chyba, len ako nezmyselná rada.
   */
  i18n?: string;
}

/** Doplní stabilný prekladový kľúč: `pack.nature.guide.<source>.<kľúč>.<poradie>`. */
function withI18n(rows: Omit<Guidance, 'i18n'>[]): Guidance[] {
  const seen: Record<string, number> = {};
  return rows.map((g) => {
    const base = `${g.source}.${g.key.replace(':', '-')}`;
    const n = (seen[base] = (seen[base] ?? -1) + 1);
    return { ...g, i18n: `pack.nature.guide.${base}.${n}` };
  });
}

/** ÚLOHA × 4 — réžia dňa, spolužitie, tlak. Nikdy miska. */
const GUIDANCE_ROLE: Guidance[] = withI18n([
  // ── COMPANION ──
  { source: 'role', key: 'companion', lane: 'mistake', titleEN: 'Big hellos and big goodbyes',
    textEN: 'Making an event of the door teaches a Companion that **your absence is the thing that matters**. Come in quietly and greet them five minutes later, when nothing is happening.' },
  { source: 'role', key: 'companion', lane: 'mistake', titleEN: 'Answering every cry with company',
    textEN: 'Sitting with them each time they cry treats the symptom and **feeds the cause**. The cure is short absences that end before the crying starts.' },
  { source: 'role', key: 'companion', lane: 'detail', titleEN: 'They mirror the room',
    textEN: 'A Companion takes the emotional temperature of whoever they are next to. **If they are unsettled and nothing has happened, look at the humans first.**' },
  { source: 'role', key: 'companion', lane: 'detail', titleEN: 'The greed is part of the wiring',
    textEN: 'Attention, toys, the other dog’s turn — they want all of it from everyone. **It is not bad manners, it is the role without a channel.** Give it one.' },
  // ── HERALD ──
  { source: 'role', key: 'herald', lane: 'mistake', titleEN: 'Telling them to be quiet',
    textEN: 'Announcing is the job. **Being told to shut up is not an answer to it** — let them look, then release them.' },
  { source: 'role', key: 'herald', lane: 'mistake', titleEN: 'Correcting the alarm away',
    textEN: 'Punish enough warnings and you do not get a quieter dog, you get **a dog who stops warning you**. The bark is the last polite step before something worse.' },
  { source: 'role', key: 'herald', lane: 'detail', titleEN: 'The second bark is the one that matters',
    textEN: 'The first is the job. A second round, after you have already answered, means **your answer did not land** — go and look properly.' },
  { source: 'role', key: 'herald', lane: 'detail', titleEN: 'Blocking the view backfires',
    textEN: 'A Herald who cannot see does not stop. **They start guessing from sound alone**, and sound is far less specific than sight.' },
  // ── DIVINER ──
  { source: 'role', key: 'diviner', lane: 'mistake', titleEN: 'Another trainer, another method',
    textEN: 'You have been through several. **Each new system is one more inconsistency** — and inconsistency is the exact thing a Diviner reacts to. Pick one and stay in it for three months.' },
  { source: 'role', key: 'diviner', lane: 'mistake', titleEN: 'Waiting for them to settle on their own',
    textEN: 'There is no off switch waiting to be found. **Rest has to be built, not waited for** — same place, same hour, every day, whether they look tired or not.' },
  { source: 'role', key: 'diviner', lane: 'detail', titleEN: 'The nothing is usually a something',
    textEN: 'When a Diviner reacts to an empty room, **it is worth a look before it is worth a correction**: a person outside, a change in the house, another animal that is unwell.' },
  { source: 'role', key: 'diviner', lane: 'detail', titleEN: 'Labels arrive fast',
    textEN: 'People will call your dog aggressive, anxious or broken within minutes of meeting them. **You have years of data and they have ten seconds.**' },
  // ── DEFENDER ──
  { source: 'role', key: 'defender', lane: 'mistake', titleEN: 'Reassuring them at the door',
    textEN: 'Soothing a Defender who is working **reads as agreement** — yes, this is worth worrying about. Handle the door yourself instead, plainly and without commentary.' },
  { source: 'role', key: 'defender', lane: 'mistake', titleEN: 'Letting them make the greeting call',
    textEN: 'Every unmanaged arrival is a decision they had to make alone. **A dozen of those and the door is their department for good.**' },
  { source: 'role', key: 'defender', lane: 'detail', titleEN: 'End the other dogs’ play before they do',
    textEN: 'They shut play down because nobody else does. **Take that off their shoulders** and half of what looks like conflict disappears.' },
  { source: 'role', key: 'defender', lane: 'detail', titleEN: 'Off duty has to be visible',
    textEN: 'A closed door does more than a bed in the corner. **They cannot stand down from a post they can still see.**' },
  // ── CAPTAIN ──
  { source: 'role', key: 'captain', lane: 'mistake', titleEN: 'Reading them as two dogs',
    textEN: 'Confident at home and unsure outside is **not a split personality** — it is one dog inside and outside their comfort zone. Treat the outside as a separate skill, not a betrayal.' },
  { source: 'role', key: 'captain', lane: 'mistake', titleEN: 'Pushing through the unfamiliar',
    textEN: 'Making a Captain face the new thing head-on **costs the trust you need for everything else**. Distance is not avoidance; it is the working range.' },
  { source: 'role', key: 'captain', lane: 'detail', titleEN: 'The nose is the off switch',
    textEN: 'A Captain who has been allowed to investigate properly **comes home settled in a way that distance never achieves**. The three-hour walk is the work, not the delay.' },
  { source: 'role', key: 'captain', lane: 'detail', titleEN: 'Frequency beats technique',
    textEN: 'Visitors who come often stop being visitors. **The fifth visit does more than any introduction method** — plan for repetition rather than for the perfect first meeting.' },
]);

/** ELEMENT × 3 — telo, miska, sezóna. Jediná os, ktorá smie hovoriť o výžive. */
const GUIDANCE_ELEMENT: Guidance[] = withI18n([
  // ── FIRE ──
  { source: 'element', key: 'fire', lane: 'mistake', titleEN: 'Meeting the volume with volume',
    textEN: 'A loud greeting answered loudly **has nowhere to go but up**. Say nothing, stand still, and wait for four feet on the floor.' },
  { source: 'element', key: 'fire', lane: 'mistake', titleEN: 'More exercise for the restlessness',
    textEN: 'Fire does not tire into calm, **it winds up**. What needs practising is the coming down, not another repetition of the going up.' },
  { source: 'element', key: 'fire', lane: 'detail', titleEN: 'Watch the summer',
    textEN: 'Their season, in both directions. **A drop in appetite and a rise in night-time restlessness tend to arrive in the same weeks** — it is worth knowing in advance.' },
  // ── EARTH ──
  { source: 'element', key: 'earth', lane: 'mistake', titleEN: 'Believing the hunger',
    textEN: 'An Earth dog is extremely convincing and the scales are not. **Weigh the food — the begging is not a measurement.**' },
  { source: 'element', key: 'earth', lane: 'mistake', titleEN: 'Reading slow as lazy',
    textEN: 'Deliberate is not lazy. **Hurrying an Earth dog reliably produces the exact stubbornness you were trying to avoid.**' },
  { source: 'element', key: 'earth', lane: 'detail', titleEN: 'Their gut is the household barometer',
    textEN: 'A tense week in the family often shows up at the other end. **If the stool changed and the food did not, look at the week.**' },
  // ── METAL ──
  { source: 'element', key: 'metal', lane: 'mistake', titleEN: 'A new trick every week',
    textEN: 'Metal learns by repetition. **Constant novelty teaches them that nothing is fixed**, and they quietly stop trying.' },
  { source: 'element', key: 'metal', lane: 'mistake', titleEN: 'Pulling them into a cuddle',
    textEN: '**A Metal dog handled on your schedule learns to leave the room.** Sit down, do nothing, and let them arrive.' },
  { source: 'element', key: 'metal', lane: 'detail', titleEN: 'Watch the autumn',
    textEN: 'Their season. **A cough, dry skin and hard stools show up in the same weeks** — it is worth knowing in advance rather than in hindsight.' },
  // ── WATER ──
  { source: 'element', key: 'water', lane: 'mistake', titleEN: 'Coaxing them out of the den',
    textEN: 'The hideaway is **the thing that makes coming out possible**. Take it away and you do not get a braver dog, you get a cornered one.' },
  { source: 'element', key: 'water', lane: 'mistake', titleEN: 'Meeting fear with encouragement',
    textEN: 'Cheerful pressure is still pressure. **Distance and warmth do the work that reassurance cannot.**' },
  { source: 'element', key: 'water', lane: 'detail', titleEN: 'The cold is not cosmetic',
    textEN: 'Winter is their season and the expensive one. **Stiffness in the hind end, more night-time toilet trips and a shorter fuse tend to arrive together.**' },
  // ── WOOD ──
  { source: 'element', key: 'wood', lane: 'mistake', titleEN: 'Matching the argument',
    textEN: 'Escalating with a Wood dog **is the one game they will always accept**. Slow down instead — frustration needs an exit, not an opponent.' },
  { source: 'element', key: 'wood', lane: 'mistake', titleEN: 'Letting them win the front',
    textEN: 'First through every door, first up every hill, every single day. **Not a dominance problem — a rehearsal problem.** Vary who goes first before it hardens.' },
  { source: 'element', key: 'wood', lane: 'detail', titleEN: 'Spring is the loud season',
    textEN: 'Energy, appetite and itchy skin all climb in the same weeks. **A Wood dog in March is not a different dog — they are their own dog, at volume.**' },
]);

/** ZVLÁŠTNA ÚLOHA × 2. Sedí na základnej navrch, preto len dva riadky. */
const GUIDANCE_SPECIAL: Guidance[] = withI18n([
  { source: 'special', key: 'peacemaker', lane: 'mistake', titleEN: 'Sending them in to fix it',
    textEN: 'It works, which is exactly why it gets used. **A Peacemaker held responsible for everyone else’s tension eventually stops offering it.**' },
  { source: 'special', key: 'peacemaker', lane: 'detail', titleEN: 'You may never see them work',
    textEN: 'The job is finished before the conflict arrives, so there is nothing to watch. **The absence of incidents is the evidence.**' },
  { source: 'special', key: 'nurturer', lane: 'mistake', titleEN: 'Assuming there is no limit',
    textEN: 'Endless tolerance is **a decision they keep making**, not a property they have. Somebody has to end the session before they are forced to.' },
  { source: 'special', key: 'nurturer', lane: 'detail', titleEN: 'Earned, not born',
    textEN: 'The Nurturer sits on top of whichever role they already are. **Read the core role first — this is the layer, not the foundation.**' },
  { source: 'special', key: 'hunter', lane: 'mistake', titleEN: 'Answering the chase with distance',
    textEN: 'An hour of pavement **builds a fitter dog with identical wiring**. Ten minutes of controlled chase does more than the whole hour.' },
  { source: 'special', key: 'hunter', lane: 'detail', titleEN: 'Train the return, not the ban',
    textEN: 'They will lock on; that is the wiring, and it does not negotiate. **Practise coming back afterwards** while the stakes are still low.' },
  { source: 'special', key: 'loner', lane: 'mistake', titleEN: 'Leaving them to it',
    textEN: 'Self-sufficiency is easy to respect and easy to get wrong. **Often it is not who your dog is, but what they became** after carrying too much on their own.' },
  { source: 'special', key: 'loner', lane: 'detail', titleEN: 'Look for when it started',
    textEN: 'A Loner from the beginning and a Loner since something happened **need opposite things**. The history tells you more than the behaviour does.' },
]);

/**
 * KOMBINÁCIA úloha × element — 25 riadkov, jeden na dvojicu.
 * Toto je jediné miesto dokumentu, kde sa obe osi stretnú v jednej vete.
 */
const GUIDANCE_PAIR: Guidance[] = withI18n([
  // ── COMPANION ──
  { source: 'pair', key: 'companion:fire', lane: 'detail', titleEN: 'Everyone’s dog, at maximum volume',
    textEN: 'The affection is not the problem; **the inability to come down from it is**. Practise the ending of every good thing, not just the beginning.' },
  { source: 'pair', key: 'companion:earth', lane: 'mistake', titleEN: 'Connection and appetite point the same way',
    textEN: '**Affection and food become the same currency** — and you will be paying in both without noticing. Keep them deliberately separate.' },
  { source: 'pair', key: 'companion:metal', lane: 'mistake', titleEN: 'The warmest role in the coolest constitution',
    textEN: '**They want you close, and they want it on their own schedule.** Both are true at once — do not read the distance as rejection.' },
  { source: 'pair', key: 'companion:water', lane: 'detail', titleEN: 'Attached and afraid at the same time',
    textEN: '**You are their world and everything outside it is a risk** — which makes short, calm absences the most important work you will ever do with them.' },
  { source: 'pair', key: 'companion:wood', lane: 'detail', titleEN: 'Loves everyone and needs to be first',
    textEN: '**A Companion of Wood competes for connection they already have.** Give it before they ask, so there is nothing left to race for.' },
  // ── HERALD ──
  { source: 'pair', key: 'herald:fire', lane: 'detail', titleEN: 'The loudest combination in the set',
    textEN: '**Announcing and Fire’s volume compound** — the alert lands three notches above what the situation needed. Answer early; late answers get amplified.' },
  { source: 'pair', key: 'herald:earth', lane: 'detail', titleEN: 'Slow alarm, long memory',
    textEN: 'They will not flag everything. **What they do flag has been building for a while** — which is exactly why it is worth taking seriously.' },
  { source: 'pair', key: 'herald:metal', lane: 'detail', titleEN: 'A precise alarm',
    textEN: '**This one does not cry wolf.** There will be fewer warnings than you expect, and each is worth checking every single time.' },
  { source: 'pair', key: 'herald:water', lane: 'mistake', titleEN: 'Warns, then hides',
    textEN: '**The bark is a retreat, not a challenge.** Read it as fear that found a voice — never as bravado, and never as something to correct.' },
  { source: 'pair', key: 'herald:wood', lane: 'detail', titleEN: 'Alerting with a short fuse',
    textEN: '**An unanswered warning turns into noise with no target.** Answer fast and release faster; the gap is where it goes wrong.' },
  // ── DIVINER ──
  { source: 'pair', key: 'diviner:fire', lane: 'detail', titleEN: 'Sees everything and feels all of it out loud',
    textEN: '**The most tiring pairing in the set**, for you and for them. Rest is not a nice extra here — it is the intervention.' },
  { source: 'pair', key: 'diviner:earth', lane: 'detail', titleEN: 'The quality controller who worries',
    textEN: '**They absorb the problem instead of announcing it** — and it tends to surface in the gut before it ever surfaces in behaviour.' },
  { source: 'pair', key: 'diviner:metal', lane: 'detail', titleEN: 'Order meeting inspection',
    textEN: '**Nothing gets past them and nothing gets forgiven quickly.** Consistency is not a nice-to-have here; it is the entire management plan.' },
  { source: 'pair', key: 'diviner:water', lane: 'detail', titleEN: 'Reads the room and leaves it',
    textEN: '**Withdrawal is their report.** When a Water Diviner disappears, something changed — go and find out what, rather than calling them back.' },
  { source: 'pair', key: 'diviner:wood', lane: 'mistake', titleEN: 'Finds the fault and argues with it',
    textEN: '**The most confrontational pairing** — and the one most often mislabelled as aggression by people who met the dog for ten minutes.' },
  // ── DEFENDER ──
  { source: 'pair', key: 'defender:fire', lane: 'detail', titleEN: 'Protection at full volume',
    textEN: '**The display is bigger than the intent** — big, loud, and over before you have crossed the room. Manage the arrival, not the dog.' },
  { source: 'pair', key: 'defender:earth', lane: 'detail', titleEN: 'The immovable guard',
    textEN: '**They do not chase the threat — they sit between it and you and refuse to move.** Easy to live with, and hard to reverse once it sets.' },
  { source: 'pair', key: 'defender:metal', lane: 'detail', titleEN: 'Protection as a system',
    textEN: '**A post, hours, a routine — a job they will do identically for a decade.** The precision is the strength and the trap at the same time.' },
  { source: 'pair', key: 'defender:water', lane: 'mistake', titleEN: 'Guards from behind',
    textEN: '**Fear doing a protection job** — barking at the thing they would most like to avoid. The answer is distance and warmth, not correction.' },
  { source: 'pair', key: 'defender:wood', lane: 'mistake', titleEN: 'Guarding with a short fuse',
    textEN: '**They will not wait for the situation to develop.** Decisions have to be made before you arrive, every time, or they will be made for you.' },
  // ── CAPTAIN ──
  { source: 'pair', key: 'captain:fire', lane: 'mistake', titleEN: 'Decides loudly',
    textEN: 'Confident at home, theatrical outside. **The noise is not confidence** — treating it as such makes the outside considerably harder.' },
  { source: 'pair', key: 'captain:earth', lane: 'detail', titleEN: 'The steady chief',
    textEN: '**Slow, sure, and completely immovable once decided** — a gift indoors and a negotiation everywhere else.' },
  { source: 'pair', key: 'captain:metal', lane: 'detail', titleEN: 'Decisions by protocol',
    textEN: '**Familiar means safe, and their definition of familiar is narrow.** Widen it deliberately and slowly, one repeated thing at a time.' },
  { source: 'pair', key: 'captain:water', lane: 'mistake', titleEN: 'Careful command',
    textEN: '**The most easily misread pairing in the set.** The caution outside is not weakness — it is the same dog running the same safety calculation.' },
  { source: 'pair', key: 'captain:wood', lane: 'detail', titleEN: 'Wants the decision, and wants it now',
    textEN: '**The only pairing that will take the job back mid-situation.** Decide out loud and early, or they will decide on your behalf.' },
]);

export const NATURE_GUIDANCE: Guidance[] = [
  ...GUIDANCE_ROLE, ...GUIDANCE_ELEMENT, ...GUIDANCE_SPECIAL, ...GUIDANCE_PAIR,
];

/** Kľúč kombinačného riadku. Poradie `úloha:element` je záväzné. */
export function pairKey(role: RoleKey, element: ElementKey): PairKey {
  return `${role}:${element}`;
}

// STRÁŽ (len DEV). Dva druhy chýb, na ktoré sa v tomto súbore už raz narazilo:
//  1. rada o miske zaradená pod úlohu — vecná chyba, znie pritom rozumne,
//  2. diera v matici — chýbajúca dvojica sa prejaví ako TICHO CHÝBAJÚCA sekcia,
//     nie ako chyba, takže by si jej nikto nevšimol.
// Slovník je zámerne ÚZKY — stráž, ktorá kričí falošne, sa prestane čítať:
//  • „appetite" tu nie je, je to aj príznak, nie len miska,
//  • „treat" tu nie je, lebo je to najmä SLOVESO („treats the symptom") a maškrta
//    pri tréningu je réžia, nie výživa. Chránená hranica je „čo pes konzumuje
//    a aké potraviny mu robia dobre", nie odmena za sadni.
function assertLanes() {
  const FOOD_WORDS = /\b(bowl|feeding|diet|kibble|broth|meals?|meat|protein|nutrition)\b/i;
  const offenders = NATURE_GUIDANCE.filter(
    (g) => (g.source === 'role' || g.source === 'special') && FOOD_WORDS.test(`${g.titleEN} ${g.textEN}`),
  );
  if (offenders.length) {
    console.warn(
      '[natureQuiz] Rada o jedle pod úlohou — miska patrí elementu:',
      offenders.map((g) => `${g.source}:${g.key} — ${g.titleEN}`),
    );
  }
  const missing = ROLE_KEYS.flatMap((role) =>
    ELEMENT_KEYS.filter((el) => !GUIDANCE_PAIR.some((g) => g.key === pairKey(role, el)))
      .map((el) => pairKey(role, el)),
  );
  if (missing.length) console.warn('[natureQuiz] Diera v kombinačnej matici:', missing);
}
if (import.meta.env?.DEV) assertLanes();

export interface GuidanceSet {
  /** Riadok pre kombináciu oboch osí. `null` len ak dvojica v matici chýba. */
  pair: Guidance | null;
  mistakes: Guidance[];
  details: Guidance[];
}

/**
 * Výber z matice pre konkrétny výsledok: 4 (úloha) + 3 (element) + 1 (kombinácia)
 * + 2 za každú zvláštnu úlohu → 8 až 16 riadkov.
 *
 * ⚠️ Druhý element ani druhá úloha sa NEPRIDÁVAJÚ. Pri dualite by pes dostal
 * dvojnásobok riadkov a polovica by si protirečila — dualita patrí do rozpadu,
 * nie do usmernenia.
 */
export function guidanceFor(r: NatureResult): GuidanceSet {
  const pk = pairKey(r.role, r.element);
  const pair = NATURE_GUIDANCE.find((g) => g.source === 'pair' && g.key === pk) ?? null;
  const rest = NATURE_GUIDANCE.filter(
    (g) =>
      (g.source === 'role' && g.key === r.role) ||
      (g.source === 'element' && g.key === r.element) ||
      (g.source === 'special' && r.specials.includes(g.key as SpecialKey)),
  );
  return {
    pair,
    mistakes: rest.filter((g) => g.lane === 'mistake'),
    details: rest.filter((g) => g.lane === 'detail'),
  };
}

/** Veta o veterinárovi. Vykresľuje sa PRIAMO pri jedle, nie schovaná v päte. */
export const NUTRITION_DISCLAIMER = {
  textEN:
    'This is a constitutional leaning, not a treatment plan. If your dog is on a diet prescribed by a vet, that comes first — always.',
  i18n: 'pack.nature.nutritionDisclaimer',
};

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

/**
 * STROP ZVLÁŠTNYCH ÚLOH — LOCKED 2026-08-22 (Matej: „najviac 1, tá najsilnejšia").
 * Predtým stropu nebolo a psovi ich vyšlo aj všetkých päť naraz; v DEV dátach mal
 * Hekthor 20. 8. `hunter:3 nurturer:3 peacemaker:3` — teda TRI naraz a všetky presne
 * na prahu. Výsledok potom nečítal ako posudok, ale ako zoznam vlastností.
 */
const SPECIAL_CAP = 1;

/**
 * Vyberie zvláštnu úlohu podľa locku z 22. 8. 2026. Dve pravidlá, v tomto poradí:
 *
 *  1. **„Nie" je VETO.** Dovtedy znela podmienka `áno ALEBO body ≥ prah`, takže jediná
 *     odpoveď v jadre prebila priame „môj pes neloví" (hunter Q3.e dáva rovno +3).
 *     Priama odpoveď je nadradená vrstva — „áno" zapína, „nie" vypína, body rozhodujú
 *     len tam, kde sa človeka nikto nepýtal.
 *  2. **Potvrdené bije odvodené.** Keď je aspoň jedno „áno", vyberá sa LEN spomedzi nich;
 *     bez „áno" rozhodujú body z jadra. Inak by úlohu potvrdenú majiteľom prevalcovala
 *     iná, ktorá si len nazbierala viac nepriamych signálov.
 *
 * Zhoda bodov sa láme poradím v `SPECIAL_KEYS` — je to arbitrárne, ale deterministické.
 */
function pickSpecials(
  spec: Record<SpecialKey, number>,
  specialAnswers: Partial<Record<SpecialKey, SpecialAnswer>>,
): SpecialKey[] {
  const allowed = SPECIAL_KEYS.filter((k) => specialAnswers[k] !== 'no');
  const confirmed = allowed.filter((k) => specialAnswers[k] === 'yes');
  const pool = confirmed.length > 0
    ? confirmed
    : allowed.filter((k) => spec[k] >= SPECIAL_THRESHOLD);

  return [...pool]
    .sort((a, b) => spec[b] - spec[a] || SPECIAL_KEYS.indexOf(a) - SPECIAL_KEYS.indexOf(b))
    .slice(0, SPECIAL_CAP);
}

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

  // Zvláštna úloha: najviac JEDNA, „nie“ ju vypína natvrdo. Viď `pickSpecials`.
  const specials = pickSpecials(spec, specialAnswers);

  return {
    element: elOrder[0],
    elementSecond: dual(elOrder, el),
    role: roleOrder[0],
    roleSecond: dual(roleOrder, role),
    specials,
    scores: { el, role, spec },
  };
}

/**
 * ZAPÍSANÉ zvláštne úlohy orezané na dnešný strop — JEDINÁ cesta, ako sa `nature.specials`
 * z `dog_events` smie dostať na obrazovku.
 *
 * ⚠️ Prečo samostatná funkcia a nie riadok vo `natureResultFromStored`: strop v `scoreNature`
 * platí len pre NOVÉ behy. Povrchy, ktoré si pole čítajú z DB priamo — psí blok na
 * `/pack/dogs`, DOG ID (`DogPassport`), share karta — okolo výpočtu chodia a 22. 8. ukazovali
 * všetky štyri úlohy aj po zavedení stropu. Psi, ktorí kvíz prešli skôr, majú v DB zapísané
 * tri-štyri úlohy natrvalo; prepisovať históriu v `dog_events` sa nesmie (tabuľka je append-only),
 * takže sa oreže až čítanie.
 *
 * Poradie určuje rozpad bodov (`nature.scores`). Keď chýba — psi spred 20. 8. ho nemajú a
 * dopočítať sa nedá — rozhodne poradie v `SPECIAL_KEYS`. Je to arbitrárne, ale deterministické:
 * ten istý pes ukáže vždy tú istú úlohu.
 */
export function storedSpecials(
  stored: unknown,
  scores?: Partial<Record<SpecialKey, number>> | null,
): SpecialKey[] {
  if (!Array.isArray(stored)) return [];
  const pts = (k: SpecialKey) => {
    const n = scores?.[k];
    return typeof n === 'number' && Number.isFinite(n) ? n : 0;
  };
  return SPECIAL_KEYS
    .filter((k) => (stored as unknown[]).includes(k))
    .sort((a, b) => pts(b) - pts(a) || SPECIAL_KEYS.indexOf(a) - SPECIAL_KEYS.indexOf(b))
    .slice(0, SPECIAL_CAP);
}

/**
 * Výsledok zložený zo ZAPÍSANÝCH hodnôt na karte psa (`nature.*` v `dog_events`),
 * nie z odpovedí. Používa ho čítanie výsledku (`/pack/nature?view=result`), aby sa
 * dal výsledok pozrieť bez opakovania kvízu.
 *
 * ⚠️ Surové odpovede sa NEUKLADAJÚ, takže toto je jediná cesta späť k výsledku.
 * `nature.scores` pribudlo 20.8.2026 — psom, ktorí kvíz prešli skôr, rozpad chýba
 * a dopočítať sa nedá. Vtedy sa vráti nulový rozpad (obrazovka ho vynechá) a s ním
 * padá aj dualita, lebo `elementSecond`/`roleSecond` sú z rozpadu odvodené.
 * Vracia `null`, keď na karte nie je ani úloha, ani element — vtedy nie je čo čítať.
 */
export function natureResultFromStored(v: {
  element?: unknown; role?: unknown; specials?: unknown; scores?: unknown;
}): NatureResult | null {
  const element = ELEMENT_KEYS.includes(v.element as ElementKey) ? (v.element as ElementKey) : null;
  const role = ROLE_KEYS.includes(v.role as RoleKey) ? (v.role as RoleKey) : null;
  if (!element || !role) return null;

  const num = (o: unknown, k: string): number => {
    const n = (o as Record<string, unknown> | null | undefined)?.[k];
    return typeof n === 'number' && Number.isFinite(n) ? n : 0;
  };
  const raw = (v.scores ?? {}) as Record<string, unknown>;
  const el = Object.fromEntries(ELEMENT_KEYS.map((k) => [k, num(raw.el, k)])) as Record<ElementKey, number>;
  const roleS = Object.fromEntries(ROLE_KEYS.map((k) => [k, num(raw.role, k)])) as Record<RoleKey, number>;
  const spec = Object.fromEntries(SPECIAL_KEYS.map((k) => [k, num(raw.spec, k)])) as Record<SpecialKey, number>;

  // Dualita sa počíta rovnakým pravidlom ako v `scoreNature` — ale len nad tým, čo
  // je v rozpade. Bez neho ostáva `null`, nie vymyslený druhý element.
  const second = <K extends string>(s: Record<K, number>, keys: K[], top: K): K | null => {
    const rest = keys.filter((k) => k !== top).sort((a, b) => s[b] - s[a] || keys.indexOf(a) - keys.indexOf(b));
    const r = rest[0];
    return r && s[top] > 0 && s[r] >= s[top] * DUAL_RATIO ? r : null;
  };

  const specials = storedSpecials(v.specials, spec);

  return {
    element,
    elementSecond: second(el, ELEMENT_KEYS, element),
    role,
    roleSecond: second(roleS, ROLE_KEYS, role),
    specials,
    scores: { el, role: roleS, spec },
  };
}

/** Má výsledok rozpad bodov? Psi spred 20.8.2026 ho nemajú — viď `natureResultFromStored`. */
export function hasNatureScores(r: NatureResult): boolean {
  return [...Object.values(r.scores.el), ...Object.values(r.scores.role)].some((n) => n > 0);
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
