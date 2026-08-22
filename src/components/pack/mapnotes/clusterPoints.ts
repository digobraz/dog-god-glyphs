// ZHLUKOVANIE BODOV NA MAPE — spoločný mechanizmus pre viac vrstiev.
//
// Matej 2026-08-22: „tie hrozby musíme upraviť tak ako sú výlety v zmysle že
// z diaľky to budú len biele kruhy z červeným lemom a číslom vo vnútri a pri
// vačšom zoome sa rozpadnú na jednotlivé ikonky."
//
// ── PREČO VLASTNÝ SÚBOR A NIE KÓD V KAŽDEJ VRSTVE ──────────────────────────
// Rovnaká matematika už žije v `TripMarkers` (PackMap.tsx, port z odladeného
// prototypu 27. 7.). Skopírovať ju tretíkrát by znamenalo tri zhlukovania, ktoré
// sa časom rozídu a mapa bude mať tri rôzne odstupy. Toto je jej destilát pre
// vrstvy, ktoré nemajú prekážky s obdĺžnikom (pilulky výletov) — teda čistý
// greedy zhluk podľa vzdialenosti v pixeloch, bez ustupovania.
//
// ⚠️ KAŽDÁ VRSTVA ZHLUKUJE SAMA ZA SEBA. Zápisy svorky a cudzí dataset vreteníc
// sa NESMÚ zliať do jedného čísla — „6 upozornení" by potom tvrdilo niečo, čo
// z polovice pochádza zo screenshotu, a z polovice od členov s hlasovaním.

export interface ClusterInput {
  /** projekcia bodu do pixelov kontajnera — dodá volajúci cez `map.latLngToContainerPoint` */
  x: number;
  y: number;
}

export interface Cluster<T> {
  /** ťažisko zhluku v pixeloch (na prepočet späť cez `map.containerPointToLatLng`) */
  x: number;
  y: number;
  items: T[];
}

/**
 * Greedy zhluk podľa vzdialenosti v pixeloch.
 *
 * Poradie je STABILNÉ (zľava dole) zámerne — bez zoradenia dá ten istý výrez pri
 * každom prekreslení iný výsledok a bubliny pri posúvaní mapy poskakujú. Tá istá
 * pasca a to isté riešenie ako v `TripMarkers`.
 */
export function clusterByPixels<T>(pts: Array<T & ClusterInput>, radiusPx: number): Array<Cluster<T>> {
  const proj = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
  const taken = new Array<boolean>(proj.length).fill(false);
  const out: Array<Cluster<T>> = [];
  for (let i = 0; i < proj.length; i++) {
    if (taken[i]) continue;
    taken[i] = true;
    const group = [proj[i]];
    for (let j = i + 1; j < proj.length; j++) {
      if (taken[j]) continue;
      if (Math.hypot(proj[j].x - proj[i].x, proj[j].y - proj[i].y) <= radiusPx) {
        taken[j] = true;
        group.push(proj[j]);
      }
    }
    out.push({
      x: group.reduce((s, g) => s + g.x, 0) / group.length,
      y: group.reduce((s, g) => s + g.y, 0) / group.length,
      items: group,
    });
  }
  return out;
}

/** Veľkosť bubliny zhluku rastie s počtom — rovnaká stupnica ako pri výletoch. */
export const clusterPx = (n: number): number => (n < 5 ? 30 : n < 12 ? 36 : 42);
