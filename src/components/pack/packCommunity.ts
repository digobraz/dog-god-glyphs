// /pack komunitná vrstva — logika + MOCK ľudia (design: plany/pack-community-features-design.md).
// Perzistencia (2026-07-30, issue #32): hodnotenia / plány / inzeráty už NIE sú sessionStorage
// mirror — idú cez `@/lib/packStore` (localStorage + write-through do Supabase: trip_votes,
// user_trips, trip_events). Fabrikovaní členovia a ich obsah sú PREČ (2026-08-03, viď nižšie);
// deterministicky odvodený z trip id ostáva len mock crowd %-rozpad, nech hover neposkakuje.
import type { HeroTrail } from '@/data/heroTrails.generated';
import {
  ACTIVITY_OPTIONS, VIBE_OPTIONS,
  type ActivityTag, type TripVibe, type DogProfileAttrs,
  type DogTemperamentTag, type DogTrailTag,
} from '@/components/pack/profile/packProfile';
import { PACK_KEYS, readJson, persistVotes, persistPlans, persistEvents, readLocalTrailMeta } from '@/lib/packStore';
import { calculateProfilePoints, calculateTripPoints, JOURNEY_POINTS, POINTS, type PointsRow, type TripPointsResult } from '@/lib/tripPoints';
import { authorOf, AUTHOR_FALLBACK } from '@/components/pack/tripShared';
import { countryName, trailCountry } from '@/lib/countryGeo';

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

// Zakladatelia — koľko Dogyptianov (Matej + Hekthor) je v hlase VŽDY dvaja, pre trasy z
// `founderWalkers()` nižšie. Matej 2026-08-03: „začíname so všetkým do nuly" — toto číslo
// je len konštanta na počítanie labelu („+X Dogyptians"), NIE záruka, že KAŽDÁ trasa má
// aspoň toľkoto hlasov. Magistrály, ktoré zakladatelia neprešli, a ADD-flow tripy iných
// členov majú `founderWalkers(trail) === 0` → `walkedCount` môže byť 0.
export const FOUNDER_WALKERS = 2;

// LEVELY sú v `@/lib/tripPoints` (issue #33, 2026-07-30).
// Zrušené: `PACK_LEVELS` so siedmimi menami (Stray → Hero of the Pack) + `packLevel(tripCount)`.
// Dôvod (dashboard tab Mapa, sekcia 05): lock „level = počet tripov" z 23. 7. padol 25. 7. —
// level sa počíta z BODOV, menoslov hodností ostáva voľný pre DEVOTION a rebrík je jedno meno
// (PILGRIM) + číslo bez stropu. Duplicita s odznakmi (tie tiež rátali výlety) tým zaniká.

// MOCK_PROFILE (vymyslené „About you" + vymyslená veta o psovi) ZMAZANÝ 2026-08-03
// (Matej: „nesmie sa nič dogenerovať!"). Reálny profil žije v `profile/packProfile.ts`
// (`useProfile()` → `human.dogVoiceBio` / `human.bio`) a formulár inzerátu ho číta odtiaľ;
// keď je prázdny, ostane prázdny.

// „Volume guard" (design doc §A): kým trip nemá aspoň toľkoto reálnych hlasov, drží sa
// seed hodnota z nahadzovača (Matejov rating/diff/crowd), nie počítaný priemer.
export const VOLUME_THRESHOLD = 3;

// Crowd (EN labely v UI) ← `trail.crowd` (SK, dáta z nahadzovača). Rovnaké mapovanie ako
// CROWD_LABELS v PackMap, len bez emoji prefixu (ten pridáva UI).
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
  // `seedGoing` (mock počet ostatných, čo idú) zmazané 2026-08-04 — po purge sa všade
  // zapisovala 0 a jediné, čo robilo, bolo že karta vedela ukázať účastníkov, ktorí
  // neexistujú. Počet „ide N" sa teraz ráta z reálnej partie (`get_trip_party`).
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

// Magistrály, ktoré zakladatelia (Matej + Hekthor) reálne prešli — Matej 2026-08-03: „iba SNP
// a Poloniny". POZOR: `FOUNDER_WALKED_JOURNEY_IDS` v `tripShared.tsx:282` je DRUHÁ kópia tohto
// zoznamu a dnes navyše obsahuje `'stefanikova-magistrala'` (nesprávne) — needituje sa tu (import
// odtiaľ by nezaviedol cyklus, ale kým sa tá kópia neopraví, obe musia byť ručne držané v zhode;
// tá oprava patrí ďalšej vlne, nie tomuto súboru).
const FOUNDER_WALKED_JOURNEY_IDS: string[] = ['snp-cesta-hrdinov', 'poloniny'];

// Koľko zakladateľských (Matej + Hekthor) hlasov trasa má. 0 keď:
//  · je to magistrála/journey (Odyssey), ktorú zakladatelia neprešli (nie je v zozname vyššie),
//  · trasu pridal iný člen cez ADD TRIP flow (`authorOf(trail)` nie je fallback — pozná meno).
// Inak 2 (design: Matej 2026-07-22, potvrdené 2026-08-03: „začíname so všetkým do nuly").
export function founderWalkers(trail: HeroTrail): number {
  if (trail.diff === 'Odyssey' && !FOUNDER_WALKED_JOURNEY_IDS.includes(trail.id)) return 0;
  if (authorOf(trail) !== AUTHOR_FALLBACK) return 0;
  return FOUNDER_WALKERS;
}

// PRAVDIVÉ hlasy — žiadna fabrikácia. Presne `founderWalkers(trail)` hlasov, každý = presné
// seed hodnoty výletu (trail.diff, seedCrowd(trail), trail.stars). Predtým (do 2026-08-03) tu
// bolo FOUNDER_WALKERS + 0..14 náhodných komunitných hlasov s rozptylom náročnosti/ruchu/ratingu
// a 22 % šancou na hazard — VŠETKO vymyslené (Matej: „začíname so všetkým do nuly"). Hazardy sú
// odteraz VŽDY prázdne — zdroj pravdy (nahadzovač) žiadne dáta o kliešťoch/vretenicach/zveri
// nemá; jediný zdroj hazardu je `userVote.hazards`.
function founderVotes(trail: HeroTrail): { diffs: Difficulty[]; crowds: Crowd[]; ratings: number[]; hazards: Hazard[][] } {
  const n = founderWalkers(trail);
  const sCrowd = seedCrowd(trail);
  const diffs: Difficulty[] = new Array(n).fill(trail.diff);
  const crowds: Crowd[] = sCrowd ? new Array(n).fill(sCrowd) : [];
  const ratings: number[] = new Array(n).fill(trail.stars);
  const hazards: Hazard[][] = new Array(n).fill(null).map(() => []);
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

// Crowd-sourced agregát = seed (nahadzovač) + PRAVDIVÉ zakladateľské hlasy (founderVotes) +
// prípadný hlas usera. Pod prahom (VOLUME_THRESHOLD) sa vracia seed (rating=stars,
// difficulty=seed, crowd=seedCrowd). walkedCount už NIE JE zaručene ≥ FOUNDER_WALKERS (to
// platilo, kým každá trasa mala navyše fabrikované komunitné hlasy) — magistrála, ktorú
// zakladatelia neprešli, alebo ADD-flow trip bez hlasov má walkedCount 0.
export function crowdAggregate(trail: HeroTrail, userVote?: TripVote | null): CrowdAgg {
  const { diffs, crowds, ratings, hazards } = founderVotes(trail);
  if (userVote) {
    diffs.push(userVote.difficulty); crowds.push(userVote.crowd); ratings.push(userVote.rating);
    hazards.push(userVote.hazards ?? []);
  }
  const walkedCount = ratings.length;
  const sCrowd = seedCrowd(trail);
  if (walkedCount === 0) {
    // Poctivý prázdny agregát — žiadny hlas, nič na agregáciu (a delenie walkedCount by dalo
    // NaN/Infinity).
    // rating = 0 znamená ŽIADNY RATING, nie „nula hviezdičiek" (Matej 2026-08-03: „neprešli =
    // žiadny rating"). Predtým sa sem dosadzovalo `trail.stars`, takže magistrála, ktorú nikto
    // neprešiel, ukazovala „★★★★★ 5.0" hneď vedľa vety, že ju nikto neprešiel. `trail.stars` je
    // pri journeys redakčná hodnota z `heroJourneys.ts`, nie hodnotenie chodca.
    // ⚠️ Konzumenti MUSIA rating skryť pri `rating <= 0` (PackMap.tsx, PackTripArticle.tsx,
    // packCommunityUI.tsx) — inak sa vykreslí „0.0" a prázdne labky.
    return {
      walkedCount: 0, belowThreshold: true,
      rating: 0,
      // trail.diff je teraz voliteľný (vodná plocha ho nemá, viď isWaterTrail v tripShared.tsx) —
      // CrowdAgg.difficulty ostáva netknuté ako Difficulty (packCommunityUI.tsx ho tak číta),
      // volajúci pre vodnú plochu UI stĺpec vôbec nezobrazí (hard rule, nie chýbajúca hodnota).
      difficulty: trail.diff as Difficulty,
      difficultyBreakdown: [],
      crowd: sCrowd,
      crowdBreakdown: [],
      hazardBreakdown: [],
    };
  }
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
      difficulty: trail.diff as Difficulty,
      difficultyBreakdown: [{ value: trail.diff as Difficulty, pct: 100, count: walkedCount }],
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
    difficulty: dB[0]?.value ?? (trail.diff as Difficulty),
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
  // PORADIE (Matej 2026-08-06): magistrály boli PRVÉ — *„nikoho to nezaujíma (resp len málo
  // ľudí to zvládne), všetkých skôr zaujme to v akých pohoriach boli"*. Najprv išli úplne
  // dozadu, upresnenie o pár minút neskôr: *„long distance daj nad high peaks"*, teda pod
  // CHKO. Poradie kategórií = poradie relevancie pre bežného člena, nie poradie vzniku.
  { key: 'journeys', label: 'Long-distance trails', icon: 'walk', units: [
    // POZOR: názvy sa párujú 1:1 s `name` v heroJourneys.ts (unitsForTrail). Čo tu nie je, sa nedá
    // odškrtnúť; čo tu je navyše, robí menovateľ nedosiahnuteľným. Audit 2026-07-29: vyhodená
    // 'Tatranská magistrála' (v datasete NIE JE — vyradená, psy zakázané v TANAPe), doplnený
    // 'Malofatranský okruh' (v datasete JE, ale nedal sa odškrtnúť).
    'Cesta hrdinov SNP', 'Rudná magistrála', 'Východokarpatská magistrála', 'Nízkotatranská hrebeňovka',
    'Veľkofatranská magistrála', 'Ponitrianska magistrála', 'Kysucká magistrála', 'Záhorácka magistrála',
    'Štefánikova magistrála', 'Poloniny', 'Malofatranský okruh',
  ] },
  // F2 (Matej 2026-07-24): ikonka `water` vykresľovala DŽBÁN → `water-waves` = tri vlnky,
  // rovnaká geometria ako modrý vodný pin na mape (waterIcon() v PackMap).
  { key: 'peaks', label: 'Highest peaks', icon: 'trophy', units: [
    'Gerlachovský štít', 'Ďumbier', 'Veľký Kriváň', 'Ostrá (V. Fatra)', 'Záruby',
    'Vápeč', 'Inovec', 'Poľana (vrchol)', 'Kľak',
  ] },
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
  // 2026-07-30 (issue #36): CHÝBALA. Hrebeňovka pribudla 29.7. a do tejto mapy sa nedostala —
  // pohorie jej odškrtávalo len `trail.region` ('Nízke Tatry'), teda náhodou to isté. Zapísané
  // explicitne, nech to nezávisí od textu v inom poli. Geometria: 0,1 km od Chopku, celá trasa
  // Donovaly → Kráľova hoľa je v Nízkych Tatrách, žiadne druhé pohorie sa jej netýka.
  'nizkotatranska-hrebenovka': ['Nízke Tatry'],
};

// GEOMETRICKÝ AUDIT (2026-07-30, issue #36) — 11 magistrál × 26 pohorí, min. vzdialenosť
// reálnej stopy (`path`, 79–4492 bodov) od referenčných vrcholov/sediel každého pohoria.
// Prah „prechádza cez pohorie" = 6 km od referenčného bodu.
//   ✅ Potvrdené bez zmeny: SNP (8 z 9 pohorí do 5,3 km — Malé/Biele Karpaty, Strážovské,
//      Malá + Veľká Fatra, Kremnické, Nízke Tatry, Volovské), Rudná (3/3), Ponitrianska (2/2),
//      Štefánikova, Veľkofatranská, Malofatranský okruh, Východokarpatská, Poloniny.
//   ⚠️ Neoverené touto metódou (referenčné body ležia mimo stopy, NIE dôkaz chyby):
//      SNP × Slovenské rudohorie (13,2 km od Stolice — trasa ide Muránskou planinou),
//      Záhorácka × Biele Karpaty (12,2 km — trasa vedie podhorím), Kysucká × Javorníky
//      (5,4 km od Makova, ale medzi nimi leží Turzovská vrchovina — pôvodný research
//      z 24.7. hovorí, že Javorníky sú len výhľad).
// Tieto tri rozhodne až point-in-polygon v geo-engine (Overpass/turf) — bodové referencie
// na to nemajú rozlišovaciu schopnosť a prepisovať kvôli nim overený research by bol krok vzad.


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

// Ktoré trasy nahodil TENTO človek (20 b za trasu / 10 za miesto). Dva prípady:
//  · bežný člen — trasa nesie jeho meno v `author` (tak ju zapisuje ADD TRIP flow),
//  · founder — kurátorovaný dataset (77 tripov) je jeho práca, ale `author` tam chýba alebo
//    je to fallback „Hekthor & Matej"; bez tejto výnimky by Matejov level spadol o 4 stupne.
// Musí to byť JEDNA funkcia, inak mapa a vysvedčenie ukážu iné číslo (presne to sa dnes dialo).
export function addedByMeIds(
  trails: HeroTrail[],
  opts: { ownerName?: string | null; isFounder?: boolean },
): Set<string> {
  const FALLBACK_AUTHOR = 'Hekthor & Matej';
  return new Set(
    trails
      .filter((tr) => (tr.author && opts.ownerName ? tr.author === opts.ownerName : false)
        || (opts.isFounder && (!tr.author || tr.author === FALLBACK_AUTHOR)))
      .map((tr) => tr.id),
  );
}

// Z členmi nahodených výletov (`trp-local-trails`) sa +20 smie pripísať len za MOJE a len za
// SCHVÁLENÉ (2026-08-05). Dva dôvody, obidva sú dnes reálne zle:
//  · `pack_trips_read` vracia KAŽDÝ schválený výlet — teda aj cudzí. Lokálny zoznam preto nie je
//    „moje návrhy", ale katalóg členov, a slepé `addedIds.add(tr.id)` platilo za cudziu prácu.
//  · Body padali okamžite po nahodení, hoci `pack_trips.status` je 'pending' a Matej ho v /admin
//    môže zamietnuť. Zamietnutý výlet body nechával.
// NEZNÁMY slug (nie je v meta) sa počíta ĎALEJ — je to čerstvo nahodený alebo nezosynchronizovaný
// stav, a offline/nezalogovaný člen nesmie prísť o skóre (viď readLocalTrailMeta).
// Berie kandidátov (z `addedByMeIds` aj z lokálneho zoznamu) a prepustí len tie, ktoré moderácia
// nezhodila. JEDNA funkcia pre mapu aj vysvedčenie — dva rôzne filtre by ukázali dva rôzne levely.
export function approvedAddedIds(ids: Iterable<string>): Set<string> {
  const meta = readLocalTrailMeta();
  const out = new Set<string>();
  for (const id of ids) {
    const m = meta[id];
    if (!m || (m.mine && m.status === 'approved')) out.add(id);
  }
  return out;
}

// Koľko hodnotení dal TENTO človek (3 b za každé, `POINTS.rate`). Ráta sa z hlasov k PREJDENÝM
// trasám a len tie s labkami — hlas bez ratingu (samotné hazardy/komentár) nie je hodnotenie.
// Jedna funkcia pre mapu aj vysvedčenie; každý povrch si nesie vlastný zdroj hlasov (PackMap má
// stav, TripStatsPanel `readVotes()`), lebo v tejto vrstve nesmie byť hook.
export function ratedCountFor(
  walkedTrails: Array<{ id: string }>,
  votes: Record<string, { rating?: number } | undefined>,
): number {
  return walkedTrails.reduce((n, tr) => n + ((votes[tr.id]?.rating ?? 0) > 0 ? 1 : 0), 0);
}

/**
 * Koľko bodov padne za PREJDENIE tejto konkrétnej trasy — číslo na ✓ tlačidlo (2026-08-05).
 * Paušálne „+5" by klamalo: 5 je len sadzba za prejdenie, k nej ide 1 b/km a 2 b za každých
 * celých 100 m stúpania (magistrála má namiesto toho pevnú cenu). Záruby 1 = 5 + 12 + 10 = 27.
 * Objavenia (nové pohorie/NP/krajina) sa zámerne NEPOČÍTAJÚ — závisia od toho, čo už člen má,
 * a tlačidlo nesmie sľúbiť bonus, ktorý mu druhýkrát nepadne.
 */
export function walkPointsFor(tr: { id: string; km?: string | number; ascentM?: number; acts?: string[] }): number {
  return walkPointsBreakdown(tr).total;
}

/**
 * To isté číslo AJ S ROZPADOM (Matej 2026-08-06: „za body napr havrania skala je 26… človek nevie
 * prečo 26… ukáž to pri pridávaní hodnotenia, tam je dosť priestoru").
 *
 * Havrania skala = 5 (prejdenie) + 11 (11,3 km) + 10 (556 m ↑) = 26.
 *
 * ⚠️ `walkPointsFor` z toho ODVODZUJE svoj súčet, nepočíta si ho druhýkrát — inak by tlačidlo
 * sľubovalo jedno číslo a rozpad pod ním sa skladal na iné. Rovnaký dôvod, prečo vznikla
 * `walkedCountries()` (mapa vs. vysvedčenie).
 */
export function walkPointsBreakdown(tr: { id: string; km?: string | number; ascentM?: number; acts?: string[] }): TripPointsResult {
  return calculateTripPoints({
    kind: tr.acts?.includes('hike') ? 'trail' : 'place',
    km: Number(tr.km) || 0,
    ascentM: tr.ascentM ?? 0,
    journeyId: JOURNEY_POINTS[tr.id] ? tr.id : undefined,
    walked: true,
  });
}

/**
 * Základ odmeny do `WalkReward` — súčet AJ rozpad z JEDNÉHO volania enginu.
 * Volá sa `{ tid, ...walkRewardBase(tr), bonuses }`, takže sa nedá omylom naplniť `base`
 * z jedného výpočtu a `baseRows` z druhého.
 */
export function walkRewardBase(tr: { id: string; km?: string | number; ascentM?: number; acts?: string[] }): { base: number; baseRows: PointsRow[] } {
  const r = walkPointsBreakdown(tr);
  return { base: r.total, baseRows: r.rows };
}

/**
 * Koľko RÔZNYCH krajín človek prešiel. Vlastná funkcia zámerne (2026-08-06): dovtedy si to
 * TripStatsPanel počítal sám a hlavička mapy VÔBEC — `profilePointsFor` tam dostávala default
 * „1 krajina", takže mapa a vysvedčenie ukazovali iný level, len čo mal niekto výlet v druhej
 * krajine. Presne ten rozchod, kvôli ktorému už raz vznikla `profilePointsFor` (mapa mala
 * zadrôtované „Pútnik Lvl 1") a kvôli ktorému zomrel PawInput/PawPicker/PawRating.
 */
export const walkedCountries = (walkedTrails: HeroTrail[]): number =>
  new Set(walkedTrails.map((tr) => trailCountry(tr))).size;

// ── ODMENA PO ✓: ZÁKLAD + BONUS ZA OBJAVENIE (2026-08-05, zadanie §3b) ──────
// Tlačidlo je SĽUB pred akciou, a sľub musí platiť VŽDY — preto na ňom stojí len `walkPointsFor`
// (5 + km + stúpanie). Keby prvý Choč sľuboval +37 a druhý +27, appka pri druhom výlete vyzerá,
// že klame, hoci ráta správne.
// Bonus za objavenie sa preto ODHALÍ až po ✓ — je to prekvapenie, nie sľub. A je to jediné
// miesto v appke, kde sa človek dozvie, že objavil nové pohorie, takže sa POMENÚVA, nie len
// spočíta („prvýkrát v Malých Karpatoch", nie „+10").
export interface DiscoveryBonus {
  /** i18n kľúč pre druh objavenia (pack.points.newRange, …) — text skladá až renderer. */
  labelKey: string;
  /** Konkrétna jednotka: „Malé Karpaty", „NP Slovenský raj", „Slovensko". */
  unit: string;
  points: number;
}

/** Kategórie, za ktoré padá bonus. `peaks` = 0 bodov (kryje ho prevýšenie), `journeys` majú pevnú cenu. */
const BONUS_CATS: Array<[GeoCategory, string, number]> = [
  ['ranges', 'pack.points.newRange', POINTS.range],
  ['parks', 'pack.points.newNp', POINTS.np],
  ['chko', 'pack.points.newChko', POINTS.chko],
  ['waters', 'pack.points.newWater', POINTS.water],
];

/**
 * Čo NOVÉ odomkne prejdenie tejto trasy — voči tomu, čo už človek prešiel PREDTÝM.
 * `previouslyWalked` NESMIE obsahovať `trail` samotný (inak je všetko „už objavené").
 *
 * Krajina: nová, ak medzi predošlými trasami žiadna nebola z tej istej krajiny (30 b).
 * Zbierka: ak sa práve teraz doplnila celá kategória (9 NP / 26 pohorí / CHKO) — 50 b.
 */
export function discoveryBonusFor(trail: HeroTrail, previouslyWalked: HeroTrail[]): DiscoveryBonus[] {
  const out: DiscoveryBonus[] = [];
  const before = computeCompletion(previouslyWalked);
  const after = computeCompletion([...previouslyWalked, trail]);
  const doneOf = (c: SlovakiaCompletion, key: GeoCategory) =>
    new Set(c.categories.find((x) => x.key === key)?.done ?? []);

  for (const [key, labelKey, points] of BONUS_CATS) {
    const had = doneOf(before, key);
    for (const unit of doneOf(after, key)) if (!had.has(unit)) out.push({ labelKey, unit, points });
  }

  // Nová krajina — porovnáva sa ISO2 z datasetu (`trailCountry`), nie názov regiónu.
  const iso = trailCountry(trail);
  if (!previouslyWalked.some((t) => trailCountry(t) === iso)) {
    out.push({ labelKey: 'pack.points.newCountry', unit: countryName(iso), points: POINTS.country });
  }

  // ⚠️ KOMPLETNÁ ZBIERKA (+50) TU ZÁMERNE NIE JE — a je to príznak diery, nie rozhodnutie.
  // `POINTS.collection` existuje, legenda v TripStatsPanel ju sľubuje („Complete a collection
  // +50") a `calculateTripPoints` ju vie spočítať — ale `calculateProfilePoints` ju NEPOČÍTA
  // do súčtu vôbec. Keby ju odhalenie po ✓ ukázalo, sľúbilo by 50 bodov, o ktoré sa level
  // nikdy neposunie. Kým sa nedoplní do súčtu profilu, radšej mlčať než klamať.
  // (Dnes to nikoho neškrtí — žiadna kategória nie je kompletná.)
  return out;
}

/**
 * Text odmeny do TOASTU (utíšená ponuka — popup nevyskočí, a objavenie sa nesmie stratiť).
 * `tr` = prekladač volajúceho; tento modul prekladač nemá (rovnaké pravidlo ako `labelKey`
 * v tripPoints.ts).
 *
 * ⚠️ Prečo sa NEVYPISUJÚ všetky názvy: jedna jednotka môže byť naraz pohorie AJ CHKO
 * (Poľana, Malé Karpaty, Biele Karpaty, Vihorlat, Štiavnické vrchy). Oba body sú správne —
 * sú to dve rôzne zbierky — ale holý zoznam názvov by čítal „+10 Poľana · +10 Poľana"
 * a vyzeral by ako chyba. Preto: jedno objavenie sa pomenuje aj s druhom, viac sa spočíta
 * a menoslov ostáva popupu, kde má každý riadok svoj druh pod názvom.
 */
export function bonusToastText(
  bonuses: DiscoveryBonus[],
  tr: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (bonuses.length === 0) return '';
  const pts = bonuses.reduce((s, b) => s + b.points, 0);
  if (bonuses.length === 1) {
    return tr('pack.map.toastBonusOne', { pts, kind: tr(bonuses[0].labelKey), unit: bonuses[0].unit });
  }
  return tr('pack.map.toastBonusMany', { pts, n: bonuses.length });
}

// ── Ponuka hodnotenia po ✓ (2026-08-05) ─────────────────────────────────────
// Matej: „to hodnotenie by som asi dal na popup... nebolo by povinné ale vyskočilo by povinne."
// Popup vyskočí sám, ale prejdenie je zapísané už pred ním a zavretie nič neruší.
//
// ⚠️ TICHÉ OBDOBIE ZRUŠENÉ 2026-08-06 (Matej: „pri každom prejdenom daj popup s hodnotením nie
// random, ved človek to rád ohodnotí za body"). Predtým platilo: jedno zavretie bez vyplnenia
// utíšilo ponuku na 60 s (poistka proti odškrtávaniu víkendovej dávky). Z pohľadu človeka to
// ale vyzeralo NÁHODNE — raz popup prišiel, raz nie, a dôvod nebol nikde vidieť.
// Hodnotenie je platené bodmi, takže je to ponuka, nie otrava → ponúka sa VŽDY.
// Ak sa raz ukáže, že dávkové odškrtávanie je reálny problém, riešením NIE je návrat k tichu
// (to len skryje body), ale hromadné hodnotenie viacerých trás naraz.
export const RATE_PROMPT_POINTS = POINTS.rate;

export const FOUNDER_ACCOUNT_EMAIL = 'hekthorsk@gmail.com';
export const isFounderEmail = (email?: string | null) =>
  (email ?? '').toLowerCase() === FOUNDER_ACCOUNT_EMAIL;

// ── BODY PROFILU (issue #33) — jedno miesto, dva povrchy ────────────────────
// Level sa ukazuje v hlavičke mapy aj vo vysvedčení (TripStatsPanel). Keby si každý povrch
// počítal body sám, rozišli by sa (mapa mala zadrôtované „Pútnik Lvl 1", vysvedčenie počítalo
// z počtu tripov). Ceny a krivka žijú v `@/lib/tripPoints`, odškrtnuté geo jednotky sem
// dodá `computeCompletion` — táto funkcia ich len spojí.
export function profilePointsFor(
  walkedTrails: HeroTrail[],
  opts?: { addedIds?: Set<string>; ratings?: number; countries?: number },
): TripPointsResult {
  const completion = computeCompletion(walkedTrails);
  const done = (key: GeoCategory) => completion.categories.find((c) => c.key === key)?.done.length ?? 0;
  return calculateProfilePoints({
    walked: walkedTrails,
    addedIds: opts?.addedIds,
    ratings: opts?.ratings,
    discovered: {
      ranges: done('ranges'), parks: done('parks'), chko: done('chko'), waters: done('waters'),
      countries: opts?.countries ?? (walkedTrails.length > 0 ? 1 : 0),
    },
  });
}

// ── „ostatní ľudia" — 2026-08-03 ZMAZANÉ (Matej: „začíname so všetkým do nuly").
// Tu žil `MOCK_MEMBER_POOL`: 10 vymyslených ľudí s vymyslenými psami, pack číslami a povahami.
// Appka z nich skladala recenzie výletov, skupinové konverzácie v Inboxe, účastníkov výletov
// aj cudzie verejné profily (/pack/u/:id). Reálny zoznam členov príde z DB (`pack_members`);
// dovtedy platí, že sa radšej nezobrazí NIKTO než vymyslený niekto.
// `MockPerson` ostáva — je to len tvar dát pre plánovačov, nie fabrikovaný obsah.
export interface MockPerson { name: string; dog: string; date: string; }


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

// mockPlannersFor() a mockEventsSeed() ZMAZANÉ (Matej 2026-08-03: „začíname so všetkým do
// nuly" — 3 fiktívne verejné eventy s fake hostmi „Zuzka & Bady"/„Martin & Cézar"/„Lucia & Lola"
// sa natrvalo zapisovali do localStorage `trp-events-v2`, plus deterministický zoznam 0..3 ľudí
// „čo sa tiež chystajú" bez akéhokoľvek reálneho zdroja). Volanie `mockEventsSeed(HERO_TRAILS,
// Date.now())` v `PackMap.tsx:1376` treba odstrániť v ďalšej vlne — dovtedy je to build error
// v cudzom súbore, nie v tomto module.

// ── perzistencia (2026-07-30, issue #32) ────────────────────────────────────
// PREDTÝM: sessionStorage → hodnotenia, plány aj inzeráty zmizli používateľovi pri
// zatvorení tabu. TERAZ: `@/lib/packStore` = localStorage (synchrónne čítanie, žiadny
// prepis volajúcich) + write-through do Supabase (`trip_votes`, `user_trips`, `trip_events`).
// v2 v kľúčoch ostáva: TripVote pribudlo when/hazards, PartnerEvent prešiel na dates[]/month
// (Matej 2026-07-22) — bump verzie zahodil staré nekompatibilné dáta (inak ev.dates undefined → crash).
const VOTES_KEY = PACK_KEYS.votes;
const PLANS_KEY = PACK_KEYS.plans;
const EVENTS_KEY = PACK_KEYS.events;

export const readVotes = () => readJson<Record<string, TripVote>>(VOTES_KEY, {});
export const writeVotes = (v: Record<string, TripVote>) => persistVotes(v);
export const readPlans = () => readJson<TripPlan[]>(PLANS_KEY, []);
export const writePlans = (p: TripPlan[]) => persistPlans(p);
export const readEvents = () => readJson<PartnerEvent[]>(EVENTS_KEY, []);
export const writeEvents = (e: PartnerEvent[]) => persistEvents(e);

// ── D5 „Next trip in X days" (rozhodnutie Mateja 2026-07-26) ─────────────────
// Zdroj dát = `trp-plans` (readPlans), teda MOJE naplánované výlety. Vyberá sa
// NAJSKORŠÍ budúci — v tripliste ako info, a hore vpravo pri 🔔/✉ ako ikonka
// s číslom v krúžku.
//
// Pozor na formát dátumu: je to string z <input type="date">, ale
// PackTripArticle doň pri inzeráte zapisuje `ad.dates[0] ?? ad.month`, takže to
// môže byť aj 'YYYY-MM' alebo ''. Bez celého dňa sa počet dní spočítať nedá →
// také plány sa preskakujú (nie crash, nie nula).
//
// Signatúra je zámerne štruktúrna (`{tripId, date?}`), nie `TripPlan[]`: zdroj
// pravdy pre „moje výlety" je TRIPLIST (`triplist.ts`, user tam dátum priamo
// edituje), plány sú len to, čo sa doň ešte nemigrovalo. Volajúci posiela oboje
// a duplicity nevadia — vyhráva najskorší dátum, nie poradie.
export interface NextTripInfo { tripId: string; date: string; daysUntil: number }

const FULL_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function nextPlannedTrip(
  plans: Array<{ tripId: string; date?: string }>,
  now: Date = new Date(),
): NextTripInfo | null {
  // Porovnávame kalendárne dni, nie časové známky — výlet dnes o 8:00 pri
  // otvorení appky o 20:00 musí ostať „dnes" (0 dní), nie „−1".
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  let best: NextTripInfo | null = null;
  for (const p of plans) {
    if (!FULL_DATE.test(p.date ?? '')) continue;
    const [y, m, d] = p.date!.split('-').map(Number);
    const when = Date.UTC(y, m - 1, d);
    const daysUntil = Math.round((when - today) / DAY_MS);
    if (daysUntil < 0) continue;                       // minulé výlety nezaujímajú
    if (!best || daysUntil < best.daysUntil) best = { tripId: p.tripId, date: p.date, daysUntil };
  }
  return best;
}
