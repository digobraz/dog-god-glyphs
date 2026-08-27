import type { GeometryKind } from './addtrip/addTripModel';

/**
 * ── ŠTYRI KATEGÓRIE VÝLETU — JEDEN ZDROJ (Matej 2026-08-27) ───────────────────────────────
 *
 * „upratať AKTIVITY: zlúčime ich do 4 kategórií: HIKE, CHILL, SPORT, EXPLORE."
 *
 * Zo siedmich aktivít ostávajú štyri kategórie. Mapovanie (§11.1 kánonu):
 *   hike + journey → HIKE · picnic + overnight → CHILL · skating + paddleboard → SPORT ·
 *   explore → EXPLORE. Žiadny výlet neosirie.
 *
 * 🔴 KATEGÓRIA JE IDENTITA, AKTIVITA JE TAG (Matej 2026-08-27: „všetky výlety označené ako
 *    HIKE, ktoré majú trasu, stúpanie atď., sú predovšetkým HIKE — aj keď majú tag nocľah,
 *    piknik; je to len tag, že tam je to možné robiť, netransformujú sa preto do CHILL").
 *    Preto sú tu DVE funkcie a nie jedna:
 *      · `primaryCategoryOf()` = čo výlet JE → odznak na karte, jedna hodnota,
 *      · `categoriesOf()`      = kde sa dá NÁJSŤ → filter, všetky, ktoré nesie.
 *    Dôsledok, ktorý si Matej vypýtal sám: kto vo filtri klikne CHILL, dostane aj tie HIKE
 *    výlety, ktoré nesú piknik alebo nocľah. Bez tohto rozdelenia by pri jednej kategórii
 *    na výlet ostal CHILL na 81 seed výletoch PRÁZDNY (19 piknikov a 7 z 8 nocľahov sedí
 *    na výlete, ktorý je zároveň túra) — a prázdna priehradka sa číta ako pokazená appka.
 *
 * ⚠️ NEMIGRUJE SA NIČ. `HeroTrail.acts` ostáva poľom starých hodnôt ('hike', 'picnic', …);
 *    nové výlety dostanú `dataId` kategórie ('hike', 'chill', 'sport', 'explore'). Preto
 *    `acts` nižšie obsahuje OBOJE — starú aktivitu aj nový kľúč kategórie.
 *
 * ⚠️ EMOJI SÚ DOČASNÉ. Vyberajú sa v samostatnom kole (`npm run emoji-matrica`, Matej
 *    2026-08-27: „vybrať správne emoji riešme až potom, keď to bude stáť") — tu stoja tie,
 *    ktoré sady niesli 27. 8. Meniť ich treba TU, nie v štyroch komponentoch.
 *
 * ⚠️ TENTO SÚBOR JE JEDINÝ ZDROJ. Do 27. 8. bola taxonómia v kóde ŠTYRIKRÁT (PackMap,
 *    AddTripLog, AddTripPlan, PackTripArticle) a kópie sa už stihli rozísť — plán mal pri
 *    nocľahu ⛺ tam, kde filter 💤, a pri objavovaní 🧭 tam, kde filter 🏰. Kto pridáva
 *    kategóriu alebo mení emoji, robí to tu; komponenty si len berú.
 */
export type TripCategoryId = 'hike' | 'chill' | 'sport' | 'explore';

export type TripCategory = {
  id: TripCategoryId;
  emoji: string;
  /** čo sa zapíše do `HeroTrail.acts` novému výletu */
  dataId: string;
  /** VŠETKY hodnoty `acts`, ktoré do kategórie patria — staré aktivity aj nový kľúč */
  acts: string[];
  /** náročnosť majú len HIKE a SPORT (§10.2 kánonu) */
  hasDifficulty: boolean;
  geometry: { default: GeometryKind; allowed: GeometryKind[] };
  /** anglický názov = kľúč do slovníka aj záložný text */
  label: string;
};

export const TRIP_CATEGORIES: TripCategory[] = [
  {
    id: 'hike', emoji: '🥾', dataId: 'hike', acts: ['hike', 'hiking', 'journey'],
    hasDifficulty: true,
    // 🔴 Pri VIACDŇOVEJ (odysea) je povolená LEN 'route' — viď `geometryForCategory()` nižšie.
    geometry: { default: 'route', allowed: ['route', 'area'] },
    label: 'Hike',
  },
  {
    id: 'chill', emoji: '🧺', dataId: 'chill', acts: ['chill', 'picnic', 'overnight'],
    // §10.2: CHILL nemá náročnosť vôbec — piknik pri jazere nie je ľahký ani ťažký.
    hasDifficulty: false,
    geometry: { default: 'area', allowed: ['area', 'point'] },
    label: 'Chill',
  },
  {
    id: 'sport', emoji: '🏄', dataId: 'sport', acts: ['sport', 'skating', 'paddleboard'],
    hasDifficulty: true,
    // Všetky tri druhy: korčule sú trasa, ale 6 vodných plôch (Buková, Liptovská Mara,
    // Kráľová, Sĺňava, Orešianska, Palcmanská Maša) má v datasete jedinú kotvu — teda bod.
    geometry: { default: 'route', allowed: ['route', 'area', 'point'] },
    label: 'Sport',
  },
  {
    id: 'explore', emoji: '🏰', dataId: 'explore', acts: ['explore'],
    hasDifficulty: false,
    // 🔴 ZÁMERNE BEZ 'route' (Matej 2026-07-29: „len Bod + Okruh"). Kto chce trasu, prepne
    // kategóriu. Miesta bez trasy: hrady, kaštiele, parky.
    geometry: { default: 'point', allowed: ['point', 'area'] },
    label: 'Explore',
  },
];

export const CATEGORY_BY_ID: Record<string, TripCategory> =
  Object.fromEntries(TRIP_CATEGORIES.map((c) => [c.id, c]));

/** dátová hodnota z `acts` → kategória, do ktorej patrí */
export const ACT_TO_CATEGORY: Record<string, TripCategoryId> = Object.fromEntries(
  TRIP_CATEGORIES.flatMap((c) => c.acts.map((a) => [a, c.id])),
);

/**
 * PORADIE IDENTITY. Výlet s trasou a stúpaním je HIKE, aj keď sa na ňom dá aj piknikovať —
 * priorita `hike` pred `overnight` je odklepnutá (§10.6) práve preto, aby tie výlety
 * neprišli o náročnosť, ktorú v datasete majú zapísanú.
 */
const IDENTITY_ORDER: TripCategoryId[] = ['hike', 'sport', 'explore', 'chill'];

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
 * ⚠️ Výlet BEZ `acts` (v datasete ich 27. 8. nemá 0, ale člen ich vie zmazať) dostane HIKE,
 * nie prázdno: odznak, ktorý raz zmizne, vyzerá ako chyba vykreslenia.
 */
export function primaryCategoryOf(acts?: string[] | null): TripCategoryId {
  const has = categoriesOf(acts);
  return IDENTITY_ORDER.find((c) => has.includes(c)) ?? 'hike';
}

/** patrí výlet do kategórie? (filter — číta VŠETKY, nie len identitu) */
export function isInCategory(acts: string[] | null | undefined, cat: TripCategoryId): boolean {
  return categoriesOf(acts).includes(cat);
}

/**
 * Geometria kategórie. Odysea (viacdňová) smie byť LEN trasa — Matej 2026-08-22:
 * „pri magistrále - logovaní nemôže byť oblasť, musí mať vždy ROUTE". Jediná povolená
 * hodnota zároveň schová prepínač druhu v `GeometryPicker` (`allowed.length > 1`).
 */
export function geometryForCategory(
  id: string,
  multiDay = false,
): { default: GeometryKind; allowed: GeometryKind[] } {
  if (id === 'hike' && multiDay) return { default: 'route', allowed: ['route'] };
  return CATEGORY_BY_ID[id]?.geometry ?? { default: 'route', allowed: ['route', 'area', 'point'] };
}

/**
 * EMOJI STARÝCH AKTIVÍT — kategórie ich nahradili ako VOĽBU, ale v `acts` ležia ďalej a na
 * karte sa zobrazujú ako TAG („dá sa tu aj prespať"). Práve toto ukáže človeku, prečo mu
 * výlet s odznakom HIKE vypadol pod filtrom CHILL.
 */
export const ACT_TAG_EMOJI: Record<string, string> = {
  hike: '🥾', hiking: '🥾', journey: '🎒', picnic: '🧺', overnight: '💤',
  skating: '🛼', paddleboard: '🏄', explore: '🏰', chill: '🧺', sport: '🏄',
};
