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

/**
 * Psy, ku ktorým má prihlásený človek prístup, v poradí vstupu do svorky.
 * Bez session: v deve s `VITE_PACK_NOAUTH=1` mock svorka, inak prázdne pole.
 */
export async function loadPackDogs<T>(select: string): Promise<T[]> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) return DEV_NOAUTH ? (DEV_MOCK_DOGS as unknown as T[]) : [];
  // B3c: zoznam ide z práv (`my_dog_rights()`), nie z vlastníctva. Majiteľovi
  // vráti tú istú množinu; pri `null` (RPC zlyhala) ostáva filter na vlastníka.
  const accessIds = await getAccessibleDogIds();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase as any).from('dogs').select(select).eq('payment_status', 'paid');
  q = accessIds ? q.in('id', accessIds) : q.eq('user_id', uid);
  const { data } = await q.order('created_at', { ascending: true });
  return (data as T[]) ?? [];
}
