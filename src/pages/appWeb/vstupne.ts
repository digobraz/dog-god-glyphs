// DOBROVOĽNÉ VSTUPNÉ na webe `/app#badges` (11. 11. 2026, zadanie `plany/zadanie-platby-2026-11-11.md` E4).
// Volá edge `vstupne` (checkout · portal · status · session). Cenu posiela len server — web posiela hodnosť.
// Hodnosť patrí človeku, takže checkout aj portál chcú prihláseného; bez prihlásenia → /login a späť sem.
import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';

export type Rank = 'akolyta' | 'knaz' | 'vezir' | 'farao';
/** Poradie kariet na webe = index (0 Veriaci … 4 Faraón). */
export const RANK_OF_CARD: (Rank | null)[] = [null, 'akolyta', 'knaz', 'vezir', 'farao'];
/** Sumy FARAÓNA — musia sedieť s `FARAO_AMOUNTS` v `_shared/vstupne.ts` (667, nie 666). */
export const FARAO_AMOUNTS = [111, 222, 333, 667, 999] as const;

async function call(body: Record<string, unknown>, auth: boolean) {
  const { data } = await supabase.auth.getSession();
  const tok = data.session?.access_token;
  if (auth && !tok) return { status: 401, json: {} as Record<string, unknown> };
  const r = await fetch(`${SUPABASE_URL}/functions/v1/vstupne`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${tok ?? SUPABASE_ANON_KEY}` },
    body: JSON.stringify(body),
  });
  return { status: r.status, json: (await r.json().catch(() => ({}))) as Record<string, unknown> };
}

export const loginUrl = () => `/login?next=${encodeURIComponent('/app#badges')}`;

/** Prejde na Stripe. Vráti 'login' (treba sa prihlásiť) alebo 'error'; pri úspechu stránka odíde. */
export async function startCheckout(rank: Rank, kind: 'month' | 'once', amount: number | undefined, lang: string, back = '/app'): Promise<'login' | 'error' | 'ok' | 'owned'> {
  const r = await call({ action: 'checkout', rank, kind, amount, lang, back }, true);
  if (r.status === 401) return 'login';
  // Už platí mesačne → zmena hodnosti v portáli. Z heroflowu (`back` ≠ /app) človeka z flowu nevyvádzame: hodnosť má, flow ide ďalej.
  if (r.status === 409) return back === '/app' ? openPortal() : 'owned';
  if (typeof r.json.url === 'string') { window.location.href = r.json.url; return 'ok'; }
  return 'error';
}

export async function openPortal(): Promise<'login' | 'error' | 'ok'> {
  const r = await call({ action: 'portal' }, true);
  if (r.status === 401) return 'login';
  if (typeof r.json.url === 'string') { window.location.href = r.json.url; return 'ok'; }
  return 'error';
}

/** Moja hodnosť (null = neprihlásený). */
export async function myRank(): Promise<string | null> {
  const r = await call({ action: 'status' }, true);
  return r.status === 200 && typeof r.json.rank === 'string' ? r.json.rank : null;
}

/** Návrat zo Stripe (`?vstupne=cs_…`) → hodnosť pre poďakovanie. */
export async function paidRank(sessionId: string): Promise<Rank | null> {
  const r = await call({ action: 'session', session_id: sessionId }, false);
  return r.json.paid ? (r.json.rank as Rank) : null;
}
