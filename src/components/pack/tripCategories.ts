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
 *    nie?"). Najmenší okruh je bod s toleranciou — rozsah 50 m – 5 km, východisko 100 (`AREA_MIN_M`/`AREA_MAX_M`
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
/**
 * ⚠️ `sport` → `activity` (Matej 1. 9. 2026, výber v matrici: 💪 „ACTIVITY"). Meno `sport`
 *    ostáva v `legacyActs` — výlety zapísané do 1. 9. ho majú v `acts` a bez neho by prišli
 *    o kategóriu. Dôvod premenovania: piknik a camping sú tiež „čo sme robili", a pod menom
 *    ŠPORT by tam nikto nehľadal. Os je odteraz: ACTIVITY = čo sme robili · VISIT = kam sme šli.
 */
export type TripCategoryId = 'hike' | 'visit' | 'activity';

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
 * ── MIESTA — KAM SME ŠLI (Matej 1. 9. 2026, finálny model) ────────────────────────────────
 *
 * CHIPY VISIT hovoria ČO TO JE ZA MIESTO, nie čo si tam robil. Deliaca čiara oproti aktivitám:
 * **ide sa tam × len to tam je.** Preto v zozname NIE JE les, hory ani výhľad — do lesa sa
 * nechodí na návštevu (Matej: „visit má tagy ktoré sú na hike? to nie je hlúposť?"); tie
 * ostávajú ZNAČKAMI, ktoré sa dajú pridať ku každému výletu vrátane turistiky.
 *
 * ⚠️ TROJ ZMENY OPROTI 31. 8. — každá má dôvod v audite slovníkov (`plany/nakres-audit-slovnikov-2026-09-01.html`):
 *   · 🏊 „Voda" VYPADLA — to isté slovo niesol chip, dve značky (Jazero 13× · Rieka 21×), šport
 *     (pádlovanie), značka svorky, OSM prameň aj spací chip. Nahradilo ju 🔵 Jazero / priehrada,
 *     teda to, čo človek naozaj navštívi; kúpanie je ČINNOSŤ a žije v `ACTIVITY_CHIPS`.
 *   · ⛺ „Táborisko" VYPADLO — camping je ČINNOSŤ (Matej: „camping je super aktivita"), a samotné
 *     spacie miesto je bod vrstvy `sleepSpots`, ktorá sa časom stane sekciou UBYTOVANIE v PLACES.
 *   · 🧺 „Lúka na piknik" sa rozpadla na dve veci, ktoré niesla naraz: LÚKA je miesto (🌼, 39
 *     výletov ju má ako značku), PIKNIK je činnosť (19 výletov) a odišiel medzi aktivity.
 *
 * ⚠️ Lúka, jazero aj útulňa žijú AJ inde (značky, resp. spacia vrstva) — zámerne: jeden slovník,
 *    dve použitia (raz cieľ, raz vlastnosť miesta). Nie je to kolízia, je to tá istá vec videná
 *    z dvoch strán.
 * ⚠️ „Opekačka" ZANIKLA (Matej 31. 8.: „picnic a opekačka je skoro to isté"). Ohnisko tam buď
 *    je, alebo nie je — to je vybavenie MIESTA a patrí medzi značky na mape.
 */
const VISIT_CHIPS: TripChip[] = [
  { id: 'park', emoji: '🌳', label: 'Park' },              // Matej 26. 8.
  { id: 'sight', emoji: '🏰', label: 'Landmark' },         // Matej 23. 8. („návšteva hradu")
  { id: 'zoo', emoji: '🦙', label: 'Zoo / farm' },         // Matej 31. 8.
  { id: 'lake', emoji: '🔵', label: 'Lake / reservoir' },  // Matej 1. 9. — nahradilo „Vodu"
  { id: 'meadow', emoji: '🌼', label: 'Meadow' },          // Matej 1. 9. — bolo „Lúka na piknik"
  { id: 'hut', emoji: '🛖', label: 'Mountain hut' },       // Matej 1. 9. („niekedy je to alternatíva k stanovaniu")
];

/**
 * ── AKTIVITY — ČO SME ROBILI (Matej 1. 9. 2026, výber v matrici) ──────────────────────────
 *
 * 🔑 Hike je tiež aktivita — len najbohatšia (Matej: „činnosť je aj hike vlastne… len je to
 *    najčastejšia a najbohatšia aktivita"), preto má vlastnú kategóriu a vlastný tok.
 *
 * ⚠️ `water` z VISITu tu SPLYNUL s `paddle` (Matej: „plávanie a SUP je jedno — obe sú voda").
 *    Dvojica `water`/`paddle` existovala len preto, aby `ACT_TO_CATEGORY` nemal kolíziu; keď je
 *    kúpanie činnosť a jazero miesto, dôvod zanikol.
 * ⚠️ `picnic` a `overnight` sú ZÁROVEŇ staré hodnoty v `acts` (19, resp. 7 výletov). Chip
 *    `picnic` má preto ZHODNÉ id so starou aktivitou — je to tá istá vec, nie dve. Camping
 *    starú hodnotu nesie cez `legacyActs` (`overnight`), lebo chip sa volá inak.
 * 🔴 VYPADLI: 🎖️ Tréning (0 výletov; podujatie „Tréning" to pokrýva lepšie — je to udalosť
 *    s časom, nie vlastnosť miesta) a 🛴 Kolobežka (Matej: „ak by sa niekto ozval, pridáme ju").
 */
const ACTIVITY_CHIPS: TripChip[] = [
  { id: 'picnic', emoji: '🧺', label: 'Picnic' },          // 19 výletov v datasete
  { id: 'camping', emoji: '🏕️', label: 'Camping' },         // Matej 1. 9. („camping je super aktivita")
  { id: 'paddle', emoji: '🏊', label: 'Swimming / SUP' },  // Matej 26. 8. („sup") + kúpanie
  { id: 'skate', emoji: '🛼', label: 'Skating' },          // Matej 26. 8.
  { id: 'run', emoji: '🏃', label: 'Running' },            // Matej 26. 8.
  { id: 'bike', emoji: '🚲', label: 'Cycling' },
  { id: 'mushrooms', emoji: '🍄', label: 'Mushrooms' },    // Matej 1. 9., vlastný zápis v matrici
];

/**
 * ── TVAR VÝLETU URČUJE CHIP, NIE KATEGÓRIA (Matej 1. 9. 2026) ─────────────────────────────
 *
 * „beh, bike a sup budú mať na výber aj trasovanie — bike a beh 1. možnosť trasa / alternatíva
 *  okruh, sup bude hlavná možnosť okruh a alternatíva trasa"
 *
 * 🔑 PORADIE POĽA JE PORADIE NA OBRAZOVKE a prvá položka je zároveň VÝCHODISKOVÝ TVAR. Preto
 *    tu nie je druhé pole `default`: dve hodnoty pre tú istú vec by sa pri prvej zmene rozišli
 *    a prepínač by ukazoval iné poradie, než aké appka nastaví.
 *
 * 🔴 PLATÍ LEN PRE VLASTNÉ CHIPY KATEGÓRIE. Turistika smie mať piknik z druhého (zbaleného)
 *    radu — a keby jej ten chip prepol geometriu na okruh, appka by človeku zahodila
 *    rozkreslenú trasu za to, že si spomenul, kde obedoval. Guard je v `geometryForCategory`.
 *
 * ⚠️ CHIP BEZ ZÁZNAMU TU NIE JE CHYBA — padá na geometriu kategórie. Návšteva tak ostáva
 *    okruhom pri všetkých šiestich miestach a nemusí sa tu opisovať šesťkrát to isté.
 *
 * ⚠️ KORČULE MAJÚ VOĽBU TIEŽ (Matej 1. 9. 2026: „korčule su trasa s okruhom!"). Prvé kolo
 *    im ju nedalo, lebo v zadaní boli menované len bicykel, beh a SUP — lenže korčuľovanie
 *    v parku je kolieska na jednom mieste presne tak, ako beh po hrádzi je trasa. Poradie
 *    má zhodné s behom a bicyklom: trasa prvá.
 *
 * 🚩 BEZ ALTERNATÍVY OSTÁVAJÚ piknik, camping a hubárčenie — pri tých je „trasa" naozaj
 *    nezmysel (nikto nepiknikuje po línii). Ak sa ozve opak, je to jedno slovo tu.
 */
const CHIP_GEOMETRY: Record<string, GeometryKind[]> = {
  run: ['route', 'area'],      // beh: 1. trasa · alt okruh
  bike: ['route', 'area'],     // bicykel: 1. trasa · alt okruh
  paddle: ['area', 'route'],   // plávanie / SUP: 1. okruh · alt trasa
  skate: ['route', 'area'],    // korčule: 1. trasa · alt okruh (Matej 1. 9.)
  picnic: ['area'],
  camping: ['area'],
  mushrooms: ['area'],
};

/** kategória bez chipov — HIKE nesie náročnosť a príznak viacdňovosti (odysea), to stačí */
const NO_CHIPS: TripChip[] = [];

type CategorySpec = Omit<TripCategory, 'acts'>;

const SPECS: CategorySpec[] = [
  /**
   * ── PORADIE PODĽA VÝKONU (Matej 1. 9. 2026) ────────────────────────────────────────────
   * Trasa a výkon → výkon bez trasy → bez výkonu. Dovtedajšie hike · visit · activity bolo
   * len poradie, v ktorom kategórie vznikali. Poradie tohto poľa nesie DLAŽDICE v ADD aj
   * `IDENTITY_ORDER` nižšie — mení sa na jednom mieste.
   */
  {
    // 🔴 `hiking` a `journey` ZMAZANÉ 1. 9. 2026 — 0 zo 72 výletov ich má v `acts` a 11
    // magistrál `acts` nemá vôbec (padajú na `hike` cez východzí návrat `primaryCategoryOf`).
    id: 'hike', emoji: '🥾', dataId: 'hike', legacyActs: [],
    chips: NO_CHIPS,
    hasDifficulty: true,
    // Jediná povolená geometria ⇒ prepínač tvaru sa v GeometryPicker vôbec nevykreslí
    // (`allowed.length > 1`). Krok 1 sa tým skráti sám, bez zásahu do pickera.
    geometry: { default: 'route', allowed: ['route'] },
    label: 'Hike',
  },
  {
    // 💪 = Matejov výber v matrici 1. 9. 2026 („activity by som dal napnutý biceps"). 🏄 bolo
    // priúzke — pádlovanie je jedna zo siedmich činností, nie ich zástupca.
    // ⚠️ `sport` OSTÁVA v `legacyActs`: je to `dataId` do 1. 9. 2026, teda hodnota, ktorú
    // majú v `acts` výlety zapísané pod starým menom. Zmazať ho = osirotiť ich.
    id: 'activity', emoji: '💪', dataId: 'activity',
    legacyActs: ['sport', 'skating', 'paddleboard', 'overnight'],
    chips: ACTIVITY_CHIPS,
    hasDifficulty: false,
    // ✅ TVAR URČUJE CHIP (postavené 1. 9. 2026) — `CHIP_GEOMETRY` vyššie. Beh a bicykel
    // začínajú trasou, SUP okruhom; človek si to prepne v doku nad mapou.
    // Tento riadok je ZÁCHRANA pre prípady, keď chip ešte nie je vybraný: plán aktivity
    // (ten sa chipu nepýta) a starý koncept uložený pred touto zmenou.
    geometry: { default: 'route', allowed: ['route', 'area'] },
    label: 'Activity',
  },
  {
    // 👀 = Matejov výber 31. 8. 2026 („visit daj oči (dve)"). 📍 padlo: `TRIP_TARGET_EMOJI`
    // v `mapnotes/markEmoji.ts` ním od 24. 8. značí CIEĽ PLÁNOVANÉHO VÝLETU, takže by tá istá
    // značka hovorila „kategória návšteva" aj „sem ideme".
    // ⚠️ NEZAMIEŇAŤ S 👁️ (jedno oko) — to je VÝHĽAD: tag `View` vo filtri aj `viewpoint` na
    // mape. Dvojica očí je kategória, jedno oko je vlastnosť miesta; na karte smú stáť vedľa
    // seba. Kto niektoré z nich mení, musí sa pozrieť na to druhé.
    id: 'visit', emoji: '👀', dataId: 'visit',
    // 🔴 `picnic` a `overnight` ODIŠLI DO ACTIVITY (Matej 1. 9.: piknik aj camping sú činnosti).
    // Preklopí to odznak TROM výletom, ktoré nemajú `hike`: slnava · oresianska-priehrada ·
    // palcmanska-masa — všetky tri sú vodné plochy s paddleboardom, takže je to oprava.
    // `chill` zmazané (0 výletov, éra štyroch kategórií).
    legacyActs: ['explore'],
    chips: VISIT_CHIPS,
    hasDifficulty: false,
    geometry: { default: 'area', allowed: ['area'] },
    label: 'Visit',
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
 * PORADIE IDENTITY = PORADIE PODĽA VÝKONU (Matej 1. 9. 2026): HIKE › ACTIVITY › VISIT.
 * Trasa a výkon → výkon bez trasy → bez výkonu. Výlet s trasou a stúpaním je HIKE, aj keď sa
 * na ňom dá aj piknikovať; priorita `hike` je odklepnutá práve preto, aby tie výlety neprišli
 * o náročnosť, ktorú v datasete majú zapísanú.
 * ⚠️ Použije sa LEN tam, kde človek nevyberal — pri novom výlete rozhoduje jeho prvý klik.
 * ⚠️ Zmena poradia + presun piknika a nocľahu do ACTIVITY preklopila odznak SIEDMIM zo 72
 *    výletov; štyrom z nich sa zmenil len názov tej istej kategórie (sport → activity), tri
 *    naozaj zmenili kategóriu (slnava, oresianska-priehrada, palcmanska-masa — vodné plochy
 *    s paddleboardom, ktoré dovtedy niesli NÁVŠTEVU).
 */
const IDENTITY_ORDER: TripCategoryId[] = ['hike', 'activity', 'visit'];

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
  chip?: string,
): { default: GeometryKind; allowed: GeometryKind[] } {
  if (id === 'hike' && multiDay) return { default: 'route', allowed: ['route'] };
  /**
   * ⚠️ CHIP PREBÍJA KATEGÓRIU, ale LEN keď je to chip TEJTO kategórie (viď `CHIP_GEOMETRY`).
   * Bez tejto podmienky by turistika s piknikom z druhého radu prepla tvar na okruh a prišla
   * o rozkreslenú trasu.
   */
  const byChip = chip ? CHIP_GEOMETRY[chip] : undefined;
  if (byChip?.length && CATEGORY_BY_ID[id]?.chips.some((c) => c.id === chip)) {
    return { default: byChip[0], allowed: byChip };
  }
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
  hike: '🥾', hiking: '🥾', journey: '🎒', picnic: '🧺', overnight: '🏕️',
  skating: '🛼', paddleboard: '🏊', explore: '🏰', chill: '🧺', sport: '💪',
  ...Object.fromEntries(TRIP_CATEGORIES.map((c) => [c.id, c.emoji])),
  ...Object.fromEntries(Object.values(CHIP_BY_ID).map((ch) => [ch.id, ch.emoji])),
};

// ── TAGY: JEDEN ZDROJ PRE EMOJI AJ SLOVNÍK (2026-09-02) ─────────────────────────────────────
// Do 2. 9. stáli `TAG_EMOJI` a slovník tagov DVAKRÁT — v `PackMap.tsx` a v `PackTripArticle.tsx`
// — a už sa rozišli: článok mal `Lake`, mapa `Lake/Reservoir`, a článku chýbali oba povrchy.
// Následok bol vidieť: dataset nesie tag `Lake` (13 z 81 výletov), takže na karte výletu na
// mape stál chip BEZ emoji a s nepreloženým anglickým slovom, kým ten istý výlet mal v článku
// 🔵 správne. Preklad tagov sa preto nedal spraviť raz — a to je blokátor E5.
//
// ⚠️ DVE SADY KĽÚČOV, JEDNA TABUĽKA. `tr.tags[]` nesie SUROVÉ dátové hodnoty (`Lake`, `Stream`),
// filtre a chipy `TAG_VOCAB` pracujú s UI hodnotami (`Lake/Reservoir`, `River`). Karta aj článok
// čítajú `tr.tags` PRIAMO, takže tabuľka musí poznať obe — ale druhý ručný zoznam by sa rozišiel
// rovnako ako ten, ktorý toto nahrádza. Aliasy sa preto DOPOČÍTAVAJÚ z `DATA_TAG_TO_UI` nižšie.
// ⚠️ Povrch (`tr.surface`) tu zámerne nie je: jeho dátové hodnoty sú malým písmom (`forest`)
// a na emoji sa nikde nepýtajú — do chipov ide až cez `SURFACE_TAG_MAP` ako UI hodnota.

/** Surová hodnota z `tr.tags[]` → hodnota vo `TAG_VOCAB`. Presunuté z `PackMap.tsx` 2026-09-02,
 *  aby sa z nej dali odvodiť aliasy tabuliek nižšie. Hodnoty bez mapovania (napr.
 *  'In the middle of nature') sa zámerne nezobrazujú ako chip a nefiltrujú — nefabrikuje sa
 *  nový dátový tag, len sa neponúka chip preň. */
export const DATA_TAG_TO_UI: Record<string, string> = {
  Mountains: 'Mountains', Forest: 'Forest', View: 'View', Meadow: 'Meadow', Sunset: 'Sunset',
  Shade: 'Shade', 'No shade': 'No shade',
  Lake: 'Lake/Reservoir', Reservoir: 'Lake/Reservoir',
  Stream: 'River', River: 'River',
};

/** Doplní tabuľke kľúčované UI hodnotami aj surové dátové kľúče, ktoré na ne mapujú. */
function withDataTagAliases(byUi: Record<string, string>): Record<string, string> {
  const out = { ...byUi };
  for (const [raw, ui] of Object.entries(DATA_TAG_TO_UI)) {
    if (out[raw] === undefined && byUi[ui] !== undefined) out[raw] = byUi[ui];
  }
  return out;
}

// Matrica značiek 24. 8. 2026: 🏞️→🔵, 💧→🌀, 🌄→👁️, 🥾→👣. Dôvod je kolízny, nie estetický —
// 💧 nesie prameň v POI, 🥾 preskočilo na turistiku v `ACT_TAG_EMOJI` a 👣 sa uvoľnilo tým, že
// návštevnosť „Rušno" prešla na 🚨.
export const TAG_EMOJI: Record<string, string> = withDataTagAliases({
  Mountains: '🏔️', Forest: '🌲', 'Lake/Reservoir': '🔵', River: '🌀', View: '👁️', Meadow: '🌼', Sunset: '🌅',
  Shade: '⛱️', 'No shade': '🌡️',
  'Forest path': '👣', Asphalt: '🛣️', Rocky: '🪨',
});

// ⚠️ HODNOTA ≠ TEXT NA OBRAZOVKE (2026-08-23). Tagy sú dátové hodnoty z `tr.tags` a `tr.surface`
// — filtruje sa podľa nich, takže sa NEPREKLADAJÚ. Chip však človek číta, a v slovenskom paneli
// FILTRE stálo „Mountains / Forest / Lake/Reservoir". Slovník je spoločný s formulárom výletu
// (`pack.map.tagLabel.*`, `surfaceLabel.*`), aby tá istá vec nemala na dvoch obrazovkách dva
// názvy. Chýbajúci kľúč padá na pôvodnú hodnotu.
export const TAG_I18N: Record<string, string> = withDataTagAliases({
  Mountains: 'pack.map.tagLabel.mountains', Forest: 'pack.map.tagLabel.forest',
  'Lake/Reservoir': 'pack.map.tagLabel.lake', River: 'pack.map.tagLabel.river',
  View: 'pack.map.tagLabel.view', Meadow: 'pack.map.tagLabel.meadow', Sunset: 'pack.map.tagLabel.sunset',
  Shade: 'pack.map.tagLabel.shade', 'No shade': 'pack.map.tagLabel.noshade',
  'Forest path': 'pack.map.surfaceLabel.forest', Asphalt: 'pack.map.surfaceLabel.asphalt',
  Rocky: 'pack.map.surfaceLabel.rocky',
});
