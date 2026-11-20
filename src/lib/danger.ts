// NAHLÁSIŤ NEBEZPEČENSTVO (SOS, 20. 11. 2026): JEDINÉ miesto, odkiaľ frontend volá backend tejto funkcie.
// Zadanie: plany/zadanie-nebezpecenstvo-stavba-2026-11-20.md (bod A = kontrakt RPC, tento súbor ho zrkadlí).
// Migrácia: vystupy/supabase/migrations/20261224_danger.sql. Tabuľky nie sú v `types.ts`, preto `as any` ako v `sos.ts`.
//
// 🔴 Adresu, telefón, fotky týrania ani text podnetu nevydá žiadny anon RPC. `dangerPublic` vráti len druh,
//    obec a okruh (týranie: stred zaokrúhlený, okruh ≥ 500 m, bez fotky a adresy).
// Čakané chyby servera: not_authenticated · no_access · rate_limited · bad_kind · bad_coords · bad_radius ·
// bad_phone · bad_text · bad_state · danger_via_report. Čítaj ich cez `dangerErrorCode`.
import { supabase } from '@/integrations/supabase/client';
import { EDGE_BASE, SUPABASE_ANON_KEY } from '@/lib/env';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpc = (name: string, args?: Record<string, unknown>) => (supabase as any).rpc(name, args);

async function call<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await rpc(name, args);
  if (error) throw error;
  return data as T;
}

export type DangerKind = 'poison' | 'abuse';
export type DangerReview = 'pending' | 'approved' | 'rejected';
export type DangerHowOften = 'once' | 'repeat' | 'months';
export type DangerOutcome = 'inspected' | 'fined' | 'removed' | 'nothing';

/** Chipy týrania (rozhodnutie 10). Pri `dog_fights` UI zvýrazní políciu 158 (§ 305c TZ). */
export const DANGER_ABUSE_CHIPS = ['beating', 'chain', 'no_water_shelter', 'starving', 'injured', 'locked', 'puppy_mill', 'dog_fights', 'other'] as const;
/** Chipy otravy a nástrah (nákres scr 8). */
export const DANGER_POISON_CHIPS = ['bait_poison', 'nails', 'glass', 'trap', 'poisoned_dog'] as const;
export type DangerAbuseChip = (typeof DANGER_ABUSE_CHIPS)[number];
export type DangerPoisonChip = (typeof DANGER_POISON_CHIPS)[number];

/** Polomer otravy drží lock značiek: 100–500 m, predvoľba 150. */
export const DANGER_RADIUS = { min: 100, max: 500, def: 150 } as const;

export interface DangerComplaintBrief {
  id: string;
  authority_code: string;
  sent_at: string | null;
  outcome: DangerOutcome | null;
  review: DangerReview;
}

/** Detail prípadu pre člena (`danger_case`). */
export interface DangerCase {
  id: string;
  slug: string;
  kind: DangerKind;
  note_id: string | null;
  country: string;
  lat: number;
  lng: number;
  place_label: string | null;
  municipality: string | null;
  district: string | null;
  radius_m: number | null;
  what: string[];
  how_often: DangerHowOften | null;
  body: string | null;
  photos: string[];
  review: DangerReview;
  expires_at: string | null;
  created_at: string;
  is_mine: boolean;
  witnesses: number;
  i_witnessed: boolean;
  author_first: string | null;
  complaints: DangerComplaintBrief[];
}

/** Riadok „moje prípady a podnety“ (`danger_mine`). */
export interface DangerMineRow {
  id: string;
  slug: string;
  kind: DangerKind;
  municipality: string | null;
  review: DangerReview;
  expires_at: string | null;
  created_at: string;
  complaints: DangerComplaintBrief[];
}

export interface DangerComment {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  is_mine: boolean;
  author_first: string | null;
  author_photo: string | null;
  pack_number: number | null;
}

/** Verejná stránka `/danger/:slug` — nič, čo by prezradilo adresu alebo nahlasovateľa. */
export interface DangerPublic {
  slug: string;
  kind: DangerKind;
  country: string;
  municipality: string | null;
  lat: number;
  lng: number;
  radius_m: number;
  what: string[];
  photo: string | null; // len otrava
  active: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface DangerReportInput {
  kind: DangerKind;
  lat: number;
  lng: number;
  country: string;
  place_label: string | null;
  municipality: string | null;
  district: string | null;
  radius_m: number | null;
  what: string[];
  how_often: DangerHowOften | null;
  body: string | null;
  photos: string[];
}

export interface DangerComplaintInput {
  case_id: string | null;
  country: string;
  place_label: string;
  authority_code: string;
  raw: string;
  official: string;
  phone: string;
  sign_name: string | null; // null = „DOGYPT za mňa“
  cc_linka: boolean;
  photos: string[];
}

export interface DangerOfficialTextInput {
  kind: DangerKind;
  raw: string;
  what: string[];
  how_often: DangerHowOften | null;
  place_label: string;
  municipality: string | null;
  country: string;
  authority_name: string;
  lang: string;
}

export function dangerErrorCode(e: unknown): string {
  const m = String((e as { message?: string })?.message ?? e ?? '');
  const hit = m.match(/[a-z_]{4,}/g);
  return hit?.find((w) => w.includes('_') || w === 'rate_limited') ?? 'error';
}

// ── člen ────────────────────────────────────────────────────────────────────
export async function dangerReport(p: DangerReportInput): Promise<{ id: string; slug: string }> {
  const rows = await call<{ id: string; slug: string }[]>('danger_report', {
    p_kind: p.kind, p_lat: p.lat, p_lng: p.lng, p_country: p.country, p_place_label: p.place_label,
    p_municipality: p.municipality, p_district: p.district, p_radius_m: p.radius_m, p_what: p.what,
    p_how_often: p.how_often, p_body: p.body, p_photos: p.photos,
  });
  return rows[0];
}

/** `id` = id prípadu ALEBO `note_id` značky na mape. */
export async function dangerCase(id: string): Promise<DangerCase | null> {
  const rows = await call<DangerCase[]>('danger_case', { p_id: id });
  return rows?.[0] ?? null;
}

export const dangerMine = () => call<DangerMineRow[]>('danger_mine');

export const dangerWitness = (caseId: string, on: boolean) => call<number>('danger_witness', { p_case: caseId, p_on: on });

export const dangerComments = (caseId: string) => call<DangerComment[]>('danger_comments', { p_case: caseId });
export const dangerCommentAdd = (caseId: string, body: string) => call<string>('danger_comment_add', { p_case: caseId, p_body: body });
export const dangerCommentDelete = (id: string) => call<void>('danger_comment_delete', { p_id: id });

export const dangerComplaintCreate = (p: DangerComplaintInput) => call<string>('danger_complaint_create', {
  p_case: p.case_id, p_country: p.country, p_place_label: p.place_label, p_authority: p.authority_code,
  p_raw: p.raw, p_official: p.official, p_phone: p.phone, p_sign_name: p.sign_name, p_cc_linka: p.cc_linka,
  p_photos: p.photos,
});

export const dangerOutcome = (complaintId: string, outcome: DangerOutcome) => call<void>('danger_outcome', { p_complaint: complaintId, p_outcome: outcome });

export const dangerTip = (country: string, body: string, contact: string) => call<string>('danger_tip_add', { p_country: country, p_body: body, p_contact: contact });

export const dangerLastPhone = () => call<string | null>('danger_last_phone');

// ── anon ────────────────────────────────────────────────────────────────────
export async function dangerPublic(slug: string): Promise<DangerPublic | null> {
  const rows = await call<DangerPublic[]>('danger_public', { p_slug: slug });
  return rows?.[0] ?? null;
}

// ── edge: AI prepis podnetu (nič neukladá) ──────────────────────────────────
export async function dangerOfficialText(p: DangerOfficialTextInput): Promise<{ text: string; missing: string[] }> {
  const { data: s } = await supabase.auth.getSession();
  const token = s.session?.access_token;
  if (!token) throw new Error('not_authenticated');
  const r = await fetch(`${EDGE_BASE}/danger-official-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify(p),
  });
  if (r.status === 429) throw new Error('rate_limited');
  if (!r.ok) throw new Error('error');
  return r.json();
}

/** Verejný odkaz prípadu (plagát, QR). */
export const dangerUrl = (slug: string) => `https://dogypt.com/danger/${slug}`;
