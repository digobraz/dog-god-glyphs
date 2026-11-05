// Posledná odpoveď servera v zariadení, viazaná na účet (5. 11. 2026, rýchlosť appky).
// Obrazovka ukáže hneď to, čo tu už bolo, a server ju potom potichu obnoví. Cudzí účet
// na tom istom telefóne kópiu nedostane: značky a priania nesú `isMine`.
import { supabase } from '@/integrations/supabase/client';

async function uid(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch { return null; }
}

export async function readDeviceCopy<T>(key: string): Promise<T | null> {
  try {
    const me = await uid();
    if (!me) return null;
    const st = JSON.parse(localStorage.getItem(key) || 'null') as { uid: string; data: T } | null;
    return st?.uid === me ? st.data : null;
  } catch { return null; }
}

export async function writeDeviceCopy<T>(key: string, data: T): Promise<void> {
  try {
    const me = await uid();
    if (me) localStorage.setItem(key, JSON.stringify({ uid: me, data }));
  } catch { /* plné úložisko: nabudúce zo siete */ }
}
