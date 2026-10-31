// ============================================================================
// POSTREHY K MIESTU NA MAPE — čítanie, zápis, body PÚTNIKA (`20261112_place_posts.sql`).
// Zadanie: `plany/zadanie-miesto-na-mape-2026-10-31.md` · nákres v3.
//
// ── MIESTO = BOD ZO SVETA, POSTREH = NÁZOR ČLENA ────────────────────────────
// Body nesú dlaždice OSM (`usePoiTiles`), DB o nich nevie nič. Postreh nesie DRUH a
// SÚRADNICU bodu, ku ktorému patrí, a páruje sa GEOMETRICKY (`postsAt`) — rovnaký jazyk ako
// `spotAt()` v `sleepSpotsData.ts`. Dlaždice OSM id nenesú (boli by väčšie než dáta).
//
// ⚠️ NAČÍTAVA SA RAZ ZA ŽIVOT STRÁNKY (a po vlastnom zápise znova). Mapa, kreslenie trasy aj
// článok si kartu otvárajú nezávisle — bez spoločného sľubu by vypálili rovnaké RPC naraz.
// ============================================================================
import { useEffect, useState } from 'react';
import { supabase as db } from '@/integrations/supabase/client';
import { hasSession } from '@/lib/hasSession';
import { DEV_NOAUTH } from '@/lib/devMockDogs';
import { uploadPlacePhoto } from '@/services/cloudinaryService';
import { compressFile } from '@/lib/photoIntake';

/** Päť druhov bodov (Matej 31. 10.). `bivak` = Bivak / prístrešok, rozlíšenie nesie chip. */
export const PLACE_KINDS = ['hut', 'camp', 'bivak', 'spring', 'viewpoint'] as const;
export type PlaceKind = (typeof PLACE_KINDS)[number];

/** Typ bodu v dlaždici / `TRAIL_POI` → druh miesta. Iné typy (lavička, sedlo…) miestom NIE SÚ. */
export function placeKindOf(poiType: string): PlaceKind | null {
  switch (poiType) {
    case 'sleep_hut': return 'hut';
    case 'sleep_camp': return 'camp';
    case 'sleep_bivak':
    // Článok výletu (`TRAIL_POI`) má prístrešok ako samostatný typ — od 31. 10. je to ten istý druh.
    case 'shelter': return 'bivak';
    case 'spring': return 'spring';
    case 'viewpoint': return 'viewpoint';
    default: return null;
  }
}

export interface PlacePost {
  id: string;
  kind: PlaceKind;
  lat: number;
  lon: number;
  placeName: string;
  paws: number | null;
  body: string;
  photos: string[];
  chips: string[];
  /** 'pending' vidí len autor — fotky ešte kontroluje AINUBIS */
  review: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  isMine: boolean;
  authorFirst: string | null;
  packNumber: number | null;
  avatarUrl: string | null;
}

interface Row {
  id: string; place_kind: string; lat: number; lon: number; place_name: string | null;
  paws: number | null; body: string | null; photos: string[] | null; chips: string[] | null;
  photo_review: string; created_at: string; is_mine: boolean;
  author_first: string | null; pack_number: number | null; avatar_url: string | null;
}

const fromRow = (r: Row): PlacePost => ({
  id: r.id,
  kind: r.place_kind as PlaceKind,
  lat: r.lat,
  lon: r.lon,
  placeName: r.place_name ?? '',
  paws: r.paws,
  body: r.body ?? '',
  photos: r.photos ?? [],
  chips: r.chips ?? [],
  review: (r.photo_review as PlacePost['review']) ?? 'approved',
  createdAt: r.created_at,
  isMine: !!r.is_mine,
  authorFirst: r.author_first,
  packNumber: r.pack_number,
  avatarUrl: r.avatar_url,
});

// ⚠️ RPC nie sú v `integrations/supabase/types.ts` (typy sú staršie než migrácia) — rovnaká
//    jedna obchádzka ako `list_sleep_spots` v `sleepSpotsData.ts`. Oprava = pregenerovať typy.
type Rpc = (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
// 🔴 `.bind(db)` NIE JE OZDOBA (31. 10. 2026): holé `db.rpc` stratí `this` a hodí chybu ešte PRED
// sieťou — postreh sa neuložil, zoznam sa nenačítal a „zatiaľ nikto nič" to ticho zakrylo.
// NOAUTH dev to neodhalil (rpc nevolá); chytil to až prihlásený test na DEV.
const rpc = (db.rpc as unknown as Rpc).bind(db);

let cache: PlacePost[] | null = null;
let inflight: Promise<PlacePost[]> | null = null;
const listeners = new Set<(p: PlacePost[]) => void>();

/** Zlyhanie je TICHÉ: karta vtedy ukáže „zatiaľ nikto nič nepridal", čo nie je lož o mieste. */
export function loadPlacePosts(): Promise<PlacePost[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = (async () => {
      if (DEV_NOAUTH || !(await hasSession())) return [];
      const { data, error } = await rpc('list_place_posts');
      if (error) throw error;
      return ((data ?? []) as Row[]).map(fromRow);
    })()
      .then((p) => { cache = p; listeners.forEach((fn) => fn(p)); return p; })
      .catch(() => [] as PlacePost[])
      .finally(() => { inflight = null; });
  }
  return inflight;
}

function reload(): void {
  cache = null;
  void loadPlacePosts();
}

export function usePlacePosts(): PlacePost[] {
  const [posts, setPosts] = useState<PlacePost[]>(cache ?? []);
  useEffect(() => {
    let alive = true;
    const fn = (p: PlacePost[]) => { if (alive) setPosts(p); };
    listeners.add(fn);
    void loadPlacePosts().then(fn);
    return () => { alive = false; listeners.delete(fn); };
  }, []);
  return posts;
}

/** Postreh patrí k bodu do 60 m toho istého druhu — rovnaká hranica ako `spotAt()`
 *  (útulňa nakreslená ako budova vs. jej uzol). Najnovšie prvé. */
const MATCH_M = 60;
export function postsAt(posts: PlacePost[], kind: PlaceKind, lat: number, lon: number): PlacePost[] {
  const k = Math.cos((lat * Math.PI) / 180);
  return posts.filter((p) => p.kind === kind
    && Math.hypot((p.lon - lon) * 111320 * k, (p.lat - lat) * 110540) < MATCH_M);
}

/** Priemer labiek z postrehov, ktoré ich majú. `null` = nikto nehodnotil. */
export function pawsAverage(posts: PlacePost[]): { avg: number; n: number } | null {
  const rated = posts.filter((p) => p.paws != null);
  if (!rated.length) return null;
  return { avg: rated.reduce((s, p) => s + (p.paws ?? 0), 0) / rated.length, n: rated.length };
}

/** Získal som už body na tomto mieste? Rozhoduje server (`scored`); appka len ukáže, či
 *  „+10" na tlačidle ešte platí — inak by sľubovala body, ktoré nepríde. */
export const alreadyScoredHere = (here: PlacePost[]): boolean =>
  here.some((p) => p.isMine && p.photos.length > 0 && p.review !== 'rejected');

export interface NewPlacePost {
  kind: PlaceKind;
  lat: number;
  lon: number;
  placeName: string;
  paws: number | null;
  body: string;
  photos: string[];
  chips: string[];
}

/** Zapíše postreh a hneď požiada AINUBISA o posúdenie fotiek (zlyhanie volania nevadí —
 *  cron á 10 min zametie, čo ostalo 'pending'). Vracia, či zápis priniesol body. */
export async function addPlacePost(n: NewPlacePost): Promise<{ id: string; scored: boolean }> {
  const { data, error } = await rpc('add_place_post', {
    p_kind: n.kind, p_lat: n.lat, p_lon: n.lon, p_name: n.placeName,
    p_paws: n.paws, p_body: n.body, p_photos: n.photos, p_chips: n.chips,
  });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as { id: string; scored: boolean };
  if (n.photos.length) {
    void db.functions.invoke('review-place-photo', { body: { postId: row.id } })
      .finally(() => { reload(); invalidateMyPlacePoints(); });
  }
  reload();
  return { id: row.id, scored: !!row.scored };
}

export async function deletePlacePost(id: string): Promise<void> {
  const { error } = await rpc('delete_place_post', { p_id: id });
  if (error) throw error;
  reload();
  invalidateMyPlacePoints();
}

/** Zmenší a nahrá fotku do `places/<uid>`. */
export async function uploadPlaceFile(file: File, uid: string): Promise<string> {
  const { blob } = await compressFile(file);
  const { secureUrl } = await uploadPlacePhoto(blob, uid, `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`);
  return secureUrl;
}

// ── BODY PÚTNIKA — POČET postrehov s bodmi (cena `POINTS.place` je v appke) ──
// Vzor `useMyWishCount()` v `mapnotes/wishData.ts`: jedno číslo pre všetky povrchy s levelom.
let countCache: number | null = null;
let countInflight: Promise<number> | null = null;
const countListeners = new Set<(n: number) => void>();

async function loadPlaceCount(): Promise<number> {
  if (countCache != null) return countCache;
  if (!countInflight) {
    countInflight = (async () => {
      if (!(await hasSession())) return 0;
      const { data, error } = await rpc('my_place_points');
      return error ? 0 : Number(data) || 0;
    })()
      .then((n) => { countCache = n; return n; })
      .catch(() => 0)
      .finally(() => { countInflight = null; });
  }
  return countInflight;
}

export function invalidateMyPlacePoints(): void {
  countCache = null;
  void loadPlaceCount().then((n) => countListeners.forEach((fn) => fn(n)));
}

export function useMyPlacePostCount(enabled = !DEV_NOAUTH): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!enabled) { setN(0); return; }
    let live = true;
    const fn = (v: number) => { if (live) setN(v); };
    countListeners.add(fn);
    void loadPlaceCount().then(fn);
    return () => { live = false; countListeners.delete(fn); };
  }, [enabled]);
  return n;
}
