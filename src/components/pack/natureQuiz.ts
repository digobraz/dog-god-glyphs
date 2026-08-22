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

  // ── Stráže prestavby z 22. 8. 2026 ────────────────────────────────────────
  // Všetky tri chytajú chybu, ktorá sa NEPREJAVÍ ako chyba: kvíz sa vykreslí,
  // dá výsledok a nikto si nevšimne, že jedna úloha nemôže vyhrať.

  // 1. Otázka bez piatich odpovedí, alebo s tou istou osou dvakrát. Presne toto
  //    robilo Veštca nedosiahnuteľným — mal 4 otázky tam, kde Spoločník 8.
  const shape = (
    qs: NatureQuestion[], keys: readonly string[], tag: string,
  ) => {
    for (const q of qs) {
      const ids = q.options.map((o) => o.id);
      const bad = ids.filter((id) => !keys.includes(id));
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      if (ids.length !== keys.length || bad.length || dupes.length) {
        console.warn(`[natureQuiz] ${tag} ${q.id}: očakáva sa ${keys.length} odpovedí, po jednej na os.`,
          { ids, bad, dupes });
      }
    }
    // Pokrytie sa nekontroluje len na otázke, ale aj v súčte — otázka smie byť
    // v poriadku a os aj tak podreprezentovaná, keby niekto otázku vymazal.
    for (const k of keys) {
      const n = qs.filter((q) => q.options.some((o) => o.id === k)).length;
      if (n !== qs.length) console.warn(`[natureQuiz] ${tag}: „${k}" je v ${n} z ${qs.length} otázok.`);
    }
  };
  shape(ELEMENT_QUESTIONS, ELEMENT_KEYS, 'ELEMENT_QUESTIONS');
  shape(ROLE_QUESTIONS, ROLE_KEYS, 'ROLE_QUESTIONS');

  // 2. Odpoveď bez opory v podklade. Vymyslená odpoveď v kvíze, ktorý radí okolo
  //    výživy, je horšia než chýbajúca — a na pohľad sa nedá odlíšiť.
  const SRC_PREFIX = /^(judy|schwartz|dataset|wddc):/;
  const noSrc = [...ELEMENT_QUESTIONS, ...ROLE_QUESTIONS].flatMap((q) =>
    q.options
      .filter((o) => !o.src?.length || !o.src.every((s) => SRC_PREFIX.test(s)))
      .map((o) => `${q.id}:${o.id}`),
  );
  if (noSrc.length) console.warn('[natureQuiz] Odpoveď bez opory v podklade (`src`):', noSrc);

  // 3. Tie-break, ktorý neexistuje — remíza by ticho spadla späť na poradie v poli.
  if (!ELEMENT_QUESTIONS.some((q) => q.id === ELEMENT_TIEBREAK)) {
    console.warn('[natureQuiz] ELEMENT_TIEBREAK ukazuje na neexistujúcu otázku:', ELEMENT_TIEBREAK);
  }
  if (!ROLE_QUESTIONS.some((q) => q.id === ROLE_TIEBREAK)) {
    console.warn('[natureQuiz] ROLE_TIEBREAK ukazuje na neexistujúcu otázku:', ROLE_TIEBREAK);
  }
}

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
// PRESTAVBA 22. 8. 2026. Zadanie: `plany/nature-kviz-navrh-2026-08-22.html`.
//
// Predtým: 14 otázok, každá s váhami 1–3 na OBE osi naraz. Dôsledok bol trojaký a
// všetok spočítaný z tohto súboru, nie odhadnutý:
//   • element sa zbieral aj na sociálnych otázkach — u Kovu 16 z 34 bodov (47 %),
//     takže plachý pes dostal Vodu, aj keď mal telo Zeme, a rada k miske potom
//     sedela na správanie,
//   • úlohy mali nerovnaké stropy (companion 20 v 8 otázkach vs diviner 10 v 4,
//     z toho dve v tej istej otázke ⇒ vylučovali sa) — Veštec nemohol vyhrať,
//   • osem odpovedí kŕmilo zvláštne úlohy, ktoré sa po locku z 22. 8. rozhodujú
//     výlučne dedikovanými otázkami.
//
// 🔑 STAVEBNÉ PRAVIDLO: **každá otázka má práve päť odpovedí, po jednej na element
// (resp. na úlohu), a `id` odpovede JE ten kľúč.** Pokrytie je tým rovnaké
// automaticky, nie kalibráciou — nedá sa pokaziť pridaním otázky. Váha je vždy 1,
// takže výsledok je „Kov 6 z 10", číslo, ktoré sa dá ukázať majiteľovi; predtým to
// bolo „Kov 27" bez mierky. Stráži to `assertLanes()`.
//
// 🔑 DELIACA ČIARA MEDZI OSAMI = TEMPERAMENT vs FUNKCIA, nie „telo vs. sociálne".
// Prvé znenie pravidla („dá sa odpovedať pri psovi, čo žije sám na dvore?") padlo
// na vlastnom podklade: z 65 vlastností Dr. Judy je telesných asi pätnásť, zvyšok
// je povaha, takže by z elementu ostali štyri otázky.
//   ELEMENT = tempo, intenzita, smer a návrat do pokoja → prejaví sa v KAŽDEJ
//             situácii rovnako (Dr. Judy + Schwartz merajú temperament)
//   ÚLOHA   = akú funkciu pes plní PRE svorku (WDDC meria funkciu)
// Preto v elemente NIE JE „postavenie v svorke" ani „vzťah k cudziemu" — sú to
// funkcie a v elemente by vyrobili presne tú kontamináciu, ktorú prestavba ruší.
//
// KOLÍZIE ZDROJA sú vyriešené vypustením, nie tichým prisúdením:
//   `Big eyes` má u Dr. Judy Drevo AJ Voda ⇒ nepoužila sa vôbec; hlava je v A1
//   opísaná stavbou, nie očami. `Strong`/`Strong body` rozdelené na stavbu (Oheň,
//   A1) a vytrvalosť (Drevo, A6). `Consistent` na tempo (Kov, A2) a vytrvalosť
//   (Voda, A6). `Alpha-in charge` + `Group leader` vypustené — funkcie.
//
// PORADIE ODPOVEDÍ JE ZÁMERNE PREMIEŠANÉ. Keby element išiel v každej otázke v tom
// istom poradí, tretia obrazovka prezradí kľúč a zvyšok kvízu meria už len to, čo
// chce majiteľ počuť.
export interface NatureOption {
  /** Kľúč osi — `ElementKey` v `ELEMENT_QUESTIONS`, `RoleKey` v `ROLE_QUESTIONS`. */
  id: string;
  labelEN: string;
  i18n: string;
  /**
   * 🔴 POVINNÁ OPORA. Odkaz na riadok v podklade, z ktorého odpoveď vznikla —
   * `judy:` (Pet Personality Quiz) · `schwartz:` (Four Paws, Five Directions,
   * portréty piatich konštitúcií) · `dataset:` (tento súbor, `traitsEN`/`bodyEN`/
   * `facts`) · `wddc:` (The 9 Social Identities).
   *
   * Nie je to poznámka pod čiarou, je to **test**: odpoveď, ku ktorej sa nedá
   * ukázať prstom do podkladu, sme si vymysleli — a vymyslená odpoveď v kvíze,
   * ktorý radí okolo výživy, je horšia než chýbajúca. Prázdne pole hlási
   * `assertLanes()`.
   */
  src: string[];
}

export interface NatureQuestion {
  id: string;
  labelEN: string;
  i18n: string;
  options: NatureOption[];
}

/**
 * KVÍZ 1 — ELEMENT. Desať otázok, `id` odpovede JE `ElementKey`.
 * A1 láme remízu (jediná otázka, ktorá sa nedá zodpovedať podľa nálady dňa).
 */
export const ELEMENT_QUESTIONS: NatureQuestion[] = [
  {
    id: 'a1', labelEN: 'Build — how are they put together?', i18n: 'pack.nature.qe.a1',
    options: [
      { id: 'metal', labelEN: 'Broad chest and forehead, a wide nose', i18n: 'pack.nature.qe.a1.metal',
        src: ['judy:metal.broad-chest', 'judy:metal.broad-forehead', 'judy:metal.wide-nose'] },
      { id: 'wood', labelEN: 'Wiry and athletic — small, but strong for their size', i18n: 'pack.nature.qe.a1.wood',
        src: ['judy:wood.thin-body', 'judy:wood.athletic-stamina', 'schwartz:wood'] },
      { id: 'earth', labelEN: 'Round and large, big head, low to the ground', i18n: 'pack.nature.qe.a1.earth',
        src: ['judy:earth.round-large', 'judy:earth.big-head', 'judy:earth.short'] },
      { id: 'fire', labelEN: 'Strong compact body, small head', i18n: 'pack.nature.qe.a1.fire',
        src: ['judy:fire.strong-body', 'judy:fire.small-head', 'dataset:fire.body'] },
      { id: 'water', labelEN: 'Thin to mid-size frame, quiet on their feet', i18n: 'pack.nature.qe.a1.water',
        src: ['judy:water.thin-mid-body', 'dataset:water.body'] },
    ],
  },
  {
    id: 'a2', labelEN: 'Pace — how they move, and how they come back down', i18n: 'pack.nature.qe.a2',
    options: [
      { id: 'water', labelEN: 'Slow but steady — and hard to get going in the first place', i18n: 'pack.nature.qe.a2.water',
        src: ['judy:water.slow-consistent', 'schwartz:water'] },
      { id: 'fire', labelEN: 'Up in a second, an hour to come back down', i18n: 'pack.nature.qe.a2.fire',
        src: ['judy:fire.easily-excited', 'judy:fire.difficult-to-calm'] },
      { id: 'metal', labelEN: 'The same pace every day, no swings', i18n: 'pack.nature.qe.a2.metal',
        src: ['judy:metal.consistent', 'judy:metal.disciplined-attitude'] },
      { id: 'wood', labelEN: 'Sharp, fast movements; waiting is not in them', i18n: 'pack.nature.qe.a2.wood',
        src: ['judy:wood.quick-movements', 'judy:wood.impulsive', 'judy:wood.impatient'] },
      { id: 'earth', labelEN: 'Slow and deliberate — they never really go up', i18n: 'pack.nature.qe.a2.earth',
        src: ['judy:earth.slow-response', 'judy:earth.relaxed-laid-back'] },
    ],
  },
  {
    id: 'a3', labelEN: 'How do they sleep?', i18n: 'pack.nature.qe.a3',
    options: [
      { id: 'wood', labelEN: 'Last one to bed, and wakes in the night already wound up', i18n: 'pack.nature.qe.a3.wood',
        src: ['dataset:wood.traits.2', 'judy:wood-section.insomnia-1-3am'] },
      { id: 'earth', labelEN: 'Likes a long lie-in and is grumpy when woken', i18n: 'pack.nature.qe.a3.earth',
        src: ['schwartz:earth', 'dataset:earth.traits.1'] },
      { id: 'fire', labelEN: 'Restless — whines, paddles, runs in their sleep', i18n: 'pack.nature.qe.a3.fire',
        src: ['schwartz:fire', 'dataset:fire.traits.3'] },
      { id: 'water', labelEN: 'Wakes in the night and needs to go out', i18n: 'pack.nature.qe.a3.water',
        src: ['dataset:water.traits.3', 'schwartz:water'] },
      { id: 'metal', labelEN: 'Sleeps without moving; the small hours are their worst', i18n: 'pack.nature.qe.a3.metal',
        src: ['schwartz:metal', 'dataset:metal.body'] },
    ],
  },
  {
    id: 'a4', labelEN: 'Heat, cold, weather', i18n: 'pack.nature.qe.a4',
    options: [
      { id: 'fire', labelEN: 'Seeks out cold tiles and shade; cannot take the sun for long', i18n: 'pack.nature.qe.a4.fire',
        src: ['schwartz:fire', 'dataset:fire.body'] },
      { id: 'water', labelEN: 'Feels the cold first and longest; winter brings toilet trouble', i18n: 'pack.nature.qe.a4.water',
        src: ['judy:water.cold-intolerant', 'schwartz:water'] },
      { id: 'wood', labelEN: 'Wind and a change in the weather unsettle them before anything happens', i18n: 'pack.nature.qe.a4.wood',
        src: ['dataset:wood.traits.3', 'judy:wood-section.wind-is-spring'] },
      { id: 'metal', labelEN: 'Sneezing and coughing in autumn; dry indoor heating does not suit them', i18n: 'pack.nature.qe.a4.metal',
        src: ['schwartz:metal', 'judy:metal-section.lungs-need-moisture'] },
      { id: 'earth', labelEN: 'Damp and cold do not suit them; heavy after a meal', i18n: 'pack.nature.qe.a4.earth',
        src: ['dataset:earth.q7', 'judy:earth-section.cold-damp-food'] },
    ],
  },
  {
    id: 'a5', labelEN: 'The bowl', i18n: 'pack.nature.qe.a5',
    options: [
      { id: 'earth', labelEN: 'Begs constantly and steals what they can — sweet things first', i18n: 'pack.nature.qe.a5.earth',
        src: ['judy:earth-section.overeat-love-sweets', 'schwartz:earth'] },
      { id: 'wood', labelEN: 'Growls over the bowl — the food is theirs', i18n: 'pack.nature.qe.a5.wood',
        src: ['schwartz:wood', 'judy:wood.easily-angered'] },
      { id: 'metal', labelEN: 'Eats slowly and without much interest; commotion does not bother them', i18n: 'pack.nature.qe.a5.metal',
        src: ['judy:metal.excess.poor-appetite', 'schwartz:metal'] },
      { id: 'fire', labelEN: 'Goes off food in the heat; otherwise inhales it on the move', i18n: 'pack.nature.qe.a5.fire',
        src: ['dataset:fire.food.2'] },
      { id: 'water', labelEN: 'Drinks a lot and gravitates to salty things', i18n: 'pack.nature.qe.a5.water',
        src: ['schwartz:water', 'judy:water.taste-salty'] },
    ],
  },
  {
    id: 'a6', labelEN: 'Energy across the day', i18n: 'pack.nature.qe.a6',
    options: [
      { id: 'wood', labelEN: 'Stamina to spare — they tire you out first', i18n: 'pack.nature.qe.a6.wood',
        src: ['judy:wood.athletic-stamina'] },
      { id: 'metal', labelEN: 'Even, but short — and then they have had enough', i18n: 'pack.nature.qe.a6.metal',
        src: ['judy:metal.consistent', 'dataset:metal.traits.play'] },
      { id: 'earth', labelEN: 'Nothing in the morning, livelier by evening; a long hike is beyond them', i18n: 'pack.nature.qe.a6.earth',
        src: ['schwartz:earth', 'judy:earth.relaxed-laid-back'] },
      { id: 'fire', labelEN: 'Flat out from the moment they wake, with nothing held back', i18n: 'pack.nature.qe.a6.fire',
        src: ['judy:fire.energetic', 'schwartz:fire'] },
      { id: 'water', labelEN: 'Quiet and slow, but they last all day', i18n: 'pack.nature.qe.a6.water',
        src: ['judy:water.slow-consistent', 'judy:water.quiet'] },
    ],
  },
  {
    id: 'a7', labelEN: 'When something goes wrong and they are under pressure', i18n: 'pack.nature.qe.a7',
    options: [
      { id: 'water', labelEN: 'Backs off and hides', i18n: 'pack.nature.qe.a7.water',
        src: ['judy:water.fearful', 'judy:water.likes-to-hide', 'schwartz:water'] },
      { id: 'metal', labelEN: 'Leaves the room and does not come back for a while', i18n: 'pack.nature.qe.a7.metal',
        src: ['judy:metal.aloof', 'schwartz:metal'] },
      { id: 'fire', labelEN: 'Goes off loudly — and it is over just as fast', i18n: 'pack.nature.qe.a7.fire',
        src: ['judy:fire.easily-excited', 'judy:fire.difficult-to-calm'] },
      { id: 'earth', labelEN: 'Takes a lot, and when it is too much they go and lie down', i18n: 'pack.nature.qe.a7.earth',
        src: ['judy:earth.serene-balanced', 'judy:earth.easily-satisfied'] },
      { id: 'wood', labelEN: 'Goes straight into it — and outlasts the other side', i18n: 'pack.nature.qe.a7.wood',
        src: ['judy:wood.easily-angered', 'schwartz:wood'] },
    ],
  },
  {
    id: 'a8', labelEN: 'Something changes at home — furniture moved, a new routine', i18n: 'pack.nature.qe.a8',
    options: [
      { id: 'metal', labelEN: 'It visibly bothers them — they want it back the way it was', i18n: 'pack.nature.qe.a8.metal',
        src: ['judy:metal.loves-order', 'judy:metal.obeys-the-rules'] },
      { id: 'fire', labelEN: 'Delighted — the whole thing has to be investigated at once', i18n: 'pack.nature.qe.a8.fire',
        src: ['judy:fire.easily-excited', 'judy:fire.energetic'] },
      { id: 'wood', labelEN: 'Adapts on the spot, as if it had always been there', i18n: 'pack.nature.qe.a8.wood',
        src: ['judy:wood.easily-adapts-to-change'] },
      { id: 'earth', labelEN: 'Notices two days later and does not mind', i18n: 'pack.nature.qe.a8.earth',
        src: ['judy:earth.slow-response', 'judy:earth.easily-satisfied'] },
      { id: 'water', labelEN: 'Gives it a wide berth and takes a while to accept it', i18n: 'pack.nature.qe.a8.water',
        src: ['judy:water.cautious', 'judy:water.likes-to-hide'] },
    ],
  },
  {
    id: 'a9', labelEN: 'Play', i18n: 'pack.nature.qe.a9',
    options: [
      { id: 'earth', labelEN: 'For a while, yes — but a nap would be better', i18n: 'pack.nature.qe.a9.earth',
        src: ['judy:earth.relaxed-laid-back', 'dataset:earth.q11'] },
      { id: 'water', labelEN: 'Loses interest quickly and wanders off', i18n: 'pack.nature.qe.a9.water',
        src: ['judy:water.self-contained', 'dataset:water.q11'] },
      { id: 'wood', labelEN: 'Has to win — and sulks when they do not', i18n: 'pack.nature.qe.a9.wood',
        src: ['judy:wood.confident', 'dataset:wood.q10'] },
      { id: 'fire', labelEN: 'Curious and wild — goes after anything that moves', i18n: 'pack.nature.qe.a9.fire',
        src: ['judy:fire.energetic', 'judy:fire.easily-excited'] },
      { id: 'metal', labelEN: 'Takes it seriously, needs a reason, and tires quickly', i18n: 'pack.nature.qe.a9.metal',
        src: ['judy:metal.disciplined-attitude', 'dataset:metal.q11'] },
    ],
  },
  {
    id: 'a10', labelEN: 'Learning and rules', i18n: 'pack.nature.qe.a10',
    options: [
      { id: 'fire', labelEN: 'Gets it in one go — and forgets just as fast', i18n: 'pack.nature.qe.a10.fire',
        src: ['dataset:fire.traits.4'] },
      { id: 'metal', labelEN: 'Learns slowly by repetition — and then has it for life', i18n: 'pack.nature.qe.a10.metal',
        src: ['judy:metal.loves-order', 'dataset:metal.traits.4'] },
      { id: 'water', labelEN: 'Slow to trust; once they do, they hold it without reservation', i18n: 'pack.nature.qe.a10.water',
        src: ['judy:water.cautious', 'dataset:water.traits.4'] },
      { id: 'earth', labelEN: 'Wants to please; the easiest dog in the world to teach', i18n: 'pack.nature.qe.a10.earth',
        src: ['schwartz:earth', 'judy:earth.loyal'] },
      { id: 'wood', labelEN: 'Learns fast and starts working around it just as fast', i18n: 'pack.nature.qe.a10.wood',
        src: ['judy:wood.confident', 'dataset:wood.traits.4'] },
    ],
  },
];

/**
 * KVÍZ 3 — ÚLOHA. Osem otázok, `id` odpovede JE `RoleKey`.
 * B8 láme remízu — všetkých päť odpovedí je doslovná citácia zo zdroja WDDC,
 * takže je zo všetkých otázok najbližšie k definícii úlohy.
 *
 * Zvláštne úlohy sa tu NEVYSKYTUJÚ. Rozhodujú ich výlučne štyri dedikované
 * otázky (`NATURE_SPECIALS[].questionEN`) — po locku z 22. 8. je „nie" veto
 * a berie sa najviac jedna, takže body z jadra už nič nerozhodovali a len
 * zaberali miesto základným úlohám.
 */
export const ROLE_QUESTIONS: NatureQuestion[] = [
  {
    id: 'b1', labelEN: 'The doorbell rings', i18n: 'pack.nature.qr.b1',
    options: [
      { id: 'herald', labelEN: 'Announces it before anyone touches the handle — and does not stop', i18n: 'pack.nature.qr.b1.herald',
        src: ['wddc:earlywarner.alerts-everything', 'wddc:earlywarner.very-vocal'] },
      { id: 'captain', labelEN: 'Hangs back while the visitor is a stranger; once they know them, a different dog', i18n: 'pack.nature.qr.b1.captain',
        src: ['wddc:decisionmaker.unsure-until-familiar'] },
      { id: 'companion', labelEN: 'Races to the door to greet — anybody', i18n: 'pack.nature.qr.b1.companion',
        src: ['wddc:prosocial.loves-everybody'] },
      { id: 'defender', labelEN: 'Puts themselves between you and the door', i18n: 'pack.nature.qr.b1.defender',
        src: ['wddc:protector.between-you-and-danger'] },
      { id: 'diviner', labelEN: 'Reacts differently depending on who is out there — and is usually right', i18n: 'pack.nature.qr.b1.diviner',
        src: ['wddc:seer.reacts-to-what-you-cant-see'] },
    ],
  },
  {
    id: 'b2', labelEN: 'A stranger is sitting in your living room', i18n: 'pack.nature.qr.b2',
    options: [
      { id: 'defender', labelEN: 'Lies down between them and the family and does not look away', i18n: 'pack.nature.qr.b2.defender',
        src: ['wddc:protector.bodyguard'] },
      { id: 'diviner', labelEN: 'Reacts differently to one particular person and nobody knows why', i18n: 'pack.nature.qr.b2.diviner',
        src: ['wddc:seer.spots-inauthenticity'] },
      { id: 'companion', labelEN: 'Settles next to them — someone new at last', i18n: 'pack.nature.qr.b2.companion',
        src: ['wddc:prosocial.outgoing-friendly'] },
      { id: 'captain', labelEN: 'Avoids them at first, then lies down beside them like an old friend', i18n: 'pack.nature.qr.b2.captain',
        src: ['wddc:decisionmaker.familiar-confident'] },
      { id: 'herald', labelEN: 'Watches from a distance and comments on every move', i18n: 'pack.nature.qr.b2.herald',
        src: ['wddc:earlywarner.sits-outside-group', 'wddc:earlywarner.scanning'] },
    ],
  },
  {
    id: 'b3', labelEN: 'On a walk — who picks the direction?', i18n: 'pack.nature.qr.b3',
    options: [
      { id: 'captain', labelEN: 'Twenty minutes turns into a three-hour neighbourhood investigation', i18n: 'pack.nature.qr.b3.captain',
        src: ['wddc:decisionmaker.3-hour-investigation'] },
      { id: 'companion', labelEN: 'Goes wherever you go, watching you more than the surroundings', i18n: 'pack.nature.qr.b3.companion',
        src: ['wddc:prosocial.natural-followers'] },
      { id: 'defender', labelEN: 'Walks ahead but keeps turning back — checking the route and checking you', i18n: 'pack.nature.qr.b3.defender',
        src: ['wddc:protector.hold-the-line'] },
      { id: 'herald', labelEN: 'Walks slightly to the side, scanning what is going on', i18n: 'pack.nature.qr.b3.herald',
        src: ['wddc:earlywarner.sits-outside-group'] },
      { id: 'diviner', labelEN: 'Stops dead at something you cannot see and will not go on', i18n: 'pack.nature.qr.b3.diviner',
        src: ['wddc:seer.reacts-to-what-you-cant-see'] },
    ],
  },
  {
    id: 'b4', labelEN: 'Two dogs are chasing each other and it is getting wilder', i18n: 'pack.nature.qr.b4',
    options: [
      { id: 'diviner', labelEN: 'Senses it is going to end badly before it turns', i18n: 'pack.nature.qr.b4.diviner',
        src: ['wddc:seer.spots-imbalance'] },
      { id: 'defender', labelEN: 'Walks over and shuts it down — even though both were fine', i18n: 'pack.nature.qr.b4.defender',
        src: ['wddc:protector.fun-police'] },
      { id: 'herald', labelEN: 'Watches from a distance and announces that something is happening', i18n: 'pack.nature.qr.b4.herald',
        src: ['wddc:earlywarner.alerts-everything'] },
      { id: 'companion', labelEN: 'Joins in and makes the chaos bigger', i18n: 'pack.nature.qr.b4.companion',
        src: ['wddc:prosocial.follows-energy'] },
      { id: 'captain', labelEN: 'Decides whether you go closer or go around — and that is that', i18n: 'pack.nature.qr.b4.captain',
        src: ['wddc:decisionmaker.decides-whats-safe'] },
    ],
  },
  {
    id: 'b5', labelEN: 'There is tension at home, or you are low', i18n: 'pack.nature.qr.b5',
    options: [
      { id: 'captain', labelEN: 'Their whole day shifts — routine, appetite, pace', i18n: 'pack.nature.qr.b5.captain',
        src: ['wddc:decisionmaker.sets-emotional-tone'] },
      { id: 'diviner', labelEN: 'Cannot settle and starts searching the house for what is wrong', i18n: 'pack.nature.qr.b5.diviner',
        src: ['wddc:seer.cant-rest', 'wddc:seer.mirror'] },
      { id: 'companion', labelEN: 'Comes over and will not leave until you feel better', i18n: 'pack.nature.qr.b5.companion',
        src: ['wddc:prosocial.emotional-support'] },
      { id: 'herald', labelEN: 'Gets uneasy and starts reporting every sound', i18n: 'pack.nature.qr.b5.herald',
        src: ['wddc:earlywarner.cant-switch-off'] },
      { id: 'defender', labelEN: 'Ramps up — goes to the door, guards, checks', i18n: 'pack.nature.qr.b5.defender',
        src: ['wddc:protector.policing'] },
    ],
  },
  {
    id: 'b6', labelEN: 'You leave them alone for three hours', i18n: 'pack.nature.qr.b6',
    options: [
      { id: 'defender', labelEN: 'Fine — does a round of the flat and checks everything is in place', i18n: 'pack.nature.qr.b6.defender',
        src: ['wddc:protector.supervise'] },
      { id: 'companion', labelEN: 'Cannot bear it — whines, destroys, waits at the door', i18n: 'pack.nature.qr.b6.companion',
        src: ['wddc:prosocial.separation-distress'] },
      { id: 'captain', labelEN: 'Fine at home; somewhere unfamiliar they are a completely different dog', i18n: 'pack.nature.qr.b6.captain',
        src: ['wddc:decisionmaker.familiar-vs-unfamiliar'] },
      { id: 'diviner', labelEN: 'Cannot lie down — paces and hunts for what is off', i18n: 'pack.nature.qr.b6.diviner',
        src: ['wddc:seer.cant-rest'] },
      { id: 'herald', labelEN: 'Copes, but reports every sound from the hallway', i18n: 'pack.nature.qr.b6.herald',
        src: ['wddc:earlywarner.cant-switch-off'] },
    ],
  },
  {
    id: 'b7', labelEN: 'A puppy or a small child gets in their space', i18n: 'pack.nature.qr.b7',
    options: [
      { id: 'herald', labelEN: 'Announces every bit of nonsense before it happens', i18n: 'pack.nature.qr.b7.herald',
        src: ['wddc:earlywarner.alerts-first'] },
      { id: 'captain', labelEN: 'Gets up and walks away — and that settles it', i18n: 'pack.nature.qr.b7.captain',
        src: ['wddc:decisionmaker.turns-nose-up-walks-away'] },
      { id: 'defender', labelEN: 'Sets a boundary and makes sure it holds', i18n: 'pack.nature.qr.b7.defender',
        src: ['wddc:protector.fun-police'] },
      { id: 'companion', labelEN: 'Plays with them as an equal — behaves like a puppy themselves', i18n: 'pack.nature.qr.b7.companion',
        src: ['wddc:prosocial.behaves-like-six-months'] },
      { id: 'diviner', labelEN: 'One particular puppy bothers them and nobody knows why', i18n: 'pack.nature.qr.b7.diviner',
        src: ['wddc:seer.spots-whats-off'] },
    ],
  },
  {
    id: 'b8', labelEN: 'How do people who do not know them describe your dog?', i18n: 'pack.nature.qr.b8',
    options: [
      { id: 'diviner', labelEN: '“There is something wrong with that dog.”', i18n: 'pack.nature.qr.b8.diviner',
        src: ['wddc:seer.somethings-wrong-with-their-brain'] },
      { id: 'companion', labelEN: '“So friendly — and a little bit much.”', i18n: 'pack.nature.qr.b8.companion',
        src: ['wddc:prosocial.described-as-needy'] },
      { id: 'defender', labelEN: '“I would not want to meet that one down a dark alley.”', i18n: 'pack.nature.qr.b8.defender',
        src: ['wddc:protector.dark-alley'] },
      { id: 'herald', labelEN: '“That dog barks at everything.”', i18n: 'pack.nature.qr.b8.herald',
        src: ['wddc:earlywarner.barks-at-everything'] },
      { id: 'captain', labelEN: '“That one behaves more like a cat.”', i18n: 'pack.nature.qr.b8.captain',
        src: ['wddc:decisionmaker.behaves-like-a-cat'] },
    ],
  },
];

/**
 * Otázka, ktorá láme remízu na danej osi. Vecná, nie abecedná — pri zhode bodov
 * rozhodne odpoveď na ňu, nie poradie v poli. Predtým rozhodovalo poradie a
 * prejavilo sa to na Hektorovi: `herald:5 diviner:5 defender:5`, víťaza vybralo
 * pole. To vyzerá ako výsledok, ale je to hod mincou.
 */
const ELEMENT_TIEBREAK = 'a1';
const ROLE_TIEBREAK = 'b8';

/** Doplnkové otázky na zvláštne úlohy: áno / niekedy / nie → +3 / +1 / 0. */
export const SPECIAL_ANSWER_WEIGHTS = { yes: 3, sometimes: 1, no: 0 } as const;
export type SpecialAnswer = keyof typeof SPECIAL_ANSWER_WEIGHTS;

// ── KVÍZ 2: ROVNOVÁHA ────────────────────────────────────────────────────────
// Zdroj: Excess / Deficiency tabuľky Dr. Judy Morgan, str. 3–4 zdrojového PDF.
// **Všetkých 60 položiek, žiadna sa nemaže** (Matej 22. 8.: „držme sa jej ale
// uvedme to ako odporučanie podľa TČM prejavy").
//
// 🔴 JEDINÁ VEC, KTORÚ SME PRIDALI, JE `class`. Zoznam obsahuje popri
// pozorovateľných prejavoch aj tvrdé DIAGNÓZY (nádory, zápal pľúc, ochorenie
// srdca, epileptické záchvaty, pretrhnutý väz). Zdrojový hárok na ne dáva
// rovnakú odpoveď ako na suchú srsť — „feed X". To sa tu NEROBÍ:
//   `sign`      → počíta sa a dostane radu k miske (L1–L3)
//   `diagnosis` → počíta sa DO OBRAZU rovnováhy, ale jediná veta, ktorá k nej
//                 patrí, je „toto patrí veterinárovi". Žiadna diétna rada.
// Dôvod nie je právna opatrnosť: keď niekto zaškrtne nádor v mieche a appka
// odpovie „kŕm Zem", ten pes mal byť u veterinára včera.
//
// ⚠️ Dve položky zdroja na psa nesadnú a sú preto rozšírené, nie vypustené —
// pozri `note` pri `water.excess.headaches` a `water.deficiency.grey`.
export type BalanceSide = 'excess' | 'deficiency';
export type BalanceClass = 'sign' | 'diagnosis';

export interface BalanceItem {
  id: string;
  element: ElementKey;
  side: BalanceSide;
  cls: BalanceClass;
  labelEN: string;
  i18n: string;
  /** Doplnok tam, kde zdrojová formulácia nie je na psovi pozorovateľná. */
  noteEN?: string;
}

/** `pack.nature.bal.<element>.<side>.<id>` — kľúč z DÁT, nie z poradia v zozname. */
function balanceRows(rows: Omit<BalanceItem, 'i18n'>[]): BalanceItem[] {
  return rows.map((r) => ({ ...r, i18n: `pack.nature.bal.${r.element}.${r.side}.${r.id}` }));
}

export const BALANCE_ITEMS: BalanceItem[] = balanceRows([
  // ── FIRE ──
  { id: 'dry-cough', element: 'fire', side: 'excess', cls: 'sign', labelEN: 'A dry cough' },
  { id: 'anxiety', element: 'fire', side: 'excess', cls: 'sign', labelEN: 'Anxiety and restlessness' },
  { id: 'dehydration', element: 'fire', side: 'excess', cls: 'sign', labelEN: 'Signs of dehydration' },
  { id: 'swollen-feet', element: 'fire', side: 'excess', cls: 'sign', labelEN: 'Swollen feet' },
  { id: 'cystitis', element: 'fire', side: 'excess', cls: 'diagnosis', labelEN: 'Cystitis' },
  { id: 'high-bp', element: 'fire', side: 'excess', cls: 'diagnosis', labelEN: 'High blood pressure' },
  { id: 'confusion', element: 'fire', side: 'deficiency', cls: 'sign', labelEN: 'Confusion' },
  { id: 'tires-easily', element: 'fire', side: 'deficiency', cls: 'sign', labelEN: 'Tires easily' },
  { id: 'panic', element: 'fire', side: 'deficiency', cls: 'sign', labelEN: 'Panic' },
  { id: 'heart-disease', element: 'fire', side: 'deficiency', cls: 'diagnosis', labelEN: 'Heart disease' },
  { id: 'anemia', element: 'fire', side: 'deficiency', cls: 'diagnosis', labelEN: 'Anaemia' },
  { id: 'low-bp', element: 'fire', side: 'deficiency', cls: 'diagnosis', labelEN: 'Low blood pressure' },
  // ── EARTH ──
  { id: 'weak-back', element: 'earth', side: 'excess', cls: 'sign', labelEN: 'Weak back and joints' },
  { id: 'gut', element: 'earth', side: 'excess', cls: 'sign', labelEN: 'Constipation, diarrhoea or gas' },
  { id: 'edema', element: 'earth', side: 'excess', cls: 'sign', labelEN: 'Swelling that pits under a finger' },
  { id: 'sticky-mucous', element: 'earth', side: 'excess', cls: 'sign', labelEN: 'Sticky mucous' },
  { id: 'appetite', element: 'earth', side: 'excess', cls: 'sign', labelEN: 'Appetite that swings up and down' },
  { id: 'conjunctivitis', element: 'earth', side: 'excess', cls: 'diagnosis', labelEN: 'Conjunctivitis' },
  { id: 'loose-teeth', element: 'earth', side: 'deficiency', cls: 'sign', labelEN: 'Loose teeth' },
  { id: 'bruises', element: 'earth', side: 'deficiency', cls: 'sign', labelEN: 'Bruises easily' },
  { id: 'muscle-tone', element: 'earth', side: 'deficiency', cls: 'sign', labelEN: 'Poor muscle tone' },
  { id: 'bleeding-gums', element: 'earth', side: 'deficiency', cls: 'sign', labelEN: 'Bleeding gums' },
  { id: 'swollen-abdomen', element: 'earth', side: 'deficiency', cls: 'diagnosis', labelEN: 'Swollen abdomen or liver' },
  { id: 'lymph-nodes', element: 'earth', side: 'deficiency', cls: 'diagnosis', labelEN: 'Swollen lymph nodes' },
  // ── METAL ──
  { id: 'poor-appetite', element: 'metal', side: 'excess', cls: 'sign', labelEN: 'Little interest in food' },
  { id: 'brittle-nails', element: 'metal', side: 'excess', cls: 'sign', labelEN: 'Dry, cracked, brittle nails' },
  { id: 'constipation', element: 'metal', side: 'excess', cls: 'sign', labelEN: 'Constipation' },
  { id: 'asthma', element: 'metal', side: 'excess', cls: 'diagnosis', labelEN: 'Asthma' },
  { id: 'colitis', element: 'metal', side: 'excess', cls: 'diagnosis', labelEN: 'Colitis' },
  { id: 'dermatitis', element: 'metal', side: 'excess', cls: 'diagnosis', labelEN: 'Dermatitis' },
  { id: 'bladder-weak', element: 'metal', side: 'deficiency', cls: 'sign', labelEN: 'A weak bladder' },
  { id: 'moles-warts', element: 'metal', side: 'deficiency', cls: 'sign', labelEN: 'Moles and warts' },
  { id: 'hair-loss', element: 'metal', side: 'deficiency', cls: 'sign', labelEN: 'Losing body hair' },
  { id: 'itching', element: 'metal', side: 'deficiency', cls: 'sign', labelEN: 'Itching' },
  { id: 'resp-infections', element: 'metal', side: 'deficiency', cls: 'diagnosis', labelEN: 'Respiratory tract infections' },
  { id: 'pneumonia', element: 'metal', side: 'deficiency', cls: 'diagnosis', labelEN: 'Pneumonia' },
  // ── WATER ──
  { id: 'loose-stool', element: 'water', side: 'excess', cls: 'sign', labelEN: 'Loose bowel movements' },
  { id: 'lethargy', element: 'water', side: 'excess', cls: 'sign', labelEN: 'Lethargy' },
  // ⚠️ Zdroj tu má holé „Headaches". Bolesť hlavy sa u psa pozorovať NEDÁ — je to
  // položka prevzatá z ľudskej TČM a majiteľ nemá ako ju zaškrtnúť. Ponechaná so
  // znením, ktoré pozorovateľné je.
  { id: 'headaches', element: 'water', side: 'excess', cls: 'diagnosis', labelEN: 'Head pain',
    noteEN: 'Sensitive to being touched on the head, or presses their forehead into a wall' },
  { id: 'stones', element: 'water', side: 'excess', cls: 'diagnosis', labelEN: 'Kidney or bladder stones' },
  { id: 'arthritis', element: 'water', side: 'excess', cls: 'diagnosis', labelEN: 'Arthritis' },
  { id: 'tumors', element: 'water', side: 'excess', cls: 'diagnosis', labelEN: 'Tumours of the brain, spine or lower abdomen' },
  { id: 'frequent-urination', element: 'water', side: 'deficiency', cls: 'sign', labelEN: 'Frequent urination' },
  { id: 'fear', element: 'water', side: 'deficiency', cls: 'sign', labelEN: 'Fear' },
  // ⚠️ Zdroj má „Prematurely gray". Bez veku to nehovorí nič — ňufák šedivie
  // normálne po siedmom roku. Ponechané s hranicou, ktorá z toho robí signál.
  { id: 'grey', element: 'water', side: 'deficiency', cls: 'sign', labelEN: 'Going grey early',
    noteEN: 'Before the age of five' },
  { id: 'senses', element: 'water', side: 'deficiency', cls: 'sign', labelEN: 'Dulled sight and hearing' },
  { id: 'discs', element: 'water', side: 'deficiency', cls: 'diagnosis', labelEN: 'Degeneration of discs or cartilage' },
  { id: 'osteoporosis', element: 'water', side: 'deficiency', cls: 'diagnosis', labelEN: 'Osteoporosis' },
  // ── WOOD ──
  { id: 'reflux', element: 'wood', side: 'excess', cls: 'sign', labelEN: 'Burping, gulping, licking their lips' },
  { id: 'irritability', element: 'wood', side: 'excess', cls: 'sign', labelEN: 'Short fuse — snaps with little warning' },
  { id: 'hyperactivity', element: 'wood', side: 'excess', cls: 'sign', labelEN: 'Hyperactivity' },
  { id: 'digestive-upset', element: 'wood', side: 'excess', cls: 'sign', labelEN: 'Digestive upset' },
  { id: 'wheezing', element: 'wood', side: 'excess', cls: 'sign', labelEN: 'Wheezing' },
  { id: 'seizures', element: 'wood', side: 'excess', cls: 'diagnosis', labelEN: 'Seizures' },
  { id: 'joint-pain', element: 'wood', side: 'deficiency', cls: 'sign', labelEN: 'Aching joints and tendons' },
  { id: 'dry-eyes', element: 'wood', side: 'deficiency', cls: 'sign', labelEN: 'Dry eyes' },
  { id: 'phlegm', element: 'wood', side: 'deficiency', cls: 'sign', labelEN: 'Phlegm — a cough, mucous' },
  { id: 'sluggish', element: 'wood', side: 'deficiency', cls: 'sign', labelEN: 'Lethargy' },
  { id: 'circulation', element: 'wood', side: 'deficiency', cls: 'diagnosis', labelEN: 'Sluggish circulation' },
  { id: 'ccl', element: 'wood', side: 'deficiency', cls: 'diagnosis', labelEN: 'A ruptured ligament (CCL)' },
]);

/**
 * Ktorý element podporiť. Prevzaté DOSLOVA zo zdroja („Feed …" pod každou tabuľkou);
 * nedostatok vždy podporuje sám seba a svoju matku v cykle.
 *
 * ⚠️ Toto je jediné miesto, kde sa vrstva rovnováhy dotýka misky, a hovorí len
 * KTORÝ element podporiť. Čím sa podporí, je už `foodEN` daného elementu — teda
 * L1–L3, ktoré sú v datasete a nemenia sa. Žiadna nová výživová rada tu nevzniká.
 */
export const BALANCE_SUPPORT: Record<BalanceSide, Record<ElementKey, ElementKey[]>> = {
  excess: {
    fire: ['water'], earth: ['wood'], metal: ['fire'], water: ['earth'], wood: ['metal'],
  },
  deficiency: {
    fire: ['fire', 'wood'], earth: ['earth', 'fire'], metal: ['metal', 'earth'],
    water: ['water', 'metal'], wood: ['wood', 'water'],
  },
};

// ── SCORING ──────────────────────────────────────────────────────────────────
export interface NatureResult {
  element: ElementKey;
  /**
   * Druhý element. Od prestavby 22. 8.: rozdiel najviac 1 bod a víťaz aspoň
   * `DUAL_MIN_EL`. Podiel 80 % je pri desiatich bodoch priveľmi štedrý —
   * pri 4 : 3 by dualitu priznal, čo je pri váhe 1 bežný šum.
   */
  elementSecond: ElementKey | null;
  role: RoleKey;
  roleSecond: RoleKey | null;
  /** Zvláštne úlohy, ktoré prekročili prah. Môže byť viac aj žiadna. */
  specials: SpecialKey[];
  scores: {
    el: Record<ElementKey, number>;
    role: Record<RoleKey, number>;
    spec: Record<SpecialKey, number>;
    /**
     * 🔑 VERZIA ŠKÁLY. Bez nej sa nové pravidlo duality pustí na staré body a
     * ticho zmaže druhý element z DOG ID: pes z augusta má `earth:9 water:9`
     * v škále 0–34, kde je to dualita, ale pravidlom „rozdiel ≤ 1" prejde tiež —
     * a `metal:27 water:22` už nie, hoci starým pravidlom prešlo.
     *
     * `dog_events` je append-only, takže históriu prepísať nemožno. Verzia
     * rozhoduje, ktorým pravidlom sa ČÍTA → viď `natureResultFromStored`.
     * Chýbajúca hodnota = 1 (všetko spred 22. 8. 2026).
     */
    v?: number;
  };
}

/** Škála zápisu, ktorý vyrobí dnešný `scoreNature`. Zvyšuj pri KAŽDEJ zmene rozsahu bodov. */
export const NATURE_SCORE_VERSION = 2;

/** v1 (do 22. 8. 2026): dualita podielom — druhý ≥ 80 % prvého. */
const DUAL_RATIO = 0.8;
/** v2: dualita rozdielom. Víťaz musí mať aspoň toľko, inak je zhoda len šum. */
const DUAL_MIN_EL = 4;
const DUAL_MIN_ROLE = 3;
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

/**
 * Zoradí os a REMÍZU ROZHODNE ODPOVEĎOU na tie-break otázku, nie poradím v poli.
 *
 * ⚠️ Toto nie je kozmetika. Pri váhe 1 je zhoda bežná, nie výnimočná — a predtým
 * ju lámalo poradie v `ELEMENT_KEYS`/`ROLE_KEYS`. Hektor mal 22. 8.
 * `herald:5 diviner:5 defender:5` a víťaza vybralo pole; vyzeralo to ako výsledok,
 * ale bol to hod mincou, ktorý navyše zvýhodňoval vždy tú istú úlohu.
 */
function rankWithTiebreak<K extends string>(
  s: Record<K, number>,
  keys: K[],
  tiebreak: string | undefined,
): K[] {
  return [...keys].sort((a, b) => {
    if (s[b] !== s[a]) return s[b] - s[a];
    if (a === tiebreak) return -1;
    if (b === tiebreak) return 1;
    return keys.indexOf(a) - keys.indexOf(b);
  });
}

/** v2: dualita rozdielom. Vydelené, lebo to isté pravidlo potrebuje aj čítanie z DB. */
function dualV2<K extends string>(order: K[], s: Record<K, number>, min: number): K | null {
  const [top, second] = order;
  return second && s[top] >= min && s[top] - s[second] <= 1 ? second : null;
}

export function scoreNature(
  answers: Record<string, string>,
  specialAnswers: Partial<Record<SpecialKey, SpecialAnswer>> = {},
): NatureResult {
  const el: Record<ElementKey, number> = { fire: 0, earth: 0, metal: 0, water: 0, wood: 0 };
  const role: Record<RoleKey, number> = { companion: 0, herald: 0, diviner: 0, defender: 0, captain: 0 };
  const spec: Record<SpecialKey, number> = { loner: 0, hunter: 0, peacemaker: 0, nurturer: 0 };

  // Váha je VŽDY 1 a `id` odpovede JE kľúč osi — preto tu nie sú žiadne tabuľky váh.
  // Neznáme `id` sa ticho ignoruje: v poli môže ležať odpoveď na otázku, ktorá
  // medzitým z datasetu zmizla.
  for (const q of ELEMENT_QUESTIONS) {
    const picked = answers[q.id] as ElementKey | undefined;
    if (picked && picked in el) el[picked] += 1;
  }
  for (const q of ROLE_QUESTIONS) {
    const picked = answers[q.id] as RoleKey | undefined;
    if (picked && picked in role) role[picked] += 1;
  }

  // Zvláštne úlohy stoja UŽ LEN na dedikovaných otázkach — z jadra kvízu vypadli.
  for (const [k, a] of Object.entries(specialAnswers)) {
    if (a) spec[k as SpecialKey] += SPECIAL_ANSWER_WEIGHTS[a];
  }

  const elOrder = rankWithTiebreak(el, ELEMENT_KEYS, answers[ELEMENT_TIEBREAK]);
  const roleOrder = rankWithTiebreak(role, ROLE_KEYS, answers[ROLE_TIEBREAK]);

  // Zvláštna úloha: najviac JEDNA, „nie“ ju vypína natvrdo. Viď `pickSpecials`.
  const specials = pickSpecials(spec, specialAnswers);

  return {
    element: elOrder[0],
    elementSecond: dualV2(elOrder, el, DUAL_MIN_EL),
    role: roleOrder[0],
    roleSecond: dualV2(roleOrder, role, DUAL_MIN_ROLE),
    specials,
    scores: { el, role, spec, v: NATURE_SCORE_VERSION },
  };
}

export interface BalanceCell {
  element: ElementKey;
  side: BalanceSide;
  /** Počet zaškrtnutých položiek v bunke — prejavy aj diagnózy. */
  count: number;
  /** Ktoré elementy podľa zdroja podporiť. Prázdne, keď bunka nevyhrala. */
  support: ElementKey[];
}

export interface BalanceResult {
  /** Bunka s najviac zaškrtnutiami, alebo `null` keď nie je zaškrtnuté nič. */
  top: BalanceCell | null;
  /** Ďalšie bunky s aspoň jedným zaškrtnutím, zostupne. Bez `support`. */
  rest: BalanceCell[];
  /**
   * Zaškrtnuté DIAGNÓZY. Nedostávajú radu k miske — patrí k nim jediná veta,
   * a tou je odporúčanie ísť k veterinárovi.
   */
  diagnoses: BalanceItem[];
  /** Zaškrtnuté prejavy, kvôli výpisu „na čom to stojí". */
  signs: BalanceItem[];
}

/**
 * Vyhodnotí kvíz 2. Vstup je zoznam `id` zaškrtnutých položiek.
 *
 * Rovnováha sa počíta zo VŠETKÉHO zaškrtnutého vrátane diagnóz — diagnóza je
 * platný signál o tom, kam sa telo nakláňa. Čo sa NEDEJE, je diétna rada na ňu:
 * `diagnoses` sa vracia samostatne, aby ju obrazovka vedela vykresliť s vlastnou
 * vetou a nezamiešala ju medzi prejavy.
 *
 * Remízu bunky láme poradie `ELEMENT_KEYS` a `excess` pred `deficiency` — je to
 * arbitrárne, ale deterministické; ten istý pes uvidí vždy to isté.
 */
export function scoreBalance(checked: string[]): BalanceResult {
  const picked = new Set(checked);
  const items = BALANCE_ITEMS.filter((b) => picked.has(b.id));

  const cells: BalanceCell[] = [];
  for (const element of ELEMENT_KEYS) {
    for (const side of ['excess', 'deficiency'] as BalanceSide[]) {
      const count = items.filter((b) => b.element === element && b.side === side).length;
      if (count > 0) cells.push({ element, side, count, support: [] });
    }
  }
  cells.sort((a, b) =>
    b.count - a.count ||
    ELEMENT_KEYS.indexOf(a.element) - ELEMENT_KEYS.indexOf(b.element) ||
    (a.side === 'excess' ? -1 : 1));

  const [top, ...rest] = cells;
  return {
    top: top ? { ...top, support: BALANCE_SUPPORT[top.side][top.element] } : null,
    rest,
    diagnoses: items.filter((b) => b.cls === 'diagnosis'),
    signs: items.filter((b) => b.cls === 'sign'),
  };
}

/**
 * Veta k diagnózam. Vykresľuje sa NAMIESTO rady k miske, nie popri nej.
 * Držané tu, aby sa nedalo obísť tým, že si obrazovka napíše vlastnú.
 */
export const BALANCE_VET_NOTE = {
  textEN:
    'What you have ticked here belongs with your vet, not with the bowl. It still tells us which way the balance leans — but a diagnosis is not something a diet advises on.',
  i18n: 'pack.nature.balance.vetNote',
};

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

  // 🔑 DUALITA SA POČÍTA PODĽA VERZIE ŠKÁLY, V KTOREJ BOL ROZPAD ZAPÍSANÝ.
  //
  // Pravidlo v2 (rozdiel ≤ 1) je stavané na rozsah 0–10. Na starých bodoch, kde
  // element beží do 34, je nezmyselné v oboch smeroch: `metal:27 water:22` je
  // dualita podľa pravidla, ktoré vtedy platilo, ale rozdielom neprejde — a psovi
  // by druhý element z DOG ID **ticho zmizol**, bez chyby a bez varovania. Opačne
  // `earth:2 water:1` by rozdielom prešlo, hoci to nie je nič.
  //
  // `dog_events` je append-only, takže sa nesmie prepísať zápis — oreže sa až
  // ČÍTANIE, rovnako ako pri `storedSpecials()`. Chýbajúce `v` = 1.
  const version = num(raw, 'v') || 1;
  const second = <K extends string>(s: Record<K, number>, keys: K[], top: K, min: number): K | null => {
    const rest = keys.filter((k) => k !== top)
      .sort((a, b) => s[b] - s[a] || keys.indexOf(a) - keys.indexOf(b));
    const r = rest[0];
    if (!r) return null;
    return version >= 2
      ? (s[top] >= min && s[top] - s[r] <= 1 ? r : null)
      : (s[top] > 0 && s[r] >= s[top] * DUAL_RATIO ? r : null);
  };

  const specials = storedSpecials(v.specials, spec);

  return {
    element,
    elementSecond: second(el, ELEMENT_KEYS, element, DUAL_MIN_EL),
    role,
    roleSecond: second(roleS, ROLE_KEYS, role, DUAL_MIN_ROLE),
    specials,
    scores: { el, role: roleS, spec, v: version },
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
// ⚠️ Rozšírené 22. 8. 2026. Do prestavby menovala pätička len WDDC a všeobecne
// „Traditional Chinese Medicine" — lenže elementová vrstva odvtedy stojí na dvoch
// konkrétnych, menovite citovateľných prácach: hárok a state Dr. Judy Morgan
// (`judy:` v `src`) a portréty piatich konštitúcií od Cheryl Schwartz (`schwartz:`).
// Priznať „čínsku medicínu" a zamlčať autorov, z ktorých sú prevzaté formulácie,
// je horšie než nepriznať nič. Kým `src` menuje štyri podklady, pätička musí tiež.
export const NATURE_ATTRIBUTION = {
  textEN:
    'The pack-role layer builds on research by the Wolf and Dog Development Centre — The 9 Social Identities. The constitution layer draws on Traditional Chinese Medicine as set out by Dr. Judy Morgan (Naturally Healthy Pets) and Cheryl Schwartz, DVM (Four Paws, Five Directions). With thanks for their work.',
  i18n: 'pack.nature.attribution',
  sourceName: 'Wolf and Dog Development Centre',
  url: '',
} as const;

// ⚠️ VOLANIE MUSÍ BYŤ AŽ TU, NA KONCI SÚBORU.
// `assertLanes()` číta `ELEMENT_QUESTIONS`, `ROLE_QUESTIONS` aj `BALANCE_ITEMS`, ktoré sú
// deklarované NIŽŠIE než samotná funkcia. Volanie hneď za jej definíciou preto spadlo na
// temporal dead zone (`Cannot access 'ELEMENT_QUESTIONS' before initialization`) a zhodilo
// celú stránku do ErrorBoundary.
// 🔑 Nechytil to `tsc` ANI `npm run build` — v produkcii je `import.meta.env.DEV` nepravdivé,
// takže sa stráž nezavolá a build prejde. Chyba žila LEN v deve a odhalilo ju až otvorenie
// stránky. Ak sem pribudne ďalšia kontrola, volanie ostáva na konci súboru.
if (import.meta.env?.DEV) assertLanes();
