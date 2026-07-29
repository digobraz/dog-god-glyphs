// ADD TRIP — klient k edge funkcii `map-proxy` (vlna 1, krok 3).
// Kontrakt: plany/kontrakt-geometrypicker-2026-07-29.md §1
//
// PREČO CEZ PROXY A NIE PRIAMO: kľúč Mapy.com je síce vo frontende (src/lib/env.ts — musí byť,
// ťahajú sa cezeň mapové dlaždice), ale routing cezeň volať priamo NESMIEME — obišli by sme
// server-side cache, mesačný kill-switch aj počítadlo `map_api_usage`. Presne to robí starý
// src/lib/snapToTrail.ts; ten sa na konci vlny maže spolu s __TrailsPreview.tsx.
//
// DVE CACHE, OBE MODULOVÉ (nie React state) — prežívajú zavretie a znovuotvorenie ADD flow,
// inak by človek platil kredity znova za tie isté kliky:
//   snapCache — geometria úsekov (undo → redo NESMIE volať sieť, §10.2 bod 2 zadania)
//   elevCache — výšky bodov, kľúč cez elevCacheKey() z addTripGeo.ts (~1 m presnosť)
import type { LatLngTuple } from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { EDGE_BASE, SUPABASE_ANON_KEY } from '@/lib/env';
import { elevCacheKey } from './addTripGeo';

const ROUTE_URL = `${EDGE_BASE}/map-proxy/route`;
const ELEVATION_URL = `${EDGE_BASE}/map-proxy/elevation`;

// OpenTopoData: ~1 req/s, 100 bodov/request. Server to drží tiež, ale klient nemá zbytočne
// otvárať paralelné requesty a čakať v nich.
const ELEVATION_BATCH = 100;
const ELEVATION_GAP_MS = 1100;

export type SnapReason = 'ok' | 'straight' | 'paused' | 'ratelimited' | 'error';

export type SnapResult = {
  geometry: LatLngTuple[];
  lengthM: number;
  snapped: boolean;
  reason: SnapReason;
};

// ── cache ───────────────────────────────────────────────────────────────────────────────
const snapCache = new Map<string, SnapResult>();
const elevCache = new Map<string, number>();
// in-flight dedup: pri rýchlom klikaní by sa ten istý úsek/bod fetchol viackrát
const snapInFlight = new Map<string, Promise<SnapResult>>();
const elevInFlight = new Set<string>();

function segKey(from: LatLngTuple, to: LatLngTuple): string {
  return `${elevCacheKey(from[0], from[1])}|${elevCacheKey(to[0], to[1])}`;
}

// ── auth hlavičky ───────────────────────────────────────────────────────────────────────
// Prihlásený člen → jeho JWT (proxy podľa neho ráta per-user rate limit 150/h, 600/deň).
// Bez session (dev DEV_NOAUTH, alebo odhlásený) → anon key; proxy padne na rate limit podľa IP.
async function authHeaders(): Promise<Record<string, string>> {
  let token = SUPABASE_ANON_KEY;
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) token = data.session.access_token;
  } catch {
    /* bez session sa kreslí ďalej — rate limit padne na IP */
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    apikey: SUPABASE_ANON_KEY,
  };
}

// ── snapSegment ─────────────────────────────────────────────────────────────────────────
/**
 * Snapne JEDEN úsek (from→to) na chodník cez proxy.
 * NIKDY nehádže — pri akejkoľvek chybe vráti rovnú čiaru so `snapped:false`. Kreslenie sa
 * nesmie zaseknúť na sieti; volajúci podľa `reason` zobrazí hlášku (§5.2c).
 */
export async function snapSegment(
  from: LatLngTuple,
  to: LatLngTuple,
  signal?: AbortSignal,
): Promise<SnapResult> {
  const key = segKey(from, to);

  const hit = snapCache.get(key);
  if (hit) return hit;

  const pending = snapInFlight.get(key);
  if (pending) return pending;

  const straightFallback = (reason: SnapReason): SnapResult => ({
    geometry: [from, to],
    lengthM: Math.round(haversine(from, to)),
    snapped: false,
    reason,
  });

  const task = (async (): Promise<SnapResult> => {
    try {
      const res = await fetch(ROUTE_URL, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ from, to }),
        signal,
      });

      // 429 = per-user rate limit. Žiadny retry — volajúci ukáže „slow down" a kreslí rovno.
      if (res.status === 429) return straightFallback('ratelimited');
      if (!res.ok) return straightFallback('error');

      const d = await res.json();
      const geometry: LatLngTuple[] = Array.isArray(d?.geometry) && d.geometry.length >= 2
        ? d.geometry
        : [from, to];
      const result: SnapResult = {
        geometry,
        lengthM: Number(d?.lengthM ?? Math.round(haversine(from, to))),
        snapped: !!d?.snapped,
        reason: d?.paused ? 'paused' : d?.snapped ? 'ok' : 'straight',
      };
      // cachujeme aj neúspech — ten istý pár klikov nemá volať API znova
      snapCache.set(key, result);
      return result;
    } catch {
      // abort (človek klikol ďalej) aj sieťová chyba → rovná čiara, NEcachovať
      return straightFallback('error');
    } finally {
      snapInFlight.delete(key);
    }
  })();

  snapInFlight.set(key, task);
  return task;
}

// ── výšky ───────────────────────────────────────────────────────────────────────────────
/**
 * Dotiahne výšky pre body, ktoré ešte nie sú v cache, a zapíše ich do zdieľanej `elevCache`.
 * Fronta: po 100 bodoch, s odstupom ~1,1 s (limit OpenTopoData).
 * NIKDY nehádže — čo sa nepodarí, ostane nevyplnené a `elevAt` vráti undefined.
 */
export async function ensureElevations(points: LatLngTuple[], signal?: AbortSignal): Promise<void> {
  // deduplikuj podľa cache kľúča: interp() dáva body po 100 m, ale susedné trasy sa prekrývajú
  const wanted = new Map<string, LatLngTuple>();
  for (const p of points) {
    const k = elevCacheKey(p[0], p[1]);
    if (!elevCache.has(k) && !elevInFlight.has(k)) wanted.set(k, p);
  }
  if (wanted.size === 0) return;

  const keys = [...wanted.keys()];
  keys.forEach((k) => elevInFlight.add(k));

  try {
    const entries = [...wanted.entries()];
    for (let i = 0; i < entries.length; i += ELEVATION_BATCH) {
      if (signal?.aborted) return;
      const chunk = entries.slice(i, i + ELEVATION_BATCH);
      try {
        const res = await fetch(ELEVATION_URL, {
          method: 'POST',
          headers: await authHeaders(),
          body: JSON.stringify({ points: chunk.map(([, p]) => p) }),
          signal,
        });
        if (res.ok) {
          const d = await res.json();
          const elevations: Array<number | null> = Array.isArray(d?.elevations) ? d.elevations : [];
          chunk.forEach(([k], idx) => {
            const e = elevations[idx];
            if (typeof e === 'number' && Number.isFinite(e)) elevCache.set(k, e);
          });
        }
      } catch {
        /* chýbajúce výšky = `↑ …` namiesto čísla; nikdy nie klamlivá 0 */
      }
      if (i + ELEVATION_BATCH < entries.length) {
        await new Promise((r) => setTimeout(r, ELEVATION_GAP_MS));
      }
    }
  } finally {
    keys.forEach((k) => elevInFlight.delete(k));
  }
}

/**
 * Synchrónny lookup do cache — presne tvar, aký chce `calibratedAscent(path, elevAt)`.
 * Žiadna sieť: prepočet celej trasy pri každom kliku (§5.2a) musí byť lokálny a v milisekundách.
 */
export function elevAt(p: LatLngTuple): number | null | undefined {
  return elevCache.get(elevCacheKey(p[0], p[1]));
}

/** Koľko bodov ešte nemá výšku — kým > 0, zobrazuj `↑ …`, NIE `↑ 0 m` (klamalo by). */
export function missingElevationCount(points: LatLngTuple[]): number {
  let n = 0;
  for (const p of points) if (!elevCache.has(elevCacheKey(p[0], p[1]))) n++;
  return n;
}

// ── lokálna haversine ───────────────────────────────────────────────────────────────────
// Vlastná kópia namiesto importu `hav` z addTripGeo.ts — ten súbor je 1:1 port Python skriptu
// a drží kalibráciu; tento klient si ho nemá ťahať kvôli jednej pomocnej funkcii vo fallbacku.
function haversine(a: LatLngTuple, b: LatLngTuple): number {
  const R = 6371000;
  const p1 = (a[0] * Math.PI) / 180;
  const p2 = (b[0] * Math.PI) / 180;
  const dp = ((b[0] - a[0]) * Math.PI) / 180;
  const dl = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
