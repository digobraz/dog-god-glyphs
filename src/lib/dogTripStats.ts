// ─────────────────────────────────────────────────────────────────────────────
// PSIE KM — jeden zdroj čísel pre psa (B20, Matej 17. 9. 2026).
//
// „počíta sa to pre človeka (pútnik všetky km so psami) a jednotlive km bude mať
// pes v profile ako aj prejdený vylety a km… v tripstats bude aj pes a jeho stats."
//
// 🔒 PÚTNIK SA TÝMTO NEDELÍ. Body, level ani prstenec v hlavičke `/map` sa odtiaľto
// nečítajú — tie ostávajú človeku a rátajú sa z `trip_walked` (`walkedIds`).
// Tento modul odpovedá na inú otázku: čo prešiel PES.
//
// ⚠️ KM NIE SÚ V DB a nebudú. Nesie ich trasa (`heroTrails.generated.ts`,
// `heroJourneys.ts`, členmi nahodené výlety v `trp-local-trails`), nie vzťah k nej —
// presne ako pri človeku, kde `walkedKm` vzniká z `allTrails.filter(walkedIds.has)`.
// Druhé miesto s číslom km by znamenalo dve odpovede na tú istú otázku.
//
// ⚠️ Zoznam trás sa skladá TOU ISTOU trojicou ako `allTrails` v PackMap.tsx
// (`visibleLocalTrails` + `HERO_JOURNEYS` + `HERO_TRAILS`) — keby sa rozišli,
// psí profil by hlásil iné km než mapa nad tými istými výletmi.
// ─────────────────────────────────────────────────────────────────────────────
import { HERO_TRAILS, type HeroTrail } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { visibleLocalTrails, readLocalTrails } from '@/components/pack/tripShared';
import { readDogTrips } from '@/lib/packStore';

export interface DogTripStats {
  /** Prejdené výlety psa — počítajú sa LEN tie, ktoré appka vie nájsť medzi trasami. */
  trips: number;
  km: number;
  trails: HeroTrail[];
}

/**
 * ⚠️ Slug bez trasy sa do počtu NERÁTA. Stáva sa to pri výlete, ktorý ešte nedorazil
 * z `pack_trips` (hydratácia beží), a pripočítať ho ako „+1 výlet, 0 km" by znamenalo
 * blok, kde počet a kilometre nesedia k sebe. Radšej o riadok menej než dve čísla,
 * ktoré si protirečia.
 */
export function dogTripStats(dogId: string | null | undefined): DogTripStats {
  if (!dogId) return { trips: 0, km: 0, trails: [] };
  const slugs = new Set(readDogTrips()[dogId] ?? []);
  if (!slugs.size) return { trips: 0, km: 0, trails: [] };
  const all = [...visibleLocalTrails(readLocalTrails()), ...HERO_JOURNEYS, ...HERO_TRAILS];
  const trails = all.filter((tr) => slugs.has(tr.id));
  const km = trails.reduce((s, tr) => s + (Number(tr.km) || 0), 0);
  return { trips: trails.length, km, trails };
}

/** Rovnaký tvar čísla ako TRIPSTATS (`fmtKm`) — celé číslo bez desatiny, inak jedna. */
export const fmtDogKm = (n: number): string => (Number.isInteger(n) ? String(n) : n.toFixed(1));
