// ════════════════════════════════════════════════════════════════════════════
// ZOZNAM MOJICH PSOV pre obrazovky `/pack/dogs*` — JEDEN dotaz, dve obrazovky.
//
// Vytiahnuté z `pages/PackDogs.tsx` 8. 10. 2026, keď pribudla KRONIKA
// (`pages/PackChronicle.tsx`). Pravidlo „ktorých psov vidím" (práva cez
// `my_dog_rights()`, pri zlyhaní vlastníctvo, len `paid`) sa NEOPISUJE do druhej
// obrazovky — dve kópie by sa rozišli pri prvej úprave (CLAUDE.md, identita).
// ════════════════════════════════════════════════════════════════════════════
import { supabase } from '@/integrations/supabase/client';
import { DEV_NOAUTH, DEV_MOCK_DOGS } from '@/lib/devMockDogs';
import { getAccessibleDogIds } from '@/lib/dogRights';
import { applyDogOrder, readDogOrder } from '@/lib/dogOrder';

/**
 * Psy, ku ktorým má prihlásený človek prístup — v JEHO poradí (`lib/dogOrder.ts`),
 * bez nastavenia podľa psieho čísla vzostupne (do 13. 10. 2026 podľa `created_at`).
 * Bez session: v deve s `VITE_PACK_NOAUTH=1` mock svorka, inak prázdne pole.
 */
// POSLEDNÝ VÝSLEDOK podľa `select` (30. 10. 2026, Matej: „/dogs je dlho vidno len načítavam").
// Obrazovka si ho vezme ako počiatočný stav (`peekPackDogs`), takže pri návrate na /dogs
// nekreslí kostru znova — čerstvé dáta dobehnú hneď za tým tým istým `loadPackDogs`.
const last = new Map<string, unknown[]>();

/** Psy z posledného načítania (tej istej `select`), alebo `null`, kým sa ešte nenačítali. */
export function peekPackDogs<T>(select: string): T[] | null {
  return (last.get(select) as T[] | undefined) ?? null;
}

export async function loadPackDogs<T>(select: string): Promise<T[]> {
  // `getSession()`, nie `getUser()`: uid stačí z uloženej session — `getUser()` je vždy
  // jedna cesta na auth server navyše, a stála NA ZAČIATKU reťaze (uid → práva → psy).
  // Prístup aj tak stráži RLS podľa tokenu, nie toto uid.
  const { data: auth } = await supabase.auth.getSession();
  const uid = auth?.session?.user?.id;
  if (!uid) return DEV_NOAUTH ? (DEV_MOCK_DOGS as unknown as T[]) : [];
  // B3c: zoznam ide z práv (`my_dog_rights()`), nie z vlastníctva. Majiteľovi
  // vráti tú istú množinu; pri `null` (RPC zlyhala) ostáva filter na vlastníka.
  const accessIds = await getAccessibleDogIds();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase as any).from('dogs').select(select).eq('payment_status', 'paid');
  q = accessIds ? q.in('id', accessIds) : q.eq('user_id', uid);
  const [{ data }, order] = await Promise.all([
    q.order('pack_number', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true }),
    readDogOrder(),
  ]);
  const rows = applyDogOrder(((data as T[]) ?? []) as (T & { id: string })[], order);
  last.set(select, rows);
  return rows;
}
