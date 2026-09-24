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
  /**
   * 🔴 VERDIKT = JEDNA VETA (voľba B1, 24. 9. 2026). Toto je to JEDINÉ, čo
   * z odpovede vidno na nástenke; `body` sa otvorí až v karte.
   * Premerané pred zmenou: karta mala 592–1037 znakov a 534–844 px, na obrazovku
   * sa zmestila 1,2 karty. Nie je to skratka odpovede — je to jej pointa.
   * ⚠️ Hviezdičky `*takto*` zvýraznia kúsok vety (`verdictParts`). Je to jediná
   *    značka, ktorú veta pozná; markdown sa sem nevláči.
   */
  verdict: string;
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
  /**
   * 🔴 NÁLEPKA SVETA (Matej 24. 9. 2026, voľba C1): *„problém alebo otázky by
   * mali mať nálepku SVETA ktorého sa to týka"*. Kľúč zo `vault/worlds.ts` —
   * nie vlastný zoznam. Svet hovorí KAM TO PATRÍ a je to spojka na vault:
   * AINUBIS z toho sveta odpovedá a filtre nástenky sú tie isté svety.
   * ⚠️ Svet NENAHRÁDZA druh. Druh (problém · skúsenosť) je prvý štítok dole
   *    a hovorí ČO TO JE. Dve osi, dve farby — svet je MODRÝ (svit vaultu),
   *    druh je zlatý.
   */
  world: string;
  who: string;
  initial: string;
  /** Pes pod menom — „Ajka · 7 y · German shepherd". Jeden riadok, nie pilulky. */
  dog: string;
  text: string;
  /**
   * 🔴 OTÁZKA JEDNOU VETOU (Matej 24. 9. 2026): *„OTAZKY packu ak je dlhá —
   * skrátiť/preložiť ju do jednej otázky (ako to robia chaty)"*. Na nástenke
   * stojí TOTO, plné znenie sa otvorí v karte.
   * ⚠️ Nie je to orezanie s trojbodkou — je to PREKLAD do jednej vety. Orezanie
   *    utne v polovici myšlienky; zhrnutie nechá otázku otázkou. Trojbodka je
   *    len poistka, keď zhrnutie chýba (`shortOf`).
   * ⚠️ Naostro ho napíše model pri odoslaní, nie človek. Tu je napísané rukou.
   */
  short?: string;
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
    id: 'w1', world: 'problems',
    who: 'Tomáš B.', initial: 'T', dog: 'Ajka · 7 y · German shepherd',
    text: 'After a longer hike she limps on a hind leg. By morning it is gone. Should I be dealing with this, or is it normal tiredness?',
    short: 'She limps after long hikes but is fine by morning — vet, or normal?',
    tags: ['problem', 'movement', 'looking for advice'],
    ai: {
      verdict: 'Limping that clears overnight is a *distance limit*, not the joint.',
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
    id: 'w2', world: 'training',
    who: 'Martina D.', initial: 'M', dog: 'Bodo · 2 y · Border collie',
    text: 'I stopped using his name when telling him off and his recall got better within a week.',
    short: 'Dropping his name from scoldings fixed his recall in a week.',
    tags: ['experience', 'training'],
    ai: {
      verdict: 'The vault has *no scroll on training* yet — I will not dress an opinion up as knowledge.',
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
    id: 'w3', world: 'prevention',
    who: 'Lukáš H.', initial: 'L', dog: 'Cyra · 4 y · Mixed breed',
    text: 'I pulled a tick off her head this morning and the spot is red. How long do I watch it?',
    short: 'Tick pulled off her head, the spot is red — how long do I watch it?',
    tags: ['problem', 'prevention', 'parasites'],
    ai: {
      verdict: 'A red ring right after removal is a *reaction to the bite*, not an infection.',
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
    id: 'w4', world: 'nutrition',
    who: 'Zuzana R.', initial: 'Z', dog: 'Bary · 9 y · Labrador',
    text: 'He throws up yellow bile in the morning before his first meal. Is that a stomach problem?',
    short: 'Yellow bile every morning before the first meal — stomach problem?',
    tags: ['problem', 'nutrition', 'looking for advice'],
    ai: {
      verdict: 'Morning bile is usually the *night gap*, not the food.',
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
  // ── DOPLNENÉ 24. 9. 2026 (Matej: „do boardu daj veľa dotazov nech vidím ako
  //    to vyzerá zaplnená a kde budu nejake stranky") ──────────────────────────
  // 🔴 POKRYTIE NIE JE NÁHODNÉ. `blank: true` majú svety, ktoré korpus naozaj
  //    nemá napísané (výcvik, cesta psa, porozumenie); odpoveď z nich sa
  //    NEVYMÝŠĽA. Plnú odpoveď majú výživa, telo, prevencia a problémy.
  //    [[feedback_maketa_radsej_prizna_ze_nehlada]]
  {
    id: 'w5', world: 'nutrition',
    who: 'Peter K.', initial: 'P', dog: 'Aris · 3 y · Vizsla',
    text: 'The vet said to switch to a lower protein food because of his kidney values, but every breeder forum says protein was never the problem and that it is the phosphorus. Who is right?',
    short: 'Vet says less protein for kidneys, forums say phosphorus. Who is right?',
    tags: ['problem', 'nutrition', 'looking for advice'],
    ai: {
      verdict: 'For kidneys the number that matters is *phosphorus*, not protein alone.',
      body: 'Both halves are half right. Restricting protein without looking at phosphorus lowers the dog and not the strain; phosphorus is the number renal diets are actually built around. What also matters is protein quality — a smaller amount the body can fully use leaves less waste than a larger amount it cannot.',
      advice: 'Ask for the phosphorus value in mg per 100 kcal, not the percentage on the bag.',
      scrolls: 7, world: 'Nutrition', circle: 'Feeding a sick dog',
    },
    replies: [{ who: 'Andrea L.', text: 'Our vet gave us the same number and it dropped in three months.', seal: 'fits' }],
    moreReplies: 11, paws: 43,
  },
  {
    id: 'w6', world: 'anatomy',
    who: 'Simona H.', initial: 'S', dog: 'Nela · 6 y · Beagle',
    text: 'She sleeps sixteen hours a day and I keep reading that this is normal, but she is not a puppy any more and it feels like a lot.',
    short: 'Sixteen hours of sleep a day at six years old — is that still normal?',
    tags: ['experience', 'anatomy'],
    ai: {
      verdict: 'Sixteen hours is normal; what is not normal is *sleep that never refreshes*.',
      body: 'Dogs run on many short cycles rather than one long one, so the daily total says less than the quality. The signal is not the hours but what follows them: a dog that wakes up as tired as it lay down, that is slow to stand, or that stops reacting to what used to get it up.',
      scrolls: 5, world: 'Anatomy', circle: 'Sleep and rest',
    },
    replies: [{ who: 'Marek D.', text: 'Ours is the same and bloodwork came back clean.', seal: 'unknown' }],
    moreReplies: 3, paws: 12,
  },
  {
    id: 'w7', world: 'dogsPath',
    who: 'Jakub V.', initial: 'J', dog: 'Ora · 2 y · Czechoslovakian wolfdog',
    text: 'Everyone tells me she is closer to a wolf than other dogs. Is that actually true or is it a story people like to tell?',
    short: 'Is a wolfdog really closer to a wolf, or is that just a story?',
    tags: ['experience', 'dog’s path'],
    ai: {
      verdict: 'No scroll of *the dog’s path* is written yet — I will not guess at it.',
      body: 'The dog’s path is one of the seven worlds and it has not been written. This is the kind of question where an invented answer would be worse than none: it sits on genetics, on breeding history and on a hundred years of claims that were never tested. Ask again when the world opens.',
      scrolls: 0, world: 'Dog’s path', circle: '', blank: true,
    },
    replies: [{ who: 'Nina S.', text: 'Ours behaves like any other shepherd, honestly.', seal: 'unknown' }],
    moreReplies: 8, paws: 37,
  },
  {
    id: 'w8', world: 'prevention',
    who: 'Katarína B.', initial: 'K', dog: 'Fiby · 11 y · Yorkshire terrier',
    text: 'Her breath has turned really bad over the last months and there is brown film on the back teeth. She eats fine so I keep putting off the cleaning because of the anaesthesia at her age.',
    short: 'Bad breath and brown film on the teeth — is anaesthesia worth it at eleven?',
    tags: ['problem', 'prevention'],
    ai: {
      verdict: 'The risk being weighed is not anaesthesia against nothing — it is anaesthesia against *an infection that is already running*.',
      body: 'Brown film with a smell is not dirt, it is a colony, and what it does does not stay in the mouth. Age alone is not a contraindication; the questions that decide it are heart, kidneys and liver, and those are answered by bloodwork, not by the number of years.',
      advice: 'Ask for pre-anaesthetic bloodwork first. It turns the decision into a number instead of a fear.',
      scrolls: 9, world: 'Prevention', circle: 'Teeth and gums',
    },
    replies: [
      { who: 'Zuzana M.', text: 'We did it at twelve and she was home the same evening.', seal: 'fits' },
      { who: 'Roman P.', text: 'Bones clean teeth, no need for a vet.', seal: 'differs',
        why: 'The vault carries chewing as prevention of new build-up, not as removal of established tartar — and hard bones as a common cause of broken teeth.' },
    ],
    moreReplies: 21, paws: 66,
  },
  {
    id: 'w9', world: 'understanding',
    who: 'Tereza N.', initial: 'T', dog: 'Kaya · 4 y · Australian shepherd',
    text: 'She yawns every time I hug her. My partner says she is bored, I think it means something else.',
    short: 'She yawns every time I hug her — bored, or something else?',
    tags: ['experience', 'understanding'],
    ai: {
      verdict: 'Understanding has *no scrolls yet* — and this is exactly the question that deserves a written one.',
      body: 'Body language is one of the seven worlds and it is not written. I can tell you that the question is a good one and that the answer is not boredom, but I am not going to dress that up as knowledge from a source that does not exist yet.',
      scrolls: 0, world: 'Understanding', circle: '', blank: true,
    },
    replies: [{ who: 'Lenka Ď.', text: 'Mine does it at the vet too, never at home.', seal: 'unknown' }],
    moreReplies: 14, paws: 52,
  },
  {
    id: 'w10', world: 'nutrition',
    who: 'Michal R.', initial: 'M', dog: 'Tara · 5 y · Rottweiler',
    text: 'Is grain free better? Half the shelf says it is and the other half says it causes heart problems.',
    short: 'Is grain-free actually better, or does it cause heart problems?',
    tags: ['problem', 'nutrition'],
    ai: {
      verdict: 'Grain-free is a *marketing category*, not a nutritional one.',
      body: 'What replaced the grain is the question worth asking, because in many recipes it is legumes in large amounts, and that is where the heart concern came from — not from the absence of grain itself. A dog with no grain intolerance gains nothing from the label.',
      advice: 'Read the first five ingredients. If three of them are peas, lentils or chickpeas, ask why.',
      scrolls: 11, world: 'Nutrition', circle: 'Reading a label',
    },
    replies: [{ who: 'Ivana K.', text: 'We went back to a normal food and nothing changed for the worse.', seal: 'fits' }],
    moreReplies: 19, paws: 74,
  },
  {
    id: 'w11', world: 'problems',
    who: 'Dominik S.', initial: 'D', dog: 'Rex · 8 y · Labrador',
    text: 'He has started licking one paw raw. There is no thorn, no cut. It happens mostly in the evening.',
    short: 'He licks one paw raw every evening — no thorn, no cut.',
    tags: ['problem', 'problems', 'looking for advice'],
    ai: {
      verdict: 'One paw, always the same one, always at the same hour — that is a *pattern*, not an itch.',
      body: 'Licking that is limited to a single paw and a single part of the day points somewhere other than the skin: joints and nerves refer pain down the limb, and evening is when the day’s load shows. Allergy usually takes several paws and does not keep a schedule.',
      advice: 'Film one evening. Which paw, what time, how long — that is the whole first consultation.',
      scrolls: 4, world: 'Problems', circle: 'Skin and licking',
    },
    replies: [
      { who: 'Alena T.', text: 'Ours turned out to be elbow arthritis on that side.', seal: 'fits' },
      { who: 'Boris H.', text: 'It is boredom, walk him more.', seal: 'differs',
        why: 'The vault carries boredom licking as spread over the body and irregular in time, not locked to one paw and one hour.' },
    ],
    moreReplies: 16, paws: 58,
  },
  {
    id: 'w12', world: 'training',
    who: 'Eva P.', initial: 'E', dog: 'Bodo · 1 y · Border collie',
    text: 'He pulls on the lead so hard he coughs. The trainer sold us a prong collar and it works immediately, but I feel terrible using it.',
    short: 'A prong collar stopped the pulling instantly — and I feel awful about it.',
    tags: ['problem', 'training'],
    ai: {
      verdict: 'Training is *not written yet*, so I have no source to put against your trainer.',
      body: 'I can see why you are asking: the thing works and that is exactly what makes it hard. But this is a question about method and consequence, and the world it belongs to has not a single scroll. I am not going to answer it with an opinion wearing a source’s clothes.',
      scrolls: 0, world: 'Training', circle: '', blank: true,
    },
    replies: [{ who: 'Filip M.', text: 'A front-clip harness did the same for us without the guilt.', seal: 'unknown' }],
    moreReplies: 27, paws: 91,
  },
  {
    id: 'w13', world: 'anatomy',
    who: 'Veronika Ž.', initial: 'V', dog: 'Lola · 7 y · French bulldog',
    text: 'She snores so loudly at night that we hear her through a wall, and lately she makes the same sound while awake.',
    short: 'Loud snoring at night — and now the same sound while she is awake.',
    tags: ['problem', 'anatomy'],
    ai: {
      verdict: 'Snoring while *awake* is a different sign than snoring asleep.',
      body: 'In a short-nosed breed noise at rest is common enough to be treated as normal, which is precisely the trap. The line the vault draws is wakefulness: airway noise that continues while the dog is up and calm means the airway is narrow all the time, not only when the muscles relax.',
      advice: 'Record thirty seconds of her awake breathing. That recording is worth more than any description.',
      scrolls: 6, world: 'Anatomy', circle: 'Breathing',
    },
    replies: [{ who: 'Martin B.', text: 'Ours had soft palate surgery and it was night and day.', seal: 'fits' }],
    moreReplies: 12, paws: 48,
  },
  {
    id: 'w14', world: 'prevention',
    who: 'Ondrej L.', initial: 'O', dog: 'Sam · 2 y · Mixed breed',
    text: 'How often do I really need to deworm him? The vet says four times a year, the internet says it depends.',
    short: 'Four dewormings a year, or does it really depend?',
    tags: ['problem', 'prevention', 'parasites'],
    ai: {
      verdict: 'Four a year is a *default for unknown risk* — yours may be higher or lower.',
      body: 'The interval is not a property of the dog, it is a property of what the dog meets: raw food, hunting, small children in the house, other dogs, travel. The quarterly schedule is what you use when nobody has asked those questions. The alternative is not less deworming, it is testing.',
      advice: 'Ask about a faecal test between treatments. It answers the interval instead of guessing it.',
      scrolls: 8, world: 'Prevention', circle: 'Fleas, ticks and heartworm',
    },
    replies: [{ who: 'Petra V.', text: 'We test twice a year and only treat when it is positive.', seal: 'fits' }],
    moreReplies: 6, paws: 29,
  },
  {
    id: 'w15', world: 'problems',
    who: 'Adriána F.', initial: 'A', dog: 'Cyra · 9 y · German shepherd',
    text: 'She drinks much more water than she used to and asks to go out at night. She is otherwise completely herself.',
    short: 'Drinking much more and asking out at night — but otherwise herself.',
    tags: ['problem', 'problems'],
    ai: {
      verdict: 'More water plus more nights is the *one pattern* that is worth a same-week appointment.',
      body: 'A dog that is still itself is reassuring in every other context and not in this one. Increased thirst with increased urination is one of the few signals that appears long before the dog looks ill, and the conditions behind it are ones where months matter.',
      advice: 'Measure what she drinks over 24 hours and note her weight. Both numbers will be asked for.',
      scrolls: 5, world: 'Problems', circle: 'Signs that cannot wait',
    },
    replies: [{ who: 'Jana R.', text: 'That was the first sign for ours and we caught it early.', seal: 'fits' }],
    moreReplies: 9, paws: 61,
  },
  {
    id: 'w16', world: 'nutrition',
    who: 'Lucia G.', initial: 'L', dog: 'Nero · 4 y · Cane corso',
    text: 'I want to switch him to raw but my mother in law is convinced it will make him aggressive.',
    short: 'Will raw feeding make him aggressive, as my mother-in-law insists?',
    tags: ['problem', 'nutrition'],
    ai: {
      verdict: 'Raw meat does not change temperament — the real questions are *bones and bacteria*.',
      body: 'The aggression story has no source behind it and never had one; it survives because it sounds like it should be true. The subjects that do deserve care are bone fragments, bacterial load in a household with small children or immunocompromised people, and whether the bowl is actually balanced over weeks rather than per meal.',
      scrolls: 9, world: 'Nutrition', circle: 'Raw feeding',
    },
    replies: [
      { who: 'Denis O.', text: 'Four years raw, the calmest dog I have ever had.', seal: 'fits' },
      { who: 'Emília K.', text: 'Raw bones are always safe, it is only cooked ones that splinter.', seal: 'differs',
        why: 'The vault carries raw bones as safer than cooked, not as safe — weight-bearing bones of large animals break teeth either way.' },
    ],
    moreReplies: 33, paws: 87,
  },
  {
    id: 'w17', world: 'anatomy',
    who: 'Štefan J.', initial: 'Š', dog: 'Bela · 10 y · Dachshund',
    text: 'There is a soft lump on her side that moves under the skin. It has not grown in a month.',
    short: 'A soft lump that moves under the skin and has not grown in a month.',
    tags: ['problem', 'anatomy', 'looking for advice'],
    ai: {
      verdict: 'Soft and movable is *reassuring but not diagnostic* — only a needle is.',
      body: 'The description fits the most common benign lump, and it also fits several that are not. No one can tell them apart by touch, which is why the vault treats a lump the same way regardless of feel: measure it, date it, and let a needle answer it. A month without growth lowers the urgency, not the question.',
      advice: 'Photograph it beside a coin and write the date. Do it again in a month.',
      scrolls: 3, world: 'Anatomy', circle: 'Lumps and skin',
    },
    replies: [{ who: 'Miroslav H.', text: 'Ours was a lipoma, they took a sample in five minutes.', seal: 'fits' }],
    moreReplies: 7, paws: 22,
  },
  {
    id: 'w18', world: 'problems',
    who: 'Barbora Ch.', initial: 'B', dog: 'Aika · 3 y · Husky',
    text: 'She ate a whole corn cob at a barbecue two hours ago. She seems completely fine and is playing.',
    short: 'She swallowed a whole corn cob two hours ago and seems fine.',
    tags: ['problem', 'problems'],
    ai: {
      verdict: 'A corn cob is the textbook *obstruction* — “fine” now means nothing.',
      body: 'It does not digest, it does not break down and it is almost exactly the wrong shape and size for a dog’s small intestine. The window in which this is easy to solve is measured in hours, and it closes while the dog still looks well. This is not a watch-and-wait.',
      advice: 'Call the emergency vet now, before anything changes. Two hours is still early.',
      scrolls: 4, world: 'Problems', circle: 'Signs that cannot wait',
    },
    replies: [{ who: 'Tomáš L.', text: 'Same thing here, surgery on day three and it was touch and go.', seal: 'fits' }],
    moreReplies: 18, paws: 103,
  },
];

/** Otázka na nástenke: zhrnutie, inak orezanie s trojbodkou (poistka). */
export const shortOf = (p: WallPost): string =>
  p.short ?? (p.text.length > 96 ? `${p.text.slice(0, 95).trimEnd()}…` : p.text);


/**
 * 🔴 FILTRE = SEDEM SVETOV (Matej 24. 9. 2026, voľba D1) — nie ad-hoc štítky.
 *
 * Zoznam sa preto NEPÍŠE TU: berie sa z `vault/worlds.ts`, aby sa nástenka
 * a mozog nemohli rozísť. Keby tu stál vlastný rad slov, pri prvom premenovaní
 * sveta by nástenka filtrovala podľa mena, ktoré vo vaulte už neexistuje.
 *
 * ⚠️ Matej 24. 9.: *„musíme počítať s tým že svet už asi nepribudne, ale okruhy
 *    a zvitky môžu"* — sedem je teda strop a rad filtrov sa nemá kam rozrásť.
 *    Presne preto je to dobrá os na filtrovanie a štítky ňou neboli.
 */

/** Rozdelí vetu verdiktu na kúsky; `*takto*` je zvýraznené. Jediná značka. */
export const verdictParts = (v: string): { t: string; hi: boolean }[] =>
  v.split(/\*([^*]+)\*/g).map((t, i) => ({ t, hi: i % 2 === 1 })).filter((x) => x.t !== '');
