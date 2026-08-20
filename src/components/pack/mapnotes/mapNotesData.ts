// ZÁPISY DO MAPY — dátová vrstva nad Supabase.
// Migrácia: `vystupy/supabase/migrations/20260820_map_notes.sql`
// Zadanie:  `plany/zadanie-zapisy-do-mapy-2026-08-20.md`
//
// Matej 2026-08-20: „cieľom je aby každý človek vedel písať po mape a dal tak
// vedieť ostatným." Vlna A = parkovisko; typ je stĺpec, takže ďalšie druhy
// značiek nepotrebujú ani novú tabuľku, ani nový súbor.
//
// Vzor prevzatý 1:1 z `trip/tripCommentsData.ts`: zápis NIE JE optimistický —
// insert/vote/delete čaká na odpoveď DB a až potom sa prejaví v UI. Keď RLS
// zápis odmietne (odhlásený, neplatiaci, DEV_NOAUTH), komponent dostane throw
// a musí sa tváriť, že sa nič neodoslalo. Ticho „uložené" pri parkovisku je
// horšie než chyba — človek by sa spoľahol na informáciu, ktorá nikde nie je.
//
// Typy tabuliek/RPC nie sú v generovanom `types.ts` (migrácia čaká na aplikáciu)
// — rovnaký dôvod pre `supabase as any` ako v `packMessaging.ts`.
import { supabase } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/** Druhy zápisov. Poradie = poradie v palete. `parking` je vlna A, zvyšok vlna B. */
export const NOTE_KINDS = ['parking', 'hazard', 'note', 'water', 'viewpoint', 'wildlife'] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];

export interface MapNote {
  id: string;
  kind: NoteKind;
  lat: number;
  lon: number;
  /** null = bod, číslo = oblasť s polomerom v metroch */
  radiusM: number | null;
  body: string;
  /** VÝNIMKA, nie väzba — „patrí sem" pri zápise z otvoreného článku výletu */
  pinnedSlug: string | null;
  /** len pri kind='parking': true = spoplatnené, false = zdarma, null = nevie sa */
  paid: boolean | null;
  createdAt: string;
  isMine: boolean;
  authorFirst: string | null;
  packNumber: number | null;
  validVotes: number;
  staleVotes: number;
  /** môj hlas: true = PLATÍ, false = UŽ NEPLATÍ, null = nehlasoval som */
  myVote: boolean | null;
  /** odvodené serverom (2× „už neplatí“ ⇒ true), alebo ručný override Mateja */
  isStale: boolean;
}

interface NoteRow {
  id: string;
  kind: NoteKind;
  lat: number;
  lon: number;
  radius_m: number | null;
  body: string;
  pinned_slug: string | null;
  paid: boolean | null;
  created_at: string;
  is_mine: boolean;
  author_first: string | null;
  pack_number: number | null;
  valid_votes: number;
  stale_votes: number;
  my_vote: boolean | null;
  is_stale: boolean;
}

function fromRow(r: NoteRow): MapNote {
  return {
    id: r.id,
    kind: r.kind,
    lat: r.lat,
    lon: r.lon,
    radiusM: r.radius_m,
    body: r.body,
    pinnedSlug: r.pinned_slug,
    paid: r.paid,
    createdAt: r.created_at,
    isMine: r.is_mine,
    authorFirst: r.author_first,
    packNumber: r.pack_number,
    validVotes: r.valid_votes ?? 0,
    staleVotes: r.stale_votes ?? 0,
    myVote: r.my_vote ?? null,
    isStale: !!r.is_stale,
  };
}

/**
 * Načíta VŠETKY zápisy naraz — nie per-výlet.
 *
 * Je to zámer, nie lenivosť: väzba zápisu na výlet je geometrická a počíta sa
 * v prehliadači (`notesForTrail()` v `mapNotesGeo.ts`), takže server nemá ako
 * vedieť, ktoré zápisy k výletu patria. Mapa ich navyše potrebuje všetky naraz
 * na vykreslenie vrstvy, takže per-výlet dotaz by znamenal dve rôzne cesty
 * k tým istým dátam.
 */
export async function fetchMapNotes(): Promise<MapNote[]> {
  const { data, error } = await db.rpc('list_map_notes');
  if (error) throw error;
  return ((data ?? []) as NoteRow[]).map(fromRow);
}

export interface NewMapNote {
  kind: NoteKind;
  lat: number;
  lon: number;
  body: string;
  radiusM?: number | null;
  paid?: boolean | null;
  /** vyplní sa len pri zápise z otvoreného článku výletu */
  pinnedSlug?: string | null;
}

/** Vráti id nového zápisu. Throwne pri RLS odmietnutí aj pri dennom strope. */
export async function addMapNote(n: NewMapNote): Promise<string> {
  const { data, error } = await db.rpc('add_map_note', {
    p_kind: n.kind,
    p_lat: n.lat,
    p_lon: n.lon,
    p_body: n.body,
    p_radius_m: n.radiusM ?? null,
    p_paid: n.paid ?? null,
    p_pinned_slug: n.pinnedSlug ?? null,
  });
  if (error) throw error;
  return data as string;
}

/** `valid = null` hlas stiahne. Na vlastný zápis hlasovať nejde (DB to odmietne). */
export async function voteMapNote(noteId: string, valid: boolean | null): Promise<void> {
  const { error } = await db.rpc('vote_map_note', { p_note_id: noteId, p_valid: valid });
  if (error) throw error;
}

export async function deleteMapNote(noteId: string): Promise<void> {
  const { error } = await db.rpc('delete_map_note', { p_note_id: noteId });
  if (error) throw error;
}
