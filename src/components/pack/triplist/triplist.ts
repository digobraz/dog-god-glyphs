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
import { MOCK_MEMBER_POOL, type MockMember, type TripPlan } from '@/components/pack/packCommunity';
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

export interface PublicTrip {
  trail: HeroTrail;
  owner: MockMember;
  date: string;
  status: 'looking';
  joinersCount: number;
  joiners: MockMember[];  // reálni členovia (mock, deterministickí) — profily v oznamovom popupe
  message: string;        // krátky odkaz od usporiadateľa (hover → celý v bublinke)
}

// ── MOCK PROFIL členov (Matej 2026-07-23) — human + dog tagy do pills s emoji. Deterministické zo
// seedu člena (id). Štartovací set; presné tagy sa doladia neskôr v profile. ──
export interface ProfilePill { emoji: string; label: string; }
export interface MemberProfile { human: ProfilePill[]; dog: ProfilePill[]; }
const MTN_SKILL = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const MUSIC = ['Indie', 'Techno', 'Folk', 'Rock', 'Jazz', 'Hip-hop', 'Ambient'];
const HOBBY: [string, string][] = [['📷', 'Photography'], ['🧗', 'Climbing'], ['🏕️', 'Camping'], ['🏃', 'Running'], ['🚴', 'Cycling'], ['🎣', 'Fishing']];
const DOG_SEX: string[] = ['♂ Neutered', '♂ Intact', '♀ Spayed', '♀ Intact'];
const DOG_SOC = ['Very social', 'Selective', 'Shy but warms up'];
const DOG_TEMP: [string, string][] = [['😌', 'Calm'], ['🎾', 'Playful'], ['⚡', 'Energetic'], ['🦴', 'Independent']];
const DOG_AGGR = ['No aggression', 'Reactive on leash', 'Wary of strangers'];
export function deriveMemberProfile(member: MockMember): MemberProfile {
  const r = mulberry32(hashStr(`${member.id}:profile`));
  const pick = <X,>(arr: X[]) => arr[Math.floor(r() * arr.length)];
  const humanAge = 22 + Math.floor(r() * 34);
  const dogAge = 1 + Math.floor(r() * 11);
  const hobby = pick(HOBBY);
  const temp = pick(DOG_TEMP);
  return {
    human: [
      { emoji: '🎂', label: `${humanAge}` },
      { emoji: '⛰️', label: pick(MTN_SKILL) },
      { emoji: '🎧', label: pick(MUSIC) },
      { emoji: hobby[0], label: hobby[1] },
    ],
    dog: [
      { emoji: '🎂', label: `${dogAge}y` },
      { emoji: '🐕', label: pick(DOG_SEX) },
      { emoji: '🐾', label: pick(DOG_SOC) },
      { emoji: temp[0], label: temp[1] },
      { emoji: '🛡️', label: pick(DOG_AGGR) },
    ],
  };
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

// krátke odkazy usporiadateľa — deterministický pool (mock), pridelené cez per-trip PRNG.
const PUBLIC_MSGS = [
  'Easy pace, plenty of sniff breaks. Bring water for the pups. Well-socialised dogs welcome — mine loves company on the trail.',
  'Planning a calm morning walk before it gets hot. Two friendly dogs so far, room for a few more paws.',
  'Looking for a small pack to share the trail. My dog is reactive on leash but great once we get moving.',
  'First time on this route — would love company who knows it. Relaxed vibe, no rush, we stop for photos.',
  'Weekend adventure, moderate effort. Good boots recommended. Dogs off-leash where it is safe.',
  'Sunset walk if the weather holds. Bring a headlamp just in case. All friendly dogs welcome.',
];

// ── deterministický PRNG z string seedu (mulberry32 + FNV-1a hash) — rovnaký vzor ako
// packCommunity.ts / TripComments.tsx. Mock owner/date/pick musia byť stabilné medzi
// rendermi, nie Math.random. ──
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// deterministicky vyberie n unikátnych indexov z [0, len) pomocou danej PRNG inštancie
// (rovnaký vzor ako pickN v packCommunity.ts, len vracia indexy namiesto hodnôt).
function pickNIndices(len: number, n: number, rnd: () => number): number[] {
  const remaining = Array.from({ length: len }, (_, i) => i);
  const out: number[] = [];
  const count = Math.min(n, remaining.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rnd() * remaining.length);
    out.push(remaining.splice(idx, 1)[0]);
  }
  return out;
}

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

const DAY_MS = 86400000;

// PUBLIC TRIPS seed — deterministický mock (viď zadanie §1). Vyberie ~10 tripov z `trails`
// (vylučuje tie, čo už user vlastní vo svojom triplist), každému pridelí owner + budúci dátum +
// joinersCount. Stabilné medzi rendermi (žiadny Math.random).
export function buildPublicTrips(trails: HeroTrail[], nowMs: number): PublicTrip[] {
  const mine = readTriplist();
  const pool = trails.filter((tr) => !mine[tr.id]);
  const pickRnd = mulberry32(hashStr('triplist:public'));
  const idxs = pickNIndices(pool.length, Math.min(10, pool.length), pickRnd);
  return idxs.map((i) => {
    const trail = pool[i];
    const rnd = mulberry32(hashStr(`${trail.id}:public-trip`));
    const owner = MOCK_MEMBER_POOL[Math.floor(rnd() * MOCK_MEMBER_POOL.length)];
    const days = 2 + Math.floor(rnd() * 29); // 2..30
    const date = new Date(nowMs + days * DAY_MS).toISOString().slice(0, 10);
    const joinersCount = Math.floor(rnd() * 3); // 0..2
    const joiners: MockMember[] = [];
    for (let j = 0; j < joinersCount; j++) {
      const cand = MOCK_MEMBER_POOL[Math.floor(rnd() * MOCK_MEMBER_POOL.length)];
      if (cand.id !== owner.id && !joiners.some((m) => m.id === cand.id)) joiners.push(cand);
    }
    const message = PUBLIC_MSGS[Math.floor(rnd() * PUBLIC_MSGS.length)];
    return { trail, owner, date, status: 'looking', joinersCount, joiners, message };
  });
}
