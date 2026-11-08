// ─────────────────────────────────────────────────────────────────────────────
// STENA TRIPSTATS — čo človek prešiel, DOKOPY (Matej 8. 11. 2026).
// *„merať všetko dokopy, až cez filter sa ukáže ktorá krajina"*.
//
// Dve povahy čísel: ZBIERKA má menovateľ (pohoria, NP, diaľkové trasy) a ukáže ho až po výbere
// krajiny; ZÁZNAM je bez stropu (vrcholy, vody). Nákres: plany/nakres-tripstats-2026-11-08/.
//
// ⚠️ Vrcholy a vody sú zatiaľ tabuľka nad kurátorovanými výletmi. Register všetkých krajín
//    z OSM je samostatná úloha (plany/zadanie-tripstats-krajiny-2026-11-07.md).
// ─────────────────────────────────────────────────────────────────────────────
import type { HeroTrail } from '@/data/heroTrails.generated';
import { unitsForTrail, SK_GEO, type GeoCategory } from '@/components/pack/packCommunity';
import { trailCountry } from '@/lib/countryGeo';
import { tripDayCount } from '@/components/pack/tripShared';
import { ROADTRIP_ACT } from '@/components/pack/tripCategories';

export type WaterKind = 'pond' | 'reservoir' | 'lake';

export interface WallItem {
  name: string;
  iso: string;
  /** Výška vrcholu, kilometre, stúpanie… — podľa kategórie. */
  value?: number;
  water?: WaterKind;
  trails: HeroTrail[];
}

const PEAK_BY_TRAIL: Record<string, [string, number]> = {
  'chopok-dumbier-nizke-tatry': ['Ďumbier', 2043],
  'sivy-vrch-zapadne-tatry': ['Sivý vrch', 1805],
  'velky-krivan-mala-fatra': ['Veľký Kriváň', 1709],
  'ostredok-velka-fatra': ['Ostredok', 1592],
  'ohniste-nizke-tatry': ['Ohnište', 1538],
  'tlsta-ostra-velka-fatra': ['Tlstá', 1373],
  'mincol-mala-fatra': ['Minčol', 1364],
  'klak-mala-fatra': ['Kľak', 1352],
  'maly-rozsutec-mala-fatra': ['Malý Rozsutec', 1343],
  'strazov-strazovske-vrchy': ['Strážov', 1213],
  'sokolie-mala-fatra': ['Sokolie', 1172],
  'sip': ['Šíp', 1170],
  'vapec-strazovske-vrchy': ['Vápeč', 955],
  'velky-lopenik-rozhladna-biele-karpaty': ['Veľký Lopeník', 912],
  'zaruby-1-kostol-certov-zlab-zaruby-male-karpaty': ['Záruby', 768],
  'zaruby-2-smolenice-stanica-havranica-zaruby-male-karpaty': ['Záruby', 768],
  'zaruby-3-bukova-ostry-kamen-zaruby-male-karpaty': ['Záruby', 768],
  'zaruby-4-jahodnik-certov-zlab-zaruby-male-karpaty': ['Záruby', 768],
  'zaruby-5-kostol-kaluza-zaruby-male-karpaty': ['Záruby', 768],
  'vysoka-na-steroidoch-tajne-skaly-male-karpaty': ['Vysoká', 754],
  'vapenna-rostun-male-karpaty': ['Vápenná', 752],
};

const WATER_BY_TRAIL: Record<string, [string, WaterKind]> = {
  'chtelnica-priehrada-male-karpaty': ['Chtelnica', 'pond'],
  'bukova-priehrada-male-karpaty': ['Buková', 'pond'],
  'oresianska-priehrada': ['Orešianska', 'pond'],
  'palcmanska-masa': ['Palcmanská Maša', 'pond'],
  'liptovska-mara': ['Liptovská Mara', 'reservoir'],
  'slnava': ['Sĺňava', 'reservoir'],
  'kralova': ['Kráľová', 'reservoir'],
  'zelene-pleso-vysoke-tatry': ['Zelené pleso', 'lake'],
  'bled': ['Bled', 'lake'],
  'seealpsee': ['Seealpsee', 'lake'],
};

/** Zahraničné výlety z datasetu: `unitsForTrail` pozná len slovenské jednotky. */
const EXTRA_RANGES: Record<string, string[]> = { 'vintgar-radovna-tiesnava': ['Julské Alpy'], seealpsee: ['Alpstein'] };
const EXTRA_PARKS: Record<string, string[]> = { 'vintgar-radovna-tiesnava': ['Triglavský NP'] };

/** Menovatele zbierok podľa krajiny. Krajina bez riadku menovateľ neukáže. */
const unitsOf = (key: GeoCategory) => SK_GEO.find((c) => c.key === key)?.units ?? [];
export const WALL_UNITS: Record<'ranges' | 'parks' | 'journeys' | 'chko', Record<string, string[]>> = {
  ranges: { sk: unitsOf('ranges') },
  parks: { sk: unitsOf('parks'), si: ['Triglavský NP'], ch: ['Švajčiarsky NP'] },
  journeys: { sk: unitsOf('journeys') },
  chko: { sk: unitsOf('chko') },
};

const km = (t: HeroTrail) => Number(t.km) || 0;

function groupUnits(trails: HeroTrail[], unitsFor: (t: HeroTrail) => string[]): WallItem[] {
  const m = new Map<string, WallItem>();
  for (const t of trails) {
    for (const u of unitsFor(t)) {
      const hit = m.get(u);
      if (hit) hit.trails.push(t);
      else m.set(u, { name: u, iso: trailCountry(t), trails: [t] });
    }
  }
  return [...m.values()].sort((a, b) => b.trails.length - a.trails.length);
}

export interface TripWallStats {
  km: number;
  ascent: number;
  /** Koľko ráz Mount Everest, zaokrúhlené nadol na desatiny. */
  everest: number;
  countries: { iso: string; trails: HeroTrail[] }[];
  ranges: WallItem[];
  parks: WallItem[];
  chko: WallItem[];
  peaks: WallItem[];
  waters: WallItem[];
  journeys: WallItem[];
  roadtrips: WallItem[];
  stays: WallItem[];
  nights: number;
  byKm: HeroTrail[];
  byAscent: HeroTrail[];
}

export function computeTripWall(walked: HeroTrail[]): TripWallStats {
  const units = (t: HeroTrail) => unitsForTrail(t);
  const ranges = groupUnits(walked, (t) => [...(units(t).ranges ?? []), ...(EXTRA_RANGES[t.id] ?? [])]);
  const parks = groupUnits(walked, (t) => {
    const s = new Set([...(units(t).parks ?? []), ...(EXTRA_PARKS[t.id] ?? [])]);
    if (t.id.endsWith('slovensky-raj')) s.add('NP Slovenský raj');
    return [...s];
  });
  const chko = groupUnits(walked, (t) => units(t).chko ?? []);

  const peakMap = new Map<string, WallItem>();
  for (const t of walked) {
    const p = PEAK_BY_TRAIL[t.id];
    if (!p) continue;
    const hit = peakMap.get(p[0]);
    if (hit) hit.trails.push(t);
    else peakMap.set(p[0], { name: p[0], iso: trailCountry(t), value: p[1], trails: [t] });
  }
  const peaks = [...peakMap.values()].sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const waters: WallItem[] = [];
  for (const t of walked) {
    const w = WATER_BY_TRAIL[t.id];
    if (w) { waters.push({ name: w[0], iso: trailCountry(t), water: w[1], trails: [t] }); continue; }
    if (!t.acts?.includes('lake')) continue;
    const n = t.name.toLowerCase();
    waters.push({ name: t.name, iso: trailCountry(t), water: /priehrad|nádrž|reservoir|dam/.test(n) ? 'reservoir' : /jazierk|rybn|pond/.test(n) ? 'pond' : 'lake', trails: [t] });
  }

  const journeys = walked.filter((t) => t.acts?.includes('journey'))
    .map((t) => ({ name: t.name, iso: trailCountry(t), value: km(t), trails: [] as HeroTrail[] }));

  const roadtrips = walked.filter((t) => t.acts?.includes(ROADTRIP_ACT))
    .map((t) => ({ name: t.name, iso: trailCountry(t), value: km(t), trails: [] as HeroTrail[] }));

  const stays: WallItem[] = [];
  let nights = 0;
  for (const t of walked) {
    const days = tripDayCount(t);
    if (days < 2 || t.acts?.includes(ROADTRIP_ACT)) continue;
    nights += days - 1;
    stays.push({ name: t.name, iso: trailCountry(t), value: days - 1, trails: [] });
  }

  const byIso = new Map<string, HeroTrail[]>();
  for (const t of walked) {
    const iso = trailCountry(t);
    const arr = byIso.get(iso);
    if (arr) arr.push(t); else byIso.set(iso, [t]);
  }
  const ascent = walked.reduce((s, t) => s + (t.ascentM ?? 0), 0);

  return {
    km: walked.reduce((s, t) => s + km(t), 0),
    ascent,
    everest: Math.floor((ascent / 8849) * 10) / 10,
    countries: [...byIso.entries()].map(([iso, trails]) => ({ iso, trails })).sort((a, b) => b.trails.length - a.trails.length),
    ranges, parks, chko, peaks, waters, journeys, roadtrips, stays, nights,
    byKm: walked.filter((t) => km(t) > 0).sort((a, b) => km(b) - km(a)),
    byAscent: walked.filter((t) => (t.ascentM ?? 0) > 0).sort((a, b) => (b.ascentM ?? 0) - (a.ascentM ?? 0)),
  };
}
