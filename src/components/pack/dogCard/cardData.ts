// Údaje pre núdzovú kartičku: riadok psa + posledné hodnoty DOG ID, súbežne. Používa `PackDogCard` aj predstiahnutie v `sosLocal.ts`.
import { supabase } from '@/integrations/supabase/client';
import { readLatest, type LatestValue } from '@/lib/dogEvents';

export type DogRow = {
  dog_name: string | null; cloudinary_main_url: string | null; patron_svg: string | null; life_status: string | null;
  selections: Record<string, string> | null; owner_name: string | null;
};

export async function fetchCardData(id: string): Promise<{ dog: DogRow | null; latest: Record<string, LatestValue> }> {
  const [dogRes, latest] = await Promise.all([
    supabase.from('dogs').select('dog_name, cloudinary_main_url, patron_svg, life_status, selections, owner_name').eq('id', id).maybeSingle(),
    readLatest(id, { strict: true }),
  ]);
  if (dogRes.error) throw dogRes.error;
  return { dog: (dogRes.data as DogRow | null) ?? null, latest };
}
