// ainubisHistory — história rozhovorov člena a prepínače, čo o ňom AINUBIS smie vedieť (appka MVP, 31. 10. 2026).
//
// · zoznam / vymazanie ide cez edge `ainubis-chat` (`action: 'list' | 'clear'`) — vymazanie musí zmazať aj
//   screenshoty z private bucketu, čo z prehliadača ani z SQL nejde. Člen sa overuje z tokenu.
// · prepínače žijú v `pack_profiles.human.ainubis` (NIE piate miesto na údaje o človeku) — čítanie a zápis
//   cez `lib/humanPrefs.ts`. Chýbajúci kľúč = ZAPNUTÉ, vypína len výslovné `false` (rovnako ako server,
//   `_shared/ainubis-dog-context.ts` → `loadMemberProfile`).
import { supabase } from '@/integrations/supabase/client';
import { patchHuman, readHuman } from '@/lib/humanPrefs';

export interface HistoryItem {
  id: string;
  session_token: string;
  created_at: string;
  last_message_at: string;
  msg_count: number;
  preview: string;
}

/** Čo smie AINUBIS o členovi vedieť — kľúče sedia s `AinubisAccess` na serveri. */
export type AccessKey = 'dogs' | 'dogId' | 'diary' | 'memory';
export const ACCESS_KEYS: AccessKey[] = ['dogs', 'dogId', 'diary', 'memory'];
export type Access = Record<AccessKey, boolean>;

export async function listHistory(): Promise<HistoryItem[]> {
  const { data, error } = await supabase.functions.invoke('ainubis-chat', { body: { action: 'list' } });
  if (error) throw error;
  return ((data as { conversations?: HistoryItem[] } | null)?.conversations ?? []);
}

export async function clearHistory(): Promise<number> {
  const { data, error } = await supabase.functions.invoke('ainubis-chat', { body: { action: 'clear' } });
  if (error) throw error;
  return (data as { deleted?: number } | null)?.deleted ?? 0;
}

export async function readAccess(): Promise<Access> {
  const { human } = await readHuman();
  const a = (human.ainubis ?? {}) as Partial<Record<AccessKey, unknown>>;
  return { dogs: a.dogs !== false, dogId: a.dogId !== false, diary: a.diary !== false, memory: a.memory !== false };
}

/** Zapíše CELÝ objekt `ainubis` (patchHuman prepíše kľúč na najvyššej úrovni, nie vnorene). */
export async function writeAccess(next: Access): Promise<void> {
  await patchHuman({ ainubis: next });
}
