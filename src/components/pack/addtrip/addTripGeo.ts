// ADD TRIP — geometria/prevýšenie na klientovi (vlna 1, §5.1–5.2 zadania). Port funkcií z
// `plany/compute-ascent.py` DO PÍSMENA — ten skript kalibruje celý existujúci dataset
// (`heroTrails.generated.ts` ascentM). Ak by tu live výpočet použil inú hustotu vzorkovania
// alebo iný kalibračný faktor, čerstvo nakreslené tripy by sa rozišli s dátami — presne pasca
// z §5.2, ktorú tento súbor rieši. Žiadne volania siete tu — `calibratedAscent` dostane
// `elevAt` ako callback (proxy/cache si rieši volajúci), takže sa dá testovať bez API.
import type { LatLngTuple } from 'leaflet';

// SPACING = rozostup po prevzorkovaní (m), rovnaký ako v compute-ascent.py — kalibrácia SNP
// je naň naviazaná, meniť sa nesmie bez prepočítania celého datasetu.
export const SPACING = 100;
// SNP_BOOK = kniha „Cesta s Hrdinom" — kalibračná kotva (compute-ascent.py riadok 19).
export const SNP_BOOK = 29403;

// Kalibračný faktor = SNP_BOOK / raw_gain(SNP trasy po interp na SPACING m).
// Zistené 2026-07-27 priamym prepočtom z `plany/.ascent-elev-cache.json['__SNP_CALIB__']`
// (rovnaké DEM výšky, aké použil posledný beh compute-ascent.py): RAW = 29562,56 m →
// faktor = 29403 / 29562,56 = 0,9946026074461444. Overené na celom `plany/ascent-cache.json`
// (54/54 trás sedí presne po zaokrúhlení) — je to TÁ ISTÁ hodnota, akú batch skript naposledy
// zapísal, nie nový odhad. Ak sa SNP kalibračná stopa v `heroJourneys.ts` niekedy zmení,
// treba faktor prepočítať znova (compute-ascent.py to spraví automaticky pri ďalšom behu).
export const CALIB_FACTOR = 0.9946026074461444;

// ── haversine (m) — 1:1 port `hav()` z compute-ascent.py ───────────────────────────────
export function hav(a: LatLngTuple, b: LatLngTuple): number {
  const R = 6371000;
  const p1 = (a[0] * Math.PI) / 180;
  const p2 = (b[0] * Math.PI) / 180;
  const dp = ((b[0] - a[0]) * Math.PI) / 180;
  const dl = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

// ── interp — 1:1 port `interp()` z compute-ascent.py ────────────────────────────────────
// Prevzorkuje stopu na rovnomerný rozostup ~spacing m — body vkladá AJ vynecháva.
//
// POZOR (rovnaká pasca ako v Pythone, oprava 2026-07-27, po snape trás na chodníky):
// naivná verzia by body len PRIDÁVALA, takže hustá (snapnutá, bod každých ~8 m) stopa by
// ostala hustá — DEM by sa vzorkoval ~12× hustejšie než kalibračná SNP stopa a šum výškového
// modelu (±1–2 m medzi susednými pixelmi) by sa nazbieral ako falošné stúpanie. Kalibrácia je
// spoločná pre celý dataset, takže by to nafúklo VŠETKY čísla vrátane live kreslenia. Táto
// verzia drží hustotu rovnakú pre kreslené aj snapnuté stopy — akumuluje vzdialenosť (`acc`)
// a vzorkuje presne každých `spacing` metrov pozdĺž trasy, nezávisle od hustoty vstupu.
export function interp(path: LatLngTuple[], spacing: number): LatLngTuple[] {
  if (path.length < 2) return path.slice();
  const out: LatLngTuple[] = [path[0]];
  let acc = 0; // nazbieraná vzdialenosť od posledného vzorkovaného bodu
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const d = hav(a, b);
    if (d === 0) continue;
    let pos = 0; // koľko z tohto segmentu je už spotrebované
    while (acc + (d - pos) >= spacing) {
      pos += spacing - acc;
      const t = pos / d;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      acc = 0;
    }
    acc += d - pos;
  }
  const last = out[out.length - 1];
  const pathLast = path[path.length - 1];
  if (last[0] !== pathLast[0] || last[1] !== pathLast[1]) out.push(pathLast); // koniec stopy vždy, nech dĺžka sedí
  return out;
}

// ── rawAscent — 1:1 port `raw_gain()` z compute-ascent.py ───────────────────────────────
export function rawAscent(elevations: Array<number | null | undefined>): number {
  const e = elevations.filter((x): x is number => x !== null && x !== undefined);
  if (e.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < e.length; i++) sum += Math.max(0, e[i] - e[i - 1]);
  return sum;
}

// ── calibratedAscent — spojí interp + rawAscent + CALIB_FACTOR (§5.2a) ──────────────────
// KRITICKÉ (§5.2a): prevýšenie sa NESMIE sčítavať po segmentoch — pri každom kliku sa musí
// prepočítať CELÁ trasa odznova z cachovaných výšok (elevAt), presne ako batch skript počíta
// celú stopu naraz. Volajúci si drží výšky v `Map<gridKey, elevation>` (elevCacheKey nižšie)
// a fetchuje len chýbajúce body — elevAt tu je čistý synchrónny lookup, žiadna sieť.
export function calibratedAscent(path: LatLngTuple[], elevAt: (p: LatLngTuple) => number | null | undefined): number {
  const resampled = interp(path, SPACING);
  const elevations = resampled.map(elevAt);
  return Math.round(rawAscent(elevations) * CALIB_FACTOR);
}

// ── totalDistanceM — 1:1 kópia z PackPortal.tsx:167 (ten súbor needitovať, len prevzaté) ──
export function totalDistanceM(points: LatLngTuple[]): number {
  let sum = 0;
  for (let i = 1; i < points.length; i++) sum += hav(points[i - 1], points[i]);
  return Math.round(sum);
}

// ── elevCacheKey — kľúč do Map<gridKey, elevation> (§5.2a) ──────────────────────────────
// Zaokrúhlenie na 5 desatinných miest ≈ 1 m — rovnaká presnosť ako server-side snap cache
// (§10.2 bod 1: „kľúč = zaokrúhlené súradnice from/to, 5 desatinných miest ≈ 1 m").
export function elevCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}
