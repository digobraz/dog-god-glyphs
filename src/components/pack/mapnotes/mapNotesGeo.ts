// ZÁPISY DO MAPY — ODVODENÁ VÄZBA NA VÝLET.
// Zadanie: `plany/zadanie-zapisy-do-mapy-2026-08-20.md` §2.1b
//
// ── PREČO SA VÄZBA POČÍTA, A NEUKLADÁ ──────────────────────────────────────
// Prvý návrh mal `trip_slug` v tabuľke a človek by pri zápise vyberal výlet.
// Matej 2026-08-20: „niekto chce len pridať poznámku k random miestu ale
// v blízkosti bude viacero tripov". Presne tak — a človek nemá informácie na to,
// aby vybral správny. Preto sa zápis ukladá NA MIESTO a do článku výletu sa
// premietne každý zápis, ktorý leží dosť blízko jeho trasy.
//
// Tri veci, ktoré tým vznikli zadarmo:
//   1. parkovisko pri štarte slúži VŠETKÝM výletom, čo odtiaľ vychádzajú,
//   2. nová trasa cez staré miesto zdedí parkovisko aj varovanie sama,
//   3. `map_notes` nemá cudzí kľúč na slug ⇒ premenovanie výletu ju nerozbije
//      (na rozdiel od `user_trips`/`trip_requests`/`trip_events`, kde
//      premenovanie 3. 8. osirelo riadky bez jedinej chybovej hlášky).
//
// ── PREČO MÁ PARKOVISKO INÝ PRAH ───────────────────────────────────────────
// Parkovisko sa meria k ŠTARTU/CIEĽU, nie k trase. Parkovisko 100 m od polovice
// trasy nie je parkovisko pre ten výlet — je to parkovisko, okolo ktorého trasa
// náhodou ide. Ostatné zápisy (výstraha, poznámka, voda) naopak sledujú celú
// stopu, lebo spadnutý most v polovici trasy sa toho výletu týka veľmi.
import type { LatLngTuple } from 'leaflet';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { hav } from '@/components/pack/addtrip/addTripGeo';
import type { MapNote, NoteKind } from './mapNotesData';

/** Parkovisko: vzdialenosť od štartu alebo cieľa trasy. */
export const PARKING_RADIUS_M = 500;
/** Ostatné zápisy: vzdialenosť od najbližšieho bodu stopy. */
export const NOTE_RADIUS_M = 150;

export function thresholdFor(kind: NoteKind): number {
  return kind === 'parking' ? PARKING_RADIUS_M : NOTE_RADIUS_M;
}

/**
 * Vzdialenosť bodu od najbližšieho bodu stopy.
 *
 * Meria sa k VRCHOLOM stopy, nie k úsečkám medzi nimi. Je to vedomé
 * zjednodušenie: stopy v datasete sú snapnuté a husté (rozostup ~100 m, viď
 * `SPACING` v addTripGeo.ts), takže najhoršia chyba je polovica rozostupu —
 * rádovo 50 m pri prahu 150 m. Projekcia na úsečku by pridala kód aj čas
 * a nezmenila by jediný výsledok.
 */
function distToPath(lat: number, lon: number, path: LatLngTuple[]): number {
  if (!path.length) return Infinity;
  const p: LatLngTuple = [lat, lon];
  let best = Infinity;
  for (const v of path) {
    const d = hav(p, v);
    if (d < best) best = d;
  }
  return best;
}

/** Vzdialenosť od štartu alebo cieľa — čo je bližšie. */
function distToEnds(lat: number, lon: number, path: LatLngTuple[]): number {
  if (!path.length) return Infinity;
  const p: LatLngTuple = [lat, lon];
  const start = hav(p, path[0]);
  const end = path.length > 1 ? hav(p, path[path.length - 1]) : start;
  return Math.min(start, end);
}

/** Patrí zápis k tejto trase? Pripnutie prebíja geometriu, nie naopak. */
export function noteBelongsToTrail(note: MapNote, trail: HeroTrail): boolean {
  if (note.pinnedSlug && note.pinnedSlug === trail.id) return true;
  const path = trail.path ?? [];
  if (!path.length) return false;
  const d = note.kind === 'parking'
    ? distToEnds(note.lat, note.lon, path)
    : distToPath(note.lat, note.lon, path);
  return d <= thresholdFor(note.kind);
}

/**
 * Zápisy patriace k výletu, zoradené na čítanie v článku:
 * parkovisko → výstraha → zvyšok, a v rámci skupiny najnovšie hore.
 * Zošednuté („už neplatí") padajú na koniec svojej skupiny — nemiznú, len
 * prestávajú byť to prvé, čo človek vidí.
 */
export function notesForTrail(notes: MapNote[], trail: HeroTrail): MapNote[] {
  const rank: Record<string, number> = { parking: 0, hazard: 1, water: 2, note: 3, viewpoint: 4, wildlife: 5 };
  return notes
    .filter((n) => noteBelongsToTrail(n, trail))
    .sort((a, b) => {
      if (a.isStale !== b.isStale) return a.isStale ? 1 : -1;
      const r = (rank[a.kind] ?? 9) - (rank[b.kind] ?? 9);
      if (r !== 0) return r;
      return b.createdAt.localeCompare(a.createdAt);
    });
}

/**
 * Ku ktorému výletu sa zápis pripne pri zakladaní z otvoreného článku.
 * Vracia najbližší výlet v prahu, alebo null („poznámka k random miestu").
 */
export function nearestTrailId(lat: number, lon: number, kind: NoteKind, trails: HeroTrail[]): string | null {
  let bestId: string | null = null;
  let bestD = thresholdFor(kind);
  for (const t of trails) {
    const path = t.path ?? [];
    if (!path.length) continue;
    const d = kind === 'parking' ? distToEnds(lat, lon, path) : distToPath(lat, lon, path);
    if (d <= bestD) { bestD = d; bestId = t.id; }
  }
  return bestId;
}

// ── DATASETOVÉ BODY (`customPoi`) ────────────────────────────────────────────
// V `heroTrails.generated.ts` už leží 8 výletov s vlastnými bodmi (výhľady, divá
// zver) nahádzaných cez `npm run trip-audit` — a appka ich doteraz NIKDE
// nekreslila. Boli to mŕtve dáta: typ ich deklaroval, konzument neexistoval.
// Tá istá vrstva ich zobrazí bez ďalšej práce, len sa musia pretvarovať na
// `MapNote`. Sú to dáta z datasetu, nie od členov, takže nemajú autora,
// nehlasuje sa o nich a nedajú sa mazať.
const POI_KIND: Record<string, NoteKind> = {
  viewpoint: 'viewpoint',
  wildlife: 'wildlife',
  ticks: 'wildlife',
  shelter: 'note',
};

export function datasetNotes(trails: HeroTrail[]): MapNote[] {
  const out: MapNote[] = [];
  for (const t of trails) {
    for (const [i, p] of (t.customPoi ?? []).entries()) {
      out.push({
        id: `poi:${t.id}:${i}`,
        kind: POI_KIND[p.t] ?? 'note',
        lat: p.lat,
        lon: p.lon,
        radiusM: p.kind === 'area' ? (p.r ?? 500) : null,
        body: p.name ?? '',
        pinnedSlug: t.id,
        paid: null,
        createdAt: '',
        isMine: false,
        authorFirst: null,
        packNumber: null,
        validVotes: 0,
        staleVotes: 0,
        myVote: null,
        isStale: false,
      });
    }
  }
  return out;
}

/** Zápis z datasetu, nie od člena — nemá autora, nehlasuje sa, nemaže sa. */
export const isDatasetNote = (n: MapNote): boolean => n.id.startsWith('poi:');
