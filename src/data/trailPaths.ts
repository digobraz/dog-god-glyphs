// PLNÁ STOPA TRÁS — sťahuje sa až keď treba (audit /pack/map, 26. 9. 2026).
//
// `HERO_TRAILS[].path` nesie čiaru ZRIEDENÚ na 10 m (plany/gen-hero-trails.mjs, SIMPLIFY_M):
// podmnožinu pôvodných bodov so zachovaným štartom a cieľom. Na prehľad mapy a na všetko,
// čo meria so stovkami metrov (značky 150/500 m, priania 5 km, hmla), to stačí.
// Presnú stopu treba len tam, kde je 10 m vidno alebo kde odchádza von:
//   · mapa priblížená k chodníkom a vybraný výlet (PackMap)
//   · článok výletu — čiara, rámovanie, GPX a odkaz na Mapy.com (PackTripArticle)
//   · duchovia existujúcich trás pri kreslení novej (GeometryPicker)
// ⚠️ Nový konzument, ktorý z čiary MERIA dĺžku alebo ju EXPORTUJE, patrí na plnú stopu.
import { useEffect, useState } from 'react';
import type { LatLngTuple } from 'leaflet';

export type TrailPaths = Record<string, LatLngTuple[]>;

let cache: TrailPaths | null = null;
let pending: Promise<TrailPaths> | null = null;

export function loadTrailPaths(): Promise<TrailPaths> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = import('./heroTrailPaths.generated')
      .then((m) => (cache = m.HERO_TRAIL_PATHS))
      // Bez siete ostáva zriedená čiara — pokus sa zopakuje pri ďalšom volaní.
      .catch(() => { pending = null; return {} as TrailPaths; });
  }
  return pending;
}

/** Plné stopy, keď `active`; dovtedy `null` (kresli sa zriedená `path`). Po načítaní ostávajú. */
export function useTrailPaths(active = true): TrailPaths | null {
  const [paths, setPaths] = useState<TrailPaths | null>(cache);
  useEffect(() => {
    if (!active || paths) return;
    let alive = true;
    // Aj prázdny výsledok (bez siete) sa zapíše — konzument sa nesmie zaseknúť v čakaní;
    // `fullPathOf` vtedy vráti čiaru, ktorú výlet nesie.
    void loadTrailPaths().then((p) => { if (alive) setPaths(p); });
    return () => { alive = false; };
  }, [active, paths]);
  return paths;
}

/** Presná čiara výletu, ak je načítaná; inak tá, ktorú výlet nesie (zriedená alebo vlastná). */
export const fullPathOf = (tr: { id: string; path: LatLngTuple[] }, paths: TrailPaths | null): LatLngTuple[] =>
  paths?.[tr.id] ?? tr.path;
