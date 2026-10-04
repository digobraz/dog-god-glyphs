// ════════════════════════════════════════════════════════════════════════════
// ZVITKY VAULTU — obsah + postup člena (naostro od 4. 10. 2026; ukážka od 3. 10.)
// ────────────────────────────────────────────────────────────────────────────
// Matej 4. 10.: *„urobiť 1. okruh na komplet + ainubis stats po kliknutí na fotku…
// postaviť tak, aby to bolo ready"*.
//
// OBSAH = tabuľka `vault_scrolls` (migrácia 20261007). Plní ju LEN
// `node scripts/vault-nahraj.mjs <dev|live> <svet> <okruh>` z organizmu — ručne nie.
// V DEV bez riadkov (iná DB, NOAUTH) padá na starú ukážku `public/vault-demo/zvitky.json`.
//
// POSTUP = tabuľka `vault_reads`, riadok na (človek, zvitok): videné · prečítané ·
// dopočúvané · kam došiel v podcaste · srdiečko · uložené. Bez prihlásenia (NOAUTH dev)
// drží to isté prehliadač, aby sa dalo klikať aj bez účtu.
//
// STAV ZVITKU: 0 nevidené · 1 videné (karta ~2 s na obrazovke) · 2 hotovo (prečítal
// ALEBO dopočúval podcast ≥ 90 %). Farby = BRAIN_STATE (24. 9.).
// ⚠️ Zápis je optimistický — klik sa ukáže hneď, DB dobehne; chyba zápisu sa len zaloguje
//    (stav sa nevráti, ďalší zápis ten istý riadok aj tak prepíše celý).
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useState, useSyncExternalStore } from 'react';
import { supabase } from '@/integrations/supabase/client';

/** Zvitky sú zapnuté všade, kde je `/pack/ainubis` (ten je za DEV_FULL — von ide s FLIPom). */
export const SCROLL_DEMO = true;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type ScrollLang = { t: string; v: string; vz: string; d: string; min: number };
export type ScrollSource = { a: string; r: number; t: string; j: string; doi?: string; url?: string };
export type ScrollPod = { src: string; sec: number; tr?: { s: 'A' | 'B'; t: string }[] };
export type DemoScroll = {
  /** `dogsPath-O1-1` — svet je v id, lebo O1-1 má každý svet. `code` = O1-1 (extraktor, súbory). */
  id: string; code: string; okruh: number;
  n: number; total: number; world: string; circle: string; img: string;
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

/** Riadok `vault_scrolls` → tvar, s ktorým pracuje UI. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromRow = (r: any): DemoScroll => ({
  id: r.id, code: r.code, okruh: r.okruh, n: r.n, total: r.total, world: r.world,
  circle: r.circle?.sk || '', img: r.img, imgs: r.imgs || {}, sd: r.sd || 0,
  lang: r.lang || {}, pod: r.pod || {}, zdroje: r.zdroje || [], doplnene: r.doplnene || [], rel: r.rel || [],
});
/** Stará DEV ukážka (id bez sveta) → id so svetom, aby sedeli kľúče postupu. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromDemo = (z: any): DemoScroll => ({
  ...z, code: z.id, id: `${z.world}-${z.id}`, okruh: Number(String(z.id).match(/^O(\d+)/)?.[1] || 1),
  rel: (z.rel || []).map((x: string) => `${z.world}-${x}`),
});

let cache: DemoScroll[] | null = null;
let loading: Promise<DemoScroll[]> | null = null;
function loadScrolls(): Promise<DemoScroll[]> {
  if (cache) return Promise.resolve(cache);
  if (!loading) {
    loading = (async () => {
      const { data, error } = await db.from('vault_scrolls').select('*').order('world').order('okruh').order('n');
      let list: DemoScroll[] = !error && data?.length ? data.map(fromRow) : [];
      if (!list.length && import.meta.env.DEV) {
        list = await fetch('/vault-demo/zvitky.json').then((r) => (r.ok ? r.json() : [])).then((j) => j.map(fromDemo)).catch(() => []);
      }
      cache = list;
      return list;
    })();
  }
  return loading;
}
export function useDemoScrolls(): DemoScroll[] {
  const [list, setList] = useState<DemoScroll[]>(cache || []);
  useEffect(() => {
    if (cache) return;
    let on = true;
    void loadScrolls().then((l) => { if (on) setList(l); });
    return () => { on = false; };
  }, []);
  return list;
}

// ── POSTUP ČLENA (`vault_reads`) ─────────────────────────────────────────────
export type ReadRow = {
  scroll_id: string; seen_at: string | null; read_at: string | null; listened_at: string | null;
  listen_sec: number; listen_langs: string[]; liked: boolean; saved: boolean; updated_at?: string;
};
type StateMap = Record<string, 0 | 1 | 2>;
const LOCAL = 'vault-reads';
let uid: string | null = null;
let reads: Record<string, ReadRow> = {};
let snap = { state: {} as StateMap, liked: [] as string[], saved: [] as string[] };
const subs = new Set<() => void>();
const derive = () => {
  const state: StateMap = {};
  const liked: string[] = []; const saved: string[] = [];
  for (const r of Object.values(reads)) {
    state[r.scroll_id] = r.read_at || r.listened_at ? 2 : r.seen_at ? 1 : 0;
    if (r.liked) liked.push(r.scroll_id);
    if (r.saved) saved.push(r.scroll_id);
  }
  snap = { state, liked, saved };
  subs.forEach((f) => f());
};
const sub = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

let started = false;
/** Načíta postup raz za session; bez účtu číta prehliadač. */
function startReads() {
  if (started) return;
  started = true;
  void (async () => {
    const { data } = await supabase.auth.getSession();
    uid = data.session?.user?.id ?? null;
    if (!uid) {
      try { reads = JSON.parse(localStorage.getItem(LOCAL) || '{}'); } catch { reads = {}; }
      derive();
      return;
    }
    const { data: rows } = await db.from('vault_reads').select('*');
    reads = Object.fromEntries(((rows || []) as ReadRow[]).map((r) => [r.scroll_id, r]));
    derive();
    void loadCounts();
  })();
}
const blank = (id: string): ReadRow => ({
  scroll_id: id, seen_at: null, read_at: null, listened_at: null, listen_sec: 0, listen_langs: [], liked: false, saved: false,
});
function write(id: string, patch: Partial<ReadRow>) {
  const row = { ...(reads[id] || blank(id)), ...patch, updated_at: new Date().toISOString() };
  reads = { ...reads, [id]: row };
  derive();
  if (!uid) {
    try { localStorage.setItem(LOCAL, JSON.stringify(reads)); } catch { /* súkromné okno */ }
    return;
  }
  void db.from('vault_reads').upsert({ ...row, user_id: uid }, { onConflict: 'user_id,scroll_id' })
    .then(({ error }: { error: unknown }) => { if (error) console.warn('[vault] zápis postupu', error); });
}

/** Stav sa len ZVYŠUJE — videné neprepíše hotovo. `how` = čím sa stal hotovým. */
export function markScroll(id: string, s: 1 | 2, how: 'read' | 'listen' = 'read') {
  const r = reads[id];
  const now = new Date().toISOString();
  if (s === 1) { if (!r?.seen_at) write(id, { seen_at: now }); return; }
  if (how === 'listen' ? r?.listened_at : r?.read_at) return;
  write(id, { seen_at: r?.seen_at || now, ...(how === 'listen' ? { listened_at: now } : { read_at: now }) });
}
/** Kam došiel v podcaste — zapisuje sa len posun vpred (najviac raz za 15 s z prehrávača). */
export function saveListen(id: string, sec: number, lang: string) {
  const r = reads[id];
  const langs = r?.listen_langs || [];
  if ((r?.listen_sec || 0) >= sec && langs.includes(lang)) return;
  write(id, { listen_sec: Math.max(r?.listen_sec || 0, Math.floor(sec)), listen_langs: langs.includes(lang) ? langs : [...langs, lang] });
}
export function toggleLiked(id: string) { bump(id, 'likes', !reads[id]?.liked); write(id, { liked: !reads[id]?.liked }); }
export function toggleSaved(id: string) { bump(id, 'saves', !reads[id]?.saved); write(id, { saved: !reads[id]?.saved }); }

export function useScrollState(): StateMap { startReads(); return useSyncExternalStore(sub, () => snap.state, () => snap.state); }
export function useLiked(): string[] { startReads(); return useSyncExternalStore(sub, () => snap.liked, () => snap.liked); }
export function useSaved(): string[] { startReads(); return useSyncExternalStore(sub, () => snap.saved, () => snap.saved); }
/** Celé riadky postupu — pre štatistiky (Moje znalosti). */
export function useReads(): Record<string, ReadRow> {
  startReads();
  return useSyncExternalStore(sub, () => reads, () => reads);
}

// ── POČTY srdiečok a uložení od VŠETKÝCH (bez mien) ─────────────────────────
let counts: Record<string, { likes: number; saves: number }> = {};
async function loadCounts() {
  const { data } = await db.rpc('vault_scroll_counts');
  counts = Object.fromEntries(((data || []) as { scroll_id: string; likes: number; saves: number }[])
    .map((c) => [c.scroll_id, { likes: Number(c.likes), saves: Number(c.saves) }]));
  subs.forEach((f) => f());
}
function bump(id: string, k: 'likes' | 'saves', up: boolean) {
  if (!uid) return; // bez účtu je počet len môj klik (ráta ho UI)
  const c = counts[id] || { likes: 0, saves: 0 };
  counts = { ...counts, [id]: { ...c, [k]: Math.max(0, c[k] + (up ? 1 : -1)) } };
}
/** Počet od všetkých; bez účtu `null` ⇒ UI ukáže len môj klik. */
export function useCounts(id: string): { likes: number; saves: number } | null {
  startReads();
  const c = useSyncExternalStore(sub, () => counts[id], () => counts[id]);
  return uid ? (c || { likes: 0, saves: 0 }) : null;
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

// ── NÁVRH ZMENY (Prispej) a ŽIADOSŤ O JAZYK → `vault_requests` (AINUBIS posúdi) ─
// Matej 3. 10.: základ SK/EN/CZ, ďalší jazyk vznikne až na žiadosť člena a ostane pre všetkých.
export type ProposalKind = 'add' | 'wrong' | 'own';
export type VaultRequest = { id: string; scroll_id: string; kind: ProposalKind | 'lang'; lang: string | null; body: string | null; status: string; created_at: string };
const RKEY = 'vault-requests';
function sendRequest(row: { scroll_id: string; kind: ProposalKind | 'lang'; lang?: string; body?: string }) {
  const full: VaultRequest = { id: `local-${Date.now()}`, lang: null, body: null, status: 'new', created_at: new Date().toISOString(), ...row };
  myReq = [full, ...myReq];
  reqSubs.forEach((f) => f());
  if (!uid) {
    try { localStorage.setItem(RKEY, JSON.stringify(myReq)); } catch { /* súkromné okno */ }
    return;
  }
  void db.from('vault_requests').insert(row).then(({ error }: { error: unknown }) => { if (error) console.warn('[vault] žiadosť', error); });
}
export function addProposal(id: string, kind: ProposalKind, text: string) { sendRequest({ scroll_id: id, kind, body: text }); }
export function requestLang(id: string, lang: string) { sendRequest({ scroll_id: id, kind: 'lang', lang }); }

let myReq: VaultRequest[] = [];
let reqLoaded = false;
const reqSubs = new Set<() => void>();
/** Moje príspevky a žiadosti (najnovšie hore) — pre štatistiky. */
export function useMyRequests(): VaultRequest[] {
  useEffect(() => {
    if (reqLoaded) return;
    reqLoaded = true;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        try { myReq = JSON.parse(localStorage.getItem(RKEY) || '[]'); } catch { myReq = []; }
      } else {
        const { data: rows } = await db.from('vault_requests').select('*').order('created_at', { ascending: false });
        myReq = (rows || []) as VaultRequest[];
      }
      reqSubs.forEach((f) => f());
    })();
  }, []);
  return useSyncExternalStore((f) => { reqSubs.add(f); return () => { reqSubs.delete(f); }; }, () => myReq, () => myReq);
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
