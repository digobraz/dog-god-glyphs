// Vyhľadávanie cieľa pre krok „WHERE ARE YOU HEADING?" (kánon: plany/zadanie-eventy-2026-08-06.md
// §2.2b). Toto je JEDINÁ ochrana proti duplicite, ktorá pre PLÁN môže fungovať — geometrická
// `findDuplicate()` (GeometryPicker.tsx:77) vracia `null` pre všetko okrem `kind === 'route'`,
// kým plán má zámerne voľnejší default (`area`/`point`, viď `defaultKindFor(_, 'plan')`).
//
// Zámerne bez hodnotového importu HERO_TRAILS — dataset chodí parametrom, rovnaká konvencia ako
// `tripPathById()` v tripShared.tsx (inak by sa celý dataset trás vtiahol do každého chunku,
// ktorý na tento modul siahne).

import type { HeroTrail } from '@/data/heroTrails.generated';
import { PACK_KEYS, readJson, readStringSet } from '@/lib/packStore';

/**
 * `choc` === `CHOC` === `Choč`. Bez tohto search vráti pri preklepe/bez diakritiky prázdno
 * a človek založí duplikát — najčastejší spôsob, ako sa katalóg zaplní tým istým kopcom
 * pod dvoma menami. NFD rozloží písmeno na znak + diakritické znamienko, range maže znamienka.
 */
export const fold = (s: string): string =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export type TripSource = 'curated' | 'journey' | 'member';

export type DestinationHit = {
  trail: HeroTrail;
  source: TripSource;
  /** Vyššie = relevantnejšie. Poradie rieši `searchDestinations`, volajúci netriedi. */
  score: number;
  walked: boolean;
  planned: boolean;
};

/** Id výletov, ktoré nahodili členovia (`trp-local-trails`) — na odlíšenie od kurátorovaných. */
const memberTrailIds = (): Set<string> => {
  const rows = readJson<Array<{ id?: string }>>(PACK_KEYS.localTrails, []);
  return new Set(rows.map((r) => r?.id).filter((id): id is string => typeof id === 'string'));
};

/** Id trás, ktoré už mám v plánoch — `trp-plans` drží drafty s `geometry`, nie odkazy na trail. */
const plannedTrailIds = (): Set<string> => {
  const rows = readJson<Array<{ relatedTrailId?: string; trailId?: string }>>(PACK_KEYS.plans, []);
  const out = new Set<string>();
  for (const r of rows) {
    if (r?.relatedTrailId) out.add(r.relatedTrailId);
    if (r?.trailId) out.add(r.trailId);
  }
  return out;
};

/**
 * ⚠️ Poradie zdrojov je záväzné (§2.2b bod 1): kurátorované PRED členskými.
 * `PackMap.tsx` skladá `allTrails` opačne (`[...localTrails, ...HERO_JOURNEYS, ...HERO_TRAILS]`),
 * takže bez tohto váženia by sa neoverený členský duplikát ponúkal NAD kurátorovaným tripom —
 * ľudia by sa priradzovali k duplikátu a ten by sa sám rozmnožoval.
 */
const SOURCE_WEIGHT: Record<TripSource, number> = { curated: 30, journey: 20, member: 0 };

/** Magistrály majú v datasete vlastné id-čka (`snp-*`, `cesta-hrdinov-*`) — dlhé viacdňové trasy. */
const isJourney = (t: HeroTrail): boolean =>
  (t.acts ?? []).includes('journey') || parseFloat(t.km) >= 50;

function scoreOf(q: string, t: HeroTrail): number {
  const name = fold(t.name);
  const region = fold(t.region ?? '');
  const tags = (t.tags ?? []).map(fold);

  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  // Zhoda na hranici slova — „choc" v „Veľký Choč" má vyššiu váhu než náhodná vsuvka.
  if (name.split(/[\s(),.\-–—]+/).some((w) => w.startsWith(q))) return 70;
  if (name.includes(q)) return 50;
  if (region.startsWith(q)) return 40;
  if (region.includes(q)) return 30;
  if (tags.some((tag) => tag.includes(q))) return 20;
  return 0;
}

export type SearchOptions = {
  /** Strop výsledkov — mobil neuživí viac než hrsť kariet naraz. */
  limit?: number;
};

export function searchDestinations(
  query: string,
  trails: HeroTrail[],
  opts: SearchOptions = {},
): DestinationHit[] {
  const q = fold(query);
  if (q.length < 2) return [];

  const members = memberTrailIds();
  const walkedIds = readStringSet(PACK_KEYS.walked);
  const plannedIds = plannedTrailIds();

  const hits: DestinationHit[] = [];
  for (const trail of trails) {
    const base = scoreOf(q, trail);
    if (base === 0) continue;
    const source: TripSource = members.has(trail.id)
      ? 'member'
      : isJourney(trail)
        ? 'journey'
        : 'curated';
    hits.push({
      trail,
      source,
      score: base + SOURCE_WEIGHT[source],
      walked: walkedIds.has(trail.id),
      planned: plannedIds.has(trail.id),
    });
  }

  hits.sort((a, b) => b.score - a.score || a.trail.name.localeCompare(b.trail.name));
  return hits.slice(0, opts.limit ?? 12);
}

// ── prázdny stav ────────────────────────────────────────────────────────────────────────
// Prázdny zoznam nesmie vyzerať ako rozbitá appka (§2.2b): človek buď odíde, alebo — horšie —
// skúša ďalšie preklepy a založí ten istý trip trikrát.

const EARTH_R = 6371;
const hav = (a: [number, number], b: [number, number]): number => {
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const la1 = (a[0] * Math.PI) / 180;
  const la2 = (b[0] * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(h));
};

/**
 * Tie isté karty ako pri hľadaní, len bez dopytu — pre stav PRED písaním (2026-08-06).
 * Krok „Where are you heading?" dovtedy nerenderoval nič, kým človek nenapísal 2 znaky, takže
 * pôsobil ako rozbitá stránka (Matej: „vyzerá to tak prázdno"). `score` je tu vždy 0 — poradie
 * určuje volajúci (vzdialenosť), nie relevancia dopytu.
 */
export function describeTrails(trails: HeroTrail[]): DestinationHit[] {
  const members = memberTrailIds();
  const walkedIds = readStringSet(PACK_KEYS.walked);
  const plannedIds = plannedTrailIds();
  return trails.map((trail) => ({
    trail,
    source: members.has(trail.id) ? 'member' : isJourney(trail) ? 'journey' : 'curated',
    score: 0,
    walked: walkedIds.has(trail.id),
    planned: plannedIds.has(trail.id),
  }));
}

/** Najbližšie tripy k bodu — pre empty state („you'd be the first; closest: X (34 km)"). */
export function nearestTrails(
  point: [number, number],
  trails: HeroTrail[],
  limit = 3,
): Array<{ trail: HeroTrail; km: number }> {
  return trails
    .filter((t) => t.path?.length > 0)
    .map((t) => ({ trail: t, km: hav(point, t.path[0]) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}

/**
 * Geografická poistka pri zakladaní NOVÉHO tripu (§2.2b bod 3) — chytá to, čo text nechytil:
 * ľudový názov („Fatranský Kriváň" vs. „Malý Kriváň"). Na rozdiel od `findDuplicate()` funguje
 * aj pre `point`/`area`, teda aj pre plány a pre log aktivít `explore`/`picnic`.
 * Vracia kandidáta, NIE verdikt — volajúci sa pýta, neblokuje.
 */
export const NEARBY_RADIUS_KM = 2;

export function findNearbyTrail(
  anchor: [number, number] | undefined,
  trails: HeroTrail[],
  radiusKm = NEARBY_RADIUS_KM,
): { trail: HeroTrail; km: number } | null {
  if (!anchor) return null;
  let best: { trail: HeroTrail; km: number } | null = null;
  for (const t of trails) {
    if (!t.path?.length) continue;
    // Meriame na najbližší BOD trasy, nie na jej štart — inak by dlhá trasa vedúca 200 m od
    // môjho pinu ostala nezachytená len preto, že začína o 15 km ďalej.
    let min = Infinity;
    for (const p of t.path) {
      const d = hav(anchor, p);
      if (d < min) min = d;
      if (min <= radiusKm) break;
    }
    if (min <= radiusKm && (!best || min < best.km)) best = { trail: t, km: min };
  }
  return best;
}
