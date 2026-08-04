// Hook, ktorý pre <FogLayer /> vyrobí zoznam trás s POTVRDENÝM prejdením (DONE).
//
// 🔴 NAJDÔLEŽITEJŠIE PRAVIDLO (spec-hmla.md §2, §9 bod 1): hmla sa skladá VÝHRADNE z trás
// s potvrdeným prejdením — NIKDY z `allTrails`. Z 11 magistrál sú reálne prejdené len DVE
// (`FOUNDER_WALKED_JOURNEY_IDS` v tripShared.tsx = ['snp-cesta-hrdinov', 'poloniny']).
// Neprejdená magistrála v hmle by tvrdila „tadiaľto sme šli" — klamstvo, nie dekorácia.
//
// Hlavná cesta = agregačná RPC `get_pack_walked_slugs()` (celok DOGYPTu naprieč všetkými
// členmi, BEZ `user_id`/`walked_at` — píše ju paralelný agent v tej istej vlne, migrácia
// zatiaľ nemusí byť v DB). RPC ešte nie je v generovaných Supabase typoch → volanie sa cistí
// `(supabase as any)`, rovnaký zavedený vzor ako `useTripParty.ts` / `useOpenTrips.ts`.
// Kým RPC neexistuje alebo padne, hook NESMIE appku zhodiť — vráti prázdne pole a hmla
// jednoducho nič neukáže; zvyšok mapy funguje ďalej.
//
// Dev fallback (RPC nedostupná): číta `readWalkedIds()` z tripShared — to je VŽDY len
// JEDNOTLIVEC (localStorage tohto prehliadača), NIE celok DOGYPTu. Slúži výhradne na lokálne
// vývojárske prezeranie („nech niečo vidno, kým RPC v DB nie je"), produkčný zdroj pravdy je RPC.
import { useEffect, useMemo, useState } from 'react';
import type { LatLngTuple } from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { readWalkedIds, readLocalTrails } from '@/components/pack/tripShared';
import type { FogTrail } from '@/components/geo/FogLayer';

interface WalkedSlugRow {
  trip_slug: string;
  walkers: number;
}

export interface UseFogSourceResult {
  /** Geometria pripravená priamo pre <FogLayer trails={...} />. */
  trails: FogTrail[];
  loading: boolean;
  /**
   * 'rpc'          = `get_pack_walked_slugs()` odpovedala — celok DOGYPTu (produkčná cesta).
   * 'dev-fallback' = RPC chýba/zlyhala, použil sa lokálny `readWalkedIds()` — LEN tento
   *                  prehliadač, nie celok (viď komentár v hlavičke súboru).
   */
  source: 'rpc' | 'dev-fallback';
}

export function useFogSource(): UseFogSourceResult {
  const [slugs, setSlugs] = useState<string[] | null>(null); // null = ešte nenačítané
  const [source, setSource] = useState<'rpc' | 'dev-fallback'>('rpc');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = (await (supabase as any).rpc('get_pack_walked_slugs')) as {
          data: WalkedSlugRow[] | null;
          error: { message: string } | null;
        };
        if (!mounted) return;
        if (error || !data) {
          console.warn('[fog] get_pack_walked_slugs:', error?.message ?? 'no data — RPC zatiaľ nemusí existovať');
          setSlugs(Array.from(readWalkedIds()));
          setSource('dev-fallback');
          return;
        }
        setSlugs(data.map((r) => r.trip_slug));
        setSource('rpc');
      } catch (err) {
        if (!mounted) return;
        console.warn('[fog] get_pack_walked_slugs threw:', err);
        setSlugs(Array.from(readWalkedIds()));
        setSource('dev-fallback');
      }
    })();
    return () => { mounted = false; };
  }, []);

  // slug → geometria: katalóg (HERO_JOURNEYS + HERO_TRAILS) + localTrails (trasy nahraté týmto
  // členom — jediné miesto, kde appka vôbec MÁ geometriu user-uploaded tripu bez ďalšieho
  // fetchu). RPC vracia len slugy, nie geometriu — tá ostáva v klientskom datasete zámerne
  // (viď spec-hmla.md §6, malý rozsah — 71 trás).
  const trails = useMemo<FogTrail[]>(() => {
    if (!slugs || slugs.length === 0) return [];
    const localTrails = readLocalTrails();
    const localIds = new Set(localTrails.map((t) => t.id));
    const catalog = new Map<string, LatLngTuple[]>();
    for (const t of HERO_JOURNEYS) catalog.set(t.id, t.path);
    for (const t of HERO_TRAILS) catalog.set(t.id, t.path);
    for (const t of localTrails) catalog.set(t.id, t.path);

    const out: FogTrail[] = [];
    for (const slug of slugs) {
      const path = catalog.get(slug);
      if (!path || path.length < 2) continue; // slug bez geometrie (zmazaný/neznámy trip) — preskoč
      // Odrez konca (súkromie) LEN pre user-nahraté trasy — katalógové majú štart z datasetu
      // (parkovisko/rázcestie), nie niečiu adresu (spec-hmla.md §7, spresnené 2026-08-04).
      out.push({ id: slug, path, trim: localIds.has(slug) });
    }
    return out;
  }, [slugs]);

  return { trails, loading: slugs === null, source };
}
