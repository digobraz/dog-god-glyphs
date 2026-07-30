// ─────────────────────────────────────────────────────────────────────────────
// BODOVÁ EKONOMIKA v2 — `calculateTripPoints()` (issue #33).
//
// ZDROJ PRAVDY = kalkulačka v dashboarde, tab **Mapa** (`vystupy/dashboard/embeds/mapa/
// index.html`, sekcia 03 · BODY: „Toto je zároveň špecifikácia funkcie calculateTripPoints()").
// Ceny, krivka levelu aj pevné ceny magistrál sú prepísané odtiaľ 1:1. Keď sa mení jedno,
// musí sa zmeniť druhé — inak appka ukazuje iné číslo než dokument, ktorý ho sľubuje.
//
// Schválené 25. 7. 2026, revízia 29. 7. 2026 (miesto 10 · krajina 30 · žiadny strop nikde ·
// deben zrušený · BONES = mena za ŠÍRENIE, body za chodenie do nej neústia).
//
// PRAVIDLÁ, ktoré nie sú vidieť v tabuľke:
//  · Mena sa volá **points**, nie XP — čísla musia byť také malé, aby sa dali napísať priamo
//    na tlačidlo („ADD TRIP · +25").
//  · **Žiadny strop.** Ani na výlety, ani na hodnotenia. Dvadsať výletov za víkend = dvadsať
//    plných odmien. Anomálie rieši detektív jednotlivo, nie pravidlo.
//  · **Objavenie sa počíta raz.** Desiatka za pohorie padne pri PRVOM vstupe, nie po každom.
//  · **Trasa vs. miesto** sa rozlišuje dátami, nie ručným značkovaním: `acts` obsahuje 'hike'
//    → TRASA (prejdenie 5 + km + stúpanie); neobsahuje → MIESTO (návšteva 10, bez km).
//  · **Vrchol = 0 bodov** — platilo by sa dvakrát za to isté stúpanie.
//  · **Magistrála má PEVNÚ cenu** vypísanú na karte od prvého dňa. Platí NAMIESTO km
//    a stúpania, nie navyše.
// ─────────────────────────────────────────────────────────────────────────────

/** Ceny jednorazových položiek. Kľúče zhodné s kalkulačkou v dashboarde (`const P`). */
export const POINTS = {
  add: 20,        // pridanie výletu (fotka povinná, je v cene)
  place: 10,      // pridanie miesta (jazero, priehrada — menej práce než trasa)
  walk: 5,        // prejdený výlet
  visit: 10,      // navštívené miesto (bez km, preto viac než prejdenie trasy)
  range: 10,      // nové pohorie
  np: 10,         // nový národný park
  chko: 10,       // nové CHKO
  water: 10,      // nová vodná plocha
  country: 30,    // nová krajina
  rate: 3,        // hodnotenie (len kto trasu prešiel, bez stropu)
  collection: 50, // kompletná zbierka (9 NP / 11 pohorí / 14 CHKO)
  peak: 0,        // vrchol — kryje ho už prevýšenie
  mapPin: 0,      // bod na mape (voda, tieň, veterina) — zatiaľ von
} as const;

/** 1 bod za km. */
export const POINTS_PER_KM = 1;
/** 2 body za každých CELÝCH 100 m stúpania (nie pomerne). */
export const POINTS_PER_100M = 2;

// ── Magistrály: pevná cena namiesto km a stúpania ───────────────────────────
// Tabuľka 04 v dashboarde. Cena stojí na karte od prvého dňa — nie je to výplata po
// dokončení, ale vypísaná odmena. Všetkých 11 = 3 550 bodov = level 15; magistrály
// zámerne porušujú pravidlo „jeden výlet posunie najviac o jeden level".
export const JOURNEY_POINTS: Record<string, number> = {
  'snp-cesta-hrdinov': 1400,
  'vychodokarpatska-magistrala': 450,
  'rudna-magistrala': 450,
  'stefanikova-magistrala': 200,
  'ponitrianska-magistrala': 200,
  'nizkotatranska-hrebenovka': 200,
  'zahoracka-magistrala': 150,
  'velkofatranska-magistrala': 150,
  'poloniny': 150,
  'kysucka-magistrala': 100,
  'malofatransky-okruh': 100,
};

// Prekryv magistrál — pravidlo z dashboardu (sekcia 04):
// „Odmena patrí ÚSILIU, nie územiu." Hrebeňovka Nízkych Tatier leží vnútri Cesty hrdinov SNP.
// Kto prešiel najprv hrebeňovku a neskôr SNP, dostane oboje (dve samostatné cesty, dve úsilia).
// Kto ide rovno SNP, dostane cenu SNP a hrebeňovku má odškrtnutú ZADARMO (medaila áno, body nie).
// Body, ktoré už raz padli, sa NIKDY spätne neodoberajú.
export const JOURNEY_CONTAINS: Record<string, string[]> = {
  'snp-cesta-hrdinov': ['nizkotatranska-hrebenovka'],
};

/**
 * Ktoré obsiahnuté trasy sa pri zapísaní `journeyId` označia ako prejdené s NULOVOU výplatou.
 * Tie, ktoré už prejdené sú, sa nevracajú — ich body ostávajú.
 */
export function containedFreeWalks(journeyId: string, alreadyWalked: Set<string>): string[] {
  return (JOURNEY_CONTAINS[journeyId] ?? []).filter((id) => !alreadyWalked.has(id));
}

// ── Levely ──────────────────────────────────────────────────────────────────
// Jeden názov (PILGRIM, rozhodnuté 29. 7. — „pútnik ide niekam", DOGYPT je náboženstvo,
// Hekthorova cesta bola púť) + číslo bez stropu. Menoslov hodností ostáva voľný pre DEVOTION.
// prah(N) = (N − 1) × (15N + 20)   ·   level(p) = floor((√(1225 + 60p) − 5) ÷ 30)
// Level 2 stojí 50 bodov, každý ďalší o 30 viac. Level nikdy neklesá.
export const RANK_NAME = 'Pilgrim';

export const levelThreshold = (n: number): number => (n - 1) * (15 * n + 20);
export const levelOf = (points: number): number =>
  Math.max(1, Math.floor((Math.sqrt(1225 + 60 * Math.max(0, points)) - 5) / 30));

export interface LevelProgress {
  level: number;
  rank: string;          // 'Pilgrim'
  points: number;
  floorPoints: number;   // prah aktuálneho levelu
  nextPoints: number;    // prah nasledujúceho levelu
  toNext: number;        // koľko bodov chýba
  pct: number;           // 0–100 v rámci aktuálneho levelu (progressbar)
}

export function levelProgress(points: number): LevelProgress {
  const p = Math.max(0, Math.round(points));
  const level = levelOf(p);
  const floorPoints = levelThreshold(level);
  const nextPoints = levelThreshold(level + 1);
  const span = Math.max(1, nextPoints - floorPoints);
  return {
    level, rank: RANK_NAME, points: p, floorPoints, nextPoints,
    toNext: Math.max(0, nextPoints - p),
    pct: Math.min(100, Math.max(0, ((p - floorPoints) / span) * 100)),
  };
}

// ── Výpočet bodov za JEDEN výlet ────────────────────────────────────────────
export interface TripPointsInput {
  /** 'trail' = trasa (km + stúpanie), 'place' = miesto (jazero, priehrada — bez km). */
  kind?: 'trail' | 'place';
  km?: number;
  ascentM?: number;
  /** Pevná cena magistrály — nahrádza km aj stúpanie (nie navyše). */
  journeyId?: string;
  /** Nahodil som ho do databázy (trasa 20 / miesto 10). */
  added?: boolean;
  /** Prešiel som ho (trasa 5) / navštívil (miesto 10). */
  walked?: boolean;
  /** Dal som hodnotenie (3, bez stropu — smie len ten, kto trasu prešiel). */
  rated?: boolean;
  /** Objavenia — LEN pri prvom vstupe (volajúci si drží, čo už má). */
  newRange?: boolean;
  newNp?: boolean;
  newChko?: boolean;
  newWater?: boolean;
  newCountry?: boolean;
  /** Dokončená zbierka (9 NP / 11 pohorí / 14 CHKO) — 50. */
  completedCollection?: boolean;
}

export interface PointsRow { label: string; points: number }
export interface TripPointsResult { total: number; rows: PointsRow[] }

/**
 * Body za jeden výlet. Rovnaký rozpad, aký ukazuje kalkulačka v dashboarde — vracia aj `rows`,
 * nech sa dá zobraziť „za čo" (ⓘ pri leveli, potvrdenie po ADD TRIP), nie len súčet.
 */
export function calculateTripPoints(input: TripPointsInput): TripPointsResult {
  const kind = input.kind ?? 'trail';
  const rows: PointsRow[] = [];
  const add = (label: string, points: number) => { if (points > 0) rows.push({ label, points }); };

  if (input.added) add(kind === 'place' ? 'pridanie miesta' : 'pridanie výletu', kind === 'place' ? POINTS.place : POINTS.add);
  if (input.walked) add(kind === 'place' ? 'navštívené miesto' : 'prejdený výlet', kind === 'place' ? POINTS.visit : POINTS.walk);

  // Magistrála: pevná cena NAMIESTO km a stúpania.
  const fixed = input.journeyId ? JOURNEY_POINTS[input.journeyId] : undefined;
  if (typeof fixed === 'number') {
    add('magistrála (pevná cena)', fixed);
  } else if (kind === 'trail') {
    const km = Math.max(0, Math.round(input.km ?? 0));
    if (km > 0) add(`${km} km`, km * POINTS_PER_KM);
    const asc = Math.max(0, Math.floor(input.ascentM ?? 0));
    const ascPts = Math.floor(asc / 100) * POINTS_PER_100M;
    if (ascPts > 0) add(`${asc} m stúpania`, ascPts);
  }

  if (input.newRange) add('nové pohorie', POINTS.range);
  if (input.newNp) add('nový NP', POINTS.np);
  if (input.newChko) add('nové CHKO', POINTS.chko);
  if (input.newWater) add('nová vodná plocha', POINTS.water);
  if (input.newCountry) add('nová krajina', POINTS.country);
  if (input.completedCollection) add('kompletná zbierka', POINTS.collection);
  if (input.rated) add('hodnotenie', POINTS.rate);

  return { total: rows.reduce((s, r) => s + r.points, 0), rows };
}

// ── Súčet za profil ─────────────────────────────────────────────────────────
// Body sa v DB (zatiaľ) nekumulujú — počítajú sa z toho, čo človek reálne má: prejdené trasy,
// nahodené trasy, hodnotenia a odškrtnuté geo jednotky. Vďaka tomu je level odvoditeľný
// a nedá sa rozísť s dátami. Keď pribudne `points_ledger`, táto funkcia ostáva ako kontrola.
export interface ProfileTrailLike {
  id: string;
  km?: string | number;
  ascentM?: number;
  acts?: string[];
  author?: string;
}

export interface ProfilePointsInput {
  /** Prejdené trasy (celé objekty — km/stúpanie/aktivity). */
  walked: ProfileTrailLike[];
  /** Nahodil ich tento človek (started as author) — 20 za trasu / 10 za miesto. */
  addedIds?: Set<string>;
  /** Počet hodnotení, ktoré dal (3 za každé). */
  ratings?: number;
  /** Počet odškrtnutých geo jednotiek po kategóriách (objavenie = raz). */
  discovered?: { ranges?: number; parks?: number; chko?: number; waters?: number; countries?: number };
}

export function calculateProfilePoints(input: ProfilePointsInput): TripPointsResult {
  const rows: PointsRow[] = [];
  let journeys = 0, km = 0, ascent = 0, walks = 0, visits = 0, added = 0, addedPlaces = 0;

  for (const tr of input.walked) {
    const isPlace = !(tr.acts?.includes('hike'));
    const fixed = JOURNEY_POINTS[tr.id];
    if (typeof fixed === 'number') {
      journeys += fixed;
    } else if (!isPlace) {
      km += Math.max(0, Math.round(Number(tr.km) || 0)) * POINTS_PER_KM;
      ascent += Math.floor(Math.max(0, tr.ascentM ?? 0) / 100) * POINTS_PER_100M;
    }
    if (isPlace) visits += POINTS.visit; else walks += POINTS.walk;
    if (input.addedIds?.has(tr.id)) { if (isPlace) addedPlaces += POINTS.place; else added += POINTS.add; }
  }

  if (journeys) rows.push({ label: 'magistrály', points: journeys });
  if (added) rows.push({ label: 'pridané trasy', points: added });
  if (km) rows.push({ label: 'km', points: km });
  if (ascent) rows.push({ label: 'stúpanie', points: ascent });
  if (walks) rows.push({ label: 'prejdené trasy', points: walks });
  if (addedPlaces) rows.push({ label: 'pridané miesta', points: addedPlaces });
  if (visits) rows.push({ label: 'navštívené miesta', points: visits });

  const d = input.discovered ?? {};
  const geo: [string, number, number][] = [
    ['pohoria', d.ranges ?? 0, POINTS.range],
    ['národné parky', d.parks ?? 0, POINTS.np],
    ['CHKO', d.chko ?? 0, POINTS.chko],
    ['vodné plochy', d.waters ?? 0, POINTS.water],
    ['krajiny', d.countries ?? 0, POINTS.country],
  ];
  for (const [label, count, price] of geo) if (count > 0) rows.push({ label, points: count * price });

  const ratings = input.ratings ?? 0;
  if (ratings > 0) rows.push({ label: 'hodnotenia', points: ratings * POINTS.rate });

  return { total: rows.reduce((s, r) => s + r.points, 0), rows };
}
