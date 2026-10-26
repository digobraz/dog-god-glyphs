// NAHLÁSIŤ A ZABLOKOVAŤ pri príspevku a cudzom profile (App Store 1.2, Matej 26. 10. 2026).
// Infra: DB `report_content` + `block_member` + `my_blocked_owners` (migrácia 20261027_report_post.sql).
// Člena adresuje POSLEDNÉ, čo o ňom appka vie — poradové číslo majiteľa (`/pack/u/:n`); `user_id` nepozná.
// Blok žije v tej istej tabuľke `pack_blocks` ako blok v správach. Skrytie príspevkov je klientske.
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const db = supabase as any;
const CHANGED = 'dogypt:blocks-changed';

let cache: Set<number> | null = null;

/** Zablokuje / odblokuje člena podľa čísla majiteľa; vracia stav PO operácii. Chyba = zámok NEplatí. */
export async function blockMember(ownerN: number, block: boolean): Promise<boolean> {
  const { data, error } = await db.rpc('block_member', { p_owner_n: ownerN, p_block: block });
  if (error) throw error;
  const on = Boolean(data);
  const next = new Set(cache ?? []);
  if (on) next.add(ownerN); else next.delete(ownerN);
  cache = next;
  window.dispatchEvent(new Event(CHANGED));
  return on;
}

export async function fetchBlockedOwners(): Promise<Set<number>> {
  const { data, error } = await db.rpc('my_blocked_owners');
  if (error) throw error;
  cache = new Set(((data ?? []) as Array<{ owner_n: number }>).map((r) => Number(r.owner_n)));
  return cache;
}

/** Čísla majiteľov, ktorých som zablokoval. Kým server neodpovie (alebo nemá migráciu), je zoznam prázdny. */
export function useBlockedOwners(): Set<number> {
  const [set, setSet] = useState<Set<number>>(cache ?? new Set());
  useEffect(() => {
    let alive = true;
    const sync = () => { if (alive && cache) setSet(cache); };
    window.addEventListener(CHANGED, sync);
    if (!cache) fetchBlockedOwners().then(sync).catch(() => {});
    return () => { alive = false; window.removeEventListener(CHANGED, sync); };
  }, []);
  return set;
}

/** Nahlási príspevok (`ref` = id) alebo člena (`ref` = číslo majiteľa). packMessaging je ťažký → dynamický import. */
export async function reportTarget(kind: 'post' | 'member', ref: string, reason: import('@/components/pack/messaging/packMessaging').ReportReason, note?: string): Promise<void> {
  const m = await import('@/components/pack/messaging/packMessaging');
  await m.reportContent(kind, ref, reason, note);
}
