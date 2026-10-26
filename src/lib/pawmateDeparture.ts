// PAWMATE K4c — ODCHOD (26. 10. 2026). Migrácia `20261027_pawmate_k4_odchod.sql`.
// Matej: *„3 dni na to, aby označila fotky"* · *„ona len označí ale zmazať ich nemôže"*.
// Všetko ide cez RPC — tabuľka `pawmate_delete_requests` nemá žiadnu priamu politiku.
import { supabase } from '@/integrations/supabase/client';

// RPC nie sú v generovaných typoch.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type Departure = { dogId: string; dogName: string; ownerName: string | null; leavingUntil: string };
export type ActedPost = { id: string; photos: string[]; body: string; createdAt: string; requested: boolean };
export type DeleteRequest = { id: string; postId: string; photos: string[]; body: string; postCreatedAt: string; requesterName: string | null; createdAt: string };

const photosOf = (v: unknown): string[] => (Array.isArray(v) ? v.filter((p): p is string => typeof p === 'string') : []);

export async function fetchMyDeparture(): Promise<Departure[]> {
  const { data, error } = await db.rpc('my_departure');
  if (error || !Array.isArray(data)) return [];
  return (data as Array<Record<string, unknown>>).map((r) => ({
    dogId: String(r.dog_id), dogName: String(r.dog_name ?? ''),
    ownerName: typeof r.owner_name === 'string' ? r.owner_name : null,
    leavingUntil: String(r.leaving_until),
  }));
}

export async function fetchMyActedPosts(): Promise<ActedPost[]> {
  const { data, error } = await db.rpc('my_acted_posts');
  if (error || !Array.isArray(data)) return [];
  return (data as Array<Record<string, unknown>>).map((r) => ({
    id: String(r.id), photos: photosOf(r.photos), body: String(r.body ?? ''),
    createdAt: String(r.created_at), requested: !!r.requested,
  }));
}

export async function requestPostDeletion(ids: string[]): Promise<number> {
  const { data, error } = await db.rpc('request_post_deletion', { p_posts: ids });
  if (error) throw error;
  return Number(data) || 0;
}

export async function fetchDeleteRequests(): Promise<DeleteRequest[]> {
  const { data, error } = await db.rpc('list_delete_requests');
  if (error || !Array.isArray(data)) return [];
  return (data as Array<Record<string, unknown>>).map((r) => ({
    id: String(r.id), postId: String(r.post_id), photos: photosOf(r.photos), body: String(r.body ?? ''),
    postCreatedAt: String(r.post_created_at),
    requesterName: typeof r.requester_name === 'string' ? r.requester_name : null,
    createdAt: String(r.created_at),
  }));
}

export async function decideDeleteRequest(id: string, del: boolean): Promise<void> {
  const { error } = await db.rpc('decide_delete_request', { p_id: id, p_delete: del });
  if (error) throw error;
}
