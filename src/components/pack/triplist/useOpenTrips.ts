// OTVORENÉ CUDZIE VÝLETY (issue #41) — inzeráty „hľadám partiu" od ostatných členov.
//
// PREČO priamy select a nie RPC: `user_trips` má na to vlastnú politiku
// `user_trips_read_open` (20260730_pack_trips_db.sql §8.2) — platiaci člen vidí
// KAŽDÝ riadok s `openness='open' and status='looking'`. Riadok nesie len slug,
// dátum a `user_id`; KTO ten človek je sa dozvie až `get_trip_party()`
// (useTripParty.ts). Tu teda ide von uuid organizátora — to je nutné, lebo bez
// neho sa nedá adresovať `trip_requests.organizer_id` ani načítať partia.
//
// ⚠️ Dovtedy boli OPEN TRIPS v triplíste MOCK (`buildPublicTrips` v triplist.ts).
// Mock sa nemaže — ostáva ako demo náplň, keď v DB reálny inzerát ešte nie je
// (rovnaký vzor ako `placeholderMyTrips`). Požiadať sa dá len o REÁLNY výlet.
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OpenTrip {
  slug: string;
  organizerId: string;
  date: string | null;   // ISO yyyy-mm-dd; null = „no date yet"
  addedAt: string | null;
}

interface OpenTripRow {
  trip_slug: string;
  user_id: string;
  trip_date: string | null;
  added_at: string | null;
}

export function useOpenTrips(epoch = 0): { trips: OpenTrip[]; loading: boolean } {
  const [trips, setTrips] = useState<OpenTrip[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id ?? null;
    if (!uid) {
      // bez session RLS nevydá nič — nemá zmysel ani strieľať dopyt
      // (⚠️ presne toto vidí VITE_PACK_NOAUTH=1: prázdno, nie chyba)
      setTrips([]); setLoading(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('user_trips')
      .select('trip_slug,user_id,trip_date,added_at')
      .eq('openness', 'open')
      .eq('status', 'looking')
      .neq('user_id', uid)          // vlastný inzerát nie je „cudzí otvorený výlet"
      .order('added_at', { ascending: false }) as
      { data: OpenTripRow[] | null; error: { message: string } | null };

    if (error) {
      console.warn('[open trips]', error.message);
      setTrips([]); setLoading(false);
      return;
    }
    setTrips((data ?? []).map((r) => ({
      slug: r.trip_slug, organizerId: r.user_id, date: r.trip_date, addedAt: r.added_at,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load, epoch]);

  return { trips, loading };
}
