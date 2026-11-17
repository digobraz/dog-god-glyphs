// 🔖 ULOŽENÉ MIESTA — veterinár uložený z karty na mape (`VetLayer`), polica v triplistu (`PackTriplist`).
// Matej 17. 11. 2026: *„možno tu chýba uložiť… malo by sa to ukladať do /map – triplist"* → *„ano uložené miesta správne"*.
// Zápis drží `feed_marks` (kind='save', cieľ `vet:<cid>`, migrácia 20261221_feed_marks_vet.sql) — tá istá tabuľka
// ako ☆ vo feede, nie nová. Zapína a vypína ju `useFeedMarks().toggle`; tu je len čítanie pre policu.
import { supabase } from '@/integrations/supabase/client';
import { ER_CLINICS, loadMapVets, type MapVet } from '@/lib/clinics';

export const vetTarget = (cid: string) => `vet:${cid}`;

/** Moje uložené kliniky, najnovšie prvé. Klinika, ktorá z registra zmizla, sa ticho vynechá. */
export async function fetchSavedVets(): Promise<MapVet[]> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return [];
  const db = supabase as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data, error } = await db.from('feed_marks').select('target, at')
    .eq('user_id', uid).eq('kind', 'save').like('target', 'vet:%').order('at', { ascending: false }).limit(200);
  if (error || !data?.length) return [];
  const all = [...ER_CLINICS, ...(await loadMapVets())];
  const byCid = new Map(all.map((v) => [v.cid, v]));
  return (data as Array<{ target: string }>).flatMap((r) => byCid.get(r.target.slice(4)) ?? []);
}
