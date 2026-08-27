// NAČÍTAVAČ DLAŽDÍC OSM BODOV — `public/poi/v1/`
//
// Zadanie: `plany/zadanie-vrstva-osm-body-2026-08-27.md` §6.3
// Dáta:    `node plany/gen-poi-tiles.mjs`
//
// ── PREČO NIE ŽIVÝ OVERPASS ────────────────────────────────────────────────
// Pri meraní 27. 8. `overpass-api.de` DVAKRÁT vrátil „The server is probably too busy",
// a to ako HTML stránku, nie JSON; mirror `overpass.kumi.systems` vrátil Internal Server
// Error. Vrstva, ktorá takto zhasne, vyzerá pre člena ako POKAZENÁ MAPA. Overpass sa preto
// používa len pri generovaní (`plany/compute-sleep-spots.py`), nikdy za behu appky.
//
// ── PREČO CACHE MIMO KOMPONENTU ────────────────────────────────────────────
// `Map` je na úrovni modulu zámerne. Človek prejde z mapy do článku výletu a späť, čím sa
// `PoiLayer` odmountuje — s cache v `useState` by sa tie isté dlaždice ťahali znova pri
// každom takom kroku. Takto sa každá stiahne raz na životnosť stránky.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';

/** Musí sedieť s `TILE_DEG` v `plany/gen-poi-tiles.mjs` — je to jediné číslo, ktoré si
 *  generátor a načítavač veria naslepo. Kontrola je nižšie: index nesie `tileDeg` a pri
 *  nezhode sa vrstva radšej vypne, než by kreslila body z posunutej mriežky. */
const TILE_DEG = 0.25;

/** Koľko dlaždíc naraz. Prehliadač zvládne viac, ale vrstva OSM bodov nesmie brať linku
 *  dlaždiciam podkladovej mapy — tie sú to, na čo človek čaká. */
const MAX_PARALLEL = 6;

/** Poistka proti nezmyselne veľkému výrezu (odzoomovanie na celý svet skôr, než sa stihne
 *  uplatniť prah priblíženia). Nad týmto počtom sa nenačíta nič — pri odzoomovaní sa aj tak
 *  nič nekreslí. */
const MAX_TILES_PER_VIEW = 24;

export type PoiTilePoint = { t: string; lat: number; lon: number; name?: string; elev?: number };

type TileIndex = { v: number; tileDeg: number; types: string[]; attribution: string; tiles: string[] };

const BASE = '/poi/v1';

const tileCache = new Map<string, PoiTilePoint[]>();
const inFlight = new Set<string>();
let indexPromise: Promise<TileIndex | null> | null = null;
let tileSet: Set<string> | null = null;

function loadIndex(): Promise<TileIndex | null> {
  indexPromise ||= fetch(`${BASE}/index.json`)
    .then((r) => (r.ok ? r.json() : null))
    .then((j: TileIndex | null) => {
      if (!j) return null;
      // Posunutá mriežka by kreslila body na správnych súradniciach, ale ťahala by nesprávne
      // dlaždice — teda diery, ktoré vyzerajú ako „tu nič nie je". Radšej vypnutá vrstva.
      if (j.tileDeg !== TILE_DEG) {
        console.warn(`[poi] index má tileDeg=${j.tileDeg}, kód počíta s ${TILE_DEG} — vrstva sa vypína`);
        return null;
      }
      tileSet = new Set(j.tiles);
      return j;
    })
    .catch(() => null);
  return indexPromise;
}

function tileIdsFor(map: LeafletMap): string[] {
  const b = map.getBounds().pad(0.2);
  const out: string[] = [];
  const y0 = Math.floor(b.getSouth() / TILE_DEG);
  const y1 = Math.floor(b.getNorth() / TILE_DEG);
  const x0 = Math.floor(b.getWest() / TILE_DEG);
  const x1 = Math.floor(b.getEast() / TILE_DEG);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      out.push(`${y}_${x}`);
      if (out.length > MAX_TILES_PER_VIEW) return [];
    }
  }
  return out;
}

async function fetchTile(id: string): Promise<void> {
  if (tileCache.has(id) || inFlight.has(id)) return;
  inFlight.add(id);
  try {
    const r = await fetch(`${BASE}/${id}.json`);
    if (!r.ok) throw new Error(String(r.status));
    // Poziční n-tica z generátora: [lat, lon] · [lat, lon, meno] · [lat, lon, meno, výška].
    // Prázdne meno pri bode s výškou je zámer, nie chyba dát — preto `name || undefined`.
    const raw = (await r.json()) as Record<string, Array<[number, number, string?, number?]>>;
    const pts: PoiTilePoint[] = [];
    for (const [t, arr] of Object.entries(raw)) {
      for (const [lat, lon, name, elev] of arr) {
        pts.push({ t, lat, lon, ...(name ? { name } : {}), ...(elev != null ? { elev } : {}) });
      }
    }
    tileCache.set(id, pts);
  } catch {
    // ⚠️ ZLYHANIE JE TICHÉ ZÁMERNE. Bod navyše na mape nie je nič; hlásenie o chybe siete
    // nad mapou je horšie než chýbajúci prameň. Dlaždica sa NEUKLADÁ ako prázdna, takže sa
    // pri ďalšom posune skúsi znova.
  } finally {
    inFlight.delete(id);
  }
}

/**
 * Body z dlaždíc pre aktuálny výrez mapy.
 *
 * `zoom` a `moveTick` sú vstupy, nie odvodené hodnoty — Leaflet mení výrez bez toho, aby sa
 * menila referencia na `map`, takže bez nich by sa hook nikdy neprepočítal. Ten istý dôvod je
 * rozpísaný pri `TripMarkers` v `PackMap.tsx`.
 *
 * @param enabled  vrstva je zapnutá A zoom je nad prahom — pod prahom sa NIČ nesťahuje
 *                 (kreslenie sa filtruje inde, ale sieť má mlčať už tu)
 */
export function usePoiTiles(map: LeafletMap, enabled: boolean, zoom: number, moveTick: number): PoiTilePoint[] {
  const [ready, setReady] = useState(0);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      const idx = await loadIndex();
      if (!idx || cancelled || !alive.current) return;
      const want = tileIdsFor(map).filter((id) => tileSet?.has(id) && !tileCache.has(id));
      if (!want.length) return;
      // Fronta so stropom súbežnosti. `Promise.all` nad celým zoznamom by pri prvom otvorení
      // mapy vystrelil všetky dlaždice naraz a pobil sa s podkladovou mapou o linku.
      let i = 0;
      const worker = async () => {
        while (i < want.length && !cancelled) await fetchTile(want[i++]);
      };
      await Promise.all(Array.from({ length: Math.min(MAX_PARALLEL, want.length) }, worker));
      if (!cancelled && alive.current) setReady((n) => n + 1);
    })();
    return () => { cancelled = true; };
  }, [map, enabled, zoom, moveTick]);

  return useMemo(() => {
    if (!enabled) return [];
    const ids = tileIdsFor(map);
    const out: PoiTilePoint[] = [];
    for (const id of ids) {
      const pts = tileCache.get(id);
      if (pts) out.push(...pts);
    }
    return out;
    // `ready` je zámerná závislosť — dotiahnutá dlaždica nemení nič iné, na čo by sa dalo
    // reagovať. eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, enabled, zoom, moveTick, ready]);
}

// Atribúciu nesie `POI_ATTRIBUTION` v `trailPoi.generated.ts` a kreslí `<PoiAttribution />` —
// druhá kópia toho istého reťazca tu by sa raz rozišla a licenčný text sa rozísť nesmie.
