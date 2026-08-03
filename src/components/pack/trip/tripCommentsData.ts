// Trip comments — dátová vrstva nad Supabase (issue #52, migrácia
// `20260803_trip_comments.sql`). Nahrádza REÁLNU časť `TripComments.tsx`
// (moje review, moje otázky), ktorá dnes žila v `localStorage`
// (`dogypt.tripReviews.v1` / `dogypt.tripQuestions.v1`) — zavri tab a je preč,
// druhý člen ju nikdy neuvidel.
//
// 2026-08-03 (Matej: „začíname so všetkým do nuly"): mock recenzie/rady
// (`buildReviews`/`buildAdvice`, fiktívni ľudia z `MOCK_MEMBER_POOL`) v
// `TripComments.tsx` sú ZMAZANÉ, rovnako ako mock skupiny v `packMessaging.ts`.
// Táto vrstva je odteraz JEDINÝ zdroj recenzií a otázok — čo nie je v DB, sa
// nezobrazí. Prázdny výlet ukáže empty state, nie výplň.
//
// Vzor je rovnaký ako `packMessaging.ts`: zápis je NIKDY optimistický naslepo —
// insert/update/delete čaká na odpoveď z DB a až po úspechu sa prejaví v UI.
// Ak RLS zápis odmietne (odhlásený, neplatiaci, zablokovaný stĺpec…), komponent
// dostane throw a sám sa musí tváriť, že sa nič neodoslalo (viď TripComments.tsx).
//
// Typy tabuliek (`trip_reviews`, `trip_questions`) a RPC (`list_trip_reviews`,
// `list_trip_questions`) ešte nie sú v generovanom `types.ts` (migrácia čaká na
// aplikáciu) — rovnaký dôvod ako `const db = supabase as any` v packMessaging.ts.
import { supabase } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface RealReview {
  /** stabilná referencia pre report_content('comment', id, …) — issue #54, NIE primárny kľúč (ten je trip_slug+user_id) */
  id: string;
  isMine: boolean;
  ownerFirst: string | null;
  packNumber: number | null;
  paws: number;
  body: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RealQuestion {
  id: string;
  isMine: boolean;
  ownerFirst: string | null;
  packNumber: number | null;
  body: string;
  createdAt: string;
}

interface ReviewRow {
  id: string;
  is_mine: boolean;
  owner_first: string | null;
  pack_number: number | null;
  paws: number;
  body: string | null;
  created_at: string;
  updated_at: string;
}

interface QuestionRow {
  id: string;
  is_mine: boolean;
  owner_first: string | null;
  pack_number: number | null;
  body: string;
  created_at: string;
}

function fromReviewRow(r: ReviewRow): RealReview {
  return {
    id: r.id,
    isMine: r.is_mine,
    ownerFirst: r.owner_first,
    packNumber: r.pack_number,
    paws: r.paws,
    body: r.body,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function fromQuestionRow(q: QuestionRow): RealQuestion {
  return {
    id: q.id,
    isMine: q.is_mine,
    ownerFirst: q.owner_first,
    packNumber: q.pack_number,
    body: q.body,
    createdAt: q.created_at,
  };
}

/** prihlásený účet, alebo null (DEV_NOAUTH / odhlásený návštevník — beží čisto lokálne, mock only) */
export async function getAuthedUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function fetchTripReviews(tripSlug: string): Promise<RealReview[]> {
  const { data, error } = await db.rpc('list_trip_reviews', { p_trip_slug: tripSlug }) as
    { data: ReviewRow[] | null; error: unknown };
  if (error || !data) return []; // offline / neprihlásený / RLS — appka beží ďalej s prázdnym reálnym zoznamom
  return data.map(fromReviewRow);
}

export async function fetchTripQuestions(tripSlug: string): Promise<RealQuestion[]> {
  const { data, error } = await db.rpc('list_trip_questions', { p_trip_slug: tripSlug }) as
    { data: QuestionRow[] | null; error: unknown };
  if (error || !data) return [];
  return data.map(fromQuestionRow);
}

/** Založí/upraví moju recenziu. Zámerne NEoptimistické — pri odmietnutí (RLS)
 *  hodí, volajúci nesmie správu vykresliť ako uloženú (viď TripComments.tsx). */
export async function upsertMyReview(tripSlug: string, paws: number, body?: string): Promise<void> {
  const uid = await getAuthedUserId();
  if (!uid) throw new Error('[tripCommentsData] upsertMyReview: not signed in');
  const { error } = await db
    .from('trip_reviews')
    .upsert(
      { trip_slug: tripSlug, user_id: uid, paws, body: body?.trim() || null },
      { onConflict: 'trip_slug,user_id' },
    );
  if (error) throw new Error(`[tripCommentsData] review neodišlo: ${error.message ?? 'unknown'}`);
}

export async function deleteMyReview(tripSlug: string): Promise<void> {
  const uid = await getAuthedUserId();
  if (!uid) throw new Error('[tripCommentsData] deleteMyReview: not signed in');
  const { error } = await db.from('trip_reviews').delete().eq('trip_slug', tripSlug).eq('user_id', uid);
  if (error) throw new Error(`[tripCommentsData] mazanie review zlyhalo: ${error.message ?? 'unknown'}`);
}

export async function postTripQuestion(tripSlug: string, body: string): Promise<void> {
  const uid = await getAuthedUserId();
  if (!uid) throw new Error('[tripCommentsData] postTripQuestion: not signed in');
  const trimmed = body.trim();
  if (!trimmed) return;
  const { error } = await db.from('trip_questions').insert({ trip_slug: tripSlug, user_id: uid, body: trimmed });
  if (error) throw new Error(`[tripCommentsData] otázka neodišla: ${error.message ?? 'unknown'}`);
}

export async function deleteTripQuestion(id: string): Promise<void> {
  const { error } = await db.from('trip_questions').delete().eq('id', id);
  if (error) throw new Error(`[tripCommentsData] mazanie otázky zlyhalo: ${error.message ?? 'unknown'}`);
}
