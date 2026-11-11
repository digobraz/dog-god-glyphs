// PEČAŤ Z DB (11. 11. 2026, zadanie `plany/zadanie-platby-2026-11-11.md` E2).
//
// Pečať (os DOGYPŤAN + ZAKLADATEĽ) sa už NERÁTA v appke z `payment_status` — počíta ju DB
// (`rank_of` / `seal_of_user` / `seal_of_dog`, migrácia `20261206_hodnosti.sql`), lebo hodnosť
// príde z troch zdrojov (web Stripe, Apple, Google) a zakladateľ je zamknutý dátumom vypnutia €11.
//
// Dopyty sa ZBIERAJÚ: všetky mená na obrazovke = jedno `seals_for(čísla, psy)` v tom istom ťahu,
// výsledok sa drží v pamäti do konca session. Cudzí človek je ČÍSLO člena (uuid von nejde).
//
// ⚠️ Kým odpoveď nepríde (alebo DB funkciu ešte nemá — LIVE pred migráciou), platí `fallback`,
//    teda presne to, čo appka ukazovala dovtedy. Chyba sa nikdy nesmie prejaviť ako „pečať zhasla".
import { useEffect, useSyncExternalStore } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { hasSession } from '@/lib/hasSession';
import type { SealTier } from './dogSeal';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
const TIERS = new Set<SealTier>(['veriaci', 'akolyta', 'knaz', 'vezir', 'zakladatel']);

const byNumber = new Map<number, SealTier>();
const byDog = new Map<string, SealTier>();
let mine: SealTier | undefined;
let mineAsked = false;
let off = false; // DB funkciu nemá / anonym — do konca session sa už nepýtame
const wantN = new Set<number>();
const wantD = new Set<string>();
let timer: ReturnType<typeof setTimeout> | null = null;
let version = 0;
const listeners = new Set<() => void>();
const notify = () => { version++; listeners.forEach((l) => l()); };

// FARAÓN zatiaľ nemá kresbu pečate — kreslí sa ako najvyššia na osi.
const asTier = (v: unknown): SealTier | undefined =>
  v === 'farao' ? 'vezir' : TIERS.has(v as SealTier) ? (v as SealTier) : undefined;

function schedule() {
  if (off || timer) return;
  timer = setTimeout(flush, 0);
}

async function flush() {
  timer = null;
  const ns = [...wantN].filter((n) => !byNumber.has(n));
  const ds = [...wantD].filter((d) => !byDog.has(d));
  const askMe = !mineAsked;
  wantN.clear(); wantD.clear();
  if (!ns.length && !ds.length && !askMe) return;
  mineAsked = true;
  try {
    if (!(await hasSession())) { off = true; return; }
    const { data, error } = await db.rpc('seals_for', { p_numbers: ns, p_dogs: ds });
    if (error || !data) { off = true; return; }
    const me = asTier(data.me);
    if (me) mine = me;
    for (const [k, v] of Object.entries(data.n ?? {})) { const t = asTier(v); if (t) byNumber.set(Number(k), t); }
    for (const [k, v] of Object.entries(data.d ?? {})) { const t = asTier(v); if (t) byDog.set(k, t); }
    notify();
  } catch {
    off = true;
  }
}

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const useVersion = () => useSyncExternalStore(subscribe, () => version, () => version);

/** Pečať konkrétneho psa (id z `dogs`). */
export function useDogSeal(dogId: string | null | undefined, fallback: SealTier): SealTier {
  useVersion();
  useEffect(() => { if (dogId && !byDog.has(dogId)) { wantD.add(dogId); schedule(); } }, [dogId]);
  return (dogId && byDog.get(dogId)) || fallback;
}

/** Pečať cudzieho človeka podľa čísla člena (`/pack/u/<n>`). */
export function useMemberSeal(n: number | null | undefined, fallback: SealTier): SealTier {
  useVersion();
  useEffect(() => { if (n != null && !byNumber.has(n)) { wantN.add(n); schedule(); } }, [n]);
  return (n != null && byNumber.get(n)) || fallback;
}

/** Moja pečať (prihlásený človek). */
export function useMySeal(fallback: SealTier): SealTier {
  useVersion();
  useEffect(() => { if (!mineAsked) schedule(); }, []);
  return mine ?? fallback;
}

/** Po nákupe / zrušení hodnosti: zabudni a spýtaj sa znova. */
export function resetSeals() {
  byNumber.clear(); byDog.clear(); mine = undefined; mineAsked = false; off = false;
  notify();
}
