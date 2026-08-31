import type { GeometryKind } from './addtrip/addTripModel';

/**
 * ── TRI KATEGÓRIE VÝLETU — JEDEN ZDROJ (Matej 2026-08-31) ─────────────────────────────────
 *
 * HIKE · VISIT · SPORT. Zo štyroch ostali tri: CHILL a EXPLORE splynuli do VISIT.
 *
 * PREČO: os nie je druh výletu, ale PUBLIKUM (Matej 31. 8. 2026):
 *   „HIKE je super pre aktívnych ľudí čo neustále chodia na výlety, ostatné možnosti by mohli
 *    byť zaujímavé pre ľudí čo radi so psami cestujú ale neriešia hike… (možno staré psy alebo
 *    jednoducho chodia len na drobné prechádzky — nie sú aktívni)"
 * Pre majiteľa starého psa je park, zrúcanina aj lúka pri priehrade to isté: miesto, kam sa
 * dá zájsť bez výkonu. Rozdiel medzi CHILL a EXPLORE, ktorý sa štyri kolá hľadal, pre človeka
 * neexistuje.
 *
 * ⚠️ NIE JE TO NÁVRAT K ZAMIETNUTÉMU HIKE+SPOT. Ten Matej 31. 8. ráno odmietol slovami
 *    „ak budú aktivity len dve hike a spot, vyzerá to pokazené" — tieto sú TRI a SPORT ostáva
 *    samostatný (vlastná výbava, vlastné publikum; bránil to už 26. 8.).
 *
 * ⚠️ MENO `visit` je Matejovo (26. 8.: „Exporing (návštevy park, zoo…)"), vybrané po jeho
 *    vlastnej výhrade „hike, spot a sport nesedia, niečo je sloveso a niečo podstatné meno" —
 *    VISIT stojí v jednej rovine s HIKE a SPORT.
 *
 * 🔴 KATEGÓRIA JE IDENTITA, CHIP JE TAG (Matej 2026-08-27, platí ďalej). Preto sú tu DVE
 *    funkcie a nie jedna:
 *      · `primaryCategoryOf()` = čo výlet JE → odznak na karte, jedna hodnota,
 *      · `categoriesOf()`      = kde sa dá NÁJSŤ → filter, všetky, ktoré nesie.
 *    Dôsledok, ktorý si Matej vypýtal sám: kto vo filtri klikne VISIT, dostane aj tie HIKE
 *    výlety, ktoré nesú piknik alebo táborisko.
 *
 * 🔴 BOD (`point`) VYPADOL Z CELÉHO TRIPFLOW (Matej 31. 8.: „bod zbytočný v celom tripflow…
 *    nie?"). Najmenší okruh je bod s toleranciou — rozsah 100–500 m (`AREA_MIN_M`/`AREA_MAX_M`
 *    v GeometryPicker). Z typu `GeometryKind` sa NEMAŽE: 8 výletov ho má v datasete zapísaný
 *    (7 vodných plôch + Bled) a zúžený typ by ich pri čítaní zhodil. Zaniklo len to, že sa dá
 *    VYBRAŤ. Prekreslenie tých ôsmich na okruh je samostatná úloha (`npm run trip-audit`).
 *
 * 🔴 NÁROČNOSŤ MÁ LEN HIKE (Matej 31. 8.: „chill nebude mať náročnosť a nedal by som ani na
 *    sport ani na explore"). Do 31. 8. ju mal aj SPORT.
 *
 * ⚠️ NEMIGRUJE SA NIČ. `HeroTrail.acts` ostáva poľom, ktoré nesie staré aktivity, kategórie
 *    aj chipy naraz. `legacyActs` nižšie preto obsahuje staré hodnoty ('picnic', 'skating'…)
 *    a `acts` je ich zjednotenie s id chipov — jeden zoznam, počítaný, nie opísaný druhýkrát.
 *
 * ⚠️ EMOJI SA VYBERAJÚ V MATRICI (`npm run emoji-matrica`), nie tu v kóde. 📍 pri VISIT je
 *    NEODKLEPNUTÝ návrh (31. 8.).
 *
 * ⚠️ TENTO SÚBOR JE JEDINÝ ZDROJ. Do 27. 8. bola taxonómia v kóde ŠTYRIKRÁT (PackMap,
 *    AddTripLog, AddTripPlan, PackTripArticle) a kópie sa už stihli rozísť — plán mal pri
 *    nocľahu ⛺ tam, kde filter 💤. Kto pridáva kategóriu, chip alebo mení emoji, robí to tu.
 */
export type TripCategoryId = 'hike' | 'visit' | 'sport';

/**
 * CHIP = ČO SME ROBILI (moja spomienka o výlete).
 * Značka na mape = ČO TAM JE (tip pre ostatných, presný bod, krok 2) — iná vrstva, `mapnotes/`.
 *
 * `id` sa ukladá do `HeroTrail.acts` SPOLU s kategóriou (§2.3 zadania): jedno pole, jeden
 * mechanizmus, filter ich číta rovnako. Druhé pole by sa po prvej úprave rozišlo.
 * `label` je anglický záložný text; zobrazený názov ide cez `pack.map.chipLabel.<id>`.
 */
export type TripChip = { id: string; emoji: string; label: string };

export type TripCategory = {
  id: TripCategoryId;
  emoji: string;
  /** čo sa zapíše do `HeroTrail.acts` novému výletu */
  dataId: string;
  /** staré hodnoty `acts`, ktoré do kategórie patria — bez nich by výlety osireli */
  legacyActs: string[];
  /** VŠETKY hodnoty `acts`, ktoré do kategórie patria — staré aktivity, kľúč kategórie aj chipy */
  acts: string[];
  /** chipy kroku 4 — „čo sme tam robili" */
  chips: TripChip[];
  /** náročnosť má LEN HIKE (Matej 2026-08-31) */
  hasDifficulty: boolean;
  geometry: { default: GeometryKind; allowed: GeometryKind[] };
  /** anglický názov = kľúč do slovníka aj záložný text */
  label: string;
};

/**
 * CHIPY VISIT hovoria ČO TO JE ZA MIESTO, nie čo si tam robil. Preto sa prekryv
 * (priehrada = voda + táborisko) nečíta ako zmätok, ale ako popis.
 * ⚠️ „Opekačka" ZANIKLA (Matej 31. 8.: „picnic a opekačka je skoro to isté"). Ohnisko tam buď
 *    je, alebo nie je — to je vybavenie MIESTA a patrí medzi značky na mape.
 */
const VISIT_CHIPS: TripChip[] = [
  { id: 'park', emoji: '🌳', label: 'Park' },            // Matej 26. 8.
  { id: 'sight', emoji: '🏰', label: 'Landmark' },       // Matej 23. 8. („návšteva hradu")
  { id: 'zoo', emoji: '🦙', label: 'Zoo / farm' },       // Matej 31. 8.
  { id: 'water', emoji: '🏊', label: 'Water' },          // z Matejovej priehrady
  { id: 'meadow', emoji: '🧺', label: 'Picnic spot' },   // Matej (piknik)
  { id: 'camp', emoji: '⛺', label: 'Campsite' },        // Matej 31. 8. („overnight daj na CAMPING")
];

/**
 * ⚠️ `water` (VISIT, kúpanie na brehu) ≠ `paddle` (SPORT, SUP). Rôzne id ZÁMERNE — inak by
 *    `ACT_TO_CATEGORY` mal kolíziu a jedna hodnota by patrila do dvoch kategórií naraz.
 * 🅿️ `bike` a `train` sú NEODKLEPNUTÉ — Matej ich nikdy nenapísal (do športu zaradil
 *    „stopovanie", z čoho vzniklo `train`). Stoja tu ako návrh, nie ako jeho slovo.
 */
const SPORT_CHIPS: TripChip[] = [
  { id: 'skate', emoji: '🛼', label: 'Skating' },        // Matej 26. 8.
  { id: 'run', emoji: '🏃', label: 'Running' },          // Matej 26. 8.
  { id: 'paddle', emoji: '🏄', label: 'Paddling' },      // Matej 26. 8. („sup")
  { id: 'bike', emoji: '🚲', label: 'Cycling' },         // 🅿️ návrh, neodklepnuté
  { id: 'train', emoji: '🎖️', label: 'Training' },       // 🅿️ návrh, neodklepnuté
];

/** kategória bez chipov — HIKE nesie náročnosť a príznak viacdňovosti (odysea), to stačí */
const NO_CHIPS: TripChip[] = [];

type CategorySpec = Omit<TripCategory, 'acts'>;

const SPECS: CategorySpec[] = [
  {
    id: 'hike', emoji: '🥾', dataId: 'hike', legacyActs: ['hike', 'hiking', 'journey'],
    chips: NO_CHIPS,
    hasDifficulty: true,
    // Jediná povolená geometria ⇒ prepínač tvaru sa v GeometryPicker vôbec nevykreslí
    // (`allowed.length > 1`). Krok 1 sa tým skráti sám, bez zásahu do pickera.
    geometry: { default: 'route', allowed: ['route'] },
    label: 'Hike',
  },
  {
    id: 'visit', emoji: '📍', dataId: 'visit',
    // CHILL aj EXPLORE sem padajú celé — vrátane ich starých aktivít. Bez toho by 19 piknikov
    // a 7 nocľahov v datasete stratilo kategóriu.
    legacyActs: ['chill', 'picnic', 'overnight', 'explore'],
    chips: VISIT_CHIPS,
    hasDifficulty: false,
    geometry: { default: 'area', allowed: ['area'] },
    label: 'Visit',
  },
  {
    id: 'sport', emoji: '🏄', dataId: 'sport', legacyActs: ['sport', 'skating', 'paddleboard'],
    chips: SPORT_CHIPS,
    hasDifficulty: false,
    // Trasa aj okruh: korčule a beh sú trasa, pádlovanie je vodná plocha. Default ostáva trasa
    // (dnešný stav mínus bod) — kto zapisuje vodu, prepne jedným ťuknutím.
    geometry: { default: 'route', allowed: ['route', 'area'] },
    label: 'Sport',
  },
];

/** `acts` sa POČÍTA, neopisuje: staré hodnoty + kľúč kategórie + id chipov. */
export const TRIP_CATEGORIES: TripCategory[] = SPECS.map((c) => ({
  ...c,
  acts: [c.dataId, ...c.legacyActs.filter((a) => a !== c.dataId), ...c.chips.map((ch) => ch.id)],
}));

export const CATEGORY_BY_ID: Record<string, TripCategory> =
  Object.fromEntries(TRIP_CATEGORIES.map((c) => [c.id, c]));

/** dátová hodnota z `acts` → kategória, do ktorej patrí */
export const ACT_TO_CATEGORY: Record<string, TripCategoryId> = Object.fromEntries(
  TRIP_CATEGORIES.flatMap((c) => c.acts.map((a) => [a, c.id])),
);

/** chip podľa id — karta a článok majú v `acts` len holý reťazec, nie celý riadok */
export const CHIP_BY_ID: Record<string, TripChip> = Object.fromEntries(
  TRIP_CATEGORIES.flatMap((c) => c.chips.map((ch) => [ch.id, ch])),
);

/**
 * PORADIE IDENTITY (Matej 31. 8.: „dal by som hike, chill, sport, explore… poradie" — po
 * zlúčení HIKE › VISIT › SPORT). Výlet s trasou a stúpaním je HIKE, aj keď sa na ňom dá aj
 * piknikovať; priorita `hike` je odklepnutá práve preto, aby tie výlety neprišli o náročnosť,
 * ktorú v datasete majú zapísanú.
 * ⚠️ Použije sa LEN tam, kde človek nevyberal — pri novom výlete rozhoduje jeho prvý klik.
 */
const IDENTITY_ORDER: TripCategoryId[] = ['hike', 'visit', 'sport'];

/** VŠETKY kategórie, pod ktorými sa výlet dá nájsť — pre filter. */
export function categoriesOf(acts?: string[] | null): TripCategoryId[] {
  const out: TripCategoryId[] = [];
  for (const a of acts ?? []) {
    const c = ACT_TO_CATEGORY[a];
    if (c && !out.includes(c)) out.push(c);
  }
  return out;
}

/**
 * ČO VÝLET JE — jedna kategória pre odznak na karte.
 * ⚠️ Výlet BEZ `acts` dostane HIKE, nie prázdno: odznak, ktorý raz zmizne, vyzerá ako chyba
 * vykreslenia.
 */
export function primaryCategoryOf(acts?: string[] | null): TripCategoryId {
  /**
   * 🔑 PRVÝ KLIK ČLOVEKA PREBÍJA PORADIE. Nový výlet má na `acts[0]` `dataId` kategórie,
   * ktorú si človek vybral — chipy stoja až za ňou. Bez tejto vetvy by SPORT s chipom
   * „táborisko" dostal odznak VISIT, lebo VISIT stojí v poradí vyššie: appka by prepísala
   * rozhodnutie, ktoré od človeka práve dostala.
   * `IDENTITY_ORDER` nižšie preto rozhoduje LEN tam, kde nikto nevyberal — teda na 81 seed
   * výletoch, ktoré nesú iba staré aktivity ('picnic', 'skating'…).
   */
  const chosen = TRIP_CATEGORIES.find((c) => c.dataId === (acts ?? [])[0]);
  if (chosen) return chosen.id;
  const has = categoriesOf(acts);
  return IDENTITY_ORDER.find((c) => has.includes(c)) ?? 'hike';
}

/** patrí výlet do kategórie? (filter — číta VŠETKY, nie len identitu) */
export function isInCategory(acts: string[] | null | undefined, cat: TripCategoryId): boolean {
  return categoriesOf(acts).includes(cat);
}

/** chipy VLASTNEJ kategórie — prvý rad kroku 4 („Čo sme tam robili") */
export function chipsForCategory(id: string): TripChip[] {
  return CATEGORY_BY_ID[id]?.chips ?? [];
}

/**
 * ZJEDNOTENIE CHIPOV OSTATNÝCH KATEGÓRIÍ — druhý, ZBALENÝ rad kroku 4.
 *
 * 🔑 NIE JE TO VLASTNÝ ZOZNAM. Počíta sa z `TRIP_CATEGORIES`, takže sa nemôže rozísť
 *    a nevzniknú v ňom duplicity. Rieši to naraz všetko, na čom sa štyri kolá stálo:
 *    „idem na Kriváň a v chipe bude pádlovanie?" (rad je zbalený, sám sa neponúka) ·
 *    „hike nemá ako mať piknik či?" (má, cez tento rad).
 */
export function otherChips(id: string): TripChip[] {
  return TRIP_CATEGORIES.filter((c) => c.id !== id).flatMap((c) => c.chips);
}

/**
 * KTORÁ HODNOTA `acts` JE CHIP — a nie kategória či stará aktivita.
 * Karta a článok podľa toho vedia, čo smú ukázať ako chip: staré `picnic`/`overnight` do
 * kategórie patria, ale chipom nikdy neboli a nemajú vlastný preklad v `chipLabel.*`.
 */
export function chipsOf(acts?: string[] | null): TripChip[] {
  const out: TripChip[] = [];
  for (const a of acts ?? []) {
    const ch = CHIP_BY_ID[a];
    if (ch && !out.includes(ch)) out.push(ch);
  }
  return out;
}

/**
 * Geometria kategórie. Odysea (viacdňová) smie byť LEN trasa — Matej 2026-08-22:
 * „pri magistrále - logovaní nemôže byť oblasť, musí mať vždy ROUTE". Pri HIKE je to dnes
 * to isté ako jednodňová vetva; riadok ostáva, lebo nesie DÔVOD, nie len hodnotu.
 */
export function geometryForCategory(
  id: string,
  multiDay = false,
): { default: GeometryKind; allowed: GeometryKind[] } {
  if (id === 'hike' && multiDay) return { default: 'route', allowed: ['route'] };
  return CATEGORY_BY_ID[id]?.geometry ?? { default: 'route', allowed: ['route', 'area'] };
}

/**
 * EMOJI HODNÔT V `acts` — kategórie, staré aktivity aj chipy. Kategórie ich nahradili ako
 * VOĽBU, ale staré hodnoty v `acts` ležia ďalej a na karte sa zobrazujú ako TAG („dá sa tu
 * aj prespať"). Práve toto ukáže človeku, prečo mu výlet s odznakom HIKE vypadol pod
 * filtrom VISIT.
 * ⚠️ Chipy sa sem sypú z `TRIP_CATEGORIES` — druhá ručne písaná kópia by sa rozišla.
 */
export const ACT_TAG_EMOJI: Record<string, string> = {
  hike: '🥾', hiking: '🥾', journey: '🎒', picnic: '🧺', overnight: '💤',
  skating: '🛼', paddleboard: '🏄', explore: '🏰', chill: '🧺', sport: '🏄',
  ...Object.fromEntries(TRIP_CATEGORIES.map((c) => [c.id, c.emoji])),
  ...Object.fromEntries(Object.values(CHIP_BY_ID).map((ch) => [ch.id, ch.emoji])),
};
