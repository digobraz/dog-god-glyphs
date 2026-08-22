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
import { uploadPackTripPhoto } from '@/services/cloudinaryService';
import type { HeroTrail } from '@/data/heroTrails.generated';

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
  // Sprievodné údaje k `localTrails`, ktoré sa NEZMESTIA do `HeroTrail` (payload je obsah
  // výletu, nie jeho stav v moderácii): kto ho nahodil a či je schválený. Bez toho appka
  // z lokálneho zoznamu nevie odlíšiť MÔJ čakajúci návrh od CUDZIEHO schváleného výletu —
  // `pack_trips_read` vracia oboje (viď migrácia 20260730_pack_trips_db.sql §8).
  localTrailsMeta: 'trp-local-trails-meta-v1',
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
/** Stav členmi nahodeného výletu v moderácii (`pack_trips.status`) + či je môj. */
export interface LocalTrailMeta { status: 'pending' | 'approved' | 'rejected' | string; mine: boolean }

/**
 * Statusy k `trp-local-trails`. PRÁZDNA mapa = ešte sa nehydratovalo (alebo sa beží offline),
 * NIE „nič nie je schválené" — volajúci to musí rozlíšiť, inak by po odhlásení/výpadku spadli
 * body za nahodené výlety na nulu.
 */
export const readLocalTrailMeta = (): Record<string, LocalTrailMeta> =>
  readJson<Record<string, LocalTrailMeta>>(PACK_KEYS.localTrailsMeta, {});

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
  window.addEventListener('online', () => { void flushQueue(); void processTripUploadQueue(); });
}

// ── tvary (štruktúrne, zámerne bez importu z packCommunity/triplist) ────────
// packCommunity.ts aj triplist.ts importujú TENTO modul, takže opačný import by
// vyrobil cyklus. Store potrebuje len tie polia, ktoré ide do DB.
interface VoteLike { tripId: string; rating?: number; difficulty?: string; crowd?: string; comment?: string; when?: string; hazards?: string[]; at: number }
interface PlanLike { tripId: string; date?: string; intent?: string; at: number }
// ⚠️ `host`, `at` a `joinedByMe` sú tu VOLITEĽNÉ, hoci v `PartnerEvent` (packCommunity.ts)
// sú POVINNÉ. Práve tá medzera spôsobila, že prekladač nechal prejsť hydratáciu nižšie, ktorá
// ich nevypĺňala — a `ev.host.charAt(0)` v karte inzerátu potom zhodil CELÚ mapu, len čo
// človek klikol na UDALOSTI. Voliteľné ostávajú (staré záznamy ich naozaj nemajú), ale kto
// z tohto tvaru skladá `PartnerEvent`, MUSÍ ich doplniť.
interface EventLike { id: string; tripId: string; dates?: string[]; month?: string; socialization?: string; closed?: boolean; hostIsMe?: boolean; host?: string; at?: number; joinedByMe?: boolean }
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

// ── privacy close-through: trip_events (issue #42) ──────────────────────────
// AddTripPlan (PackMap.tsx submitAddTripDraft) môže pri "Looking for pack" spolu s
// user_trips vytvoriť aj vlastný `trip_events` riadok — TEN má svoj vlastný `closed`
// príznak a vlastnú RLS politiku (`trip_events_read_open`: vidí ho KAŽDÝ platiaci člen,
// kým `closed=false`, BEZ OHĽADU na `user_trips.openness`). Keď človek výlet neskôr
// SPRIVATIZUJE cez "Who can see this trip" (PackTriplist.tsx `setVisibility`), tá zmena
// sedí len v `user_trips` — bez tejto funkcie by inzerát ostal verejný navždy, hoci appka
// tvrdí "Private". PackTriplist.tsx a PackMap.tsx sú DVE rôzne stránky s vlastným React
// state, takže to nejde riešiť volaním `setEvents()` priamo — packStore je jediné
// spoločné miesto (localStorage `trp-events-v2` + DB).
export function closeMyTripEvents(tripSlug: string): void {
  const events = readJson<EventLike[]>(PACK_KEYS.events, []);
  let changed = false;
  const next = events.map((e) => {
    if (e.tripId !== tripSlug || e.hostIsMe !== true || e.id.startsWith('seed-') || e.closed === true) return e;
    changed = true;
    return { ...e, closed: true };
  });
  if (!changed) return;
  writeJson(PACK_KEYS.events, next);
  const ops: SyncOp[] = next
    .filter((e) => e.tripId === tripSlug && e.hostIsMe === true && !e.id.startsWith('seed-'))
    .map((e) => ({
      kind: 'upsert', tbl: 'trip_events', onConflict: 'host_id,client_id', own: 'host_id',
      row: {
        client_id: e.id, trip_slug: e.tripId, dates: e.dates ?? [],
        month: e.month ?? null, socialization: e.socialization ?? null, closed: true,
      },
    }));
  enqueue(ops);
}

// ── write-through: členmi nahodené výlety (pack_trips, issue #32 fáza F5) ──────────────────
// Odlišné od domén vyššie: fotky sú dnes v `trp-local-trails` uložené ako base64 (tripShared.tsx
// `writeLocalTrails`) a DB stĺpec `pack_trips.payload` ich smie niesť len ako Cloudinary URL
// (migrácia §7 komentár). Medzi „nový trip pribudol" a „zápis do SyncOp fronty" preto MUSÍ byť
// async krok (upload) — čo obyčajná `SyncOp` fronta nevie (spracúva hotové riadky, nie kroky).
// Vlastná malá fronta (`trp-trip-upload-pending-v1`, slugy) preto obaľuje tento async krok:
// slug sa z nej odstráni AŽ keď sú všetky fotky nahraté A upsert je bezpečne v `SyncOp` fronte
// (tá už offline/reload prežije sama — viď `enqueue`/`flushQueue` vyššie).
const TRIP_PENDING_KEY = 'trp-trip-upload-pending-v1';
const TRIP_MIGRATED_KEY = 'trp-trips-db-migrated-v1';

const readTripPending = (): string[] => readJson<string[]>(TRIP_PENDING_KEY, []);
const writeTripPending = (ids: string[]): void => { writeJson(TRIP_PENDING_KEY, Array.from(new Set(ids))); };

/**
 * ZMAZANIE členmi nahodeného výletu z `pack_trips` (2026-08-22).
 *
 * ⚠️ BEZ TOHTO SA VÝLET ZMAZAŤ NEDÁ, len na oko. Hydratácia nižšie robí
 * `writeJson(PACK_KEYS.localTrails, fromDb)` — teda `trp-local-trails` PREPÍŠE celým
 * obsahom `pack_trips`, nezlučuje. Odstránenie len z prehliadača preto vydrží presne
 * do najbližšieho prihlásenia (alebo do ďalšieho pullu na inom zariadení) a výlet aj
 * s pinom sa vráti. Vyzeralo by to ako „mazanie sa neukladá", pritom sa ukladá — len
 * ho server o chvíľu prebije.
 *
 * Poradie: najprv VON z čakajúcej fronty uploadu (inak by `processTripUploadQueue()`
 * stihol nahrať práve zmazaný výlet naspäť a delete by dopadol na už neexistujúci
 * riadok), potom delete op, potom meta.
 */
export function deletePackTrip(slug: string): void {
  writeTripPending(readTripPending().filter((s) => s !== slug));
  enqueue([{ kind: 'delete', tbl: 'pack_trips', match: { slug }, own: 'author_id' }]);
  const meta = readJson<Record<string, LocalTrailMeta>>(PACK_KEYS.localTrailsMeta, {});
  if (slug in meta) { delete meta[slug]; writeJson(PACK_KEYS.localTrailsMeta, meta); }
}

/** Volá `writeLocalTrails` (tripShared.tsx) pre každý nový/nemigrovaný trip id. Idempotentné —
 *  bezpečné volať opakovane, slug sa vo fronte nezduplikuje. */
export function queueLocalTripUpload(ids: string[]): void {
  if (!ids.length) return;
  writeTripPending([...readTripPending(), ...ids]);
  void processTripUploadQueue();
}

let tripProcessing = false;

async function processTripUploadQueue(): Promise<void> {
  if (tripProcessing) return;
  const uid = await currentUserId();
  if (!uid) return; // DEV_NOAUTH / odhlásený návštevník — beží čisto lokálne, nič sa neodosiela
  tripProcessing = true;
  try {
    let pending = readTripPending();
    while (pending.length) {
      const slug = pending[0];
      const trail = readJson<HeroTrail[]>(PACK_KEYS.localTrails, []).find((t) => t.id === slug);
      if (!trail) { pending = pending.slice(1); writeTripPending(pending); continue; } // zmazaný lokálne medzitým
      try {
        const photos = await uploadTrailPhotos(slug);
        const fresh = readJson<HeroTrail[]>(PACK_KEYS.localTrails, []).find((t) => t.id === slug) ?? trail;
        enqueue([{
          kind: 'upsert', tbl: 'pack_trips', onConflict: 'slug', own: 'author_id',
          row: {
            slug,
            payload: { ...fresh, photos },
            km: Number.parseFloat(fresh.km) || null,
            ascent: fresh.ascentM ?? null,
            country: fresh.country ?? null,
          },
        }]);
      } catch {
        break; // sieť padla uprostred uploadu — necháme frontu, skúsi sa znova (online event / ďalšia hydratácia)
      }
      pending = readTripPending().slice(1);
      writeTripPending(pending);
    }
  } finally { tripProcessing = false; }
}

/** Nahradí base64 fotky trasy `slug` Cloudinary URL-kami. Zapisuje priebežne (po každej fotke)
 *  do `trp-local-trails`, aby retry po výpadku siete neopakoval už hotové uploady. */
async function uploadTrailPhotos(slug: string): Promise<string[]> {
  const trail = readJson<HeroTrail[]>(PACK_KEYS.localTrails, []).find((t) => t.id === slug);
  const photos = [...(trail?.photos ?? [])];
  for (let i = 0; i < photos.length; i++) {
    if (!photos[i].startsWith('data:')) continue; // už URL (predchádzajúci beh / plánovaný trip bez fotky)
    const blob = dataUrlToBlob(photos[i]);
    const { secureUrl } = await uploadPackTripPhoto(blob, slug, i);
    photos[i] = secureUrl;
    const all = readJson<HeroTrail[]>(PACK_KEYS.localTrails, []);
    writeJson(PACK_KEYS.localTrails, all.map((t) => (t.id === slug ? { ...t, photos } : t)));
  }
  return photos;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(',');
  const mime = meta.match(/data:(.*?);base64/)?.[1] ?? 'image/jpeg';
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
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
    // (1b) jednorazová migrácia členmi nahodených výletov (`trp-local-trails` → `pack_trips`,
    // issue #32 fáza F5) — VLASTNÝ guard, lebo tento krok má vlastnú async frontu (fotky) a beží
    // nezávisle od (1) vyššie.
    if (!packStorage.getItem(TRIP_MIGRATED_KEY)) {
      try {
        const localIds = readJson<HeroTrail[]>(PACK_KEYS.localTrails, []).map((t) => t.id);
        if (localIds.length) queueLocalTripUpload(localIds);
        packStorage.setItem(TRIP_MIGRATED_KEY, '1');
      } catch { /* non-fatal, skúsi sa pri ďalšom vstupe */ }
    }
    await flushQueue();

    // (2) pull — doménu s nevyslanou frontou nechávame na pokoji
    const blocked = pendingTables();
    try {
      const [walked, fav, trips, votes, events, packTrips, heroEarned] = await Promise.all([
        (supabase as any).from('trip_walked').select('trip_slug'),
        (supabase as any).from('trip_fav').select('trip_slug'),
        (supabase as any).from('user_trips').select('trip_slug,trip_date,status,openness,added_at').eq('user_id', uid),
        (supabase as any).from('trip_votes').select('*'),
        (supabase as any).from('trip_events').select('*').eq('host_id', uid),
        (supabase as any).from('pack_trips').select('slug,payload,status,author_id'),
        (supabase as any).from('hero_badges_earned').select('badge_id,earned_at'),
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
        // ⚠️ `trip_events` NEMÁ stĺpec `host` — drží len `host_id` (uuid). Meno hostiteľa teda
        // z DB dotiahnuť NEVIEME a do 22. 8. sa jednoducho nevypĺňalo: po hydratácii mal každý
        // vlastný inzerát `host: undefined` a karta padla na `ev.host.charAt(0)`. Zhodila celú
        // mapu, nielen kartu. Prejavilo sa to až na DRUHOM zariadení (alebo po vymazaní cache),
        // lebo v prehliadači, kde inzerát vznikol, meno v localStorage prežilo.
        // Riešenie bez vymýšľania dát: čo o inzeráte vieme LOKÁLNE, to si ponecháme; čo nevieme,
        // necháme prázdne a text dorobí UI (fallback „ty"). `at` berieme z `created_at`, nech
        // zoradenie po hydratácii nespadne na 0.
        const localById = new Map(local.map((e) => [e.id, e]));
        const dbMine: EventLike[] = (events.data as any[]).map((r) => {
          const had = localById.get(r.client_id);
          return {
            id: r.client_id, tripId: r.trip_slug, dates: r.dates ?? [], month: r.month ?? '',
            socialization: r.socialization ?? '', closed: r.closed ?? false, hostIsMe: true,
            host: had?.host ?? '',
            at: had?.at ?? (Date.parse(r.created_at) || Date.now()),
            // Inzerát som vypísal ja, teda idem — presne to sa zapisuje pri jeho vzniku
            // (`joinedByMe: true` v PackMap.tsx). Nie je to odhad, je to ten istý fakt.
            joinedByMe: had?.joinedByMe ?? true,
          };
        });
        writeJson(PACK_KEYS.events, [...dbMine, ...notMine]);
      }
      // pack_trips (issue #32 fáza F5): vlastný "blocked" — okrem SyncOp fronty (`enqueue`) môže
      // mať trip aj nedokončený upload fotiek (`trp-trip-upload-pending-v1`); v oboch prípadoch
      // pull PRESKOČÍME celý, nech neprepíše rozpracovaný lokálny zápis (rovnaká opatrnosť ako
      // `blocked` vyššie — tento krok len rozširuje, čo sa počíta za "má nevyslaný zápis").
      const tripsBlocked = blocked.has('pack_trips') || readTripPending().length > 0;
      if (!tripsBlocked && !packTrips.error && packTrips.data) {
        const fromDb = (packTrips.data as any[]).map((r) => r.payload as HeroTrail);
        writeJson(PACK_KEYS.localTrails, fromDb);
        // Meta ide RUKA V RUKE s payloadom (ten istý guard, ten istý zápis) — dva zápisy do
        // rôznych vetiev by vyrobili stav, kde zoznam výletov a ich statusy patria k inému pullu.
        const meta: Record<string, LocalTrailMeta> = {};
        for (const r of packTrips.data as any[]) meta[r.slug] = { status: r.status, mine: r.author_id === uid };
        writeJson(PACK_KEYS.localTrailsMeta, meta);
      }
      // hero_badges_earned je append-only (issue #48) → MERGE, nikdy overwrite: lokálny
      // záznam môže byť čerstvejší než posledný pull (napr. práve odomknuté touto session,
      // ešte vo fronte), DB záznam dopĺňa len id-čka, ktoré lokálne ešte chýbajú.
      if (!blocked.has('hero_badges_earned') && !heroEarned.error && heroEarned.data) {
        const local = readHeroEarned();
        const merged = { ...local };
        for (const r of heroEarned.data as any[]) { if (!merged[r.badge_id]) merged[r.badge_id] = r.earned_at; }
        writeJson(HERO_EARNED_KEY, merged);
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

// ── HERO BADGES — perzistované odomknutie (issue #48) ───────────────────────
// Doteraz sa „získané" počítalo za behu z walkedCount (HeroBadges.tsx) — nikde sa
// nezapisovalo, takže zmazanie prejdenej trasy odznak vzalo späť a nikdy sa nedalo
// povedať „toto som odomkol vtedy". Vzor = rovnaký ako `trip_walked` vyššie, len
// APPEND-ONLY: odznak sa raz zapíše a už nikdy nezmaže (na rozdiel od `persistSetDiff`
// niet druhého smeru — odomknutie je nevratné rozhodnutie, nie prepínač).
const HERO_EARNED_KEY = 'trp-hero-earned-v1';
const HERO_BACKFILL_KEY = 'trp-hero-earned-backfilled-v1';

/** id odznaku (`HeroBadge.id`) → ISO dátum prvého odomknutia. Synchrónna čítačka. */
export const readHeroEarned = (): Record<string, string> => readJson<Record<string, string>>(HERO_EARNED_KEY, {});

/**
 * Zapíše nové odomknutia natrvalo (write-through). Id, ktoré už v mape je, sa
 * NEPREPÍŠE — prvý dátum odomknutia je ten platný.
 */
export function persistHeroEarned(newIds: string[]): void {
  const already = readHeroEarned();
  const fresh = newIds.filter((id) => !already[id]);
  if (!fresh.length) return;
  const now = new Date().toISOString();
  const next = { ...already };
  const ops: SyncOp[] = [];
  fresh.forEach((id) => {
    next[id] = now;
    ops.push({ kind: 'upsert', tbl: 'hero_badges_earned', onConflict: 'user_id,badge_id', row: { badge_id: id, earned_at: now } });
  });
  writeJson(HERO_EARNED_KEY, next);
  enqueue(ops);
  notifyListeners(); // HeroBadges.tsx sedí na tomto evente, nech si prečíta čerstvý stav
}

/**
 * Jednorazová migrácia (issue #48): kto má DNES odznaky odvodené len z počtu
 * prejdených trás, nesmie o ne prísť len preto, že appka teraz odomknutie perzistuje.
 * Guard beží raz na prehliadač — rovnaký vzor ako `scheduleFounderSeed` — a spustí sa
 * AŽ po hydratácii, nech nezapíše odznak skôr, než DB stihne poslať to, čo tam
 * prípadne už je (inak by dva prehliadače toho istého člena vyrobili dva `earned_at`).
 */
export function scheduleHeroBadgeBackfill(badges: { id: string; trips: number }[]): void {
  if (packStorage.getItem(HERO_BACKFILL_KEY)) return;
  if (hydrated) { applyHeroBadgeBackfill(badges); return; }
  const off = onPackStoreHydrated(() => { off(); applyHeroBadgeBackfill(badges); });
}

function applyHeroBadgeBackfill(badges: { id: string; trips: number }[]): void {
  try {
    if (packStorage.getItem(HERO_BACKFILL_KEY)) return;
    packStorage.setItem(HERO_BACKFILL_KEY, '1'); // rozhodnutie padne raz, nech to skončí akokoľvek
    const walkedCount = readStringSet(PACK_KEYS.walked).size;
    const already = readHeroEarned();
    const toBackfill = badges.filter((b) => walkedCount >= b.trips && !already[b.id]).map((b) => b.id);
    if (toBackfill.length) persistHeroEarned(toBackfill);
  } catch { /* non-fatal */ }
}

/** Diagnostika pre dev konzolu — koľko zápisov ešte čaká na odoslanie. */
export const pendingSyncCount = () => readQueue().length;
