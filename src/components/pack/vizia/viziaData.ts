// ČO STAVIAME (vízia) — dáta (balík 4, 23. 11. 2026). Zadanie `plany/zadanie-funkcie-1-0-stavba-2026-11-23.md`,
// nákres `plany/nakresy/plany-buducnosti-2026-11-23/`.
//
// Matej: *„to čo chystáme, vízia, budú samostatné príspevky a budú vo feede a ku každému bude lajk a koment a potom
// v obrazovke, kde budú všetky, bude prehľad aj lajky“*.
//
// 🔴 PLÁN = PRÍSPEVOK (`posts`, štítok `t:vizia`, autor = systémový účet AINUBIS). Žiadna nová tabuľka príspevkov.
//    · ❤️ a komentáre = `post_marks` / `post_comments` (tá istá infra ako pri každom príspevku, `PostViewer`),
//    · stav, míľnik a id plánu = `posts.attach.vizia`; zmena stavu = UPDATE v DB (bez nasadenia appky),
//    · text v jazyku appky = i18n `pack.vizia.<id>.*` (18 jazykov), `posts.body` je anglický originál,
//    · server vydáva plány jedným volaním `list_vizia_posts()` (migrácia `20261124_vizia_prispevky.sql`).
// 🚩 Voľba a: BONES = plán „Za čo minieš BONES“ (DOGMA 9.3: BONES sa nekupujú ani nevyplácajú, novú menu nezakladať).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { onFeedRefresh } from '@/components/pack/feed/feedData';
import type { MePost } from '@/components/pack/profile/mePosts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export { VIZIA_TAG, VIZIA_PATH, VIZIA_ICON, VIZIA_IDS, isViziaId, type ViziaId, type ViziaStage } from './viziaCatalog';
import { isViziaId, type ViziaId, type ViziaStage } from './viziaCatalog';
import { VIZIA_TAG } from './viziaCatalog';

export interface ViziaRow {
  id: ViziaId;
  /** `posts.id` — pod ním visia ❤️ a komentáre. */
  postId: string;
  stage: ViziaStage;
  /** Pri koľkých psoch. */
  milestone: number;
  /** Anglický originál z `posts.body` (text v jazyku appky nesie i18n). */
  body: string;
  likes: number;
  comments: number;
  liked: boolean;
  createdAt: string;
  updatedAt: string;
}

const num = (x: unknown, d = 0) => { const n = Number(x); return Number.isFinite(n) ? n : d; };

function rowOf(r: Record<string, unknown>): ViziaRow | null {
  const v = ((r.attach ?? {}) as { vizia?: { id?: unknown; stage?: unknown; milestone?: unknown } }).vizia;
  if (!v || !isViziaId(v.id)) return null;
  const stage = num(v.stage, 1);
  return {
    id: v.id, postId: String(r.id), stage: (stage >= 3 ? 3 : stage <= 1 ? 1 : 2) as ViziaStage, milestone: num(v.milestone, 1000),
    body: String(r.body ?? ''), likes: num(r.likes), comments: num(r.comments), liked: r.liked === true,
    createdAt: String(r.created_at), updatedAt: String(r.updated_at ?? r.created_at),
  };
}

/**
 * Plány zo servera, zoradené podľa míľnika. Bez migrácie / bez členstva RPC nevráti nič ⇒ prázdny zoznam
 * (feed ani obrazovka tak nikdy nepadnú). Obnova ťahom nadol aj návrat z príspevku (`reload`).
 */
export function useViziaPlans(enabled = true): { rows: ViziaRow[]; ready: boolean; reload: () => Promise<void> } {
  const [rows, setRows] = useState<ViziaRow[]>([]);
  const [ready, setReady] = useState(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const load = useCallback(async () => {
    if (!enabled) return;
    const { data, error } = await db.rpc('list_vizia_posts');
    if (!alive.current) return;
    setReady(true);
    if (error) return;
    setRows(((data ?? []) as Array<Record<string, unknown>>).map(rowOf).filter((x): x is ViziaRow => !!x));
  }, [enabled]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => (enabled ? onFeedRefresh(load) : undefined), [enabled, load]);
  return { rows, ready, reload: load };
}

// ── „VIDEL SOM“ — pripomienka vo feede sa ukáže, len keď niečo pribudlo alebo sa zmenilo ───────────
const SEEN_KEY = 'pkf-vizia-seen-v1';
const SEEN_EVENT = 'dogypt:vizia-seen';
const readSeen = (): number => { try { return Number(localStorage.getItem(SEEN_KEY)) || 0; } catch { return 0; } };

/** Čas poslednej zmeny, ktorú človek už videl (obrazovka „Čo staviame“ ho posunie na najnovšiu). */
export function markViziaSeen(rows: ViziaRow[]) {
  const last = Math.max(0, ...rows.map((r) => Date.parse(r.updatedAt) || 0));
  if (!last || last <= readSeen()) return;
  try { localStorage.setItem(SEEN_KEY, String(last)); } catch { /* plné úložisko */ }
  window.dispatchEvent(new Event(SEEN_EVENT));
}

/** Plán, ktorý je nový alebo sa zmenil od posledného videnia (najčerstvejší); `changed` = zmena stavu, nie nový plán. */
export function useViziaNews(rows: ViziaRow[]): { row: ViziaRow; changed: boolean } | null {
  const [seen, setSeen] = useState(readSeen);
  useEffect(() => {
    const f = () => setSeen(readSeen());
    window.addEventListener(SEEN_EVENT, f);
    return () => window.removeEventListener(SEEN_EVENT, f);
  }, []);
  return useMemo(() => {
    const fresh = rows.filter((r) => (Date.parse(r.updatedAt) || 0) > seen)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0];
    if (!fresh) return null;
    return { row: fresh, changed: Date.parse(fresh.updatedAt) - Date.parse(fresh.createdAt) > 60_000 };
  }, [rows, seen]);
}

/** Príspevok pre `PostViewer`: text plánu v jazyku appky, bez fotiek (ikonku a DOGMU nesie `lead`). */
export function viziaAsPost(r: ViziaRow, text: string): MePost {
  return {
    id: r.postId, body: text, photos: [], tags: [VIZIA_TAG],
    attach: {}, visibility: 'public', createdAt: r.createdAt, actedBy: null, actedName: null,
  };
}
