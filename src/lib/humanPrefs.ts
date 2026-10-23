// Nastavenia človeka v `pack_profiles.human` (jsonb) — čítanie a zápis JEDNEJ vlastnosti.
// Zapisuje sa CELÝ `human` so zmenou, inak by upsert prepísal meno svorky a prezývku
// (vzor PackSettings `prepniNotifikacie`). Nové miesto na údaje o človeku nevzniká.
import { supabase } from '@/integrations/supabase/client';

export type Human = Record<string, unknown>;

export async function readHuman(): Promise<{ uid: string | null; human: Human }> {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user?.id ?? null;
  if (!uid) return { uid: null, human: {} };
  const { data: row } = await supabase
    .from('pack_profiles' as never)
    .select('human')
    .eq('user_id', uid)
    .maybeSingle();
  return { uid, human: ((row as { human?: Human } | null)?.human ?? {}) };
}

export async function patchHuman(patch: Human): Promise<Human> {
  const { uid, human } = await readHuman();
  if (!uid) throw new Error('no session');
  const next = { ...human, ...patch };
  const { error } = await supabase
    .from('pack_profiles' as never)
    .upsert({ user_id: uid, human: next } as never, { onConflict: 'user_id' });
  if (error) throw error;
  return next;
}

/** Vypnuté druhy notifikácií (id z `notifRegister.ts`). */
export const notifOff = (h: Human): string[] => (Array.isArray(h.notif_off) ? (h.notif_off as string[]) : []);

/** Časy pripomienok, 'HH:MM' v Bratislave — DVE denne (Matej 23. 10.: „15:00 a 19:00 2x za deň").
 *  Chýba ⇒ 15:00 a 19:00 (ten istý default ako DB `pending_devotion_reminders`). */
export const DEVOTION_TIMES_DEFAULT: [string, string] = ['15:00', '19:00'];
export const devotionTimes = (h: Human): [string, string] => {
  const v = Array.isArray(h.devotion_times) ? (h.devotion_times as unknown[]).filter((x): x is string => typeof x === 'string' && /^\d{2}:\d{2}$/.test(x)) : [];
  return [v[0] ?? DEVOTION_TIMES_DEFAULT[0], v[1] ?? DEVOTION_TIMES_DEFAULT[1]];
};
