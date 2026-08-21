// ZÁPISY DO MAPY — spoločný stav pre mapu aj článok výletu.
//
// Načítanie je JEDNO na celú appku, nie per-výlet: väzba zápisu na výlet je
// geometrická a počíta sa v prehliadači (`notesForTrail()`), takže server nemá
// ako vedieť, čo k čomu patrí. Detail v `mapNotesGeo.ts`.
//
// Datasetové body (`customPoi` z `heroTrails.generated.ts`) sa primiešavajú tu —
// v UI je to jedna vrstva a komponenty nemajú riešiť, odkiaľ ktorý bod prišiel.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import {
  fetchMapNotes,
  addMapNote,
  voteMapNote,
  deleteMapNote,
  type MapNote,
  type NewMapNote,
} from './mapNotesData';
import { datasetNotes } from './mapNotesGeo';

export function useMapNotes(enabled = true) {
  const [notes, setNotes] = useState<MapNote[]>([]);
  const [loading, setLoading] = useState(enabled);

  const reload = useCallback(async () => {
    if (!enabled) return;
    try {
      setNotes(await fetchMapNotes());
    } catch {
      // Zlyhané načítanie = prázdna vrstva, nie rozbitá mapa. Zápisy sú doplnok
      // k mape, nie jej podmienka — pád RPC (odhlásený, neplatiaci) nesmie
      // zhodiť celý výlet a jeho trasu.
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => { void reload(); }, [reload]);

  const add = useCallback(async (n: NewMapNote) => {
    await addMapNote(n);
    await reload();
  }, [reload]);

  const vote = useCallback(async (id: string, valid: boolean | null) => {
    await voteMapNote(id, valid);
    await reload();
  }, [reload]);

  const remove = useCallback(async (id: string) => {
    await deleteMapNote(id);
    await reload();
  }, [reload]);

  // Datasetové body sú konštanta — počítajú sa raz, nie pri každom reloade.
  const fromDataset = useMemo(() => datasetNotes(HERO_TRAILS), []);
  const all = useMemo(() => [...fromDataset, ...notes], [fromDataset, notes]);

  return { notes: all, memberNotes: notes, loading, reload, add, vote, remove };
}
