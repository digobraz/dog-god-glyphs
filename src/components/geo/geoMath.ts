// Zdieľaná geo matematika pre mapové vrstvy (PackMap.tsx + FogLayer.tsx). Predtým žila
// duplicitne v oboch súboroch (metersPerPixel) — integračná vlna (spec-hmla.md) ju zjednotila
// sem, nech pri ladení konštánt netreba meniť dve kópie na dvoch miestach.
/** Koľko reálnych metrov pokrýva jeden pixel pri danej zemepisnej šírke a zoome (Web Mercator). */
export function metersPerPixel(lat: number, zoom: number): number {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}
