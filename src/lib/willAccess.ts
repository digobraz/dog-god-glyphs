// PRÍSTUP K ZÁVETI (23. 10. 2026) — klient edge funkcie `will` (vystupy/supabase/functions/will).
// Pawtner (prihlásený): create · list · revoke. Dedič (bez konta, odkaz z mailu + heslo): hint · open · claim · decline.
// Heslo ani token sa v DB neukladajú čitateľne — prehliadač ich len pošle, porovná server.
import { supabase } from '@/integrations/supabase/client';
import { EDGE_BASE, SUPABASE_ANON_KEY } from '@/lib/env';

export interface WillRow {
  id: string;
  dog_ids: string[];
  heir_name: string;
  heir_email: string;
  hint: string;
  status: 'active' | 'declined';
  created_at: string;
  opened_at: string | null;
  claim_at: string | null;
  declined_at: string | null;
}
export interface WillDog { name: string | null; number: number | null; photo: string | null; angel: boolean; letter: string }
export interface WillOpen { owner: string; heir: string; status: 'active' | 'declined'; claimAt: string | null; dogs: WillDog[] }
export interface WillHint { hint: string; owner: string; heir: string; status: 'active' | 'declined'; lang: string }

type Res<T> = { ok: true; data: T; code?: undefined; left?: undefined } | { ok: false; data?: undefined; code: string; left?: number };

async function call<T>(body: Record<string, unknown>, auth = false): Promise<Res<T>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY };
  if (auth) {
    const { data } = await supabase.auth.getSession();
    const tok = data.session?.access_token;
    if (!tok) return { ok: false, code: 'unauthorized' };
    headers.Authorization = `Bearer ${tok}`;
  }
  try {
    const res = await fetch(`${EDGE_BASE}/will`, { method: 'POST', headers, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, code: String(json?.error ?? `http_${res.status}`), left: json?.left };
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, code: 'network' };
  }
}

export const createWill = (p: { dogIds: string[]; heirEmail: string; lang: string; answer?: string; heirName?: string; hint?: string }) =>
  call<{ ok: true; id: string }>({ action: 'create', ...p }, true);
export const listMyWills = () => call<{ wills: WillRow[] }>({ action: 'list' }, true);
export const revokeWill = (id: string) => call<{ ok: true }>({ action: 'revoke', id }, true);

export const willHint = (token: string) => call<WillHint>({ action: 'hint', token });
export const willAct = (token: string, answer: string, action: 'open' | 'claim' | 'decline') =>
  call<WillOpen>({ action, token, answer });
