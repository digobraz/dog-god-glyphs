// ─────────────────────────────────────────────────────────────────────────────
// packStore — perzistencia /pack výletov (issue #32, fáza F2).
//
// PROBLÉM, ktorý rieši: prejdené/wishlist žili v localStorage (prežije zatvorenie
// tabu, ale je to JEDEN prehliadač), a hodnotenia, plány, inzeráty a triplist žili
// v **sessionStorage** — teda zmizli používateľovi pri zatvorení tabu. Slice B
// (žiadosti medzi ľuďmi) sa na tom nedá ani otestovať.
//
// VZOR: hydrate-once + write-through (plán §F2). NIE async čítačky.
//   1. `hydratePackStore()` sa raz pri vstupe do /pack stiahne stav z Supabase do
//      localStorage a ohlási to eventom.
//   2. Čítačky (`readWalkedIds()` a spol.) ostávajú SYNCHRÓNNE a čítajú lokálne —
//      preto sa nemusí prepisovať pol /pack (volajú sa v renderi na desiatkach miest).
//   3. Zápis ide optimisticky lokálne a súčasne do DB. Keď sieť padne, operácia sedí
//      vo fronte a odošle sa neskôr — klik sa nestratí. Toto zároveň drží PWA-first
//      sľub: appka musí fungovať na chodníku bez signálu.
//
// ČO JE ZDROJ PRAVDY: DB, ale len pre domény, ktoré nemajú nevyslanú frontu. Pull
// nikdy neprepíše doménu, ktorá má vo fronte čakajúce zápisy (inak by offline klik
// zmizol pri prvom online refreshi).
//
// ROZHODNUTIE (plány vs. triplist): `trp-plans` aj `dogypt.triplist.v1` mapujú na tú
// istú tabuľku `user_trips`. Zdroj pravdy je TRIPLIST — plán je len to, čo sa doň
// ešte nemigrovalo (`seedTriplistFromPlans`). Plány preto do DB zapisujú len tripy,
// ktoré v tripliste ešte nie sú, a hydratácia ich rekonštruuje ako triplist entry.
//
// ⚠️ Bez prihlásenia (DEV_NOAUTH, odhlásený návštevník) beží celý store LOKÁLNE.
// Žiadny zápis sa nestratí ani nevyhodí chybu — len sa nikam neodošle.
// ─────────────────────────────────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any --
   VEDOMÉ ROZHODNUTIE (plán zadanie-db-migracia §2, nie nedbalosť): `src/integrations/supabase/
   types.ts` je zastaraný — pozná JEDINÚ tabuľku (`pack_members`), preto celý /pack ide cez
   `(supabase as any).from(...)`. Regenerovať typy pre 7 nových tabuliek by znamenalo prepísať
   generovaný súbor proti DEV schéme (LIVE ju ešte nemá), takže `as any` držíme — ale VÝHRADNE
   tu, v jednom dátovom module, nie rozsypané po komponentoch. Regenerácia typov je samostatná
   úloha, keď bude migrácia aj na LIVE. */
import { supabase } from '@/integrations/supabase/client';

// ── úložisko ────────────────────────────────────────────────────────────────
// localStorage s fallbackom na sessionStorage (private mode). Rovnaká probe ako
// mala tripShared.tsx — presunutá sem, nech je úložisko /packu na jednom mieste.
export const packStorage: Storage = (() => {
  try { const k = '__trp_probe'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; }
  catch { return sessionStorage; }
})();

export const PACK_KEYS = {
  walked: 'trp-walked-ids',
  fav: 'trp-fav-ids',
  localTrails: 'trp-local-trails',
  votes: 'trp-votes-v2',
  plans: 'trp-plans',
  events: 'trp-events-v2',
  triplist: 'dogypt.triplist.v1',
} as const;

const QUEUE_KEY = 'trp-sync-queue-v1';
const MIGRATED_KEY = 'trp-db-migrated-v1';
const HYDRATED_EVENT = 'pack-store-hydrated';

export function readJson<T>(key: string, fallback: T): T {
  try { const raw = packStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; }
  catch { return fallback; }
}
export function writeJson(key: string, val: unknown): boolean {
  try { packStorage.setItem(key, JSON.stringify(val)); return true; }
  catch { return false; /* quota / private mode — volajúci nech to ošetrí */ }
}
export const readStringSet = (key: string): Set<string> => new Set(readJson<string[]>(key, []));
export const writeStringSet = (key: string, s: Set<string>): boolean => writeJson(key, Array.from(s));

// ── fronta zápisov ──────────────────────────────────────────────────────────
// Operácia je zámerne bez `user_id` — dopĺňa sa až pri odoslaní z aktuálnej session.
// Keby sedelo v operácii, po prelogovaní by sa odoslalo cudzie id (RLS by ho aj tak
// odmietla, ale fronta by sa nikdy nevyprázdnila).
type SyncOp =
  | { kind: 'upsert'; tbl: string; row: Record<string, unknown>; onConflict?: string; own?: 'user_id' | 'host_id' | 'author_id' }
  | { kind: 'delete'; tbl: string; match: Record<string, unknown>; own?: 'user_id' | 'host_id' | 'author_id' };

// Strop, nech offline zápisy nenafúknu localStorage do quoty (radšej stratiť
// najstaršie operácie a vedieť o tom, než rozbiť celý store).
const QUEUE_MAX = 800;

const readQueue = (): SyncOp[] => readJson<SyncOp[]>(QUEUE_KEY, []);
const writeQueue = (q: SyncOp[]) => writeJson(QUEUE_KEY, q.slice(-QUEUE_MAX));

function enqueue(ops: SyncOp[]): void {
  if (!ops.length) return;
  writeQueue([...readQueue(), ...ops]);
  void flushQueue();
}

/** Ktoré tabuľky majú nevyslané zápisy — pull ich nesmie prepísať. */
const pendingTables = (): Set<string> => new Set(readQueue().map((o) => o.tbl));

let flushing = false;
let cachedUserId: string | null = null;

let cachedEmail: string | null = null;

async function currentUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  try {
    const { data } = await supabase.auth.getSession();
    cachedUserId = data.session?.user?.id ?? null;
    cachedEmail = data.session?.user?.email ?? null;
    return cachedUserId;
  } catch { return null; }
}

// Founder = účet, ktorému founder seed patrí (jeho história prejdených trás je reálna).
// Rovnaká adresa ako admin allowlist v pack_members policy — jeden zdroj, žiadny nový flag.
const FOUNDER_EMAIL = 'hekthorsk@gmail.com';
const isFounderAccount = () => (cachedEmail ?? '').toLowerCase() === FOUNDER_EMAIL;

/**
 * Odošle frontu. Vracia počet odoslaných operácií.
 * Operácia, ktorú DB odmietne kvôli DÁTAM (RLS, chybný tvar), sa zahodí — inak by
 * zablokovala frontu navždy. Sieťová chyba operáciu NEZAHADZUJE (skúsi sa znova).
 */
export async function flushQueue(): Promise<number> {
  if (flushing) return 0;
  const uid = await currentUserId();
  if (!uid) return 0;                      // bez prihlásenia sa nikam neposiela
  flushing = true;
  let sent = 0;
  try {
    let q = readQueue();
    while (q.length) {
      const op = q[0];
      const ownCol = op.own ?? 'user_id';
      try {
        if (op.kind === 'upsert') {
          const { error } = await (supabase as any)
            .from(op.tbl)
            .upsert({ ...op.row, [ownCol]: uid }, op.onConflict ? { onConflict: op.onConflict } : undefined);
          if (error) throw Object.assign(new Error(error.message), { pg: true });
        } else {
          const { error } = await (supabase as any)
            .from(op.tbl)
            .delete()
            .match({ ...op.match, [ownCol]: uid });
          if (error) throw Object.assign(new Error(error.message), { pg: true });
        }
        sent += 1;
        q = readQueue().slice(1);          // znovu prečítať: medzitým mohol pribudnúť zápis
        writeQueue(q);
      } catch (e: unknown) {
        if ((e as { pg?: boolean })?.pg) {
          // Odmietla to DB, nie sieť → opakovanie nepomôže, operáciu zahodíme.
          console.warn('[packStore] zápis odmietnutý, zahodené:', op.tbl, (e as Error).message);
          q = readQueue().slice(1);
          writeQueue(q);
          continue;
        }
        break;                             // sieť — necháme frontu na neskôr
      }
    }
  } finally { flushing = false; }
  return sent;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { void flushQueue(); });
}

// ── tvary (štruktúrne, zámerne bez importu z packCommunity/triplist) ────────
// packCommunity.ts aj triplist.ts importujú TENTO modul, takže opačný import by
// vyrobil cyklus. Store potrebuje len tie polia, ktoré ide do DB.
interface VoteLike { tripId: string; rating?: number; difficulty?: string; crowd?: string; comment?: string; when?: string; hazards?: string[]; at: number }
interface PlanLike { tripId: string; date?: string; intent?: string; at: number }
interface EventLike { id: string; tripId: string; dates?: string[]; month?: string; socialization?: string; closed?: boolean; hostIsMe?: boolean; host?: string }
interface TriplistLike { tripId: string; date?: string; status: string; openness: string; joiners?: unknown[]; requests?: unknown[]; addedAt: number }

const isoOf = (ms: number): string => new Date(ms || Date.now()).toISOString();
const msOf = (iso: string | null | undefined): number => (iso ? Date.parse(iso) : Date.now());

// ── write-through: prejdené / wishlist ──────────────────────────────────────
// Diff sa počíta proti tomu, čo JE v localStorage — teda proti poslednému známemu
// stavu. Netreba druhý snapshot a hydratácia sa tým sama „neodošle spať".
function persistSetDiff(key: string, tbl: string, next: Set<string>, extra: Record<string, unknown> = {}): void {
  const prev = readStringSet(key);
  writeStringSet(key, next);
  const ops: SyncOp[] = [];
  next.forEach((slug) => { if (!prev.has(slug)) ops.push({ kind: 'upsert', tbl, row: { trip_slug: slug, ...extra } }); });
  prev.forEach((slug) => { if (!next.has(slug)) ops.push({ kind: 'delete', tbl, match: { trip_slug: slug } }); });
  enqueue(ops);
}

export const persistWalked = (next: Set<string>) => persistSetDiff(PACK_KEYS.walked, 'trip_walked', next);
export const persistFav = (next: Set<string>) => persistSetDiff(PACK_KEYS.fav, 'trip_fav', next);

// ── write-through: hodnotenia ───────────────────────────────────────────────
export function persistVotes(next: Record<string, VoteLike>): void {
  const prev = readJson<Record<string, VoteLike>>(PACK_KEYS.votes, {});
  writeJson(PACK_KEYS.votes, next);
  const ops: SyncOp[] = [];
  for (const [slug, v] of Object.entries(next)) {
    if (JSON.stringify(prev[slug]) === JSON.stringify(v)) continue;
    ops.push({
      kind: 'upsert', tbl: 'trip_votes', onConflict: 'user_id,trip_slug',
      row: {
        trip_slug: slug, rating: v.rating ?? null, difficulty: v.difficulty ?? null,
        crowd: v.crowd ?? null, comment: v.comment ?? null,
        when_ym: v.when ?? null, hazards: v.hazards ?? [], at: isoOf(v.at),
      },
    });
  }
  for (const slug of Object.keys(prev)) if (!next[slug]) ops.push({ kind: 'delete', tbl: 'trip_votes', match: { trip_slug: slug } });
  enqueue(ops);
}

// ── write-through: môj výlet (triplist) ─────────────────────────────────────
// `joiners`/`requests` sa ZÁMERNE neposielajú: to je doména `trip_requests` a wiring
// Slice B je samostatné issue (#41). Tu ide len dátum, status a otvorenosť.
export function persistTriplist(next: Record<string, TriplistLike>): void {
  const prev = readJson<Record<string, TriplistLike>>(PACK_KEYS.triplist, {});
  writeJson(PACK_KEYS.triplist, next);
  const ops: SyncOp[] = [];
  const same = (a?: TriplistLike, b?: TriplistLike) =>
    a && b && a.date === b.date && a.status === b.status && a.openness === b.openness;
  for (const [slug, t] of Object.entries(next)) {
    if (same(prev[slug], t)) continue;
    ops.push({
      kind: 'upsert', tbl: 'user_trips', onConflict: 'user_id,trip_slug',
      row: { trip_slug: slug, trip_date: t.date || null, status: t.status, openness: t.openness },
    });
  }
  for (const slug of Object.keys(prev)) if (!next[slug]) ops.push({ kind: 'delete', tbl: 'user_trips', match: { trip_slug: slug } });
  enqueue(ops);
}

// ── write-through: plány ────────────────────────────────────────────────────
// Plán je „predtriplistová" forma toho istého faktu. Do DB ide len ako `user_trips`
// riadok a len keď pre daný trip ešte žiadny triplist záznam neexistuje — inak by
// dva zdroje pravdy prepisovali jeden riadok navzájom.
export function persistPlans(next: PlanLike[]): void {
  const prev = readJson<PlanLike[]>(PACK_KEYS.plans, []);
  writeJson(PACK_KEYS.plans, next);
  const triplist = readJson<Record<string, TriplistLike>>(PACK_KEYS.triplist, {});
  const prevBySlug = new Map(prev.map((p) => [p.tripId, p]));
  const ops: SyncOp[] = [];
  for (const p of next) {
    if (triplist[p.tripId]) continue;
    const before = prevBySlug.get(p.tripId);
    if (before && before.date === p.date && before.intent === p.intent) continue;
    ops.push({
      kind: 'upsert', tbl: 'user_trips', onConflict: 'user_id,trip_slug',
      row: {
        trip_slug: p.tripId,
        trip_date: /^\d{4}-\d{2}-\d{2}$/.test(p.date ?? '') ? p.date : null,
        status: p.intent === 'partner' ? 'looking' : 'solo',
        openness: p.intent === 'partner' ? 'open' : 'closed',
      },
    });
  }
  const nextSlugs = new Set(next.map((p) => p.tripId));
  for (const p of prev) if (!nextSlugs.has(p.tripId) && !triplist[p.tripId]) ops.push({ kind: 'delete', tbl: 'user_trips', match: { trip_slug: p.tripId } });
  enqueue(ops);
}

// ── write-through: inzeráty ─────────────────────────────────────────────────
// Posielajú sa VÝHRADNE moje (`hostIsMe`). Seed/mock inzeráty (`seed-event-*`) nie sú
// ničí reálny obsah a do DB nepatria.
export function persistEvents(next: EventLike[]): void {
  const prev = readJson<EventLike[]>(PACK_KEYS.events, []);
  writeJson(PACK_KEYS.events, next);
  const mine = (e: EventLike) => e.hostIsMe === true && !e.id.startsWith('seed-');
  const prevById = new Map(prev.filter(mine).map((e) => [e.id, e]));
  const ops: SyncOp[] = [];
  for (const e of next.filter(mine)) {
    const before = prevById.get(e.id);
    if (before && JSON.stringify(before) === JSON.stringify(e)) continue;
    ops.push({
      kind: 'upsert', tbl: 'trip_events', onConflict: 'host_id,client_id', own: 'host_id',
      row: {
        client_id: e.id, trip_slug: e.tripId, dates: e.dates ?? [],
        month: e.month ?? null, socialization: e.socialization ?? null, closed: e.closed ?? false,
      },
    });
  }
  const nextIds = new Set(next.filter(mine).map((e) => e.id));
  for (const id of prevById.keys()) if (!nextIds.has(id)) ops.push({ kind: 'delete', tbl: 'trip_events', match: { client_id: id }, own: 'host_id' });
  enqueue(ops);
}

// ── hydratácia ──────────────────────────────────────────────────────────────
type Listener = () => void;
const listeners = new Set<Listener>();

/** Zavolá `cb` po dobehnutí hydratácie. Vracia odhlasovaciu funkciu (pre useEffect). */
export function onPackStoreHydrated(cb: Listener): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

let hydrated = false;
let hasSession = false;
let hydrating: Promise<boolean> | null = null;
export const isPackStoreHydrated = () => hydrated;

function notifyListeners(): void {
  listeners.forEach((cb) => { try { cb(); } catch { /* jeden padnutý listener nezhodí ostatné */ } });
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(HYDRATED_EVENT));
}

/**
 * Raz za návštevu: (1) jednorazovo vytlačí lokálny stav do DB (F3 — Matejova reálna
 * história prejdených trás), (2) stiahne stav z DB do localStorage, (3) ohlási to.
 * Bez prihlásenia nerobí nič a appka beží lokálne.
 */
export function hydratePackStore(): Promise<boolean> {
  if (hydrating) return hydrating;
  hydrating = (async () => {
    const uid = await currentUserId();
    if (!uid) {
      // Lokálny režim (DEV_NOAUTH, odhlásený). Hydratácia sa nekoná, ale MUSÍ sa ohlásiť —
      // inak by odložený founder seed (scheduleFounderSeed) čakal navždy.
      hydrated = true; hasSession = false;
      notifyListeners();
      return false;
    }
    hasSession = true;

    // (1) jednorazový upload existujúceho lokálneho stavu (guard = beží raz na prehliadač)
    if (!packStorage.getItem(MIGRATED_KEY)) {
      try {
        pushLocalStateUp();
        packStorage.setItem(MIGRATED_KEY, '1');
      } catch { /* non-fatal, skúsi sa pri ďalšom vstupe */ }
    }
    await flushQueue();

    // (2) pull — doménu s nevyslanou frontou nechávame na pokoji
    const blocked = pendingTables();
    try {
      const [walked, fav, trips, votes, events] = await Promise.all([
        (supabase as any).from('trip_walked').select('trip_slug'),
        (supabase as any).from('trip_fav').select('trip_slug'),
        (supabase as any).from('user_trips').select('trip_slug,trip_date,status,openness,added_at').eq('user_id', uid),
        (supabase as any).from('trip_votes').select('*'),
        (supabase as any).from('trip_events').select('*').eq('host_id', uid),
      ]);

      if (!blocked.has('trip_walked') && !walked.error && walked.data) {
        writeStringSet(PACK_KEYS.walked, new Set(walked.data.map((r: any) => r.trip_slug)));
      }
      if (!blocked.has('trip_fav') && !fav.error && fav.data) {
        writeStringSet(PACK_KEYS.fav, new Set(fav.data.map((r: any) => r.trip_slug)));
      }
      if (!blocked.has('user_trips') && !trips.error && trips.data) {
        // Zachovávame lokálne `joiners`/`requests` — DB ich (zatiaľ, viď #41) nedrží,
        // takže by ich pull inak zmazal.
        const local = readJson<Record<string, TriplistLike>>(PACK_KEYS.triplist, {});
        const merged: Record<string, TriplistLike> = {};
        for (const r of trips.data as any[]) {
          merged[r.trip_slug] = {
            tripId: r.trip_slug,
            date: r.trip_date ?? undefined,
            status: r.status,
            openness: r.openness,
            joiners: local[r.trip_slug]?.joiners ?? [],
            requests: local[r.trip_slug]?.requests ?? [],
            addedAt: msOf(r.added_at),
          };
        }
        writeJson(PACK_KEYS.triplist, merged);
      }
      if (!blocked.has('trip_votes') && !votes.error && votes.data) {
        const rec: Record<string, VoteLike> = {};
        for (const r of votes.data as any[]) {
          rec[r.trip_slug] = {
            tripId: r.trip_slug, rating: r.rating ?? undefined, difficulty: r.difficulty ?? undefined,
            crowd: r.crowd ?? undefined, comment: r.comment ?? undefined,
            when: r.when_ym ?? undefined, hazards: r.hazards ?? [], at: msOf(r.at),
          };
        }
        writeJson(PACK_KEYS.votes, rec);
      }
      if (!blocked.has('trip_events') && !events.error && events.data) {
        // Cudzie otvorené inzeráty (RLS ich pustí) sem ZÁMERNE neťaháme — mock seed
        // ich zatiaľ zastupuje a mieša sa to až v Slice B (#41). Držíme svoje +
        // nechávame lokálne cudzie/seed záznamy tak, ako sú.
        const local = readJson<EventLike[]>(PACK_KEYS.events, []);
        const notMine = local.filter((e) => !(e.hostIsMe === true && !e.id.startsWith('seed-')));
        const dbMine: EventLike[] = (events.data as any[]).map((r) => ({
          id: r.client_id, tripId: r.trip_slug, dates: r.dates ?? [], month: r.month ?? '',
          socialization: r.socialization ?? '', closed: r.closed ?? false, hostIsMe: true,
        }));
        writeJson(PACK_KEYS.events, [...dbMine, ...notMine]);
      }
    } catch { return false; }

    hydrated = true;
    notifyListeners();
    return true;
  })();
  return hydrating;
}

/**
 * F3 — jednorazový upload toho, čo už v prehliadači je. Ide cez tú istú frontu ako
 * bežné zápisy, takže je idempotentný (upserty) a prežije offline.
 * `founder_seed` sa označuje ako zdroj, nech sa v DB dá odlíšiť „reálne prejdené"
 * od naseedovaného — a nech sa seed nikdy nemusí robiť per-prehliadač znova.
 */
function pushLocalStateUp(): void {
  // Bezpečné aj bez filtrovania founder seedu: seed sa od 2026-07-30 spúšťa až PO hydratácii
  // (scheduleFounderSeed), takže v tejto chvíli je v localStorage výhradne to, čo si tam
  // naklikal reálny človek v tomto prehliadači.
  const ops: SyncOp[] = [];
  readStringSet(PACK_KEYS.walked).forEach((slug) => ops.push({ kind: 'upsert', tbl: 'trip_walked', row: { trip_slug: slug }, onConflict: 'user_id,trip_slug' }));
  readStringSet(PACK_KEYS.fav).forEach((slug) => ops.push({ kind: 'upsert', tbl: 'trip_fav', row: { trip_slug: slug }, onConflict: 'user_id,trip_slug' }));
  for (const [slug, t] of Object.entries(readJson<Record<string, TriplistLike>>(PACK_KEYS.triplist, {}))) {
    ops.push({ kind: 'upsert', tbl: 'user_trips', onConflict: 'user_id,trip_slug', row: { trip_slug: slug, trip_date: t.date || null, status: t.status, openness: t.openness } });
  }
  for (const [slug, v] of Object.entries(readJson<Record<string, VoteLike>>(PACK_KEYS.votes, {}))) {
    ops.push({ kind: 'upsert', tbl: 'trip_votes', onConflict: 'user_id,trip_slug', row: { trip_slug: slug, rating: v.rating ?? null, difficulty: v.difficulty ?? null, crowd: v.crowd ?? null, comment: v.comment ?? null, when_ym: v.when ?? null, hazards: v.hazards ?? [], at: isoOf(v.at) } });
  }
  for (const e of readJson<EventLike[]>(PACK_KEYS.events, [])) {
    if (e.hostIsMe !== true || e.id.startsWith('seed-')) continue;
    ops.push({ kind: 'upsert', tbl: 'trip_events', onConflict: 'host_id,client_id', own: 'host_id', row: { client_id: e.id, trip_slug: e.tripId, dates: e.dates ?? [], month: e.month ?? null, socialization: e.socialization ?? null, closed: e.closed ?? false } });
  }
  enqueue(ops);
}

// ── FOUNDER SEED (issue #32, fáza F3) ───────────────────────────────────────
// „Čo nahodím, to som aj prešiel" (Matej 2026-07-24, LOCKED) je Matejova HISTÓRIA, nie
// štartovací balík pre každého nového člena. Doteraz sa seed nasadzoval per-prehliadač,
// takže každý nový člen mal 64 prejdených trás vrátane troch magistrál.
//
// Preto sa seed ODKLADÁ za hydratáciu a spustí sa len keď platí VŠETKO:
//   1. je to founder účet (alebo vôbec nie je session → lokálny dev režim, nech sa /pack testuje),
//   2. po hydratácii je prejdených 0 (teda účet v DB naozaj nič nemá).
// Vďaka bodu 2 sa ručné odškrtnutie („túto som neprešiel") na inom zariadení už nevzkriesi.
const SEED_GUARD_KEY = 'trp-walked-seeded-v2';

export function scheduleFounderSeed(defaultWalkedIds: string[]): void {
  if (packStorage.getItem(SEED_GUARD_KEY)) return;
  if (hydrated) { applyFounderSeed(defaultWalkedIds); return; }
  const off = onPackStoreHydrated(() => { off(); applyFounderSeed(defaultWalkedIds); });
}

function applyFounderSeed(defaultWalkedIds: string[]): void {
  try {
    if (packStorage.getItem(SEED_GUARD_KEY)) return;
    packStorage.setItem(SEED_GUARD_KEY, '1');       // rozhodnutie padne raz, nech to skončí akokoľvek
    if (hasSession && !isFounderAccount()) return;  // cudzí účet founder seed nedostane
    const walked = readStringSet(PACK_KEYS.walked);
    if (walked.size > 0) return;                    // účet už má vlastnú históriu → DB je pravda
    const ops: SyncOp[] = [];
    defaultWalkedIds.forEach((id) => {
      walked.add(id);
      ops.push({ kind: 'upsert', tbl: 'trip_walked', row: { trip_slug: id, source: 'founder_seed' }, onConflict: 'user_id,trip_slug' });
    });
    writeStringSet(PACK_KEYS.walked, walked);
    if (hasSession) enqueue(ops);                   // do DB raz, so zdrojom `founder_seed`
    notifyListeners();                              // povrchy nech si prečítajú naseedovaný stav
  } catch { /* non-fatal */ }
}

/** Diagnostika pre dev konzolu — koľko zápisov ešte čaká na odoslanie. */
export const pendingSyncCount = () => readQueue().length;
