// NAHLÁSIŤ NEBEZPEČENSTVO (SOS, 20. 11. 2026): JEDINÉ miesto, odkiaľ frontend volá backend tejto funkcie.
// Zadanie: plany/zadanie-nebezpecenstvo-stavba-2026-11-20.md (bod A = kontrakt RPC, tento súbor ho zrkadlí).
// Migrácia: vystupy/supabase/migrations/20261224_danger.sql. Tabuľky nie sú v `types.ts`, preto `as any` ako v `sos.ts`.
//
// 🔴 Adresu, telefón, fotky týrania ani text podnetu nevydá žiadny anon RPC. `dangerPublic` vráti len druh,
//    obec a okruh (týranie: stred zaokrúhlený, okruh ≥ 500 m, bez fotky a adresy).
// Kontrakt po opravách: plany/danger-kontrakt-2026-11-21.md. Podnet = len vlastné slová človeka, úradný text píšeme my (21. 11. 2026).
// Čakané chyby servera: not_authenticated · no_access · rate_limited · bad_kind · bad_coords · bad_radius ·
// bad_phone · bad_text · bad_state · danger_via_report. Čítaj ich cez `dangerErrorCode`.
import { supabase } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpc = (name: string, args?: Record<string, unknown>) => (supabase as any).rpc(name, args);

async function call<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error, status } = await rpc(name, args);
  if (error) throw Object.assign(error, { status });   // HTTP stav nesie rozdiel odhlásený / nečlen / sieť
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

export type DangerComplaintState = 'submitted' | 'approved_waiting' | 'sent' | 'failed' | 'rejected';

export interface DangerComplaintBrief {
  id: string;
  /** `'AUTO'` = úrad určíme my */
  authority_code: string;
  state?: DangerComplaintState;
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
  /** `null` pri komentári nahlasovateľa týrania (server ho nevydá) */
  user_id: string | null;
  body: string;
  created_at: string;
  is_mine: boolean;
  author_first: string | null;
  author_photo: string | null;
  pack_number: number | null;
  is_reporter?: boolean;
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
  /** prázdne = úrad vyberie dispečer (server uloží 'AUTO') */
  authority_code: string | null;
  /** vlastné slová človeka (5 až 3000 znakov); úradný text píšeme my */
  raw: string;
  phone: string;
  sign_name: string | null; // null = „DOGYPT za mňa“
  cc_linka: boolean;
  photos: string[];
}

const KNOWN_ERRORS = [
  'not_authenticated', 'no_access', 'rate_limited', 'limit_reports', 'bad_kind', 'bad_coords', 'bad_radius', 'bad_phone', 'bad_text',
  'bad_state', 'bad_country', 'bad_contact', 'danger_via_report', 'own_case', 'not_found', 'expired', 'duplicate_open',
];

/** Kód chyby servera (`raise exception 'rate_limited'`). Najprv známe kódy, potom čokoľvek v tvare `snake_case`. */
export function dangerErrorCode(e: unknown): string {
  const m = String((e as { message?: string })?.message ?? e ?? '');
  const known = KNOWN_ERRORS.find((k) => m.includes(k));
  if (known) return known;
  const hit = m.match(/[a-z]+_[a-z_]+/g);
  return hit?.[0] ?? 'error';
}

/** Neplatné alebo neexistujúce ID (`/p/abc`): server hlási `invalid input syntax for type uuid`. To NIE JE chyba siete. */
export const isDangerUuid = (id: string | null | undefined) => !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
export function dangerNotFound(e: unknown): boolean {
  const x = e as { code?: string; message?: string };
  return x?.code === '22P02' || /invalid input syntax|not_found/i.test(String(x?.message ?? ''));
}

// ── ČO JE ZA CHYBOU: sieť · odhlásený · nečlen · prípad neexistuje ───────────────────────────────
/** Chyba bez odpovede servera (výpadok siete): supabase-js ju vráti bez `code` a so správou „Failed to fetch“. */
export function dangerIsOffline(e: unknown): boolean {
  const x = e as { code?: string; status?: number; message?: string } | null;
  if (!x) return false;
  if (x.code && String(x.code).length > 0) return false;
  return !x.status || /failed to fetch|networkerror|load failed|network request failed/i.test(String(x.message ?? ''));
}

export type DangerAccess = 'login' | 'member';
/** Server odmietol PRÍSTUP (nie dáta): odhlásený = výzva na prihlásenie, nečlen = „len členovia“. `null` = iná chyba. */
export async function dangerAccessIssue(e: unknown): Promise<DangerAccess | null> {
  const x = e as { code?: string; status?: number; message?: string } | null;
  const code = dangerErrorCode(e);
  const denied = code === 'not_authenticated' || code === 'no_access' || x?.status === 401 || x?.status === 403 || x?.code === '42501' || x?.code === 'PGRST301';
  if (!denied) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session && code !== 'not_authenticated' && x?.status !== 401 ? 'member' : 'login';
  } catch { return 'login'; }
}

export async function dangerHasSession(): Promise<boolean> {
  try { return !!(await supabase.auth.getSession()).data.session; } catch { return false; }
}

// ── predbežná kontrola: ešte PRED nahrávaním fotiek ─────────────────────────────────────────────
// Server odmietne nečlena a limit až pri zápise, no fotky by dovtedy už boli na Cloudinary (sirota). Preto sa pýtame vopred.
// `danger_precheck(p_kind)` → `{ ok, reason, remaining }`, nikdy nevyhadzuje chybu (kontrakt 21. 11. 2026).
// `offline` = kontrola sa nedostala k serveru: volajúci NESMIE nahrávať (ukáže „Bez pripojenia“ a nechá koncept).
export type DangerGate = 'ok' | 'not_authenticated' | 'no_access' | 'rate_limited' | 'offline';
export type DangerPrecheckKind = DangerKind | 'tip' | 'complaint' | 'comment';
export async function dangerPrecheck(kind: DangerPrecheckKind): Promise<DangerGate> {
  try {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) return 'not_authenticated';
    const { data, error } = await rpc('danger_precheck', { p_kind: kind });
    if (error) {
      if (dangerIsOffline(error)) return 'offline';
      const c = dangerErrorCode(error);
      return c === 'no_access' || c === 'rate_limited' ? c : 'ok';
    }
    const r = (Array.isArray(data) ? data[0] : data) as { ok?: boolean; reason?: string | null } | null;
    if (!r || r.ok !== false) return 'ok';
    return r.reason === 'not_authenticated' || r.reason === 'no_access' || r.reason === 'rate_limited' ? r.reason : 'ok';
  } catch { return 'offline'; }
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
  p_raw: p.raw, p_official: '' /* server ho ignoruje: úradný text píšeme my */, p_phone: p.phone, p_sign_name: p.sign_name, p_cc_linka: p.cc_linka,
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

/** Verejný odkaz prípadu (plagát, QR). */
export const dangerUrl = (slug: string) => `https://dogypt.com/danger/${slug}`;
