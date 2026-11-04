// SOS — stratený pes: JEDINÉ miesto, odkiaľ frontend volá backend (Matej 4. 11. 2026).
// Migrácia: vystupy/supabase/migrations/20261118_lost_dogs.sql. Tabuľky nie sú v generovanom
// `integrations/supabase/types.ts`, preto `as any` ako v `dogEvents.ts`.
//
// 🔴 Telefón majiteľa vracia LEN `lostPhone` (po ťuku) a `sosMine` (majiteľ). `sosActive` ani
//    `lostPublic` ho nikdy nemajú; do zoznamu ani do meta značiek ho nedávaj.
// Čakané chyby servera: bad_phone · bad_coords · bad_time · bad_state · bad_url · rate_limited ·
// no_access · not_authenticated. Čítaj ich cez `sosErrorCode`.
import { supabase } from '@/integrations/supabase/client';
import { EDGE_BASE, SUPABASE_ANON_KEY } from '@/lib/env';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpc = (name: string, args?: Record<string, unknown>) => (supabase as any).rpc(name, args);

async function call<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await rpc(name, args);
  if (error) throw error;
  return data as T;
}

export type LostStatus = 'active' | 'found' | 'ended';

export interface SosFlyer {
  headline?: string;
  about?: string;
  reward?: string;
  thanks?: string;
  direction_deg?: number | null;
}

export interface SosDog {
  id: string;
  dog_name: string;
  dog_gender: string | null;
  photo: string | null;
  pack_number: number | null;
  breed: string | null;
  color: string | null;
  country: string | null;
  active_id: string | null;
  active_slug: string | null;
}

export interface SosActiveRow {
  id: string;
  slug: string;
  dog_name: string;
  photo: string | null;
  breed: string | null;
  last_seen_at: string;
  place_label: string | null;
  lat: number;
  lng: number;
  created_at: string;
  is_mine: boolean;
  flyer_url: string | null;
  dog_gender: string | null;
}

export interface SosSighting {
  id: string;
  lat: number | null;
  lng: number | null;
  seen_at: string | null;
  note: string | null;
  created_at: string;
}

export interface SosMine {
  dog_gender: string | null;
  id: string;
  slug: string;
  dog_id: string;
  dog_name: string;
  photo: string | null;
  breed: string | null;
  color: string | null;
  country: string;
  lat: number;
  lng: number;
  last_seen_at: string;
  place_label: string | null;
  phone: string | null;
  flyer: SosFlyer;
  flyer_url: string | null;
  status: LostStatus;
  asked_at: string | null;
  confirmed_at: string | null;
  found_at: string | null;
  ended_at: string | null;
  created_at: string;
  shares: number;
  phone_reveals: number;
  notified_count: number | null;
  notified_at: string | null;
  sightings: SosSighting[];
  /** Odškrtnuté kroky „Čo teraz urobiť“ (server). */
  plan_done: string[];
}

export interface LostPublic {
  slug: string;
  dog_name: string;
  dog_gender: string | null;
  photo: string | null;
  breed: string | null;
  color: string | null;
  country: string;
  status: LostStatus;
  last_seen_at: string;
  place_label: string | null;
  lat: number;
  lng: number;
  flyer: SosFlyer;
  flyer_url: string | null;
  found_at: string | null;
  ended_at: string | null;
  created_at: string;
  recall: string | null;
  temperament: string[] | null;
  strangers_ok: boolean | null;
}

export type SosContactType = 'shelter' | 'police' | 'vet' | 'oz' | 'hunting';

export interface SosContact {
  typ: SosContactType;
  name: string;
  phone: string | null;
  email: string | null;
  web: string | null;
  lat: number | null;
  lng: number | null;
  city: string | null;
  distance_km: number | null;
  source: string | null;
  source_url: string | null;
  verified_at: string | null;
  contact_person: string | null;
  contact_role: string | null;
  nationwide: boolean;
}

export const sosErrorCode = (e: unknown): string =>
  String((e as { message?: string } | null)?.message ?? '');

const first = <T,>(data: T | T[] | null): T | null => (Array.isArray(data) ? data[0] ?? null : data);

/** Hrubá poloha zariadenia pre push „stratený pes v okolí“ — server zaokrúhľuje na 2 desatinné miesta (~1 km). */
export const sosPushGeo = (token: string, lat: number, lng: number) =>
  call<void>('push_token_geo', { p_token: token, p_lat: lat, p_lng: lng });

export const sosMyDogs = () => call<SosDog[]>('sos_my_dogs');
export const sosLastPhone = () => call<string | null>('sos_last_phone');

export async function sosDeclare(a: {
  dogId: string; lat: number; lng: number; lastSeen: Date; place: string; phone: string; flyer?: SosFlyer;
}) {
  const row = first(await call<{ id: string; slug: string; existing: boolean }[]>('sos_declare', {
    p_dog: a.dogId,
    p_lat: a.lat,
    p_lng: a.lng,
    p_last_seen: a.lastSeen.toISOString(),
    p_place: a.place,
    p_phone: a.phone,
    p_flyer: a.flyer ?? {},
  }));
  if (!row) throw new Error('declare_empty');
  return row;
}

export const sosUpdate = (id: string, patch: {
  flyer?: SosFlyer; flyerUrl?: string; phone?: string; lat?: number; lng?: number; lastSeen?: Date; place?: string;
}) => call<void>('sos_update', {
  p_id: id,
  p_flyer: patch.flyer ?? null,
  p_flyer_url: patch.flyerUrl ?? null,
  p_phone: patch.phone ?? null,
  p_lat: patch.lat ?? null,
  p_lng: patch.lng ?? null,
  p_last_seen: patch.lastSeen ? patch.lastSeen.toISOString() : null,
  p_place: patch.place ?? null,
});

export const sosFound = (id: string) => call<void>('sos_found', { p_id: id });
export const sosResume = (id: string) => call<void>('sos_resume', { p_id: id });
export const sosStillSearching = (id: string) => call<void>('sos_still_searching', { p_id: id });
export const sosActive = (country?: string) =>
  call<SosActiveRow[]>('sos_active', country ? { p_country: country } : {});
export const sosMine = (id: string) => call<SosMine | null>('sos_mine', { p_id: id });
export const sosSetPlan = (id: string, done: string[]) => call<string[]>('sos_set_plan', { p_id: id, p_done: done });
export const sosMineBySlug = (slug: string) => call<SosMine | null>('sos_mine_by_slug', { p_slug: slug });
export const sosContactsNear = (lat: number, lng: number, country: string, perType = 3) =>
  call<SosContact[]>('sos_contacts_near', { p_lat: lat, p_lng: lng, p_country: country, p_limit_per_typ: perType });

export const lostPublic = async (slug: string) => first(await call<LostPublic | LostPublic[] | null>('lost_public', { p_slug: slug }));
// Telefón ide cez Edge Function `lost-phone` (rate limit na IP) — RPC `lost_phone` má od 20261119 právo len service_role.
export async function lostPhone(slug: string): Promise<string | null> {
  const r = await fetch(`${EDGE_BASE}/lost-phone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ slug }),
  });
  if (r.status === 429) throw new Error('rate_limited');
  if (!r.ok) throw new Error('bad');
  const j = (await r.json()) as { phone?: string | null };
  return typeof j.phone === 'string' ? j.phone : null;
}
export const lostShare = (slug: string) => call<void>('lost_share', { p_slug: slug });

/** Odkaz, ktorý ide na leták a do zdieľania. Slug sa po vzniku nikdy nemení. */
export const lostUrl = (slug: string) => `https://dogypt.com/lost/${slug}`;
