// ŽIADOSTI O PRIDANIE NA VÝLET (issue #41) — zápisová strana.
//
// Tabuľka + RLS už existujú (20260730_pack_trips_db.sql §4 a §8.3), tu je len
// klient. Tri pravidlá, ktoré z RLS vyplývajú a diktujú tvar tohto súboru:
//
//  1. `from_user_id` sa NIKDY neposiela z UI ako cudzia hodnota — policy
//     `trip_requests_insert_self` ho zamyká na `auth.uid()`. Posielame vlastné
//     uid zo session (inak by insert padol), nič „z tela requestu".
//  2. Status prepína VÝHRADNE organizátor (`trip_requests_decide`). Žiadateľ smie
//     svoj riadok prepnúť len na `left` — preto sa o `accepted` ani nepokúšame.
//  3. Opakovaná žiadosť po odchode/odmietnutí naráža na `unique (trip_slug,
//     organizer_id, from_user_id)`. UPDATE by ju neobišiel (žiadateľ smie zapísať
//     len `status='left'`), takže sa starý riadok najprv ZMAŽE
//     (`trip_requests_delete_self`) a založí nanovo. Preto tá vetva na 23505.
//
// Mená k žiadostiam tu nie sú a ani nemôžu byť — `trip_requests` drží len uuid.
// Kto to je vie `get_trip_party()` (useTripParty.ts); spárovanie rieši
// `pairPending()` na konci súboru.
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { forgetShared, shared } from '@/lib/sharedFetch';
import type { PartyMember } from './useTripParty';

export type TripRequestStatus = 'requested' | 'accepted' | 'declined' | 'left';

export interface OutgoingRequest {
  id: string;
  tripSlug: string;
  organizerId: string;
  status: TripRequestStatus;
  createdAt: string;
}

export interface IncomingRequest {
  id: string;
  tripSlug: string;
  fromUserId: string;
  createdAt: string;
}

/** kľúč mojich odoslaných žiadostí — slug sám nestačí, tú istú trasu vypisuje viac ľudí */
export const requestKey = (slug: string, organizerId: string) => `${slug}|${organizerId}`;

/**
 * Požiadať o pridanie na cudzí otvorený výlet.
 * @returns null pri úspechu, inak text chyby (UI ho ukáže pri karte)
 */
export async function requestToJoin(tripSlug: string, organizerId: string): Promise<string | null> {
  forgetShared('trip-requests-rows');
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user?.id;
  if (!uid) return 'You need to be signed in.';
  if (uid === organizerId) return 'This is your own trip.';

  const row = { trip_slug: tripSlug, organizer_id: organizerId, from_user_id: uid, status: 'requested' };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insert = () => (supabase as any).from('trip_requests').insert(row) as
    Promise<{ error: { code?: string; message: string } | null }>;

  let { error } = await insert();
  // #70 — DOG ID neúplné (BEFORE INSERT trigger `trip_requests_check_dogid_trg`,
  // 20260922_dogid_join_gate.sql) sa NESMIE liečiť ako 23505: keby sa stará
  // história (`declined`/`left`) zmazala a REINSERT narazil na ten istý trigger
  // znova, človek by prišiel o históriu AJ dostal chybu. Prefix `dogid_incomplete:`
  // je stabilný (píše ho trigger) — UI ho mapuje na preložený text v `PackTriplist.tsx`.
  if (error?.message?.startsWith('dogid_incomplete:')) return error.message;
  if (error?.code === '23505') {
    // už tu raz žiadosť bola (odišiel som / bol som odmietnutý) — pozri hlavičku súboru
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('trip_requests').delete()
      .match({ trip_slug: tripSlug, organizer_id: organizerId, from_user_id: uid });
    ({ error } = await insert());
    // Druhý pokus môže padnúť na ten istý trigger (profil sa medzičasom nezmenil) —
    // v tom prípade je riadok už zmazaný a nedá sa vrátiť; aspoň chyba je čitateľná.
    if (error?.message?.startsWith('dogid_incomplete:')) return error.message;
  }
  return error ? error.message : null;
}

/** Organizátor rozhodne o žiadosti. Riadok sa adresuje `id` — to je jediné, čo o cudzom človeku vieme. */
export async function decideRequest(id: string, status: 'accepted' | 'declined'): Promise<string | null> {
  forgetShared('trip-requests-rows');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('trip_requests')
    .update({ status, decided_at: new Date().toISOString() })
    .eq('id', id) as { error: { message: string } | null };
  return error ? error.message : null;
}

/** Odvolať vlastnú žiadosť / odísť z výletu (policy `trip_requests_withdraw`, iba `left`). */
export async function leaveTrip(tripSlug: string, organizerId: string): Promise<string | null> {
  forgetShared('trip-requests-rows');
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user?.id;
  if (!uid) return 'You need to be signed in.';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('trip_requests')
    .update({ status: 'left', decided_at: new Date().toISOString() })
    .match({ trip_slug: tripSlug, organizer_id: organizerId, from_user_id: uid }) as
    { error: { message: string } | null };
  return error ? error.message : null;
}

type RequestRow = { id: string; trip_slug: string; organizer_id: string; from_user_id: string; status: TripRequestStatus; created_at: string };

/** Moje odoslané aj prijaté žiadosti JEDNÝM dotazom (detail výletu ich pýtal 2×: `useMyRequests` + `useIncomingRequests`).
 *  Okno 2 s zlúči oba hooky aj dvojitý epoch po hydratácii; zápis ho zahodí (`forgetShared`). `null` = bez prihlásenia. */
async function loadRequestRows(): Promise<{ uid: string; rows: RequestRow[] } | null> {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user?.id;
  if (!uid) return null;
  const run = () => shared('trip-requests-rows', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).from('trip_requests')
      .select('id,trip_slug,organizer_id,from_user_id,status,created_at')
      .or(`from_user_id.eq.${uid},and(organizer_id.eq.${uid},status.eq.requested)`)
      .order('created_at', { ascending: true }) as { data: RequestRow[] | null; error: unknown };
    if (error || !data) throw new Error('trip_requests');
    return { uid, rows: data };
  }, 2_000);
  let res = await run().catch(() => null);
  if (res && res.uid !== uid) { forgetShared('trip-requests-rows'); res = await run().catch(() => null); } // iný účet v okne
  return res ?? { uid, rows: [] };
}

/** Moje odoslané žiadosti → stav tlačidla na karte cudzieho výletu. Kľúč = `requestKey`. */
export function useMyRequests(epoch = 0): Record<string, TripRequestStatus> {
  const [map, setMap] = useState<Record<string, TripRequestStatus>>({});

  const load = useCallback(async () => {
    const res = await loadRequestRows();
    if (!res) { setMap({}); return; }
    setMap(Object.fromEntries(res.rows.filter((r) => r.from_user_id === res.uid).map((r) => [requestKey(r.trip_slug, r.organizer_id), r.status])));
  }, []);

  useEffect(() => { void load(); }, [load, epoch]);
  return map;
}

/**
 * Čakajúce žiadosti NA MOJE výlety (schránka organizátora), zoskupené podľa slugu.
 * Čítame priamo z tabuľky, nie z RPC: potrebujeme `id` riadku, ktorým sa dá
 * rozhodnúť — a to `get_trip_party()` zámerne nevydáva (vracia len meno/psa/číslo).
 */
export function useIncomingRequests(epoch = 0): { bySlug: Record<string, IncomingRequest[]>; count: number } {
  const [bySlug, setBySlug] = useState<Record<string, IncomingRequest[]>>({});

  const load = useCallback(async () => {
    const res = await loadRequestRows();
    if (!res) { setBySlug({}); return; }
    const grouped: Record<string, IncomingRequest[]> = {};
    for (const r of res.rows) {
      if (r.organizer_id !== res.uid || r.status !== 'requested') continue;
      (grouped[r.trip_slug] ??= []).push({
        id: r.id, tripSlug: r.trip_slug, fromUserId: r.from_user_id, createdAt: r.created_at,
      });
    }
    setBySlug(grouped);
  }, []);

  useEffect(() => { void load(); }, [load, epoch]);

  return { bySlug, count: Object.values(bySlug).reduce((n, rows) => n + rows.length, 0) };
}

/**
 * Spáruje riadok žiadosti (má `id`, nemá meno) s členom z partie (má meno, nemá `id`).
 * Obe strany sú tá istá tabuľka zoradená podľa `created_at` asc, takže `at` sedí na
 * `createdAt` presne; index je len poistka, keby RPC niekoho vynechala (napr. člen
 * medzitým prestal byť platiaci → vypadne z `member` v SQL).
 */
export function pairPending(
  rows: IncomingRequest[],
  members: PartyMember[],
): { row: IncomingRequest; member: PartyMember | null }[] {
  return rows.map((row, i) => ({
    row,
    member: members.find((m) => m.at === row.createdAt) ?? members[i] ?? null,
  }));
}
