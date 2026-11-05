// SOS — zápis do denníka psa po konci pátrania (Matej 5. 11. 2026): míľnik `diary.milestone` v `dog_events`.
//  · „živý“: zápis vznikne SÁM (raz na stratu: `sosDiaryMark`), id riadku si drží `lost_dogs.diary_event`, takže ho
//    majiteľ po úprave (`DiaryEntry` edit) nájde, hoci úprava prepíše `value`.
//  · „nežije“: zápis len na výslovný ťuk, text si majiteľ môže prepísať — nič sa nepredklikáva.
// `dog_events` zapisuje RLS iba majiteľovi psa (`is_paid_member`), pawmate denník nepíše.
import { supabase } from '@/integrations/supabase/client';
import type { DiaryEditTarget } from '@/components/pack/diary/DiaryEntry';
import { dayToRecordedAt, todayKey } from '@/components/pack/diary/diaryModel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

const dayKeyOf = (iso?: string | null): string => {
  if (!iso) return todayKey();
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/** Zapíše míľnik a vráti id riadku. Zlyhanie sa vyhodí (volajúci poistku vráti). `onISO` = deň, ku ktorému míľnik patrí. */
export async function writeSosMilestone(dogId: string, text: string, onISO?: string | null): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) throw new Error('not_authenticated');
  const { data, error } = await sb.from('dog_events').insert({
    dog_id: dogId, user_id: uid, field: 'diary.milestone', value: { text }, source: 'profile',
    recorded_at: dayToRecordedAt(dayKeyOf(onISO)),
  }).select('id').single();
  if (error || !data?.id) throw new Error(error?.message ?? 'insert_failed');
  return data.id as string;
}

/** Riadok míľnika na úpravu; `null`, keď ho majiteľ medzitým zmazal. */
export async function readSosMilestone(id: string): Promise<DiaryEditTarget | null> {
  const { data, error } = await sb.from('dog_events').select('id, dog_id, field, value, recorded_at').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return { id: data.id, dogId: data.dog_id, field: data.field, value: data.value, recordedAt: data.recorded_at };
}
