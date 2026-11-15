// ZÁPISY DO MAPY — spoločný stav pre mapu aj článok výletu.
//
// Načítanie je JEDNO na celú appku, nie per-výlet: väzba zápisu na výlet je
// geometrická a počíta sa v prehliadači (`notesForTrail()`), takže server nemá
// ako vedieť, čo k čomu patrí. Detail v `mapNotesGeo.ts`.
//
// Datasetové body (`customPoi` z `heroTrails.generated.ts`) sa primiešavajú tu —
// v UI je to jedna vrstva a komponenty nemajú riešiť, odkiaľ ktorý bod prišiel.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import {
  fetchMapNotes,
  readStoredMapNotes,
  writeStoredMapNotes,
  type MapBox,
  addMapNote,
  voteMapNote,
  likeMapNote,
  deleteMapNote,
  type MapNote,
  type NewMapNote,
} from './mapNotesData';
import { datasetNotes } from './mapNotesGeo';
import { invalidateMyNotePoints } from './useMyNotePoints';
import { shared } from '@/lib/sharedFetch';

// ── VÝREZ MAPY (B2, 15. 11. 2026) ──────────────────────────────────────────────────────────
// Mapa nepotrebuje celú vrstvu naraz: pýta len výrez + rezervu (`PAD` z každej strany) a pri
// posune dotiahne len ten výrez, ktorý ešte nemá. Pokryté obdĺžniky sa pamätajú; značky sa
// zlievajú podľa `id`. Zápis/hlas/lajk obnoví všetky pokryté obdĺžniky (zmazaná značka zmizne).
// Článok výletu a zoznam výletov volajú `useMapNotes(true)` bez `bounded` — tie čítajú celú
// vrstvu ako doteraz, ale cez zdieľané okno (jedno volanie, nie jedno na povrch).
const PAD = 0.5;
const MAX_BOXES = 8;
const boxHas = (outer: MapBox, inner: MapBox) =>
  inner.n <= outer.n && inner.s >= outer.s && inner.e <= outer.e && inner.w >= outer.w;
const padBox = (b: MapBox): MapBox => {
  const dLat = (b.n - b.s) * PAD;
  const dLon = (b.e - b.w) * PAD;
  return { n: b.n + dLat, s: b.s - dLat, e: b.e + dLon, w: b.w - dLon };
};
const inBox = (n: MapNote, b: MapBox) => n.lat <= b.n && n.lat >= b.s && n.lon <= b.e && n.lon >= b.w;

/** Celá vrstva, zdieľané okno 30 s medzi povrchmi; `fresh` = po zápise vždy zo servera. */
const loadAllNotes = (fresh: boolean) =>
  shared('map-notes-all', () => fetchMapNotes(), fresh ? 0 : 30_000);

export function useMapNotes(enabled = true, opts?: { bounded?: boolean }) {
  const bounded = !!opts?.bounded;
  const [notes, setNotes] = useState<MapNote[]>([]);
  const [loading, setLoading] = useState(enabled);

  // Bounded: pokryté výrezy + zlúčené značky. Ref, nie state — mení sa pri každom posune mapy.
  const boxesRef = useRef<MapBox[]>([]);
  const byIdRef = useRef<Map<string, MapNote>>(new Map());
  const pendingRef = useRef<Set<string>>(new Set());
  const publish = useCallback(() => {
    const next = [...byIdRef.current.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    // Rovnaká odpoveď nekreslí vrstvu druhýkrát.
    setNotes((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, []);
  /** Výsledok pre výrez nahradí všetko, čo bolo v tom výreze (zmazané značky zmiznú). */
  const mergeBox = useCallback((box: MapBox, rows: MapNote[]) => {
    for (const [id, n] of byIdRef.current) if (inBox(n, box)) byIdRef.current.delete(id);
    for (const r of rows) byIdRef.current.set(r.id, r);
  }, []);

  const firstLoadRef = useRef(true);
  const reload = useCallback(async () => {
    if (!enabled) return;
    try {
      const fresh = !firstLoadRef.current;
      firstLoadRef.current = false;
      if (bounded) {
        if (!fresh) {
          const stored = await readStoredMapNotes();
          if (stored?.length && !byIdRef.current.size) {
            for (const n of stored) byIdRef.current.set(n.id, n);
            publish();
            setLoading(false);
          }
        }
        // Po zápise / hlase / lajku: obnov všetky pokryté výrezy. Prvé načítanie čaká na `setView`.
        if (fresh && boxesRef.current.length) {
          const boxes = [...boxesRef.current];
          const results = await Promise.all(boxes.map((b) => fetchMapNotes(b)));
          boxes.forEach((b, i) => mergeBox(b, results[i]));
          publish();
          void writeStoredMapNotes([...byIdRef.current.values()]);
        }
        return;
      }
      if (!fresh) {
        const stored = await readStoredMapNotes();
        if (stored?.length) { setNotes((prev) => (prev.length ? prev : stored)); setLoading(false); }
      }
      const next = await loadAllNotes(fresh).catch((e) => { if (fresh) throw e; return [] as MapNote[]; });
      // Rovnaká odpoveď nekreslí vrstvu druhýkrát.
      setNotes((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    } catch {
      // Zlyhané načítanie = posledná známa vrstva (bez nej prázdna), nie rozbitá mapa. Zápisy
      // sú doplnok k mape, nie jej podmienka — pád RPC (odhlásený, neplatiaci) nesmie
      // zhodiť celý výlet a jeho trasu.
    } finally {
      setLoading(false);
    }
  }, [enabled, bounded, mergeBox, publish]);

  useEffect(() => { void reload(); }, [reload]);

  /** Mapa hlási aktuálny výrez (na `moveend`). Dotiahne sa len výrez, ktorý ešte nie je pokrytý. */
  const setView = useCallback((view: MapBox) => {
    if (!enabled || !bounded) return;
    if (boxesRef.current.some((b) => boxHas(b, view))) return;
    const box = padBox(view);
    const key = `${box.n.toFixed(3)},${box.s.toFixed(3)},${box.e.toFixed(3)},${box.w.toFixed(3)}`;
    if (pendingRef.current.has(key)) return;
    pendingRef.current.add(key);
    fetchMapNotes(box)
      .then((rows) => {
        mergeBox(box, rows);
        // Nový výrez, ktorý obsahuje starší, ho nahradí — zoznam pokrytých sa nenafukuje.
        boxesRef.current = [...boxesRef.current.filter((b) => !boxHas(box, b)), box].slice(-MAX_BOXES);
        publish();
        void writeStoredMapNotes([...byIdRef.current.values()]);
      })
      .catch(() => { /* bez značiek mapa žije ďalej; ďalší posun to skúsi znova */ })
      .finally(() => { pendingRef.current.delete(key); setLoading(false); });
  }, [enabled, bounded, mergeBox, publish]);

  // VRACIA `id` NOVEJ ZNAČKY. Sprievodca výletu si podľa neho pamätá, čo počas TOHTO
  // pridávania vzniklo, a vie to z chipu v zhrnutí zmazať (viď `TripNoteRef`).
  const add = useCallback(async (n: NewMapNote) => {
    const id = await addMapNote(n);
    // Level počíta odkazy z vlastnej, zdieľanej kópie vrstvy — bez zneplatnenia by nový
    // zápis body pridal až po prenačítaní stránky (a vyzeralo by to, že sa nepočíta vôbec,
    // teda presne ten stav, kvôli ktorému `useMyNotePoints` vzniklo).
    invalidateMyNotePoints();
    await reload();
    return id;
  }, [reload]);

  const vote = useCallback(async (id: string, valid: boolean | null) => {
    await voteMapNote(id, valid);
    await reload();
  }, [reload]);

  const like = useCallback(async (id: string, on: boolean) => {
    await likeMapNote(id, on);
    await reload();
  }, [reload]);

  const remove = useCallback(async (id: string) => {
    await deleteMapNote(id);
    await reload();
  }, [reload]);

  // Datasetové body sú konštanta — počítajú sa raz, nie pri každom reloade.
  const fromDataset = useMemo(() => datasetNotes(HERO_TRAILS), []);
  const all = useMemo(() => [...fromDataset, ...notes], [fromDataset, notes]);

  return { notes: all, memberNotes: notes, loading, reload, add, vote, like, remove, setView };
}
