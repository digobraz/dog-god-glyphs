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
import type { TravelInfo } from '@/components/pack/addtrip/addTripModel';

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


/**
 * AKO SA ORGANIZÁTOR DOSTANE NA VÝLET — pre CUDZIE otvorené výlety (2026-08-27).
 *
 * Vracia mapu `host_id → travel` pre jeden slug. Bez tohto by dopravu videl len ten, kto ju
 * zadal — a to je presne naopak, než na čo je: je to odpoveď pre človeka, ktorý zvažuje, či
 * sa pridá („ideme vlakom z Nitry, mám dve voľné miesta").
 *
 * PREČO SAMOSTATNÝ DOTAZ a nie rozšírenie `useOpenTrips`: ten číta `user_trips` (kto niekoho
 * hľadá), doprava leží v `trip_events` (inzerát). PostgREST tie dve tabuľky nespojí jedným
 * volaním, lebo medzi nimi nie je cudzí kľúč — sú previazané cez `trip_slug`, obyčajný text.
 *
 * RLS: `trip_events_read_open` (closed = false and is_paid_member()) — netreba nič nové,
 * platí na celý riadok, teda aj na stĺpec `travel`.
 * ⚠️ `closed = false` je aj v dotaze, nielen v politike: zavretý inzerát politika síce
 * nevydá, ale spoliehať sa na to znamená, že prvá zmena politiky ticho zmení aj toto.
 */
export function useTripEventTravel(slug: string | undefined, epoch = 0): Record<string, TravelInfo> {
  const [byHost, setByHost] = useState<Record<string, TravelInfo>>({});

  useEffect(() => {
    if (!slug) { setByHost({}); return; }
    let dead = false;
    void (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session?.user?.id) { if (!dead) setByHost({}); return; }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('trip_events')
        .select('host_id,travel')
        .eq('trip_slug', slug)
        .eq('closed', false) as
        { data: Array<{ host_id: string; travel: TravelInfo | null }> | null; error: { message: string } | null };
      if (dead) return;
      if (error) { console.warn('[trip travel]', error.message); setByHost({}); return; }
      const out: Record<string, TravelInfo> = {};
      for (const r of data ?? []) if (r.travel) out[r.host_id] = r.travel;
      setByHost(out);
    })();
    return () => { dead = true; };
  }, [slug, epoch]);

  return byHost;
}
