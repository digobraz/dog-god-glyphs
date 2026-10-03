// ════════════════════════════════════════════════════════════════════════════
// ZVITKY S OBRAZOM — UKÁŽKA (3. 10. 2026, LEN DEV)
// ────────────────────────────────────────────────────────────────────────────
// Matej 3. 10. nad nákresom plany/nakres-zvitok-detail-2026-10-03-v2.html:
// „pozične aj obsahovo ok, dizajn doladíme na mieste — daj to do devu, tak aby sme
// mali kompletný 1. zvitok".
//
// Dáta NIE SÚ v kóde. Generuje ich `node scripts/gen-vault-demo.mjs` (koreň repa) z
// plany/ainubis/extraktor/<svet>/organizmus.json + obrazov + podcastov do
// public/vault-demo/zvitky.json — priečinok je v .gitignore, takže sa naostro
// nevyvezie nič. Appka ho číta fetchom, len keď beží DEV.
//
// STAV ZVITKU (krúžok v rohu karty): 0 nevidené · 1 videné (karta ~2 s na obrazovke)
// · 2 hotovo (prečítal ALEBO dopočúval podcast). Farby = BRAIN_STATE (24. 9.).
// ⚠️ Kým nežije tabuľka `vault_reads` (BLOK 2), stav drží len prehliadač.
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useState, useSyncExternalStore } from 'react';

export const SCROLL_DEMO = import.meta.env.DEV;

export type ScrollLang = { t: string; v: string; vz: string; d: string; min: number };
export type ScrollSource = { a: string; r: number; t: string; j: string; doi?: string; url?: string };
export type DemoScroll = {
  id: string; n: number; total: number; world: string; circle: string; img: string;
  /** Sila dôkazu: 3 merané + zhoda vedy · 2 veda + výklad · 1 tradícia/legenda · 0 neurčené. */
  sd: number;
  lang: Record<string, ScrollLang>;
  pod: Record<string, { src: string; sec: number }>;
  zdroje: ScrollSource[];
  doplnene: { date: string; text: string }[];
  rel: string[];
};

/** Jazyk obsahu VAULTU: základ EN/SK/CZ (Matej 3. 10.), ostatné padajú na EN. */
export const scrollLang = (lang: string) => (lang === 'sk' || lang === 'cs' ? lang : 'en');
export const pickText = (z: DemoScroll, lang: string): ScrollLang =>
  z.lang[scrollLang(lang)] || z.lang.en || z.lang.sk;
export const pickPod = (z: DemoScroll, lang: string) =>
  z.pod[scrollLang(lang)] || z.pod.en || z.pod.sk || null;
export const sourceHref = (s: ScrollSource) => (s.doi ? `https://doi.org/${s.doi}` : s.url || '');
export const fmtSec = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

let cache: DemoScroll[] | null = null;
export function useDemoScrolls(): DemoScroll[] {
  const [list, setList] = useState<DemoScroll[]>(cache || []);
  useEffect(() => {
    if (!SCROLL_DEMO || cache) return;
    fetch('/vault-demo/zvitky.json')
      .then((r) => (r.ok ? r.json() : []))
      .then((j: DemoScroll[]) => { cache = j; setList(j); })
      .catch(() => setList([]));
  }, []);
  return list;
}

// ── stav: 0 / 1 / 2 ─────────────────────────────────────────────────────────
const KEY = 'vault-demo-state';
type StateMap = Record<string, 0 | 1 | 2>;
let state: StateMap = (() => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') as StateMap; } catch { return {}; }
})();
const subs = new Set<() => void>();

/** Stav sa len ZVYŠUJE — videné neprepíše hotovo. */
export function markScroll(id: string, s: 1 | 2) {
  if ((state[id] || 0) >= s) return;
  state = { ...state, [id]: s };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* súkromné okno */ }
  subs.forEach((f) => f());
}
export function useScrollState(): StateMap {
  return useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => state, () => state);
}

// ── uložené (☆) — polica „Uložené" v Mojich znalostiach ─────────────────────
const SKEY = 'vault-demo-saved';
let saved: string[] = (() => {
  try { return JSON.parse(localStorage.getItem(SKEY) || '[]') as string[]; } catch { return []; }
})();
const ssubs = new Set<() => void>();
export function toggleSaved(id: string) {
  saved = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
  try { localStorage.setItem(SKEY, JSON.stringify(saved)); } catch { /* súkromné okno */ }
  ssubs.forEach((f) => f());
}
export function useSaved(): string[] {
  return useSyncExternalStore((f) => { ssubs.add(f); return () => { ssubs.delete(f); }; }, () => saved, () => saved);
}
