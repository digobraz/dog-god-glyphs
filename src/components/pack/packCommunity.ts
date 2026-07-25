// /pack komunitná vrstva — MOCK dáta + logika (design: plany/pack-community-features-design.md).
// Fáza: UI-first, žiadna Supabase perzistencia. Všetko žije v sessionStorage mirror-och
// (rovnaký vzor ako tripShared.tsx) alebo je deterministicky odvodené z trip id (mock crowd /
// mock ľudia), aby sa hover %-rozpad a completion nemenili medzi rendermi. Backend (trip_walks,
// partner_ads, events, sk_geo) príde až po zamknutí UX — viď §BACKEND v design doc.
import type { HeroTrail } from '@/data/heroTrails.generated';
import {
  ACTIVITY_OPTIONS, VIBE_OPTIONS, PERSONALITY_OPTIONS, deriveDefaultDogAttrs,
  type ActivityTag, type TripVibe, type DogProfileAttrs, type CentralProfile,
  type DogTemperamentTag, type DogTrailTag,
} from '@/components/pack/profile/packProfile';
import type { PackDogFull } from '@/hooks/usePackUser';

export type Difficulty = 'Easy' | 'Moderate' | 'Hard' | 'Odyssey';
// D2 (LOCKED 2026-07-24): feature „Vibe" → Crowd / Ruch. Jedna jasná os = počet ľudí, žiadny
// slang („Remote" preč). Hodnoty zrkadlia SK dáta z nahadzovača → zero migrácia.
// POZOR na dvojznačnosť slova crowd v tomto module: `Crowd` (nižšie) = RUCH na trase, kdežto
// `CrowdAgg`/`CrowdSlice` = crowd-sourced agregát VŠETKÝCH hlasov (rating+difficulty+ruch).
export type Crowd = 'Empty' | 'Calm' | 'Busy';
export const DIFFICULTIES: Difficulty[] = ['Easy', 'Moderate', 'Hard'];
// Poradie = od najkľudnejšieho po najrušnejšie (F1: „Vibe zoradiť od najkľudnejšieho").
export const CROWDS: Crowd[] = ['Empty', 'Calm', 'Busy'];

// nebezpečenstvá trasy (design: Matej 2026-07-22) — hlásia ich chodci vo walked popupe, na tripe
// sa agregujú ako % (koľko % chodcov ich nahlásilo), rovnako ako difficulty/vibe rozpad.
// Matej 2026-07-23: Steep + No water preč — ostávajú len reálne „biologické" nebezpečenstvá.
export type Hazard = 'Ticks' | 'Vipers' | 'Wildlife';
export const HAZARDS: Hazard[] = ['Ticks', 'Vipers', 'Wildlife'];
export const HAZARD_EMOJI: Record<Hazard, string> = { Ticks: '🪱', Vipers: '🐍', Wildlife: '🦌' };

// Zakladatelia — každú trasu prešli minimálne 2 Dogyptians (Matej + Hekthor). Baseline walked
// count nikdy neklesne pod 2 (design: Matej 2026-07-22).
export const FOUNDER_WALKERS = 2;

// TRIPSTATS Slice B (Matej 2026-07-23) — level rebrík, počíta sa POČTOM prejdených tripov
// (LOCKED: „Počíta sa podľa počtu tripov" — NIE devotion/bones, tie žijú zvlášť v usePackIdentity).
// Názvy = DRAFT stringy, Matej doladí menoslov; prahy nelineárne (rastú s hĺbkou hry).
export interface PackLevel { name: string; min: number; }
export const PACK_LEVELS: PackLevel[] = [
  { name: 'Stray', min: 0 }, { name: 'Wanderer', min: 3 }, { name: 'Pilgrim', min: 10 },
  { name: 'Pathfinder', min: 25 }, { name: 'Devotee', min: 50 }, { name: 'Guardian', min: 100 },
  { name: 'Hero of the Pack', min: 200 },
];
export function packLevel(tripCount: number): { level: PackLevel; index: number; next: PackLevel | null; toNext: number } {
  let index = 0;
  for (let i = 0; i < PACK_LEVELS.length; i++) if (tripCount >= PACK_LEVELS[i].min) index = i;
  const next = PACK_LEVELS[index + 1] ?? null;
  return { level: PACK_LEVELS[index], index, next, toNext: next ? next.min - tripCount : 0 };
}

// Turistický profil = JEDEN zdroj naprieč platformou (design: Matej 2026-07-22 — needituje sa
// per-kategória, ale na jednom mieste). Zatiaľ MOCK placeholder; reálny profil = budúca feature.
export interface TouristProfile { blurb: string; dog: string; }
export const MOCK_PROFILE: TouristProfile = {
  blurb: 'Weekend ridge-walker, always up for a muddy climb.',
  dog: 'chill trail dog, good with everyone',
};

// „Volume guard" (design doc §A): kým trip nemá aspoň toľkoto reálnych hlasov, drží sa
// seed hodnota z nahadzovača (Matejov rating/diff/crowd), nie počítaný priemer.
export const VOLUME_THRESHOLD = 3;

// Crowd (EN labely v UI) ← `trail.crowd` (SK, dáta z nahadzovača). Rovnaké mapovanie ako
// CROWD_LABELS v PackPortal, len bez emoji prefixu (ten pridáva UI).
const SEED_CROWD: Record<string, Crowd> = { 'Ľudoprázdne': 'Empty', 'Pokojné': 'Calm', 'Rušné': 'Busy' };
export const CROWD_EMOJI: Record<Crowd, string> = { Empty: '🏔️', Calm: '🌿', Busy: '👣' };
export function seedCrowd(trail: HeroTrail): Crowd | null {
  return trail.crowd ? SEED_CROWD[trail.crowd] ?? null : null;
}

// ── deterministický PRNG z trip id (mulberry32 + FNV-1a hash) — mock hlasy/ľudia musia byť
// stabilné medzi rendermi, inak by hover %-rozpad „poskakoval". Nie Math.random. ──
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── User vote (flow „Walked", design §A) ──
export interface TripVote {
  tripId: string; rating: number; difficulty: Difficulty; crowd: Crowd; comment: string;
  when: string; hazards: Hazard[]; at: number; // when = rok/mesiac (YYYY-MM), nemusí byť presný
}

// ── Wishlist zámer / planning (design §B + §C2) ──
export type PlanIntent = 'solo' | 'partner';
export interface TripPlan { tripId: string; date: string; intent: PlanIntent; at: number; }

// ── Partner ad → Event (design §D) — VŽDY public (keď hľadáš parťáka, nemôže byť private,
// Matej 2026-07-22). Dátum benevolentný: dates[] = 2–3 návrhy termínov ALEBO prázdne + month. ──
export interface PartnerEvent {
  id: string; tripId: string; dates: string[]; month: string; socialization: string;
  host: string; at: number; joinedByMe: boolean;
  seedGoing: number; // mock počet ostatných čo idú (deterministický pre seed eventy)
  // Zavretá skupina (Matej 2026-07-25): „ktorýkoľvek člen v packu vidí výlet ALE ak
  // sú dvaja v skupine vedia tento trip vypnúť aby sa už nikto nepridal." Inzerát
  // teda ostáva VIDITEĽNÝ pre celý pack (nemení sa pravidlo z 2026-07-22), len sa
  // nedá pridať. Zamyká VÝHRADNE autor výletu — nie ten, kto sa pridal.
  closed?: boolean;
  hostIsMe?: boolean; // inzerát som vypísal ja → jediný, kto smie zamykať
}

// Som autor tohto inzerátu? `hostIsMe` sa zapisuje pri vytvorení; fallback na tvar
// mena je kvôli záznamom uloženým v localStorage pred zavedením toho poľa.
export const isMyEvent = (ev: PartnerEvent): boolean =>
  ev.hostIsMe ?? ev.host.endsWith('& your dog');

// ── Crowd-sourced agregát (design §A: priemer na rating, konsenzus + %-rozpad na diff/ruch) ──
export interface CrowdSlice<T extends string> { value: T; pct: number; count: number; }
export interface CrowdAgg {
  walkedCount: number;
  belowThreshold: boolean; // true → zobrazuje sa seed, nie počítaný agregát
  rating: number;
  difficulty: Difficulty;
  difficultyBreakdown: CrowdSlice<Difficulty>[];
  crowd: Crowd | null;
  crowdBreakdown: CrowdSlice<Crowd>[];
  hazardBreakdown: CrowdSlice<Hazard>[]; // % chodcov čo nahlásili dané nebezpečenstvo
}

// deterministicky vygeneruje N mock hlasov (diff+ruch) sústredených okolo seed hodnoty, s
// rozptylom nech %-rozpad vyzerá živo (napr. „67% Moderate · 20% Hard · 13% Easy").
function mockVotes(trail: HeroTrail): { diffs: Difficulty[]; crowds: Crowd[]; ratings: number[]; hazards: Hazard[][] } {
  const rnd = mulberry32(hashStr(trail.id));
  // min FOUNDER_WALKERS (Matej + Hekthor) + 0..14 komunitných → nikdy pod 2 (Matej 2026-07-22).
  const n = FOUNDER_WALKERS + Math.floor(rnd() * 15);
  const sCrowd = seedCrowd(trail);
  const diffs: Difficulty[] = [];
  const crowds: Crowd[] = [];
  const ratings: number[] = [];
  const hazards: Hazard[][] = [];
  for (let i = 0; i < n; i++) {
    // prvé 2 hlasy = zakladatelia (presne seed hodnoty), zvyšok komunita s rozptylom
    const founder = i < FOUNDER_WALKERS;
    // Odyssey (journey) = intrinsická náročnosť, NIE komunitou hlasovaná — vždy trail.diff,
    // žiadny random rozptyl na Easy/Moderate/Hard (inak by 770 km magistrála ukázala „13% Easy").
    diffs.push(trail.diff === 'Odyssey' || founder || rnd() < 0.62 ? trail.diff : DIFFICULTIES[Math.floor(rnd() * 3)]);
    if (sCrowd) crowds.push(founder || rnd() < 0.6 ? sCrowd : CROWDS[Math.floor(rnd() * 3)]);
    else crowds.push(CROWDS[Math.floor(rnd() * 3)]);
    ratings.push(founder ? trail.stars : Math.min(5, Math.max(1, trail.stars + (rnd() < 0.5 ? 0 : rnd() < 0.5 ? 1 : -1))));
    // nebezpečenstvá: každý chodec nahlási 0..2 (deterministicky) — agregujú sa na %
    const hz: Hazard[] = [];
    for (const h of HAZARDS) if (rnd() < 0.22) hz.push(h);
    hazards.push(hz);
  }
  return { diffs, crowds, ratings, hazards };
}

function breakdown<T extends string>(votes: T[], order: T[]): CrowdSlice<T>[] {
  const total = votes.length || 1;
  return order
    .map((value) => ({ value, count: votes.filter((v) => v === value).length }))
    .filter((s) => s.count > 0)
    .map((s) => ({ ...s, pct: Math.round((s.count / total) * 100 * 10) / 10 }))
    .sort((a, b) => b.count - a.count);
}

// Crowd-sourced agregát = seed (nahadzovač) + deterministické mock hlasy + prípadný hlas usera.
// Pod prahom (VOLUME_THRESHOLD) sa vracia seed (rating=stars, difficulty=seed, crowd=seedCrowd).
export function crowdAggregate(trail: HeroTrail, userVote?: TripVote | null): CrowdAgg {
  const { diffs, crowds, ratings, hazards } = mockVotes(trail);
  if (userVote) {
    diffs.push(userVote.difficulty); crowds.push(userVote.crowd); ratings.push(userVote.rating);
    hazards.push(userVote.hazards ?? []);
  }
  const walkedCount = ratings.length; // vždy ≥ FOUNDER_WALKERS
  const sCrowd = seedCrowd(trail);
  // hazard % = koľko % CHODCOV nahlásilo dané nebezpečenstvo (denominátor = walkedCount, nie
  // počet zmienok — jeden chodec môže nahlásiť viac). Nezávisí od seed guardu.
  const hB: CrowdSlice<Hazard>[] = HAZARDS
    .map((value) => ({ value, count: hazards.filter((hz) => hz.includes(value)).length }))
    .filter((s) => s.count > 0)
    .map((s) => ({ ...s, pct: Math.round((s.count / walkedCount) * 100) }))
    .sort((a, b) => b.count - a.count);
  if (walkedCount < VOLUME_THRESHOLD) {
    return {
      walkedCount, belowThreshold: true,
      rating: trail.stars,
      difficulty: trail.diff,
      difficultyBreakdown: [{ value: trail.diff, pct: 100, count: walkedCount }],
      crowd: sCrowd,
      crowdBreakdown: sCrowd ? [{ value: sCrowd, pct: 100, count: walkedCount }] : [],
      hazardBreakdown: hB,
    };
  }
  const dB = breakdown(diffs, DIFFICULTIES);
  const cB = breakdown(crowds, CROWDS);
  const avg = ratings.reduce((s, r) => s + r, 0) / walkedCount;
  return {
    walkedCount, belowThreshold: false,
    rating: Math.round(avg * 10) / 10,
    difficulty: dB[0]?.value ?? trail.diff,
    difficultyBreakdown: dB,
    crowd: cB[0]?.value ?? sCrowd,
    crowdBreakdown: cB,
    hazardBreakdown: hB,
  };
}

// ── SK geo taxonómia (completion „% SVK", design §C1) — MOCK kánonický dataset. Reálne názvy,
// ale nie vyčerpávajúci — cieľ je zamknúť mechaniku (5 kategórií, % per kategória + celkové).
// Reálny dataset príde z geo-taxonómie ([[project_dogypt_trails_geo_taxonomy_2026-07-14]]). ──
export type GeoCategory = 'journeys' | 'ranges' | 'parks' | 'chko' | 'peaks' | 'waters';
export interface GeoCategoryDef { key: GeoCategory; label: string; icon: string; units: string[]; }

// F2/Fáza 2 (Matej 2026-07-24: „Vymeniť ikony pri range / national park / CHKO a pod."):
// `ranges` a `chko` mali OBE `forest.svg` — dve kategórie vedľa seba s identickou ikonkou.
// Teraz: ranges → `layers` (hrebene nad sebou) · parks → `forest` (sun sa k národnému parku
// nehodil) · chko → `badge` (chránené = pečať/odznak) · peaks → `trophy` · waters → vlnky.
// Všetko z existujúcej brand sady, žiadny nový asset.
export const SK_GEO: GeoCategoryDef[] = [
  { key: 'journeys', label: 'Long-distance trails', icon: 'walk', units: [
    'Cesta hrdinov SNP', 'Rudná magistrála', 'Východokarpatská magistrála', 'Tatranská magistrála',
    'Veľkofatranská magistrála', 'Ponitrianska magistrála', 'Kysucká magistrála', 'Záhorácka magistrála',
    'Štefánikova magistrála', 'Poloniny',
  ] },
  { key: 'ranges', label: 'Mountain ranges', icon: 'layers', units: [
    // 26 kurátorovaných pohorí = zhodné s POHORIA v regions.ts (chrbtica filtra), zoradené podľa výšky dominanty.
    'Vysoké Tatry', 'Západné Tatry', 'Belianske Tatry', 'Nízke Tatry', 'Malá Fatra', 'Chočské vrchy',
    'Veľká Fatra', 'Slovenské rudohorie', 'Poľana', 'Vtáčnik', 'Oravská Magura', 'Kremnické vrchy',
    'Volovské vrchy', 'Levočské vrchy', 'Kysucké Beskydy', 'Bukovské vrchy', 'Strážovské vrchy', 'Branisko',
    'Slanské vrchy', 'Vihorlat', 'Javorníky', 'Považský Inovec', 'Štiavnické vrchy', 'Biele Karpaty',
    'Tribeč', 'Malé Karpaty',
  ] },
  { key: 'parks', label: 'National parks', icon: 'forest', units: [
    'Tatranský NP', 'NP Nízke Tatry', 'NP Malá Fatra', 'NP Slovenský raj', 'NP Muránska planina',
    'NP Poloniny', 'NP Slovenský kras', 'NP Veľká Fatra', 'Pieninský NP',
  ] },
  { key: 'chko', label: 'Protected areas (CHKO)', icon: 'badge', units: [
    // 14 CHKO na Slovensku (kompletné, Matej 2026-07-24) — logá ŠOP SR sopsr.sk/img/posobnost.
    'Malé Karpaty', 'Biele Karpaty', 'Strážovské vrchy', 'Kysuce', 'Horná Orava',
    'Ponitrie', 'Poľana', 'Cerová vrchovina', 'Vihorlat', 'Latorica',
    'Štiavnické vrchy', 'Východné Karpaty', 'Dunajské luhy', 'Záhorie',
  ] },
  { key: 'peaks', label: 'Highest peaks', icon: 'trophy', units: [
    'Gerlachovský štít', 'Ďumbier', 'Veľký Kriváň', 'Ostrá (V. Fatra)', 'Záruby',
    'Vápeč', 'Inovec', 'Poľana (vrchol)', 'Kľak',
  ] },
  // F2 (Matej 2026-07-24): ikonka `water` vykresľovala DŽBÁN → `water-waves` = tri vlnky,
  // rovnaká geometria ako modrý vodný pin na mape (waterIcon() v PackPortal).
  { key: 'waters', label: 'Top waters', icon: 'water-waves', units: [
    'Liptovská Mara', 'Oravská priehrada', 'Zemplínska šírava', 'Sĺňava', 'Domaša',
    'Ružín', 'Štrbské pleso', 'Zelené pleso',
  ] },
];

// pohorie (ranges unit) → NP odznak (TRIPSTATS medaily, Matej 2026-07-23 zadanie bod 1).
// DRAFT geo dáta — Matej doaudituje neskôr. Hodnoty MUSIA byť z SK_GEO 'parks' units.
const RANGE_TO_NP: Record<string, string> = {
  'Malá Fatra': 'NP Malá Fatra', 'Nízke Tatry': 'NP Nízke Tatry', 'Veľká Fatra': 'NP Veľká Fatra',
  'Vysoké Tatry': 'Tatranský NP', 'Západné Tatry': 'Tatranský NP', 'Belianske Tatry': 'Tatranský NP',
  'Bukovské vrchy': 'NP Poloniny',
};
// pohorie → CHKO odznak. Hodnoty MUSIA byť z SK_GEO 'chko' units.
const RANGE_TO_CHKO: Record<string, string> = {
  'Malé Karpaty': 'Malé Karpaty', 'Biele Karpaty': 'Biele Karpaty', 'Strážovské vrchy': 'Strážovské vrchy',
  'Poľana': 'Poľana', 'Vihorlat': 'Vihorlat', 'Kysucké Beskydy': 'Kysuce', 'Oravská Magura': 'Horná Orava',
  'Považský Inovec': 'Ponitrie', 'Vtáčnik': 'Ponitrie', 'Tribeč': 'Ponitrie',
};
// keyword v názve tripu → peak / water jednotka (mock, ľahké párovanie)
const PEAK_KEYWORDS: Array<[string, string]> = [
  ['záruby', 'Záruby'], ['vápeč', 'Vápeč'], ['inovec', 'Inovec'], ['kľak', 'Kľak'],
];
// Dominantný vrchol pohoria → získaš ho keď prejdeš to pohorie (hrebeň magistrály cez neho vedie).
// Fallback k slabému name-matchingu, lebo žiadna trasa nemá vrchol v názve. Matej 2026-07-24:
// „prešiel som velky krivan aj dumbier a vlastne všetko okrem gerlachu". Gerlachovský štít ZÁMERNE
// chýba — dá sa len s horským vodcom, takže ostáva nezískaný kým naň nebude explicitný trip.
const PEAK_RANGE: Record<string, string> = {
  'Ďumbier': 'Nízke Tatry', 'Veľký Kriváň': 'Malá Fatra', 'Ostrá (V. Fatra)': 'Veľká Fatra',
  'Záruby': 'Malé Karpaty', 'Vápeč': 'Strážovské vrchy', 'Inovec': 'Považský Inovec',
  'Poľana (vrchol)': 'Poľana', 'Kľak': 'Malá Fatra',
};
// F2 (2026-07-25): pôvodné WATER_KEYWORDS boli mock a odškrtávali NESPRÁVNE plochy —
// `'priehrad' → Ružín` znamenalo, že „Orešianska priehrada" (ani „Oravská priehrada") odškrtla
// RUŽÍN; `'pleso' → Štrbské pleso` odškrtlo Štrbské za ktorékoľvek pleso; `'jazer' → Ružín`
// detto. A naopak: reálny trip „Liptovská Mara" neodškrtol jednotku „Liptovská Mara", lebo
// pre ňu keyword neexistoval. TRIPSTATS tak tvrdil prejdené plochy, kde si nebol, a zamlčal tie,
// kde si bol.
// Teraz: názov tripu sa páruje s NÁZVOM JEDNOTKY zo SK_GEO (bez diakritiky, case-insensitive).
// Nič sa nefabrikuje — trip mimo kurátorovanej osmičky (Kráľová, Palcmanská Maša, Orešianska
// priehrada) neodškrtne nič, čo je správne: „Top waters" je cieľovník, nie zoznam existujúcich
// tripov.
const deaccent = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const WATER_UNITS: string[] = SK_GEO.find((c) => c.key === 'waters')?.units ?? [];

// Magistrála prechádza cez viacero pohorí → odškrtne ich všetky (nie len samú seba).
// DRAFT mapa (bez polygónov pohorí — nahradiť point-in-polygon až budú PostGIS geo_pohorie).
// Hodnoty MUSIA byť z 'ranges' units v SK_GEO (12 kurátorovaných). Kľúč = trail.id journey.
const JOURNEY_RANGES: Record<string, string[]> = {
  // Overené 2026-07-24 proti Wikipédii + reálnej OSM stope: SNP ide cez Biele Karpaty (0,1 km),
  // NIE cez Považský Inovec (29 km preč — pôvodná chyba ručnej mapy). Geo-engine to prepočíta presne.
  'snp-cesta-hrdinov': ['Malé Karpaty', 'Biele Karpaty', 'Strážovské vrchy', 'Malá Fatra', 'Kremnické vrchy', 'Veľká Fatra', 'Nízke Tatry', 'Slovenské rudohorie', 'Volovské vrchy'],
  // Zladené 2026-07-24 s researchom: Rudná ide cez Štiavnické vrchy + Poľanu + Slovenské rudohorie
  // (Muránska planina/Stolica). NIE Volovské vrchy (to je až za Stolicou, na trase nie je).
  // Pohronský Inovec + Javorie sú mimo 26 pohorí → nezobraziteľné.
  'rudna-magistrala': ['Štiavnické vrchy', 'Poľana', 'Slovenské rudohorie'],
  'velkofatranska-magistrala': ['Veľká Fatra'],
  // Zladené 2026-07-24: Handlová (Vtáčnik) → Nitra (Tribeč). NIE Považský Inovec ani Strážovské
  // vrchy (iné pohoria, na trase nie sú — Považský Inovec bola rovnaká chyba ako pri SNP vyššie).
  'ponitrianska-magistrala': ['Vtáčnik', 'Tribeč'],
  // Zladené 2026-07-24: reálne ide cez Turzovskú vrchovinu (+ Mor.-sliezske Beskydy pri Makove),
  // OBE sú mimo 26 pohorí → prázdne. Predtým chybne Kysucké Beskydy/Javorníky/Malá Fatra (tie na
  // trase nie sú — Javorníky sú len vzdialený výhľad).
  'kysucka-magistrala': [],
  // Zladené 2026-07-24: Skalica → Biele Karpaty hraničný hrebeň → Borská nížina (Závod). NIE Malé
  // Karpaty (tie sú južnejšie). Myjavská/Chvojnická pahorkatina + Borská nížina sú mimo 26 pohorí.
  'zahoracka-magistrala': ['Biele Karpaty'],
  // Zladené 2026-07-24: Bradlo → Ivanka pri Dunaji cez CELÝ hrebeň Malých Karpát. Biele Karpaty
  // na trase nie sú. Myjavská pahorkatina + Podunajská rovina sú mimo 26 pohorí.
  'stefanikova-magistrala': ['Malé Karpaty'],
  'malofatransky-okruh': ['Malá Fatra'],
  // Zladené 2026-07-24: Ubľa → Minčol cez Bukovské vrchy + Nízke Beskydy + Čergov. NIE Vihorlat
  // (ten je južnejšie, na trase nie je). Nízke Beskydy (Laborecká/Ondavská vrch.) + Čergov = mimo 26.
  'vychodokarpatska-magistrala': ['Bukovské vrchy'],
  'poloniny': ['Bukovské vrchy'],
};

// Magistrála križuje aj NP ktoré NIE SÚ viazané na 26 pohorí (Slovenský raj, Muránska planina,
// Slovenský kras, Pieniny) → priamy zoznam, inak sú tie NP štrukturálne nezarobiteľné.
// DRAFT — Matej audituje. Hodnoty MUSIA byť z SK_GEO 'parks' units.
const JOURNEY_PARKS: Record<string, string[]> = {
  'snp-cesta-hrdinov': ['NP Slovenský raj', 'NP Muránska planina'],
  'rudna-magistrala': ['NP Muránska planina'], // NIE Slovenský raj — je až za Stolicou (2026-07-24)
};

// ktoré geo jednotky daný trip „odškrtne" (design §C1: odškrtnutie vyžaduje trip)
export function unitsForTrail(trail: HeroTrail): Partial<Record<GeoCategory, string[]>> {
  const out: Partial<Record<GeoCategory, string[]>> = {};
  const rangeUnits = SK_GEO.find((c) => c.key === 'ranges')!.units;
  const rangeSet = new Set<string>();
  // journey (diaľková magistrála) odškrtne samú seba podľa názvu + pohoria cez ktoré prechádza
  if (trail.acts?.includes('journey')) {
    const jUnits = SK_GEO.find((c) => c.key === 'journeys')!.units;
    if (jUnits.includes(trail.name)) out.journeys = [trail.name];
    (JOURNEY_RANGES[trail.id] ?? []).forEach((r) => { if (rangeUnits.includes(r)) rangeSet.add(r); });
  }
  if (rangeUnits.includes(trail.region)) rangeSet.add(trail.region);
  if (rangeSet.size) out.ranges = Array.from(rangeSet);
  // NP/CHKO sa odvádzajú z rangeSet (pohoria trailu + journey crossings), NIE z trail.region priamo
  // — inak by magistrály (napr. SNP) nezarobili NP/CHKO ktoré ich trasa križuje.
  const parkSet = new Set<string>(), chkoSet = new Set<string>();
  rangeSet.forEach((r) => { if (RANGE_TO_NP[r]) parkSet.add(RANGE_TO_NP[r]); if (RANGE_TO_CHKO[r]) chkoSet.add(RANGE_TO_CHKO[r]); });
  // + NP viazané priamo na magistrálu (Slovenský raj, Muránska planina… mimo 26 pohorí)
  if (trail.acts?.includes('journey')) (JOURNEY_PARKS[trail.id] ?? []).forEach((p) => parkSet.add(p));
  if (parkSet.size) out.parks = Array.from(parkSet);
  if (chkoSet.size) out.chko = Array.from(chkoSet);
  const name = trail.name.toLowerCase();
  // vrcholy = zbieraj VŠETKY (nie prvý): name-keyword + dominantný vrchol každého prejdeného pohoria
  const peakSet = new Set<string>();
  PEAK_KEYWORDS.forEach(([kw, p]) => { if (name.includes(kw)) peakSet.add(p); });
  Object.entries(PEAK_RANGE).forEach(([peak, range]) => { if (rangeSet.has(range)) peakSet.add(peak); });
  if (peakSet.size) out.peaks = Array.from(peakSet);
  // voda: názov tripu musí obsahovať názov jednotky (bez diakritiky) — „Liptovská Mara" →
  // jednotka „Liptovská Mara". Žiadne fuzzy keywordy, ktoré odškrtávali cudzie plochy.
  const nameFlat = deaccent(trail.name);
  const waters = WATER_UNITS.filter((u) => nameFlat.includes(deaccent(u)));
  if (waters.length) out.waters = waters;
  return out;
}

// counts (TRIPSTATS Slice A, Matej 2026-07-23 zadanie bod 1) — ADITÍVNE pole: koľko prejdených
// tripov odškrtlo danú jednotku (per-unit rozklad + farebné pills v TripStatsPanel). done/total/pct
// NEMENENÉ — dead export MySlovakiaDashboard ich stále číta v pôvodnom tvare.
export interface CategoryCompletion { key: GeoCategory; label: string; icon: string; done: string[]; total: number; pct: number; counts: Record<string, number>; }
export interface SlovakiaCompletion { categories: CategoryCompletion[]; overallPct: number; doneUnits: number; totalUnits: number; }

export function computeCompletion(walkedTrails: HeroTrail[]): SlovakiaCompletion {
  const doneByCat: Record<GeoCategory, Set<string>> = { journeys: new Set(), ranges: new Set(), parks: new Set(), chko: new Set(), peaks: new Set(), waters: new Set() };
  const countByCat: Record<GeoCategory, Record<string, number>> = { journeys: {}, ranges: {}, parks: {}, chko: {}, peaks: {}, waters: {} };
  for (const tr of walkedTrails) {
    const units = unitsForTrail(tr);
    (Object.keys(units) as GeoCategory[]).forEach((k) => units[k]!.forEach((u) => {
      doneByCat[k].add(u);
      countByCat[k][u] = (countByCat[k][u] ?? 0) + 1;
    }));
  }
  const categories: CategoryCompletion[] = SK_GEO.map((c) => {
    const done = c.units.filter((u) => doneByCat[c.key].has(u));
    return { key: c.key, label: c.label, icon: c.icon, done, total: c.units.length, pct: Math.round((done.length / c.units.length) * 100), counts: countByCat[c.key] };
  });
  const doneUnits = categories.reduce((s, c) => s + c.done.length, 0);
  const totalUnits = categories.reduce((s, c) => s + c.total, 0);
  return { categories, overallPct: Math.round((doneUnits / totalUnits) * 100), doneUnits, totalUnits };
}

// ── mock „ostatní ľudia" (design §C2 „kto sa tiež chystá" + §D účastníci eventu) ──
export interface MockPerson { name: string; dog: string; date: string; }
const NAME_POOL = ['Zuzka', 'Peter', 'Lucia', 'Martin', 'Katka', 'Tomáš', 'Ivana', 'Jozef', 'Simona', 'Andrej'];
const DOG_POOL = ['Bady', 'Cézar', 'Lola', 'Rocky', 'Bella', 'Max', 'Daisy', 'Argo', 'Nela', 'Tobi'];

// ── mock zoznam členov pre companion autocomplete (Matej 2026-07-23 — „fotky iných členov ak
// začneš písať ich meno"). Reálny zoznam členov príde z DB (pack_members) po zamknutí UX.
// A0 (Fable-5 amendment, plany/zadanie-profil-messaging-2026-07-23.md §10) — rozšírené o id,
// packNumber, avatarUrl a odvodené profil-atribúty (dog + human), aby messaging dedup/perzistencia
// a profil snippet na tripe mali čo zobraziť bez ďalšieho kola. ──
export interface MockMember {
  name: string;
  dog: string;
  id: string;                                    // stabilný slug z mena, dedup kľúč pre konverzácie
  packNumber: number;                             // deterministické poradové číslo (Dogyptian #N)
  avatarUrl?: string;                             // doplní sa neskôr (avatar upload)
  attrs: DogProfileAttrs;                         // pes: training/socialization/energy/… (packProfile.ts)
  human: { interests: ActivityTag[]; vibes: TripVibe[] }; // človek: záujmy + preferovaný vibe tripov
}

// slug z mena + stabilný suffix pri kolízii (dnes NAME_POOL nemá duplicity, ale zoznam sa môže rozrásť)
function slugify(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function uniqueSlug(base: string, taken: Set<string>): string {
  let slug = base;
  let n = 2;
  while (taken.has(slug)) { slug = `${base}-${n}`; n += 1; }
  taken.add(slug);
  return slug;
}

const takenSlugs = new Set<string>();
export const MOCK_MEMBER_POOL: MockMember[] = NAME_POOL.map((name, i) => {
  const dog = DOG_POOL[i];
  const id = uniqueSlug(slugify(name) || `member-${i}`, takenSlugs);
  const rnd = mulberry32(hashStr(`${id}:member`));
  const packNumber = 12 + Math.floor(rnd() * (4800 - 12));
  const interests = pickN(ACTIVITY_OPTIONS.map((o) => o.value), 2 + Math.floor(rnd() * 2), rnd); // 2–3
  const vibes = pickN(VIBE_OPTIONS.map((o) => o.value), 1 + Math.floor(rnd() * 2), rnd);          // 1–2
  return {
    name, dog, id, packNumber,
    avatarUrl: undefined,
    attrs: deriveDefaultDogAttrs(id),
    human: { interests, vibes },
  };
});

// Demo seed — pár mock členov s vyplneným psím BIO + tagmi, aby read-profil (/pack/u/:id)
// nebol prázdny pri prehliadke. Placeholder content (reálni useri dostanú vlastné dáta po
// Supabase perzistencii profilu). Hodnoty musia byť z DOG_TEMPERAMENT_TAGS / DOG_TRAIL_TAGS.
const MOCK_DOG_BIOS: Record<string, { bio: string; temperament: DogTemperamentTag[]; trail: DogTrailTag[] }> = {
  martin: {
    bio: 'Rescue mutt with more energy than sense. Will find every puddle within 2 km and lie down in it.',
    temperament: ['playful', 'friendly', 'social'],
    trail: ['dogs_ok', 'kids_ok', 'loves_water', 'long_distance'],
  },
  zuzka: {
    bio: 'Calm old soul. Prefers a slow, sniff-heavy walk over any summit. Great with pups.',
    temperament: ['calm', 'friendly'],
    trail: ['dogs_ok', 'kids_ok', 'slow_pace'],
  },
};
MOCK_MEMBER_POOL.forEach((m) => {
  const seed = MOCK_DOG_BIOS[m.id];
  if (seed) m.attrs = { ...m.attrs, bio: seed.bio, tags: { temperament: seed.temperament, trail: seed.trail } };
});

// ── FÁZA 3: TripProfileCard → buddy list (zadanie-trips-launch-2026-07-24) ──────────────────
// „Prepojiť pripravené profily do TRIP vrstvy." Karta existovala len ako preview na spodku
// PackProfile; tu sa dopĺňa to, čo jej chýbalo, aby sa dala vykresliť pre CUDZIEHO člena:
//   1. KTO ide na výlet — `ev.seedGoing` bol len POČET, nie zoznam ľudí.
//   2. PREKLAD MockMember → CentralProfile + PackDogFull[], čo karta žiada.
// Oboje deterministické z `id` (mulberry32), rovnako ako mockVotes/deriveDefaultDogAttrs —
// zoznam ľudí sa nesmie medzi rendermi prehadzovať.

/** Kto ide na plánovaný výlet (mock). Host je zvlášť — je to meno, nie člen poolu. */
export function eventGoingMembers(ev: PartnerEvent): MockMember[] {
  const rnd = mulberry32(hashStr(`${ev.id}:going`));
  const hostFirst = ev.host.split(' ')[0];
  const pool = MOCK_MEMBER_POOL.filter((m) => m.name !== hostFirst);
  return pickN(pool, Math.min(ev.seedGoing, pool.length), rnd);
}

/** MockMember → čo TripProfileCard žiada. Trip-tier polia (languages/personality/smoke)
 *  sa dopĺňajú deterministicky, inak by karta cudzieho člena bola prázdna a vyzeralo by to
 *  ako rozbité — rovnaký dôvod, prečo MOCK_DOG_BIOS seeduje psie BIO. */
export function mockMemberProfile(m: MockMember): { profile: CentralProfile; dogs: PackDogFull[] } {
  const rnd = mulberry32(hashStr(`${m.id}:tripcard`));
  const personality = pickN(PERSONALITY_OPTIONS.map((o) => o.value), 3 + Math.floor(rnd() * 3), rnd);
  const languages = ['SK', ...(rnd() < 0.6 ? ['EN'] : []), ...(rnd() < 0.25 ? ['DE'] : [])];
  const dogId = `${m.id}-dog`;
  return {
    profile: {
      human: {
        interests: m.human.interests,
        vibes: m.human.vibes,
        languages,
        hobbies: [], intents: [],
        personality,
        smoke: rnd() < 0.25 ? 'yes' : 'no',
        visibility: {}, // žiadne override → platí DEFAULT_VISIBILITY (languages/interests/vibes = trip)
      },
      dogs: { [dogId]: m.attrs },
      updatedAt: new Date(0).toISOString(),
    },
    dogs: [{
      id: dogId,
      dog_name: m.dog,
      cloudinary_main_url: null,
      selections: null,
      created_at: new Date(0).toISOString(),
      pack_number: m.packNumber,
    }],
  };
}

// deterministicky vyberie n unikátnych prvkov z pool pomocou danej PRNG inštancie (rnd musí byť
// zdieľaná so zvyškom volania, inak by sa poradie hashov posunulo).
function pickN<T>(pool: T[], n: number, rnd: () => number): T[] {
  const remaining = [...pool];
  const out: T[] = [];
  const count = Math.min(n, remaining.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rnd() * remaining.length);
    out.push(remaining.splice(idx, 1)[0]);
  }
  return out;
}

const DAY_MS = 86400000;

// deterministický zoznam 0..3 ľudí čo sa tiež chystajú na daný trip
export function mockPlannersFor(tripId: string, nowMs: number): MockPerson[] {
  const rnd = mulberry32(hashStr(`${tripId}:planners`));
  const count = Math.floor(rnd() * 4); // 0..3
  const out: MockPerson[] = [];
  for (let i = 0; i < count; i++) {
    const name = NAME_POOL[Math.floor(rnd() * NAME_POOL.length)];
    const dog = DOG_POOL[Math.floor(rnd() * DOG_POOL.length)];
    const date = new Date(nowMs + (2 + Math.floor(rnd() * 20)) * DAY_MS).toISOString().slice(0, 10);
    out.push({ name, dog, date });
  }
  return out;
}

// pár seed VEREJNÝCH eventov (design §D — EVENTS sa „aktivuje", nesmie byť prázdne pri prvom
// otvorení). Referencuje reálne tripy z HERO_TRAILS. nowMs kvôli deterministickým budúcim dátam.
export function mockEventsSeed(trails: HeroTrail[], nowMs: number): PartnerEvent[] {
  const picks = trails.slice(0, 3);
  return picks.map((tr, i) => {
    const rnd = mulberry32(hashStr(`${tr.id}:event`));
    // benevolentný termín: 2 navrhnuté dátumy (Matej 2026-07-22 — nemusí byť presný)
    const d1 = new Date(nowMs + (3 + i * 4) * DAY_MS).toISOString().slice(0, 10);
    const d2 = new Date(nowMs + (6 + i * 4) * DAY_MS).toISOString().slice(0, 10);
    return {
      id: `seed-event-${i}`,
      tripId: tr.id,
      dates: [d1, d2],
      month: d1.slice(0, 7),
      socialization: ['Great with everyone', 'Prefers small calm dogs', 'Needs active playmates'][i] ?? 'Open to all',
      host: ['Zuzka & Bady', 'Martin & Cézar', 'Lucia & Lola'][i] ?? 'Dogyptian',
      at: nowMs - i * DAY_MS,
      joinedByMe: false,
      seedGoing: 1 + Math.floor(rnd() * 4), // 1..4 už idú
    };
  });
}

// ── sessionStorage mirrors (rovnaký vzor ako tripShared.tsx — NIE Supabase) ──
// v2: TripVote pribudlo when/hazards, PartnerEvent prešiel na dates[]/month (Matej 2026-07-22) —
// bump verzie zahodí staré nekompatibilné dáta zo sessionStorage (inak ev.dates undefined → crash).
const VOTES_KEY = 'trp-votes-v2';
const PLANS_KEY = 'trp-plans';
const EVENTS_KEY = 'trp-events-v2';

function readJson<T>(key: string, fallback: T): T {
  try { const raw = sessionStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}
function writeJson(key: string, val: unknown): void {
  try { sessionStorage.setItem(key, JSON.stringify(val)); } catch { /* private mode / quota — non-fatal */ }
}

export const readVotes = () => readJson<Record<string, TripVote>>(VOTES_KEY, {});
export const writeVotes = (v: Record<string, TripVote>) => writeJson(VOTES_KEY, v);
export const readPlans = () => readJson<TripPlan[]>(PLANS_KEY, []);
export const writePlans = (p: TripPlan[]) => writeJson(PLANS_KEY, p);
export const readEvents = () => readJson<PartnerEvent[]>(EVENTS_KEY, []);
export const writeEvents = (e: PartnerEvent[]) => writeJson(EVENTS_KEY, e);
