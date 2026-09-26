// PODUJATIA — dátová vrstva nad DB (vlna 2, plany/zadanie-podujatia-funkcne-2026-09-24.md §5.1).
//
// Do 24. 9. 2026 podujatia žili LEN v `localStorage['trp-events-own-v1']` — formulár aj zoznam
// fungovali, ale druhý človek podujatie nikdy nevidel. Odteraz sa číta aj píše výhradne cez
// RPC z `vystupy/supabase/migrations/20260925_events_v2.sql` (zápis priamo do tabuliek RLS
// už nepustí — séria a ročník sa zakladajú spolu a pravidlá zmazania v politike nie sú).
//
// Staré lokálne koncepty sa NEMIGRUJÚ: na LIVE boli za zámkom (`EVENTS_LIVE`), na deve sú to
// testy. Kľúč sa pri prvom načítaní zmaže.
//
// Klient cez `supabase as any` ako `packAlerts.ts` — `types.ts` tieto RPC nepozná.
// Supabase premenné prostredia sa tu nečítajú (tech-stack lock) — klient si ich berie sám cez `@/lib/env`.
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EVENTS_LIVE } from '@/lib/packFlags';
import type { AddEventDraft, EventKind, EventOrigin } from './eventModel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- viď hlavička
const db = supabase as any;

export type RsvpState = 'going' | 'interested';

/** Ročník z DB — formulárový tvar (`AddEventDraft`) + to, čo pridáva prevádzka. */
export type EventItem = AddEventDraft & {
  status: 'published' | 'cancelled';
  isMine: boolean;
  authorFirst: string | null;
  authorDog: string | null;
  authorNumber: number | null;
  going: number;
  interested: number;
  myState: RsvpState | null;
  /** koľko ľudí okrem autora sa pridalo — zmazať smie autor len pri nule */
  othersCount: number;
  heldConfirmedAt: string | null;
  recap: string | null;
  recapPhotos: string[];
  /** ISO — `startsAt` je lokálny `datetime-local` pre formulár a kartu */
  startsIso: string;
};

export type Attendee = { state: RsvpState; isMe: boolean; first: string | null; dog: string | null; number: number | null };
export type EventComment = { id: string; isMine: boolean; first: string | null; dog: string | null; number: number | null; body: string; createdAt: string };

// ── čas ────────────────────────────────────────────────────────────────────────────────────
// `datetime-local` nemá zónu a znamená LOKÁLNY čas človeka; DB drží `timestamptz`.
// Prevod je tu na jednom mieste, inak by sa termín posunul o hodinu či dve podľa toho,
// kto ho práve číta.
const pad = (n: number) => String(n).padStart(2, '0');
export function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function localInputToIso(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// ── staré lokálne koncepty ─────────────────────────────────────────────────────────────────
const LEGACY_KEY = 'trp-events-own-v1';
function dropLegacyLocalEvents() {
  try { localStorage.removeItem(LEGACY_KEY); } catch { /* private mode */ }
  try { sessionStorage.removeItem(LEGACY_KEY); } catch { /* */ }
}

// ── čítanie ────────────────────────────────────────────────────────────────────────────────
interface EditionRow {
  id: string; title: string; kind: string; country: string; organizer_credit: string | null;
  starts_at: string; ends_at: string; venue_name: string | null; lat: number | null; lng: number | null;
  description: string | null; photo_url: string | null; origin: string; source_url: string | null;
  status: string; created_at: string; updated_at: string | null; held_confirmed_at: string | null;
  recap: string | null; recap_photos: string[] | null; is_mine: boolean;
  author_first: string | null; author_dog: string | null; author_number: number | null;
  going: number; interested: number; my_state: string | null; others_count: number;
}

function toItem(r: EditionRow): EventItem {
  const created = new Date(r.created_at).getTime();
  return {
    id: r.id,
    origin: (r.origin === 'tip' ? 'tip' : 'own') as EventOrigin,
    title: r.title,
    kind: r.kind as EventKind,
    startsAt: isoToLocalInput(r.starts_at),
    endsAt: isoToLocalInput(r.ends_at),
    venueName: r.venue_name ?? '',
    center: r.lat != null && r.lng != null ? [r.lat, r.lng] : undefined,
    country: r.country,
    description: r.description ?? undefined,
    photoUrl: r.photo_url ?? undefined,
    sourceUrl: r.source_url ?? undefined,
    organizerCredit: r.organizer_credit ?? undefined,
    authorName: r.author_first ?? '',
    createdAt: created,
    updatedAt: r.updated_at ? new Date(r.updated_at).getTime() : created,
    status: r.status === 'cancelled' ? 'cancelled' : 'published',
    isMine: r.is_mine,
    authorFirst: r.author_first,
    authorDog: r.author_dog,
    authorNumber: r.author_number,
    going: r.going,
    interested: r.interested,
    myState: r.my_state === 'going' || r.my_state === 'interested' ? r.my_state : null,
    othersCount: r.others_count,
    heldConfirmedAt: r.held_confirmed_at,
    recap: r.recap,
    recapPhotos: r.recap_photos ?? [],
    startsIso: r.starts_at,
  };
}

export async function fetchEvents(archive: boolean): Promise<EventItem[]> {
  const { data, error } = await db.rpc('list_event_editions', { p_archive: archive });
  if (error) throw new Error(error.message);
  return ((data ?? []) as EditionRow[]).map(toItem);
}

/**
 * Nadchádzajúce aj archív naraz, s ručným obnovením.
 * `enabled=false` (podujatia vypnuté príznakom) = žiadny dotaz, prázdne zoznamy.
 */
export function useEvents(enabled: boolean) {
  const [upcoming, setUpcoming] = useState<EventItem[]>([]);
  const [archive, setArchive] = useState<EventItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    try {
      const [u, a] = await Promise.all([fetchEvents(false), fetchEvents(true)]);
      setUpcoming(u);
      setArchive(a);
      setError(null);
    } catch (e) {
      // Chyba sa neprehltne na prázdno: prázdny zoznam by tvrdil „nič sa nekoná".
      setError((e as Error).message);
    } finally {
      setLoaded(true);
    }
  }, [enabled]);

  useEffect(() => {
    dropLegacyLocalEvents();
    void reload();
  }, [reload]);

  return { upcoming, archive, loaded, error, reload };
}

// ── zápis ──────────────────────────────────────────────────────────────────────────────────
export type SaveResult =
  | { ok: true; id: string; created: boolean }
  | { ok: false; error: 'duplicate'; id?: string }
  | { ok: false; error: string };

/** Založí (bez `existingId`) alebo upraví podujatie. `draft.id` je pri novom UUID z prehliadača. */
export async function saveEvent(draft: AddEventDraft, existingId?: string): Promise<SaveResult> {
  const p = {
    id: existingId ?? draft.id,
    origin: draft.origin,
    title: draft.title,
    kind: draft.kind,
    country: draft.country,
    starts_at: localInputToIso(draft.startsAt),
    ends_at: localInputToIso(draft.endsAt || draft.startsAt),
    venue_name: draft.venueName,
    lat: draft.center?.[0] ?? null,
    lng: draft.center?.[1] ?? null,
    description: draft.description ?? null,
    photo_url: draft.photoUrl ?? null,
    source_url: draft.sourceUrl ?? null,
    organizer_credit: draft.organizerCredit ?? null,
  };
  const { data, error } = await db.rpc('save_event', { p });
  if (error) return { ok: false, error: error.message };
  return data as SaveResult;
}

export async function cancelEvent(id: string): Promise<boolean> {
  const { data, error } = await db.rpc('cancel_event', { p_edition_id: id });
  return !error && data === true;
}

/** 'ok' · 'has_people' · 'not_author' · 'not_found' · alebo text chyby */
export async function deleteEvent(id: string): Promise<string> {
  const { data, error } = await db.rpc('delete_event', { p_edition_id: id });
  return error ? error.message : String(data);
}

export async function setRsvp(id: string, state: RsvpState | null): Promise<boolean> {
  const { data, error } = state
    ? await db.rpc('set_event_rsvp', { p_edition_id: id, p_state: state })
    : await db.rpc('clear_event_rsvp', { p_edition_id: id });
  // clear vráti false aj keď riadok nebol — to nie je chyba
  return !error && (state ? data === true : true);
}

/** 'ok' · 'recap_missing' · 'recap_long' · 'photo_missing' · 'not_allowed' */
export async function confirmHeld(id: string, recap: string, photoUrl: string): Promise<string> {
  const { data, error } = await db.rpc('confirm_event_held', { p_edition_id: id, p_recap: recap, p_photo: photoUrl });
  return error ? error.message : String(data);
}

// ── kto ide + diskusia ─────────────────────────────────────────────────────────────────────
export async function fetchAttendees(id: string): Promise<Attendee[]> {
  const { data, error } = await db.rpc('list_event_attendees', { p_edition_id: id });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Array<{ state: RsvpState; is_me: boolean; owner_first: string | null; dog_name: string | null; pack_number: number | null }>)
    .map((r) => ({ state: r.state, isMe: r.is_me, first: r.owner_first, dog: r.dog_name, number: r.pack_number }));
}

export async function fetchComments(id: string): Promise<EventComment[]> {
  const { data, error } = await db.rpc('list_event_comments', { p_edition_id: id });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Array<{ id: string; is_mine: boolean; owner_first: string | null; dog_name: string | null; pack_number: number | null; body: string; created_at: string }>)
    .map((r) => ({ id: r.id, isMine: r.is_mine, first: r.owner_first, dog: r.dog_name, number: r.pack_number, body: r.body, createdAt: r.created_at }));
}

/** Zápis NIE JE optimistický (vzor `TripComments`) — chyba sa ukáže, nič sa netvári uložené. */
export async function postComment(id: string, body: string): Promise<boolean> {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user?.id;
  if (!uid) return false;
  const { error } = await db.from('event_comments').insert({ edition_id: id, user_id: uid, body: body.trim() });
  return !error;
}

export async function deleteComment(commentId: string): Promise<boolean> {
  const { error } = await db.from('event_comments').delete().eq('id', commentId);
  return !error;
}

// ── odkaz → predvyplnenie (edge `event-link-preview`) ──────────────────────────────────────
export type LinkPreview = {
  ok: boolean;
  reason?: 'facebook' | 'robots' | 'tdm' | 'unreachable' | 'nothing' | 'bad_url' | 'rate' | string;
  title?: string;
  startsAt?: string;
  endsAt?: string;
  venueName?: string;
  lat?: number;
  lng?: number;
  organizer?: string;
};

export async function previewLink(url: string): Promise<LinkPreview> {
  try {
    const { data, error } = await supabase.functions.invoke('event-link-preview', { body: { url } });
    if (error) return { ok: false, reason: 'unreachable' };
    return data as LinkPreview;
  } catch {
    return { ok: false, reason: 'unreachable' };
  }
}

// ── body ───────────────────────────────────────────────────────────────────────────────────
// Rovnaký vzor ako `useMyNotePoints`: jeden dotaz na session, zdieľaný medzi povrchmi, ktoré
// ukazujú level. Po potvrdení „uskutočnilo sa" sa cache zahodí.
let pointsCache: number | null = null;
let pointsInflight: Promise<number> | null = null;
const pointsListeners = new Set<(n: number) => void>();

async function loadEventCount(): Promise<number> {
  if (pointsCache != null) return pointsCache;
  if (!pointsInflight) {
    pointsInflight = (async () => {
      const { data, error } = await db.rpc('my_event_points');
      return error ? 0 : Number(data) || 0;
    })()
      .then((n) => { pointsCache = n; return n; })
      .catch(() => 0)
      .finally(() => { pointsInflight = null; });
  }
  return pointsInflight;
}

export function invalidateMyEventPoints(): void {
  pointsCache = null;
  void loadEventCount().then((n) => pointsListeners.forEach((fn) => fn(n)));
}

/**
 * POČET potvrdených podujatí (nie body — cenu nesie `POINTS.event` v `calculateProfilePoints`,
 * aby cena žila na jednom mieste). Každý povrch s `profileLevelFor` ho musí dostať, inak sa
 * level rozíde (komentár nad tou funkciou).
 */
export function useMyEventCount(enabled = EVENTS_LIVE): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!enabled) { setN(0); return; }
    let live = true;
    const fn = (v: number) => { if (live) setN(v); };
    pointsListeners.add(fn);
    void loadEventCount().then(fn);
    return () => { live = false; pointsListeners.delete(fn); };
  }, [enabled]);
  return n;
}
