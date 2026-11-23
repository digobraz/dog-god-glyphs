// Psy člena pre výber „Pre koho“ v chate v2: zaplatení, živí, v poradí podľa čísla (najnižšie = prvý pes člena).
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserShared, shared } from '@/lib/sharedFetch';
import { DEV_NOAUTH, DEV_MOCK_DOGS } from '@/lib/devMockDogs';

export interface V2Dog { id: string; name: string; photo: string | null }

export function useV2Dogs(): V2Dog[] {
  const [dogs, setDogs] = useState<V2Dog[]>(() =>
    DEV_NOAUTH ? DEV_MOCK_DOGS.map((d) => ({ id: d.id, name: d.dog_name, photo: d.cloudinary_main_url })) : []);
  useEffect(() => {
    if (DEV_NOAUTH) return;
    let alive = true;
    (async () => {
      try {
        const { data: { user } } = await getUserShared();
        if (!user) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await shared(`ainubis-v2-dogs:${user.id}`, () => (supabase as any)
          .from('dogs')
          .select('id, dog_name, life_status, cloudinary_main_url')
          .eq('user_id', user.id)
          .eq('payment_status', 'paid')
          .order('pack_number', { ascending: true }), 30_000) as {
            data: { id: string; dog_name: string | null; life_status: string | null; cloudinary_main_url: string | null }[] | null; error: unknown;
          };
        if (!alive || error || !data) return;
        setDogs(data.filter((d) => d.life_status !== 'deceased' && (d.dog_name ?? '').trim())
          .map((d) => ({ id: d.id, name: (d.dog_name ?? '').trim(), photo: d.cloudinary_main_url })));
      } catch { /* bez psov = len Všeobecne */ }
    })();
    return () => { alive = false; };
  }, []);
  return dogs;
}
