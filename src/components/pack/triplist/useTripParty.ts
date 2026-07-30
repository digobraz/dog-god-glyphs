// Kto naozaj ide na výlet (issue #41) — organizátor, prijatí účastníci a (len pre
// organizátora) čakajúce žiadosti.
//
// PREČO RPC a nie `supabase.from(...)`: `trip_requests` drží len `uuid`. Kto ten
// človek je, vie iba tabuľka `dogs`, a tá je čítateľná výhradne vlastná. Cudziu
// identitu vydáva `get_trip_party()` (migrácia 20260730_trip_party.sql) a vydáva
// z nej len krstné meno, meno psa, fotku a poradové číslo — rovnaký whitelist ako
// precedens `get_my_network()`. Kto nemá prístup, dostane prázdno.
//
// ⚠️ Toto NIE JE bohatý profil (pilulky povahy, D3 tiery). Ten žije zatiaľ len
// v localStorage (`packProfile.ts:757` „SWAP: localStorage → supabase"), takže
// o CUDZOM členovi ho appka fyzicky nemá odkiaľ prečítať.
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PartyRole = 'organizer' | 'joiner' | 'requested';

export interface PartyMember {
  role: PartyRole;
  ownerFirst: string | null;
  dogName: string | null;
  dogPhoto: string | null;
  packNumber: number | null;
  at: string | null;
}

interface PartyRow {
  role: PartyRole;
  owner_first: string | null;
  dog_name: string | null;
  dog_photo: string | null;
  pack_number: number | null;
  at: string | null;
}

export interface TripParty {
  organizer: PartyMember | null;
  joiners: PartyMember[];
  requests: PartyMember[];   // vidí ich len organizátor (strážené v SQL, nie tu)
  loading: boolean;
}

const EMPTY: TripParty = { organizer: null, joiners: [], requests: [], loading: false };

/**
 * @param tripSlug   id výletu (HeroTrail.id)
 * @param organizerId majiteľ výletu; undefined = ja (default v SQL je auth.uid())
 */
export function useTripParty(tripSlug: string | null | undefined, organizerId?: string | null): TripParty {
  const [party, setParty] = useState<TripParty>(EMPTY);

  const load = useCallback(async () => {
    if (!tripSlug) { setParty(EMPTY); return; }
    setParty((p) => ({ ...p, loading: true }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('get_trip_party', {
      p_trip_slug: tripSlug,
      ...(organizerId ? { p_organizer: organizerId } : {}),
    }) as { data: PartyRow[] | null; error: { message: string } | null };

    if (error) {
      // prázdna partia je legitímny stav (zavretý cudzí výlet) — chybu nehádžeme
      // do UI, len do konzoly, nech to nezhodí kartu výletu
      console.warn('[trip party]', error.message);
      setParty(EMPTY);
      return;
    }
    const map = (r: PartyRow): PartyMember => ({
      role: r.role, ownerFirst: r.owner_first, dogName: r.dog_name,
      dogPhoto: r.dog_photo, packNumber: r.pack_number, at: r.at,
    });
    const rows = (data ?? []).map(map);
    setParty({
      organizer: rows.find((r) => r.role === 'organizer') ?? null,
      joiners: rows.filter((r) => r.role === 'joiner'),
      requests: rows.filter((r) => r.role === 'requested'),
      loading: false,
    });
  }, [tripSlug, organizerId]);

  useEffect(() => { void load(); }, [load]);

  return party;
}

/**
 * Partie pre VIAC mojich výletov naraz (zoznam TRIPLIST). RPC je per výlet, takže
 * sa volá paralelne — mojich výletov sú jednotky, nie tisíce. Kľúč cache je zoznam
 * slugov, nie pole: inak by sa to prekresľovalo pri každom renderi rodiča.
 */
export function useMyTripParties(slugs: string[]): Record<string, TripParty> {
  const [map, setMap] = useState<Record<string, TripParty>>({});
  const key = slugs.join('|');

  useEffect(() => {
    let alive = true;
    const list = key ? key.split('|') : [];
    if (!list.length) { setMap({}); return; }
    (async () => {
      const entries = await Promise.all(list.map(async (slug) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).rpc('get_trip_party', { p_trip_slug: slug }) as
          { data: PartyRow[] | null; error: { message: string } | null };
        if (error) return [slug, EMPTY] as const;
        const rows = (data ?? []).map((r): PartyMember => ({
          role: r.role, ownerFirst: r.owner_first, dogName: r.dog_name,
          dogPhoto: r.dog_photo, packNumber: r.pack_number, at: r.at,
        }));
        return [slug, {
          organizer: rows.find((r) => r.role === 'organizer') ?? null,
          joiners: rows.filter((r) => r.role === 'joiner'),
          requests: rows.filter((r) => r.role === 'requested'),
          loading: false,
        }] as const;
      }));
      if (alive) setMap(Object.fromEntries(entries));
    })();
    return () => { alive = false; };
  }, [key]);

  return map;
}
