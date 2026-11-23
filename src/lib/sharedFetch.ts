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
import { EDGE_BASE, LIVE_EDGE_BASE } from '@/lib/env';

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

/** Zahodí zdieľaný sľub pod kľúčom — volaj po zápise, po ktorom musí ďalší čitateľ ísť na sieť. */
export function forgetShared(key: string): void {
  cache.delete(key);
}

// B2 (audit záťaže 15. 11. 2026): 5 s okno stačilo len na „dvaja naraz", nie na návštevu —
// pri prechádzke appkou išlo `get-pack-stats` 10× a `get_or_create_my_affiliate` 10× za 5 minút.
// Verejné čísla svorky sa menia raz za pár minút, BONES po pozvánke či výlete — preto 2 min / 1 min.
const STATS_TTL_MS = 120_000;
const AFFILIATE_TTL_MS = 60_000;

// Bezpečnostná previerka 21. 11. 2026: Supabase pred sebou Cloudflare nemá a `get-pack-stats` robí
// 9 dotazov na volanie. Ostrá prevádzka preto číta kópiu z okraja (`/api/stats`, worker.js, 60 s);
// priamo ide len DEV projekt a záloha, keď Worker neodpovie (aj kým nová verzia Workera nie je vonku).
const STATS_VIA_WORKER = !import.meta.env.DEV && EDGE_BASE === LIVE_EDGE_BASE;
const statsDirect = <T,>() =>
  fetch(`${EDGE_BASE}/get-pack-stats`).then((r) => {
    if (!r.ok) throw new Error(`get-pack-stats ${r.status}`);
    return r.json() as Promise<T>;
  });

/** `get-pack-stats` — verejné čísla svorky (počty, top krajiny a plemená). */
export function getPackStats<T = unknown>(): Promise<T> {
  return shared('pack-stats', () =>
    STATS_VIA_WORKER
      ? fetch('https://dogypt.com/api/stats')
          .then((r) => (r.ok ? (r.json() as Promise<T>) : Promise.reject(r.status)))
          .catch(() => statsDirect<T>())
      : statsDirect<T>(),
    STATS_TTL_MS,
  );
}

/** `get_or_create_my_affiliate` — riadok affiliate prihláseného člena (BONES, kód). */
export function getMyAffiliate<T = unknown>(): Promise<{ data: T[] | null; error: { message: string } | null }> {
  return shared('my-affiliate', async () => {
    const { data, error } = await supabase.rpc('get_or_create_my_affiliate');
    if (error) throw error;
    return { data: data as T[] | null, error: null };
  }, AFFILIATE_TTL_MS).catch((e: { message?: string }) => ({ data: null, error: { message: e?.message ?? String(e) } }));
}

/** Zahodí pamäť BONES — volaj po akcii, po ktorej sa body menia (pozvánka, odmena). */
export function invalidateMyAffiliate(): void {
  cache.delete('my-affiliate');
}

let authWatch = false;
/**
 * Prihlásený používateľ z `auth.getUser()` — jedna cesta na auth server na okno, nie na komponent
 * (14× za 5 min prechádzky). Pamäť sa zahodí pri KAŽDEJ zmene auth stavu (USER_UPDATED po úprave
 * profilu či súhlasu, prihlásenie, odhlásenie, obnova tokenu), takže čerstvé `user_metadata`
 * po zápise neostane staré; inak platí okno 60 s.
 */
export function getUserShared() {
  if (!authWatch) {
    authWatch = true;
    supabase.auth.onAuthStateChange(() => { cache.delete('auth-user'); });
  }
  return shared('auth-user', () => supabase.auth.getUser(), 60_000);
}
