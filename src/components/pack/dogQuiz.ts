// KATALÓG KVÍZOV — jeden zdroj pravdy pre TRI povrchy naraz:
//   1. MY PACK hub (`/pack/dogs`)        — dlaždice akcií + progres „3 z 10"
//   2. kvíz engine (`/pack/dogs/quiz/:key`) — otázky, typy vstupov, možnosti
//   3. karta psa / pet pas (`/pack/dogs/:id`) — sekcie, poradie, pohľady, ✎ deep-linky
//
// Zadanie: plany/zadanie-mypack-petpas-2026-08-06.md §5–§7.
// „Nové funkcie sa pridávajú SEM" (§5) — stránka rastie o položku v poli, nie o novú
// sekciu v JSX. Preto tu žije aj to, do KTORÝCH POHĽADOV pole patrí: keby to bol druhý
// zoznam v komponente pasu, rozišli by sa.
//
// LOCKY, ktoré tento súbor drží:
//  • §2/5 — odpovede sú z výberu (enum). Voľný text len tam, kde ho pet pas znesie
//    (poznámka pre veterinára); inak by karta prestala byť čitateľná.
//  • §2/14 — NIČ SA NEDOGENERUJE. Katalóg neobsahuje default hodnoty; nevyplnené pole
//    sa na karte nezobrazí. `DogProfileAttrs` LOCK z 2026-08-03.
//  • §2/1 — každá sekcia pasu vie, z ktorého kroku kvízu pochádza (`sectionKey`), aby
//    „✎" vedelo, kam deep-linkovať.
//
// TAXONÓMIE sa NEDUPLIKUJÚ — ťahajú sa z `profile/packProfile.ts`, ktorý je ich domovom.
// i18n: každý krok má kľúč; chýbajúci preklad padá na `labelEN` (rovnaký vzor ako
// `pack.dogCard.opt.*` v `DogCardFields.tsx`).
import {
  DOG_SIZE_OPTIONS, DOG_NEUTERED_OPTIONS, DOG_ORIGIN_OPTIONS,
  DOG_FITNESS_OPTIONS, DOG_RANGE_OPTIONS, DOG_SKILL_OPTIONS, DOG_ALONE_OPTIONS,
  DOG_COMPAT_OPTIONS, DOG_FEEDING_OPTIONS,
  DOG_TEMPERAMENT_TAGS, DOG_FEAR_SUGGESTIONS, DOG_JOY_SUGGESTIONS, DOG_TRIGGER_SUGGESTIONS,
  type TaxonomyOption,
} from './profile/packProfile';
import {
  NATURE_ELEMENTS, NATURE_ROLES, NATURE_SPECIALS,
  ELEMENT_KEYS, ROLE_KEYS, SPECIAL_KEYS,
} from './natureQuiz';

// ── pohľady (§7) ─────────────────────────────────────────────────────────────
// 'full' = moja karta + ZÁVET (Matej 6.8.: závet má 100 % info, dedič nastupuje na
// miesto majiteľa). Preto závet NIE JE štvrtý pohľad — je to nosič pohľadu 'full'.
export type PassView = 'full' | 'vet' | 'sitter' | 'story';

export const PASS_VIEWS: { key: PassView; labelEN: string; i18n: string }[] = [
  { key: 'full', labelEN: 'My card', i18n: 'pack.pass.view.full' },
  { key: 'vet', labelEN: 'Vet', i18n: 'pack.pass.view.vet' },
  { key: 'sitter', labelEN: 'Sitter', i18n: 'pack.pass.view.sitter' },
  { key: 'story', labelEN: 'Story', i18n: 'pack.pass.view.story' },
];

// ── kroky ────────────────────────────────────────────────────────────────────
export type QuizInputKind =
  | 'single'   // jedna možnosť z enumu (pilulky)
  | 'multi'    // viac možností z enumu
  | 'chips'    // viac možností + vlastný text (návrhové pills — vzor `dislikedTypes`)
  | 'number'
  | 'date'
  | 'text';    // VÝNIMKA z locku „len enum" — používa sa striedmo, viď §2/5

export interface QuizStep {
  /** Kľúč poľa v `dog_events` — `<sekcia>.<pole>`. Nikdy nemeniť: je to kľúč histórie. */
  field: string;
  /** Otázka vo fullscreen kvíze („Čím psa kŕmiš?"). */
  labelEN: string;
  i18n: string;
  /** Krátky popis pod otázkou. Nepovinný. */
  hintEN?: string;
  hintI18n?: string;
  /** Názov riadku na karte psa („Krmivo") — kratší než otázka. */
  rowEN: string;
  rowI18n: string;
  kind: QuizInputKind;
  options?: readonly TaxonomyOption[];
  /** Návrhy pre `chips` — hodnoty sa prekladajú cez `pack.dogCard.opt.<value>`. */
  suggestions?: readonly string[];
  /**
   * Strop viacnásobného výberu (Matej odklepol 2026-09-02: „fakty bez stropu, povahové
   * otázky so stropom 3").
   *
   * Deliaca čiara: pole, ktoré je FAKT o psovi (povely, alergie, diagnózy, krmivo, zákazy),
   * strop NEMÁ — tam je dlhý zoznam pravdivá odpoveď a orezať ho znamená klamať v doklade.
   * Pole, ktoré je VOĽBA charakteru (aký je, čoho sa bojí, čo ho spustí, čo ho teší), strop
   * má: keď je pes „všetko naraz", z odpovede nevyjde profil, len šum.
   *
   * ⚠️ Platí len pre `multi` a `chips`; na ostatných druhoch je bez účinku.
   * ⚠️ Strop NEOREZÁVA už uložené odpovede — pes, ktorý má zo staršieho behu štyri, si ich
   *    nechá a odobrať sa dajú len ručne. Tichá orezávka by zmazala údaj bez slova.
   */
  maxPick?: number;
  unit?: string;
  /** Do ktorých pohľadov pole patrí. 'full' sa NEUVÁDZA — obsahuje všetko. */
  views: Exclude<PassView, 'full'>[];
  /**
   * Preklad HODNOTY, keď nepochádza z taxonómie. Karta psa inak hľadá labely
   * v `pack.dogCard.opt.*` a `pack.dogTag.*` — a `nature.specials` nesie kľúč
   * `loner`, ktorý v `pack.dogTag.loner` znamená TAG POVAHY („Samotár"), nie
   * zvláštnu úlohu „The Loner". Bez tejto mapy by karta ticho zobrazila cudzí
   * label. Ostatné kľúče (`defender`, `metal`) by spadli na `humanize()` =
   * „Defender" namiesto „The Defender".
   */
  valueLabels?: Record<string, { labelEN: string; i18n: string }>;
  /**
   * Pole, ktoré sa nedá „vyplniť" vôľou — nesmie brzdiť progres pasu.
   * `nature.specials` býva prázdne pole ZÁMERNE (väčšina psov nenesie žiadnu
   * zvláštnu úlohu, a `hasValue([])` je false), takže by pas nikdy nedosiahol
   * 100 % a progres by klamal.
   */
  noProgress?: boolean;
  /**
   * Pole, ktoré je BONUS, nie diera (13.8.2026). Odkedy DOG ID ukazuje všetky položky
   * a nevyplnené sfarbí načerveno, rozhoduje sa tu, čo je „chýba ti to" a čo len
   * „keď budeš mať čas" — inak je červená všade a tým prestane niečo znamenať.
   * Prejav: tlmená pomlčka namiesto červenej (`.pass-missing--optional`).
   * ⚠️ NIE JE to `noProgress`. `noProgress` = pole sa nedá vyplniť vôľou (pes zvláštnu
   * úlohu buď má, alebo nemá). `optional` = vyplniť sa dá, len to nikoho neohrozí.
   */
  optional?: boolean;
  /**
   * Kam vedie oprava TOHTO poľa, keď sa needituje cez kvíz svojej skupiny.
   * Vzniklo 13.8.2026 s presunom `nature.*` do skupiny IDENTITA (Matej: „do identity
   * by mali pribudnúť dve možnosti, a síce postavenie vo svorke, element"): skupina má
   * jeden ✎ pre celú sekciu, ale tieto tri polia sa vypĺňajú osobnostným kvízom na
   * vlastnom povrchu. Bez tohto by ✎ pri nich viedol do kvízu ZÁKLAD, kde nie sú.
   */
  editHref?: string;
  /**
   * Kam vedie ČÍTANIE výsledku, keď je hodnota poľa len vrcholom väčšieho posudku.
   * Vzniklo 22. 8. 2026 (Matej: „k výsledku sa musí dať prekliknúť z DOG ID na jeden
   * klik a následne sa vrátiť na dog id šípkou").
   *
   * ⚠️ NIE JE to `editHref`. Ten vedie do kvízu, teda na PREPÍSANIE výsledku — a pes
   * má za sebou dvadsaťdva otázok, takže „chcem si to prečítať" a „chcem to vyplniť
   * znova" sa nesmú spájať do jedného odkazu. `editHref` ostáva na ✎, toto visí na
   * samotnej hodnote.
   */
  resultHref?: string;
}

// 'scored' = kvíz s VÁHAMI a vlastným povrchom (osobnostný kvíz `/pack/nature`).
// Starý engine (`/pack/dogs/quiz/:key`) ho MUSÍ odmietnuť — jeho kroky nemajú
// `options`, takže by ponúkol otázku bez odpovedí. Odmieta ho `section.kind !== 'quiz'`
// v `PackDogQuiz.tsx`; kroky tu sú len preto, aby sa výsledok vedel vykresliť na
// karte psa (`STEP_BY_FIELD` je derivované odtiaľto — pole bez kroku nemá label).
export type QuizSectionKind = 'quiz' | 'gallery' | 'journal' | 'scored' | 'will';

export interface QuizSection {
  key: string;
  labelEN: string;
  i18n: string;
  subEN: string;
  subI18n: string;
  emoji: string;
  kind: QuizSectionKind;
  /** Vlastný povrch pre 'scored' — dlaždica hubu vedie SEM, nie do starého enginu. */
  href?: string;
  /** Nadpis sekcie na karte psa. Prázdne pri gallery/journal (majú vlastný render). */
  steps: QuizStep[];
}

/** Kľúč → { labelEN, i18n } z datasetu osobnostného kvízu. Jeden zdroj, žiadny opis. */
const natureLabels = <K extends string>(
  keys: readonly K[],
  src: Record<K, { labelEN: string; i18n: string }>,
): Record<string, { labelEN: string; i18n: string }> =>
  Object.fromEntries(keys.map((k) => [k, { labelEN: src[k].labelEN, i18n: src[k].i18n }]));

// Pomocník na skrátenie zápisu — TaxonomyOption zoznamy sú v packProfile.ts typované
// na konkrétny union; katalóg ich berie ako readonly TaxonomyOption[] (labely + values).
const opts = (o: readonly TaxonomyOption<string>[]) => o as readonly TaxonomyOption[];

// Povaha — z `DOG_TEMPERAMENT_TAGS` (17 hodnôt) na TaxonomyOption. Labely majú
// preklad pod `pack.dogTag.<value>`, ktorý v locales existuje od psej karty.
const TEMPERAMENT_CHIPS: readonly string[] = DOG_TEMPERAMENT_TAGS;

export const QUIZ_SECTIONS: QuizSection[] = [
  // ── 1 ZÁKLAD ───────────────────────────────────────────────────────────────
  {
    key: 'basics',
    labelEN: 'Basics', i18n: 'pack.quiz.basics.label',
    subEN: 'Size, neutering, where they came from.', subI18n: 'pack.quiz.basics.sub',
    emoji: '🧬', kind: 'quiz',
    steps: [
      {
        field: 'basics.size', kind: 'single', options: opts(DOG_SIZE_OPTIONS),
        labelEN: 'How big is your dog?', i18n: 'pack.quiz.basics.size.q',
        rowEN: 'Size', rowI18n: 'pack.quiz.basics.size.row',
        views: ['vet', 'sitter'],
      },
      {
        field: 'basics.neutered', kind: 'single', options: opts(DOG_NEUTERED_OPTIONS),
        labelEN: 'Is your dog neutered?', i18n: 'pack.quiz.basics.neutered.q',
        rowEN: 'Neutered', rowI18n: 'pack.quiz.basics.neutered.row',
        views: ['vet'],
      },
      {
        field: 'basics.origin', kind: 'single', options: opts(DOG_ORIGIN_OPTIONS),
        labelEN: 'Where did your dog come from?', i18n: 'pack.quiz.basics.origin.q',
        rowEN: 'Came from', rowI18n: 'pack.quiz.basics.origin.row',
        views: ['story'],
      },
      {
        field: 'basics.since', kind: 'date',
        labelEN: 'Since when do you have them?', i18n: 'pack.quiz.basics.since.q',
        rowEN: 'Together since', rowI18n: 'pack.quiz.basics.since.row',
        views: ['story'],
      },
      {
        // Číslo čipu je jediný údaj, ktorý veterinára identifikuje psa bez majiteľa.
        field: 'basics.chip', kind: 'text',
        labelEN: 'Microchip number', i18n: 'pack.quiz.basics.chip.q',
        hintEN: 'The 15-digit number from the vaccination booklet.', hintI18n: 'pack.quiz.basics.chip.hint',
        rowEN: 'Microchip', rowI18n: 'pack.quiz.basics.chip.row',
        views: ['vet'],
      },
    ],
  },

  // ── 2 AKO FUNGUJE ──────────────────────────────────────────────────────────
  {
    key: 'howWorks',
    labelEN: 'How they work', i18n: 'pack.quiz.howWorks.label',
    subEN: 'Fitness, range, obedience, recall, home alone.', subI18n: 'pack.quiz.howWorks.sub',
    emoji: '🏃', kind: 'quiz',
    steps: [
      {
        field: 'howWorks.fitness', kind: 'single', options: opts(DOG_FITNESS_OPTIONS),
        labelEN: 'What shape is your dog in?', i18n: 'pack.quiz.howWorks.fitness.q',
        rowEN: 'Fitness', rowI18n: 'pack.quiz.howWorks.fitness.row',
        views: ['vet', 'sitter'],
      },
      {
        field: 'howWorks.range', kind: 'single', options: opts(DOG_RANGE_OPTIONS),
        labelEN: 'How far can they walk?', i18n: 'pack.quiz.howWorks.range.q',
        rowEN: 'Range', rowI18n: 'pack.quiz.howWorks.range.row',
        views: ['sitter'],
      },
      {
        field: 'howWorks.obedience', kind: 'single', options: opts(DOG_SKILL_OPTIONS),
        labelEN: 'How is their obedience?', i18n: 'pack.quiz.howWorks.obedience.q',
        rowEN: 'Obedience', rowI18n: 'pack.quiz.howWorks.obedience.row',
        views: ['sitter'],
      },
      {
        field: 'howWorks.recall', kind: 'single', options: opts(DOG_SKILL_OPTIONS),
        labelEN: 'Do they come when called?', i18n: 'pack.quiz.howWorks.recall.q',
        hintEN: 'The one thing that decides whether they can go off leash.', hintI18n: 'pack.quiz.howWorks.recall.hint',
        rowEN: 'Recall', rowI18n: 'pack.quiz.howWorks.recall.row',
        views: ['sitter'],
      },
      {
        field: 'howWorks.alone', kind: 'single', options: opts(DOG_ALONE_OPTIONS),
        labelEN: 'How do they handle being alone?', i18n: 'pack.quiz.howWorks.alone.q',
        rowEN: 'Home alone', rowI18n: 'pack.quiz.howWorks.alone.row',
        views: ['sitter'],
      },
      {
        field: 'howWorks.commands', kind: 'chips',
        suggestions: ['sit', 'down', 'come', 'stay', 'place', 'heel', 'leave_it', 'paw'],
        labelEN: 'Which commands do they know?', i18n: 'pack.quiz.howWorks.commands.q',
        rowEN: 'Commands', rowI18n: 'pack.quiz.howWorks.commands.row',
        views: ['sitter'], optional: true,
      },
    ],
  },

  // ── 3 S KÝM VYCHÁDZA ───────────────────────────────────────────────────────
  // ⚠️ ODCHÝLKA od orezania z 2026-07-25 (vtedy zostal JEDEN semafor riadok — psy —
  // a deti/mačky/cudzí sa presunuli do „čo nemá rád"). Nákres pet pasu z 6.8.2026
  // ukazuje štyri riadky a je novší. Dôvod, prečo tu tri späť patria: orezanie bolo
  // pre buddy-matching profil, tu je to karta pre OPATROVATEĽA — presne on musí vedieť,
  // či môže psa pustiť k deťom a k mačke. Štyri otázky nie je jedenásť.
  {
    key: 'social',
    labelEN: 'Gets along with', i18n: 'pack.quiz.social.label',
    subEN: 'Dogs, kids, cats, strangers.', subI18n: 'pack.quiz.social.sub',
    emoji: '🤝', kind: 'quiz',
    steps: [
      {
        field: 'social.dogs', kind: 'single', options: opts(DOG_COMPAT_OPTIONS),
        labelEN: 'How are they with other dogs?', i18n: 'pack.quiz.social.dogs.q',
        rowEN: 'Other dogs', rowI18n: 'pack.quiz.social.dogs.row',
        views: ['sitter', 'story'],
      },
      {
        field: 'social.kids', kind: 'single', options: opts(DOG_COMPAT_OPTIONS),
        labelEN: 'How are they with kids?', i18n: 'pack.quiz.social.kids.q',
        rowEN: 'Kids', rowI18n: 'pack.quiz.social.kids.row',
        views: ['sitter', 'story'],
      },
      {
        field: 'social.cats', kind: 'single', options: opts(DOG_COMPAT_OPTIONS),
        labelEN: 'How are they with cats?', i18n: 'pack.quiz.social.cats.q',
        rowEN: 'Cats', rowI18n: 'pack.quiz.social.cats.row',
        views: ['sitter', 'story'],
      },
      {
        field: 'social.strangers', kind: 'single', options: opts(DOG_COMPAT_OPTIONS),
        labelEN: 'How are they with strangers?', i18n: 'pack.quiz.social.strangers.q',
        rowEN: 'Strangers', rowI18n: 'pack.quiz.social.strangers.row',
        views: ['sitter', 'story'],
      },
    ],
  },

  // ── 4 POVAHA ───────────────────────────────────────────────────────────────
  {
    key: 'temperament',
    labelEN: 'Temperament', i18n: 'pack.quiz.temperament.label',
    subEN: 'What they are like, what scares them, what they love.', subI18n: 'pack.quiz.temperament.sub',
    emoji: '🐾', kind: 'quiz',
    steps: [
      {
        field: 'temperament.tags', kind: 'chips', maxPick: 3, suggestions: TEMPERAMENT_CHIPS,
        labelEN: 'What is your dog like?', i18n: 'pack.quiz.temperament.tags.q',
        rowEN: 'Character', rowI18n: 'pack.quiz.temperament.tags.row',
        views: ['sitter', 'story'],
      },
      {
        field: 'temperament.fears', kind: 'chips', maxPick: 3, suggestions: DOG_FEAR_SUGGESTIONS,
        labelEN: 'What are they afraid of?', i18n: 'pack.quiz.temperament.fears.q',
        hintEN: 'A sitter needs to know before the first storm, not after.', hintI18n: 'pack.quiz.temperament.fears.hint',
        rowEN: 'Afraid of', rowI18n: 'pack.quiz.temperament.fears.row',
        views: ['sitter'],
      },
      {
        field: 'temperament.triggers', kind: 'chips', maxPick: 3, suggestions: DOG_TRIGGER_SUGGESTIONS,
        labelEN: 'What sets them off?', i18n: 'pack.quiz.temperament.triggers.q',
        rowEN: 'Triggers', rowI18n: 'pack.quiz.temperament.triggers.row',
        views: ['sitter'],
      },
      {
        field: 'temperament.joys', kind: 'chips', maxPick: 3, suggestions: DOG_JOY_SUGGESTIONS,
        labelEN: 'What makes them happy?', i18n: 'pack.quiz.temperament.joys.q',
        rowEN: 'Loves', rowI18n: 'pack.quiz.temperament.joys.row',
        // BONUS, nie diera: „čo ho teší" nikoho neohrozí. Spúšťače (`triggers`) a
        // „nikdy nedávať" (`food.forbidden`) ZÁMERNE bonus NIE SÚ — tie sú bezpečnostné.
        views: ['sitter', 'story'], optional: true,
      },
    ],
  },

  // ── 5 ZDRAVIE A VET ────────────────────────────────────────────────────────
  {
    key: 'health',
    labelEN: 'Health & vet', i18n: 'pack.quiz.health.label',
    subEN: 'Weight, allergies, meds, vaccinations.', subI18n: 'pack.quiz.health.sub',
    emoji: '🩺', kind: 'quiz',
    steps: [
      {
        // Váha je jediné pole, kde má trend na karte reálny zmysel — preto je
        // append-log dôležitý práve tu (§4 zadania).
        field: 'health.weightKg', kind: 'number', unit: 'kg',
        labelEN: 'How much do they weigh?', i18n: 'pack.quiz.health.weight.q',
        hintEN: 'Every entry stays — the card shows the trend, not just the last number.',
        hintI18n: 'pack.quiz.health.weight.hint',
        rowEN: 'Weight', rowI18n: 'pack.quiz.health.weight.row',
        views: ['vet', 'sitter'],
      },
      {
        field: 'health.allergies', kind: 'chips',
        suggestions: ['chicken', 'beef', 'grain', 'dairy', 'pollen', 'flea_saliva', 'none'],
        labelEN: 'Any allergies?', i18n: 'pack.quiz.health.allergies.q',
        rowEN: 'Allergies', rowI18n: 'pack.quiz.health.allergies.row',
        views: ['vet', 'sitter'],
      },
      {
        // DIAGNÓZY, NIE LEN LIEKY (13.8.2026). Dovtedy pas ukazoval „berie fenobarbital",
        // ale nie „má epilepsiu" — veterinár z toho musel hádať. Legacy stĺpec
        // `dogs.conditions` existoval, kvízové pole k nemu nie.
        field: 'health.conditions', kind: 'chips',
        suggestions: ['epilepsy', 'hip_dysplasia', 'heart', 'thyroid', 'diabetes',
          'kidney', 'skin', 'arthritis', 'none'],
        labelEN: 'Any diagnosed conditions?', i18n: 'pack.quiz.health.conditions.q',
        hintEN: 'What a vet already named. Not symptoms — diagnoses.',
        hintI18n: 'pack.quiz.health.conditions.hint',
        rowEN: 'Conditions', rowI18n: 'pack.quiz.health.conditions.row',
        views: ['vet', 'sitter'],
      },
      {
        field: 'health.meds', kind: 'text',
        labelEN: 'Any medication?', i18n: 'pack.quiz.health.meds.q',
        hintEN: 'Name and dose. Leave empty if none.', hintI18n: 'pack.quiz.health.meds.hint',
        rowEN: 'Medication', rowI18n: 'pack.quiz.health.meds.row',
        views: ['vet', 'sitter'],
      },
      {
        field: 'health.vaxRabies', kind: 'date',
        labelEN: 'Last rabies shot', i18n: 'pack.quiz.health.rabies.q',
        hintEN: 'Pick the real date, even if it was last year.', hintI18n: 'pack.quiz.health.rabies.hint',
        rowEN: 'Rabies', rowI18n: 'pack.quiz.health.rabies.row',
        views: ['vet'],
      },
      {
        field: 'health.vaxCombo', kind: 'date',
        labelEN: 'Last combined vaccine', i18n: 'pack.quiz.health.combo.q',
        rowEN: 'Combined vaccine', rowI18n: 'pack.quiz.health.combo.row',
        views: ['vet'],
      },
      {
        field: 'health.deworm', kind: 'date',
        labelEN: 'Last deworming', i18n: 'pack.quiz.health.deworm.q',
        rowEN: 'Deworming', rowI18n: 'pack.quiz.health.deworm.row',
        views: ['vet'],
      },
      {
        // TELEFÓN NA MAJITEĽA (13.8.2026). Pas mal kontakt na veterinára aj na záložnú
        // osobu, ale nie na majiteľa — pritom prvý telefonát opatrovateľa aj nálezcu
        // strateného psa ide práve jemu. Do pohľadu `story` NEPATRÍ: ten sa zdieľa
        // najširšie a súkromné číslo v ňom nemá čo robiť.
        field: 'health.ownerPhone', kind: 'text',
        labelEN: 'Your phone', i18n: 'pack.quiz.health.ownerPhone.q',
        hintEN: 'The number someone should ring first — a sitter, or whoever finds them.',
        hintI18n: 'pack.quiz.health.ownerPhone.hint',
        rowEN: 'Owner', rowI18n: 'pack.quiz.health.ownerPhone.row',
        views: ['vet', 'sitter'],
      },
      {
        field: 'health.vetContact', kind: 'text',
        labelEN: 'Your vet', i18n: 'pack.quiz.health.vet.q',
        hintEN: 'Name and phone — so a sitter can call the right one.', hintI18n: 'pack.quiz.health.vet.hint',
        rowEN: 'Vet', rowI18n: 'pack.quiz.health.vet.row',
        // ZÁMERNE NIE 'vet' (Matej 6.8.): veterinár nepotrebuje vlastné číslo.
        views: ['sitter'],
      },
      {
        field: 'health.backupContact', kind: 'text',
        labelEN: 'Backup contact', i18n: 'pack.quiz.health.backup.q',
        hintEN: 'Who to call when you are not reachable.', hintI18n: 'pack.quiz.health.backup.hint',
        rowEN: 'Backup contact', rowI18n: 'pack.quiz.health.backup.row',
        views: ['vet', 'sitter'],
      },
    ],
  },

  // ── 6 STRAVA A REŽIM ───────────────────────────────────────────────────────
  {
    key: 'food',
    labelEN: 'Food & routine', i18n: 'pack.quiz.food.label',
    subEN: 'What, when and how much you feed.', subI18n: 'pack.quiz.food.sub',
    emoji: '🍖', kind: 'quiz',
    steps: [
      {
        field: 'food.feeding', kind: 'multi', options: opts(DOG_FEEDING_OPTIONS),
        labelEN: 'What do you feed them?', i18n: 'pack.quiz.food.feeding.q',
        rowEN: 'Food', rowI18n: 'pack.quiz.food.feeding.row',
        views: ['vet', 'sitter'],
      },
      {
        field: 'food.mealsPerDay', kind: 'single',
        options: [
          { value: '1', labelEN: 'Once a day' },
          { value: '2', labelEN: 'Twice a day' },
          { value: '3', labelEN: 'Three times a day' },
          { value: 'free', labelEN: 'Free feeding' },
        ],
        labelEN: 'How often do they eat?', i18n: 'pack.quiz.food.meals.q',
        rowEN: 'Meals', rowI18n: 'pack.quiz.food.meals.row',
        views: ['vet', 'sitter'],
      },
      {
        field: 'food.portion', kind: 'text',
        labelEN: 'How much per day?', i18n: 'pack.quiz.food.portion.q',
        hintEN: 'Grams, cups, whatever you actually measure in.', hintI18n: 'pack.quiz.food.portion.hint',
        rowEN: 'Portion', rowI18n: 'pack.quiz.food.portion.row',
        views: ['vet', 'sitter'],
      },
      {
        field: 'food.forbidden', kind: 'chips',
        suggestions: ['chicken', 'chocolate', 'grapes', 'onion', 'bones', 'dairy', 'table_scraps'],
        labelEN: 'What must they never get?', i18n: 'pack.quiz.food.forbidden.q',
        rowEN: 'Never give', rowI18n: 'pack.quiz.food.forbidden.row',
        views: ['vet', 'sitter'],
      },
      {
        field: 'food.walks', kind: 'single',
        options: [
          { value: '1', labelEN: 'Once a day' },
          { value: '2', labelEN: 'Twice a day' },
          { value: '3', labelEN: 'Three times a day' },
          { value: '4plus', labelEN: 'Four or more' },
        ],
        labelEN: 'How many walks a day?', i18n: 'pack.quiz.food.walks.q',
        rowEN: 'Walks', rowI18n: 'pack.quiz.food.walks.row',
        views: ['sitter'],
      },
    ],
  },

  // ── 7 POVAHA HLBŠIE: OSOBNOSTNÝ KVÍZ (`/pack/nature`) ──────────────────────
  // Tretia vrstva povahy — diagnostika, nie výber. Povaha = 2 z 8 heroglyf
  // charakterov (majiteľ VYBERIE) + tagy vyššie (naklikne); TOTO sa vyhodnotí.
  // Zadanie: plany/zadanie-nature-kviz-dokoncenie-2026-08-06.md §3.1.
  //
  // ⚠️ Kroky NEMAJÚ `options` — nezískavajú sa otázkou z enumu, ale scoringom.
  // Preto `kind: 'scored'` a `href` na vlastný povrch. Sú tu preto, že karta psa
  // vie vykresliť len pole, ktoré má krok (label, typ, pohľady).
  {
    key: 'nature',
    labelEN: 'Who is your dog', i18n: 'pack.quiz.nature.label',
    subEN: 'Eighteen questions, two answers: what they are made of and what they do for you.',
    subI18n: 'pack.quiz.nature.sub',
    emoji: '🜂', kind: 'scored', href: '/pack/nature',
    steps: [
      {
        // Názvy RIADKOV sú krátke (1–3 slová), lebo od 13.8.2026 stoja v IDENTITE
        // vedľa „Veľkosť" a „Kastrácia" — „Role in the pack" bol na tom mieste
        // dvakrát dlhší než susedia a rozhodil ľavý stĺpec.
        field: 'nature.role', kind: 'single',
        valueLabels: natureLabels(ROLE_KEYS, NATURE_ROLES),
        labelEN: 'Role in the pack', i18n: 'pack.quiz.nature.role.q',
        rowEN: 'Pack role', rowI18n: 'pack.quiz.nature.role.row',
        views: ['story', 'sitter'],
        editHref: '/pack/nature',
        resultHref: '/pack/nature?view=result',
      },
      {
        // Element ide aj veterinárovi — je to konštitúcia a predispozície, teda
        // vstup do výživy a longevity, nie povahová nálepka. Riadok sa napriek tomu
        // volá ELEMENT, nie „Constitution" (Matej 13.8.2026) — tak sa to volá všade
        // inde v appke (pilulka v psom bloku, výsledok kvízu).
        field: 'nature.element', kind: 'single',
        valueLabels: natureLabels(ELEMENT_KEYS, NATURE_ELEMENTS),
        labelEN: 'Constitution', i18n: 'pack.quiz.nature.element.q',
        rowEN: 'Element', rowI18n: 'pack.quiz.nature.element.row',
        views: ['story', 'sitter', 'vet'],
        editHref: '/pack/nature',
        resultHref: '/pack/nature?view=result',
      },
      {
        // Riadok „Special roles" JE ten povinný prefix z locku — zvláštna úloha
        // sa nikdy nevykresľuje ako holý chip vedľa tagov povahy.
        field: 'nature.specials', kind: 'multi', noProgress: true,
        valueLabels: natureLabels(SPECIAL_KEYS, NATURE_SPECIALS),
        labelEN: 'Special roles', i18n: 'pack.quiz.nature.specials.q',
        rowEN: 'Special role', rowI18n: 'pack.quiz.nature.specials.row',
        views: ['story'],
        editHref: '/pack/nature',
        resultHref: '/pack/nature?view=result',
      },
    ],
  },

  // ── 8 GALÉRIA (§2/11 — hromadný vstup s tagovaním psov) ────────────────────
  {
    key: 'gallery',
    labelEN: 'Gallery', i18n: 'pack.quiz.gallery.label',
    subEN: 'Upload photos and tag who is in them.', subI18n: 'pack.quiz.gallery.sub',
    emoji: '📷', kind: 'gallery', steps: [],
  },

  // ── 9 DENNÍK ───────────────────────────────────────────────────────────────
  {
    key: 'journal',
    labelEN: 'Journal', i18n: 'pack.quiz.journal.label',
    subEN: 'Write once, tag the dogs it applies to.', subI18n: 'pack.quiz.journal.sub',
    emoji: '📖', kind: 'journal', steps: [],
  },

  // ── 10 ZÁVET ───────────────────────────────────────────────────────────────
  // Matej 13.8.2026: „vymyslime aj mechanizmus závetu. po kliku sa zobrazí správa
  // o psíkovi, odkaz novému majiteľovi, ktorý sa uloží, a s emailami — a všetko sa
  // to uloží, prípadne sa to môže odoslať."
  //
  // Prečo je to `kind: 'will'` a nie bežný kvíz: závet sa nepýta po jednej otázke na
  // obrazovku. Je to JEDEN list — komu, na aký e-mail a čo mu odkazuješ — a človek ho
  // píše naraz, so všetkým pred očami. Preto má vlastný panel (`WillPanel`) priamo na
  // doklade a starý kvízový engine ho MUSÍ odmietnuť (rovnaký dôvod ako pri 'scored').
  //
  // Kroky tu napriek tomu SÚ — `STEP_BY_FIELD` je z nich derivované, takže bez nich by
  // závetové polia nemali na doklade label a nevykreslili by sa ani ako pomlčky.
  {
    key: 'will',
    labelEN: 'Will', i18n: 'pack.quiz.will.label',
    subEN: 'Who takes them, and what you want that person to know.',
    subI18n: 'pack.quiz.will.sub',
    emoji: '🕊', kind: 'will', steps: [
      {
        field: 'will.heirName', kind: 'text',
        labelEN: 'Who takes them', i18n: 'pack.quiz.will.heirName.q',
        rowEN: 'Successor', rowI18n: 'pack.quiz.will.heirName.row',
        // Závet vidí LEN majiteľ (pohľad `full`) — meno dediča nepatrí veterinárovi
        // ani opatrovateľovi. `views: []` = v žiadnom zdieľanom pohľade.
        views: [],
      },
      {
        field: 'will.heirEmail', kind: 'text',
        labelEN: 'Their e-mail', i18n: 'pack.quiz.will.heirEmail.q',
        rowEN: 'E-mail', rowI18n: 'pack.quiz.will.heirEmail.row',
        views: [],
      },
      {
        // Druhý e-mail nie je duplikát — je to poistka. Závet, ktorý sa dá doručiť len
        // na jednu adresu, zlyhá, keď tá adresa prestane existovať.
        field: 'will.heirEmail2', kind: 'text',
        labelEN: 'Second e-mail', i18n: 'pack.quiz.will.heirEmail2.q',
        rowEN: 'Backup e-mail', rowI18n: 'pack.quiz.will.heirEmail2.row',
        views: [], optional: true,
      },
      {
        field: 'will.letter', kind: 'text',
        labelEN: 'Your message', i18n: 'pack.quiz.will.letter.q',
        rowEN: 'Message', rowI18n: 'pack.quiz.will.letter.row',
        views: [],
      },
    ],
  },
];

// ── SKUPINY NA PET PASE (§7) ─────────────────────────────────────────────────
// Poradie a nadpisy sekcií na KARTE PSA. Zámerne to NIE JE 1:1 poradie kvízov:
// kvíz sa pýta tak, ako sa človeku odpovedá (naraz celá téma), karta ukazuje tak,
// ako to príjemca číta — veterinár chce očkovania ako samostatný blok, nie schované
// v „Zdravie a vet", a kontakty patria na koniec, nie medzi zdravotné údaje.
//
// Je to zoznam POLÍ, nie druhá definícia — labely, typy aj pohľady si každé pole
// naďalej nesie samo v `ALL_STEPS`. Preto sa nemôžu rozísť.
export interface PassGroup {
  key: string;
  labelEN: string;
  i18n: string;
  /** Do ktorej sekcie kvízu vedie „✎". */
  editSection: string;
  /**
   * Vlastný povrch pre „✎", keď sekcia nie je krokom starého enginu.
   * Osobnostný kvíz sa nedá otvoriť na jednom poli — je to jeden priebeh so
   * scoringom, takže deep-link `?field=` by tam nedával zmysel.
   */
  editHref?: string;
  /**
   * Skupina sa needituje inde, ale PRIAMO NA DOKLADE vo vlastnom paneli.
   * `DogPassport` v tom prípade nevykreslí odkaz, ale zavolá `onEditPanel(key)`.
   * Zatiaľ jediný prípad: `will` — závet je jeden list, nie rad otázok.
   */
  editPanel?: string;
  fields: string[];
}

export const PASS_GROUPS: PassGroup[] = [
  // POSTAVENIE VO SVORKE A ELEMENT SÚ SÚČASŤ IDENTITY (Matej 13.8.2026: „do identity
  // by mali pribudnúť dve možnosti, a síce postavenie vo svorke, element"). Samostatná
  // skupina `nature` tým zanikla — po presune tých dvoch by v nej ostala jediná
  // „Zvláštna úloha", ktorá je navyše zámerne prázdna u väčšiny psov, čiže z bloku by
  // bol trvalo prázdny rám. Ide tam s nimi. Editáciu všetkých troch drží `editHref`
  // na kroku (osobnostný kvíz), nie ✎ skupiny — ten vedie do kvízu ZÁKLAD.
  { key: 'identity', labelEN: 'Identity', i18n: 'pack.pass.group.identity', editSection: 'basics',
    fields: ['basics.size', 'basics.neutered', 'basics.chip', 'basics.origin', 'basics.since',
      'nature.role', 'nature.element', 'nature.specials'] },
  { key: 'health', labelEN: 'Health', i18n: 'pack.pass.group.health', editSection: 'health',
    fields: ['health.weightKg', 'health.conditions', 'health.allergies', 'health.meds'] },
  { key: 'vax', labelEN: 'Vaccinations', i18n: 'pack.pass.group.vax', editSection: 'health',
    fields: ['health.vaxRabies', 'health.vaxCombo', 'health.deworm'] },
  { key: 'food', labelEN: 'Food & routine', i18n: 'pack.pass.group.food', editSection: 'food',
    fields: ['food.feeding', 'food.mealsPerDay', 'food.portion', 'food.forbidden', 'food.walks'] },
  { key: 'howWorks', labelEN: 'How they work', i18n: 'pack.pass.group.howWorks', editSection: 'howWorks',
    fields: ['howWorks.fitness', 'howWorks.range', 'howWorks.obedience', 'howWorks.recall', 'howWorks.alone', 'howWorks.commands'] },
  { key: 'social', labelEN: 'Gets along with', i18n: 'pack.pass.group.social', editSection: 'social',
    fields: ['social.dogs', 'social.kids', 'social.cats', 'social.strangers'] },
  { key: 'temperament', labelEN: 'Temperament', i18n: 'pack.pass.group.temperament', editSection: 'temperament',
    fields: ['temperament.tags', 'temperament.fears', 'temperament.triggers', 'temperament.joys'] },
  { key: 'contacts', labelEN: 'Contacts', i18n: 'pack.pass.group.contacts', editSection: 'health',
    fields: ['health.ownerPhone', 'health.vetContact', 'health.backupContact'] },
  // ZÁVET je posledný blok dokladu — číta sa naposledy a je to jediná časť, ktorá
  // nehovorí o psovi, ale o tom, čo sa má stať. `editPanel` = ✎ aj červené pomlčky
  // otvárajú panel na doklade, nie kvíz (závet sa píše naraz, nie po otázkach).
  { key: 'will', labelEN: 'Will', i18n: 'pack.pass.group.will', editSection: 'will',
    editPanel: 'will',
    fields: ['will.heirName', 'will.heirEmail', 'will.heirEmail2', 'will.letter'] },
];

export const STEP_BY_FIELD: Record<string, QuizStep> =
  Object.fromEntries(QUIZ_SECTIONS.flatMap((s) => s.steps).map((st) => [st.field, st]));

export const QUIZ_BY_KEY: Record<string, QuizSection> =
  Object.fromEntries(QUIZ_SECTIONS.map((s) => [s.key, s]));

/** Všetky kroky naprieč sekciami — katalóg polí pasu. */
export const ALL_STEPS: QuizStep[] = QUIZ_SECTIONS.flatMap((s) => s.steps);

/**
 * Kroky, ktoré sa počítajú do progresu pasu („12 z 30"). Menovateľ musí byť
 * dosiahnuteľný, inak progres klame — viď `noProgress` pri `nature.specials`.
 */
// Do progresu idú len polia, ktoré sa DAJÚ vyplniť a ktorých absencia niečo znamená.
// `optional` je vylúčené z rovnakého dôvodu ako `noProgress`: bonusové pole nesmie
// držať doklad pod 100 %, inak sa 100 % nikdy nedosiahne a číslo klame.
export const PROGRESS_STEPS: QuizStep[] = ALL_STEPS.filter((s) => !s.noProgress && !s.optional);

/** Sekcia, do ktorej krok patrí — pohon „✎" deep-linku z karty psa do kvízu. */
export function sectionOfField(field: string): QuizSection | undefined {
  return QUIZ_SECTIONS.find((s) => s.steps.some((st) => st.field === field));
}

/** Patrí pole do daného pohľadu? 'full' = všetko (moja karta aj závet). */
export function stepInView(step: QuizStep, view: PassView): boolean {
  return view === 'full' || step.views.includes(view);
}
