// TRIPLIST — data model (Slice A, plany/zadanie-triplist-sliceA-2026-07-23.md). Buddy model
// LOCKED (plany/zadanie-profil-messaging-2026-07-23.md §14–16). This is Slice A ONLY: data
// model + hub route + date. Slice B (request lifecycle: accept/decline, open/close toggle,
// leave/handoff, request→DM), C (header 🐾+🔔), D (post-trip loop) are separate later kolá —
// joiners/requests stay [] until Slice B wires them up.
//
// Perzistencia (2026-07-30, issue #32): `@/lib/packStore` — localStorage (synchrónne čítanie)
// + write-through do Supabase `user_trips` (dátum, status, openness). PREDTÝM to bol
// sessionStorage mirror, takže „môj výlet" aj naplánovaný dátum zmizli pri zatvorení tabu.
// `joiners`/`requests` ostávajú lokálne — to je doména `trip_requests` a wiring Slice B (#41).
import type { HeroTrail } from '@/data/heroTrails.generated';
import { type TripPlan } from '@/components/pack/packCommunity';
import { PACK_KEYS, readJson, persistTriplist } from '@/lib/packStore';

export type TripStatus = 'solo' | 'looking' | 'going';
export type TripOpenness = 'open' | 'closed';

export interface TripRequest { fromMemberId: string; at: number; status: 'requested' | 'accepted' | 'declined'; declineReason?: string; }
export interface TripJoiner { memberId: string; acceptedAt: number; }

export interface TriplistTrip {
  tripId: string;          // = HeroTrail.id
  date?: string;           // ISO yyyy-mm-dd; undefined = "no date yet"
  status: TripStatus;
  openness: TripOpenness;  // organizer ovláda; Slice B ho prepína
  joiners: TripJoiner[];   // accepted (Slice B ich pridáva); Slice A = []
  requests: TripRequest[]; // pending (Slice B); Slice A = []
  addedAt: number;
}

// ── WCE lokalita — Západ/Stred/Východ SR odvodené zo zemepisnej dĺžky prvého bodu trasy
// (dataset nemá WCE pole). Prahy: BA ~17.1° · BB ~19.1° · KE ~21.3°. ──
export type WCE = 'W' | 'C' | 'E';
export function trailWCE(trail: HeroTrail): WCE {
  const lng = trail.path?.[0]?.[1];
  if (typeof lng !== 'number') return 'C';
  if (lng < 18.8) return 'W';
  if (lng < 20.3) return 'C';
  return 'E';
}
export const WCE_LABEL: Record<WCE, string> = { W: 'West Slovakia', C: 'Central Slovakia', E: 'East Slovakia' };

const STORE_KEY = PACK_KEYS.triplist;

export function readTriplist(): Record<string, TriplistTrip> {
  return readJson<Record<string, TriplistTrip>>(STORE_KEY, {});
}
export function writeTriplist(m: Record<string, TriplistTrip>): void {
  persistTriplist(m);
}

// merge patch into the store entry for tripId (creating a default solo/closed entry if none
// exists yet) and persist. Used by the "+ Add date" popup (Slice A) and by future Slice B
// lifecycle actions.
export function upsertMyTrip(tripId: string, patch: Partial<TriplistTrip>): TriplistTrip {
  const all = readTriplist();
  const existing = all[tripId];
  const next: TriplistTrip = {
    tripId,
    status: existing?.status ?? 'solo',
    openness: existing?.openness ?? 'closed',
    joiners: existing?.joiners ?? [],
    requests: existing?.requests ?? [],
    addedAt: existing?.addedAt ?? Date.now(),
    date: existing?.date,
    ...patch,
  };
  all[tripId] = next;
  writeTriplist(all);
  return next;
}

/**
 * Zmazanie položky z triplistu (2026-08-22).
 *
 * ⚠️ Volaj to VÝHRADNE spolu so zmazaním plánu (`plan-` trail + TripPlan). Samotné
 * odstránenie riadku tu je totiž DOČASNÉ: `seedTriplistFromPlans()` ho pri ďalšom
 * mounte hubu z prežívajúceho plánu poslušne založí naspäť, a vyzeralo by to ako
 * „zmazanie sa neuložilo".
 */
export function removeMyTrip(tripId: string): void {
  const all = readTriplist();
  if (!(tripId in all)) return;
  delete all[tripId];
  writeTriplist(all);
}

// Migrácia z existujúcich wishlist plánov (packCommunity.ts TripPlan) → triplist entries.
// Idempotentné — NIKDY neprepíše existujúcu triplist entry, volá sa raz pri mounte hubu.
export function seedTriplistFromPlans(plans: TripPlan[]): void {
  const all = readTriplist();
  let changed = false;
  for (const p of plans) {
    if (all[p.tripId]) continue;
    all[p.tripId] = {
      tripId: p.tripId,
      date: p.date || undefined,
      status: p.intent === 'partner' ? 'looking' : 'solo',
      openness: p.intent === 'partner' ? 'open' : 'closed',
      joiners: [],
      requests: [],
      addedAt: p.at,
    };
    changed = true;
  }
  if (changed) writeTriplist(all);
}

/**
 * ── DOLIEČENIE: ZAPÍSANÉ VÝLETY, KTORÉ VZNIKLI PRED 26. 8. 2026 ─────────────────────────
 *
 * Do 26. 8. zápis výletu do triplistu vôbec nezapisoval (opravené v `submitAddTripDraft`
 * v PackMap.tsx) — takže MY TRIPS ukazoval plány a hviezdičkované trasy, ale vlastné
 * zapísané výlety nie. Oprava rieši nové zápisy; tie staré by v zozname chýbali naďalej
 * a vyzeralo by to, že chyba pretrváva.
 *
 * ⚠️ IDEMPOTENTNÉ a len na VLASTNÉ zápisy: `local-*` bez `plan-` prefixu (plány rieši
 * `seedTriplistFromPlans`) a nikdy neprepíše existujúci záznam — kto si výlet medzitým
 * otvoril pre svorku, oň nepríde.
 * `addedAt` sa odvodzuje z id (`local-<timestamp>-<m>`), lebo `HeroTrail` čas vzniku
 * nenesie; keď sa nedá prečítať, ide 0 — riadok potom sadne na koniec zoznamu, čo je pre
 * starý výlet správne.
 */
export function seedTriplistFromWalked(trailIds: string[]): void {
  const all = readTriplist();
  let changed = false;
  for (const id of trailIds) {
    if (!id.startsWith('local-')) continue;
    if (all[id]) continue;
    const stamp = Number(id.split('-')[1]);
    all[id] = {
      tripId: id,
      status: 'solo',
      openness: 'closed',
      joiners: [],
      requests: [],
      addedAt: Number.isFinite(stamp) ? stamp : 0,
    };
    changed = true;
  }
  if (changed) writeTriplist(all);
}

