// ── JEDNO VOLANIE, VIAC ČITATEĽOV (audit homepage 26. 9. 2026) ─────────────────
// Homepage pýtala tie isté dáta z viacerých miest naraz: `get-pack-stats` 2× (Pack.tsx
// + usePackIdentity v lište), `get_or_create_my_affiliate` 3× (Pack.tsx, lišta,
// FounderInvite). Každé miesto si ich pýta samo a o ostatných nevie — tak to má ostať,
// komponenty sa nemajú poznať. Zdieľa sa preto SĽUB: kto príde počas letu alebo do
// pár sekúnd po ňom, dostane ten istý výsledok, nie nové volanie.
//
// ⚠️ Krátke okno (TTL), nie pamäť na celú návštevu: BONES sa menia (pozvánka, výlet)
//    a štatistiky tiež. Po uplynutí okna ide ďalší čitateľ na sieť znova.
// ⚠️ Chyba sa nezdieľa dopredu — zlyhaný sľub sa z pamäte hneď zahodí, aby ďalší
//    pokus nedostal tú istú chybu.
import { supabase } from '@/integrations/supabase/client';
import { EDGE_BASE } from '@/lib/env';

const TTL_MS = 5_000;
const cache = new Map<string, { at: number; p: Promise<unknown> }>();

/** Zdieľaný sľub pod kľúčom. `ttl` kratší než 5 s = len „dvaja naraz", nie pamäť. */
export function shared<T>(key: string, run: () => Promise<T>, ttl = TTL_MS): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.p as Promise<T>;
  const p = run();
  cache.set(key, { at: Date.now(), p });
  p.catch(() => { if (cache.get(key)?.p === p) cache.delete(key); });
  return p;
}

/** `get-pack-stats` — verejné čísla svorky (počty, top krajiny a plemená). */
export function getPackStats<T = unknown>(): Promise<T> {
  return shared('pack-stats', () =>
    fetch(`${EDGE_BASE}/get-pack-stats`).then((r) => {
      if (!r.ok) throw new Error(`get-pack-stats ${r.status}`);
      return r.json() as Promise<T>;
    }),
  );
}

/** `get_or_create_my_affiliate` — riadok affiliate prihláseného člena (BONES, kód). */
export function getMyAffiliate<T = unknown>(): Promise<{ data: T[] | null; error: { message: string } | null }> {
  return shared('my-affiliate', async () => {
    const { data, error } = await supabase.rpc('get_or_create_my_affiliate');
    if (error) throw error;
    return { data: data as T[] | null, error: null };
  }).catch((e: { message?: string }) => ({ data: null, error: { message: e?.message ?? String(e) } }));
}
