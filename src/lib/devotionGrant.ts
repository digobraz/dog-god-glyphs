// Volanie `grant-devotion` z klienta — jedno miesto (hlavičky, udalosť pre usePackIdentity).
// Server rozhoduje o bodoch, strope aj živých psoch; klient len posiela skutok.
import { supabase } from '@/integrations/supabase/client';
import { EDGE_BASE, SUPABASE_ANON_KEY } from '@/lib/env';

export async function grantDevotion(body: { kind: string; dog_ids?: string[]; scroll?: string; items?: Array<{ kind: string; n: number }>; note?: string; deed_type?: string }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('no session');
  const res = await fetch(`${EDGE_BASE}/grant-devotion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({})) as { points?: number; total?: number; error?: string; capped?: boolean; good_deed?: { approved: boolean; reason?: string } | null };
  if (!res.ok) throw new Error(j.error ?? String(res.status));
  if (typeof j.total === 'number') window.dispatchEvent(new CustomEvent('dogypt:devotion', { detail: { total: j.total } }));
  return j;
}

/** DOG ID na 100 % → +30 ☥ raz za psa. Pamätá si to aj zariadenie, aby /dogs nevolal server pri každom otvorení. */
export function grantDogIdFull(dogIds: string[]) {
  const key = (id: string) => `dogypt_dv_dogid_${id}`;
  const fresh = dogIds.filter((id) => { try { return !localStorage.getItem(key(id)); } catch { return true; } });
  if (!fresh.length) return;
  void grantDevotion({ kind: 'dogid_full', dog_ids: fresh })
    .then(() => { for (const id of fresh) { try { localStorage.setItem(key(id), '1'); } catch { /* súkromné okno */ } } })
    .catch(() => { /* mŕtvy pes / hosť / offline — skúsi sa pri ďalšom otvorení */ });
}
