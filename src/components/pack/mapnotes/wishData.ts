// ============================================================================
// PRIANIA — dátová vrstva (BUDDY krok 2, 24. 9. 2026)
//
// Zadanie: `plany/zadanie-assnif-2026-09-24.md` §2 · DB: `20260925_wish_pins.sql`.
// Vzor: `mapNotesData.ts` — čítanie aj zápis len cez RPC, cudzí `user_id` sa klientovi
// nevydáva (NAPÍSAŤ ide cez `start_wish_dm(id prania)`).
//
// Emoji a lem značky sú v `markEmoji.ts` (`WISH_EMOJI`, `WISH_RIM`) — jediný zdroj značiek mapy.
//
// DEV_NOAUTH (atrapa bez prihlásenia) drží priania v localStorage, aby sa dal tok
// preklikať bez účtu. Do produkčného buildu sa vetva nedostane.
// ============================================================================
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WISHES_LIVE } from '@/lib/packFlags';
import { countryISO2 } from '@/lib/countryGeo';
import { distM } from '@/components/pack/addtrip/builtUpCheck';
import { trackPack } from '@/lib/packAnalytics';
import { DEV_NOAUTH } from './devMockNotes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const WISH_TRIP_KINDS = ['short', 'day', 'multi', 'roadtrip', 'abroad'] as const;
export type WishTripKind = typeof WISH_TRIP_KINDS[number];

export const WISH_WHENS = ['month', 'spring', 'summer', 'autumn', 'winter', 'year', 'lifetime'] as const;
export type WishWhen = typeof WISH_WHENS[number];

export type WishPlaceKind = 'point' | 'peak' | 'city' | 'region' | 'country';

export interface WishPin {
  id: string;
  lat: number;
  lon: number;
  placeName: string;
  placeKind: WishPlaceKind | null;
  trailId: string | null;
  tripKind: WishTripKind;
  when: WishWhen;
  whenYear: number | null;
  seeking: boolean;
  note: string | null;
  expiresAt: string | null;
  createdAt: string;
  isMine: boolean;
  ownerFirst: string | null;
  dogName: string | null;
  dogDeceased: boolean;
  dogPhoto: string | null;
  packNumber: number | null;
}

export interface NewWish {
  lat: number;
  lon: number;
  placeName: string;
  placeKind: WishPlaceKind | null;
  tripKind: WishTripKind;
  when: WishWhen;
  seeking: boolean;
  note: string | null;
  trailId?: string | null;
  /** ISO2 štátu (malými) z vyhľadávača — D1: výlet v tom istom štáte splní prianie „štát". */
  countryCode?: string | null;
}

/** Druh výsledku Mapy.com → druh miesta prania. Neznámy typ = bod. */
export function placeKindFromMapy(type?: string): WishPlaceKind {
  if (!type) return 'point';
  if (type === 'regional.country') return 'country';
  if (type === 'regional.region') return 'region';
  if (type.startsWith('regional.municipality')) return 'city';
  return 'point';
}

/** Zoom mapy po výbere miesta — štát treba vidieť celý, bod zblízka. */
export function zoomForPlaceKind(k: WishPlaceKind | null): number {
  return k === 'country' ? 5 : k === 'region' ? 8 : k === 'city' ? 11 : 13;
}

type Row = {
  id: string; lat: number; lon: number; place_name: string; place_kind: string | null;
  trail_id: string | null; trip_kind: string; when_bucket: string; when_year: number | null;
  seeking: boolean; note: string | null; expires_at: string | null; created_at: string;
  is_mine: boolean; owner_first: string | null; dog_name: string | null;
  dog_deceased: boolean; dog_photo: string | null; pack_number: number | null;
};

function fromRow(r: Row): WishPin {
  return {
    id: r.id, lat: r.lat, lon: r.lon, placeName: r.place_name,
    placeKind: (r.place_kind as WishPlaceKind | null) ?? null, trailId: r.trail_id,
    tripKind: r.trip_kind as WishTripKind, when: r.when_bucket as WishWhen, whenYear: r.when_year,
    seeking: r.seeking, note: r.note, expiresAt: r.expires_at, createdAt: r.created_at,
    isMine: r.is_mine, ownerFirst: r.owner_first, dogName: r.dog_name,
    dogDeceased: !!r.dog_deceased, dogPhoto: r.dog_photo, packNumber: r.pack_number,
  };
}

// ── DEV atrapa ────────────────────────────────────────────────────────────────
const MOCK_KEY = 'trp-wish-mock-v1';
function mockRead(): WishPin[] {
  try { return JSON.parse(localStorage.getItem(MOCK_KEY) || '[]') as WishPin[]; } catch { return []; }
}
function mockWrite(list: WishPin[]) {
  try { localStorage.setItem(MOCK_KEY, JSON.stringify(list)); } catch { /* súkromné okno */ }
}
/** Zrkadlo `wish_when_year()` z migrácie — atrapa a veta „Posunuté: leto 2027". */
export function wishYearFor(when: WishWhen): number | null {
  if (when === 'lifetime') return null;
  const now = new Date(); const y = now.getFullYear(); const m = now.getMonth() + 1;
  if (when === 'spring') return m > 5 ? y + 1 : y;
  if (when === 'summer') return m > 8 ? y + 1 : y;
  if (when === 'autumn') return m > 11 ? y + 1 : y;
  if (when === 'winter') return m <= 2 ? y - 1 : y;
  return y;
}
function mockAdd(n: NewWish): string {
  const id = `mock-${Date.now().toString(36)}`;
  mockWrite([{
    id, lat: n.lat, lon: n.lon, placeName: n.placeName, placeKind: n.placeKind, trailId: n.trailId ?? null,
    tripKind: n.tripKind, when: n.when, whenYear: wishYearFor(n.when), seeking: n.seeking, note: n.note,
    expiresAt: null, createdAt: new Date().toISOString(), isMine: true, ownerFirst: 'Matej',
    dogName: 'Hektor', dogDeceased: false, dogPhoto: null, packNumber: 1,
  }, ...mockRead()]);
  return id;
}

// ── API ───────────────────────────────────────────────────────────────────────
export async function fetchWishPins(): Promise<WishPin[]> {
  if (DEV_NOAUTH) return mockRead();
  const { data, error } = await db.rpc('list_wish_pins');
  if (error) throw error;
  return ((data ?? []) as Row[]).map(fromRow);
}

export async function addWishPin(n: NewWish): Promise<string> {
  if (DEV_NOAUTH) return mockAdd(n);
  const { data, error } = await db.rpc('add_wish_pin', {
    p_lat: n.lat, p_lon: n.lon, p_place_name: n.placeName, p_trip_kind: n.tripKind,
    p_when: n.when, p_seeking: n.seeking, p_note: n.note, p_place_kind: n.placeKind,
    p_trail_id: n.trailId ?? null, p_country_code: n.countryCode ?? null,
  });
  if (error) throw error;
  trackPack('pack_wish_add');
  return data as string;
}

/** CHCEM TIEŽ — vznikne VLASTNÁ kópia (miesto + druh), termín si človek volí sám. */
export async function meTooWish(sourceId: string, when: WishWhen): Promise<string> {
  if (DEV_NOAUTH) {
    const src = mockRead().find((w) => w.id === sourceId);
    if (!src) throw new Error('not_found');
    return mockAdd({ lat: src.lat, lon: src.lon, placeName: src.placeName, placeKind: src.placeKind,
      tripKind: src.tripKind, when, seeking: true, note: null, trailId: src.trailId });
  }
  const { data, error } = await db.rpc('me_too_wish', { p_source: sourceId, p_when: when });
  if (error) throw error;
  trackPack('pack_wish_metoo');
  return data as string;
}

export async function cancelWishPin(id: string): Promise<void> {
  if (DEV_NOAUTH) { mockWrite(mockRead().filter((w) => w.id !== id)); return; }
  const { error } = await db.rpc('cancel_wish_pin', { p_id: id });
  if (error) throw error;
}

// NAPÍSAŤ z pinu žije v `messaging/packMessaging.ts` (`startWishDM`) — vedľa `startTripDM`,
// lebo po založení vlákna treba obnoviť zoznam rozhovorov a spustiť realtime.

// ============================================================================
// ŽIVOT PRIANIA (26. 9. 2026) — `20260926_wish_life.sql`
// Hlášky C (termín) a D (splnené) z `plany/nakres-buddy-hlasky-2026-09-24.html`.
// ============================================================================

/** Stav tak, ako ho vidí človek: `missed` = termín prešiel, aj keď ešte nikto neodpovedal. */
export type WishStatus = 'live' | 'done' | 'missed' | 'cancelled';

export interface MyWish {
  id: string;
  lat: number;
  lon: number;
  placeName: string;
  placeKind: WishPlaceKind | null;
  trailId: string | null;
  countryCode: string | null;
  tripKind: WishTripKind;
  when: WishWhen;
  whenYear: number | null;
  status: WishStatus;
  expiresAt: string | null;
  postponed: number;
  createdAt: string;
  /** koľko ĎALŠÍCH ľudí chce na to isté miesto (bez mien) */
  others: number;
}

type MyRow = {
  id: string; lat: number; lon: number; place_name: string; place_kind: string | null;
  trail_id: string | null; country_code: string | null; trip_kind: string; when_bucket: string;
  when_year: number | null; status: string; expires_at: string | null; postponed: number;
  created_at: string; others: number;
};

export async function fetchMyWishes(): Promise<MyWish[]> {
  if (DEV_NOAUTH) {
    return mockRead().map((w) => ({
      id: w.id, lat: w.lat, lon: w.lon, placeName: w.placeName, placeKind: w.placeKind, trailId: w.trailId,
      countryCode: null, tripKind: w.tripKind, when: w.when, whenYear: w.whenYear, status: 'live' as const,
      expiresAt: w.expiresAt, postponed: 0, createdAt: w.createdAt, others: 0,
    }));
  }
  const { data, error } = await db.rpc('list_my_wishes');
  if (error) throw error;
  return ((data ?? []) as MyRow[]).map((r) => ({
    id: r.id, lat: r.lat, lon: r.lon, placeName: r.place_name,
    placeKind: (r.place_kind as WishPlaceKind | null) ?? null, trailId: r.trail_id,
    countryCode: r.country_code, tripKind: r.trip_kind as WishTripKind, when: r.when_bucket as WishWhen,
    whenYear: r.when_year, status: r.status as WishStatus, expiresAt: r.expires_at,
    postponed: r.postponed ?? 0, createdAt: r.created_at, others: r.others ?? 0,
  }));
}

/** C2 POSUNÚŤ · C4 OŽIVIŤ · C5 TENTO ROK (`nudged` = odpoveď na C5, ďalšia otázka o rok). */
export async function postponeWish(id: string, when: WishWhen, nudged = false): Promise<void> {
  if (DEV_NOAUTH) return;
  const { error } = await db.rpc('postpone_wish', { p_id: id, p_when: when, p_nudged: nudged });
  if (error) throw error;
}

/** D1 (s výletom z LOGu) · D3 „len označiť" (`tripId` = null → bez bodov). */
export async function fulfillWish(id: string, tripId: string | null): Promise<void> {
  if (DEV_NOAUTH) { mockWrite(mockRead().filter((w) => w.id !== id)); return; }
  const { error } = await db.rpc('fulfill_wish', { p_id: id, p_trip: tripId });
  if (error) throw error;
  trackPack('pack_wish_done', { log: !!tripId });
  invalidateMyWishCount();
}

/** C5 EŠTE NIE — otázka príde o rok. */
export async function wishLater(id: string): Promise<void> {
  if (DEV_NOAUTH) return;
  const { error } = await db.rpc('wish_later', { p_id: id });
  if (error) throw error;
}

/** C4 NECHAŤ TAK — prianie ostane v profile ako prešvihnuté, otázka zhasne. */
export async function dismissMissedWish(id: string): Promise<void> {
  if (DEV_NOAUTH) return;
  const { error } = await db.rpc('dismiss_missed_wish', { p_id: id });
  if (error) throw error;
}

/** Hranica „blízko pinu" pre D1 (zadanie §2.1). */
export const WISH_MATCH_M = 5000;
/** Body len za prianie staršie ako týždeň (Matej 24. 9.: „inak by to boli zadarmo body"). */
export const WISH_MIN_AGE_MS = 7 * 24 * 3600 * 1000;

export const wishEarnsPoints = (w: Pick<MyWish, 'createdAt'>, now = Date.now()): boolean =>
  now - Date.parse(w.createdAt) >= WISH_MIN_AGE_MS;

/**
 * D1 — ktoré MOJE živé prianie práve zapísaný výlet splnil. Tri cesty (zadanie §2.1):
 *  · ten istý výlet z katalógu (`trailId`)
 *  · pin „štát" a výlet v tom istom štáte (výlet bez štátu = Slovensko, ako v katalógu)
 *  · ktorýkoľvek bod trasy ≤ 5 km od pinu
 * Pri viacerých vyhráva najbližší — otázka „Splnené?" sa pýta na JEDNO prianie.
 */
export function wishMatchForTrail(
  mine: MyWish[],
  trail: { id: string; path: readonly (readonly number[])[]; country?: string | null },
): MyWish | null {
  const live = mine.filter((w) => w.status === 'live');
  const byTrail = live.find((w) => w.trailId && w.trailId === trail.id);
  if (byTrail) return byTrail;
  let best: MyWish | null = null;
  let bestD = Infinity;
  for (const w of live) {
    if (w.placeKind === 'country' || w.placeKind === 'region') continue;
    for (const p of trail.path) {
      const d = distM([w.lat, w.lon], p);
      if (d < bestD) { bestD = d; best = w; }
    }
  }
  if (best && bestD <= WISH_MATCH_M) return best;
  const iso = countryISO2(trail.country ?? 'sk');
  return live.find((w) => w.placeKind === 'country' && w.countryCode && w.countryCode === iso) ?? null;
}

// ── body: POČET splnených prianí, ktoré platia (cena `POINTS.wish`) ─────────────
// Vzor `useMyEventCount` (events/eventStore.ts): jeden dotaz na session, zdieľaný
// všetkými povrchmi, ktoré ukazujú level. Každý povrch s `profileLevelFor` ho MUSÍ
// dostať, inak sa level rozíde.
let countCache: number | null = null;
let countInflight: Promise<number> | null = null;
const countListeners = new Set<(n: number) => void>();

async function loadWishCount(): Promise<number> {
  if (countCache != null) return countCache;
  if (!countInflight) {
    countInflight = (async () => {
      const { data, error } = await db.rpc('my_wish_points');
      return error ? 0 : Number(data) || 0;
    })()
      .then((n) => { countCache = n; return n; })
      .catch(() => 0)
      .finally(() => { countInflight = null; });
  }
  return countInflight;
}

export function invalidateMyWishCount(): void {
  countCache = null;
  void loadWishCount().then((n) => countListeners.forEach((fn) => fn(n)));
}

export function useMyWishCount(enabled = WISHES_LIVE && !DEV_NOAUTH): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!enabled) { setN(0); return; }
    let live = true;
    const fn = (v: number) => { if (live) setN(v); };
    countListeners.add(fn);
    void loadWishCount().then(fn);
    return () => { live = false; countListeners.delete(fn); };
  }, [enabled]);
  return n;
}
