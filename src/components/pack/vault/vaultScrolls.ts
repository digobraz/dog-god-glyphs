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
export type ScrollPod = { src: string; sec: number; tr?: { s: 'A' | 'B'; t: string }[] };
export type DemoScroll = {
  id: string; n: number; total: number; world: string; circle: string; img: string;
  /** Sila dôkazu: 3 merané + zhoda vedy · 2 veda + výklad · 1 tradícia/legenda · 0 neurčené. */
  sd: number;
  lang: Record<string, ScrollLang>;
  /** Podcast po jazykoch; `tr` = prepis (scenár, z ktorého vzniklo audio): A = AINUBIS, B = Matej. */
  pod: Record<string, ScrollPod>;
  /** Všetky varianty obrazu (A/B/C) — nepoužité idú do článku cez značku `▣ B | popis`. */
  imgs?: Record<string, string>;
  zdroje: ScrollSource[];
  doplnene: { date: string; text: string }[];
  rel: string[];
};

/** Jazyk obsahu VAULTU: základ EN/SK/CZ (Matej 3. 10.), ostatné padajú na EN. */
export const scrollLang = (lang: string) => (lang === 'sk' || lang === 'cs' ? lang : 'en');
export const pickText = (z: DemoScroll, lang: string): ScrollLang =>
  z.lang[scrollLang(lang)] || z.lang.en || z.lang.sk;
/** Jazyk podcastu: zvolený (ak existuje) → jazyk appky → EN → SK. */
export const podLang = (z: DemoScroll, lang: string, want?: string) =>
  [want, scrollLang(lang), 'en', 'sk'].find((l) => l && z.pod[l]) || null;
export const pickPod = (z: DemoScroll, lang: string, want?: string) => {
  const l = podLang(z, lang, want);
  return l ? z.pod[l] : null;
};
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

// ── diskusia (komentáre k celému zvitku, „ako fórum") — DEV len v prehliadači ─
const TKEY = 'vault-demo-talk';
export type Talk = { text: string; at: number; img?: string; liked?: boolean };
let talk: Record<string, Talk[]> = (() => {
  try { return JSON.parse(localStorage.getItem(TKEY) || '{}') as Record<string, Talk[]>; } catch { return {}; }
})();
const tsubs = new Set<() => void>();
const NONE: Talk[] = [];
function saveTalk() {
  try { localStorage.setItem(TKEY, JSON.stringify(talk)); } catch { /* plná pamäť / súkromné okno */ }
  tsubs.forEach((f) => f());
}
/** Lajk komentára (labka s počtom). DEV: len môj klik. */
export function toggleTalkLike(id: string, i: number) {
  const list = [...(talk[id] || [])];
  if (!list[i]) return;
  list[i] = { ...list[i], liked: !list[i].liked };
  talk = { ...talk, [id]: list };
  saveTalk();
}
export function addTalk(id: string, text: string, img?: string) {
  talk = { ...talk, [id]: [...(talk[id] || []), { text, at: Date.now(), ...(img ? { img } : {}) }] };
  try { localStorage.setItem(TKEY, JSON.stringify(talk)); } catch { /* súkromné okno */ }
  tsubs.forEach((f) => f());
}
export function useTalk(id: string): Talk[] {
  return useSyncExternalStore((f) => { tsubs.add(f); return () => { tsubs.delete(f); }; }, () => talk[id] || NONE, () => talk[id] || NONE);
}

// ── páči sa (labka) — DEV len v prehliadači, rovnako ako Uložené ─────────────
const LKEY = 'vault-demo-liked';
let liked: string[] = (() => {
  try { return JSON.parse(localStorage.getItem(LKEY) || '[]') as string[]; } catch { return []; }
})();
const lsubs = new Set<() => void>();
export function toggleLiked(id: string) {
  liked = liked.includes(id) ? liked.filter((x) => x !== id) : [...liked, id];
  try { localStorage.setItem(LKEY, JSON.stringify(liked)); } catch { /* súkromné okno */ }
  lsubs.forEach((f) => f());
}
export function useLiked(): string[] {
  return useSyncExternalStore((f) => { lsubs.add(f); return () => { lsubs.delete(f); }; }, () => liked, () => liked);
}

// ── NÁVRH ZMENY (Prispej) — DEV: len v prehliadači; naostro ide AINUBISOVI na posúdenie ─
const PKEY = 'vault-demo-proposals';
export type ProposalKind = 'add' | 'wrong' | 'own';
export function addProposal(id: string, kind: ProposalKind, text: string) {
  try {
    const all = JSON.parse(localStorage.getItem(PKEY) || '[]') as unknown[];
    all.push({ id, kind, text, at: Date.now() });
    localStorage.setItem(PKEY, JSON.stringify(all));
  } catch { /* súkromné okno */ }
}

/** Fotka do komentára: zmenší na dlhšiu stranu 800 px a vráti JPEG data URL. */
export function shrinkPhoto(file: File, max = 800): Promise<string> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d')?.drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.8));
    };
    im.onerror = rej;
    im.src = url;
  });
}

// ── ŽIADOSŤ O NOVÝ JAZYK (Matej 3. 10.: základ SK/EN/CZ, ďalší jazyk vznikne až na žiadosť
// člena, vygeneruje sa a ostane pre všetkých). DEV: len v prehliadači; naostro → AINUBIS fronta.
const RKEY = 'vault-demo-langreq';
export function requestLang(id: string, lang: string) {
  try {
    const all = JSON.parse(localStorage.getItem(RKEY) || '[]') as unknown[];
    all.push({ id, lang, at: Date.now() });
    localStorage.setItem(RKEY, JSON.stringify(all));
  } catch { /* súkromné okno */ }
}
