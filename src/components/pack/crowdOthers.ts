// ============================================================================
// OSTATNÍ ČLENOVIA na výlete — súhrn z RPC `trip_crowd()` (rozhodnutie 3A, 21. 9. 2026)
//
// Matej 21. 9.: „walked by N je počet ľudí, čo označili, že to prešli". Dovtedy
// `crowdAggregate()` skladal čísla len zo seedu zakladateľov + hlasu PRIHLÁSENÉHO,
// lebo `trip_votes` aj `trip_walked` majú RLS „len vlastné riadky" — cudzie hlasy
// klient nevidí a vidieť nemá. RPC vracia len súhrn (počty + anonymné hodnoty),
// bez identity. Migrácia: `vystupy/supabase/migrations/20260921_trip_crowd.sql`.
//
// ⚠️ RPC vynecháva ZAKLADATEĽA (nesie ho seed `founderWalkers()`) aj VOLAJÚCEHO
//    (jeho hlas pridáva `crowdAggregate()` z `userVote`). Keby sa niektorý z nich
//    rátal aj tu, bol by na karte dvakrát.
//
// Načíta sa RAZ za session pri prvom `useCrowdOthers()`. Bez prihlásenia alebo pri
// chybe ostane mapa prázdna ⇒ karta ukáže presne to, čo pred 21. 9. (seed + môj
// hlas). Chyba sa nikdy nesmie prejaviť ako „0 chodcov".
// ============================================================================
import { useSyncExternalStore } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Crowd, Difficulty, Hazard } from './packCommunity';

export interface CrowdOthers {
  /** Koľko RÔZNYCH ľudí (okrem zakladateľa a mňa) výlet prešlo alebo ohodnotilo. */
  walkers: number;
  /** Koľko ich psov je pri výlete v `dog_trips` — reálne číslo, nie odhad. */
  dogs: number;
  ratings: number[];
  difficulties: Difficulty[];
  crowds: Crowd[];
  hazards: Hazard[][];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
let bySlug = new Map<string, CrowdOthers>();
let version = 0;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

export const crowdOthersFor = (slug: string): CrowdOthers | undefined => bySlug.get(slug);

export function refreshCrowdOthers(): Promise<void> {
  loading = (async () => {
    try {
      const { data, error } = await db.rpc('trip_crowd');
      if (error || !Array.isArray(data)) return;
      const next = new Map<string, CrowdOthers>();
      for (const r of data) {
        next.set(String(r.trip_slug), {
          walkers: Number(r.walkers) || 0,
          dogs: Number(r.dogs) || 0,
          ratings: (r.ratings ?? []).map(Number),
          difficulties: r.difficulties ?? [],
          crowds: r.crowds ?? [],
          hazards: Array.isArray(r.hazards) ? r.hazards : [],
        });
      }
      bySlug = next;
      version++;
      listeners.forEach((l) => l());
    } catch {
      // sieť/RPC nedostupné — ostáva predchádzajúci stav, karta padne na seed + môj hlas
    }
  })();
  return loading;
}

function subscribe(l: () => void) {
  listeners.add(l);
  if (!loading) void refreshCrowdOthers();
  return () => { listeners.delete(l); };
}

/** Prihlási komponent na súhrn ostatných členov. Vracia číslo verzie —
 *  daj ho do závislostí `useMemo`, ktoré volá `crowdAggregate()`. */
export const useCrowdOthers = (): number => useSyncExternalStore(subscribe, () => version, () => 0);
