// FEED 1.0 — dáta (DOMOV `/pack`, len za TEST_BUILD; Matej 24. 10. 2026: *„postav to zatiaľ do appky,
// lepšie než nič… budeme to ladiť postupne"*).
//
// 🔴 NIČ SA NEFALŠUJE. Každá karta feedu je skutočný riadok z existujúceho úložiska:
//    · VÝLETY  = členmi nahodené výlety, ktoré `hydratePackStore()` už dotiahol z `pack_trips`
//                (RLS `pack_trips_read`: každý SCHVÁLENÝ výlet vidí člen, vlastný aj čakajúci).
//                Feed ich NEŤAHÁ znova — číta ten istý `trp-local-trails` ako mapa a triplist.
//    · ZVITOK  = `vault_scrolls` cez `useDemoScrolls()` (ten istý zdroj ako VAULT).
//    · CITÁT   = `data/feedQuotes.ts` (30 dní, text editovateľný po jazykoch).
//    · STORIES = vlastné `posts` so štítkom `moment` (`mePosts.ts`).
//
// ⚠️ ČO TU ZÁMERNE NIE JE (potrebuje server, bez migrácie sa to nedá):
//    · CUDZIE STORIES — `posts_read` ich pustí platiacemu členovi, ale `posts` nesie len `author_id` a žiadna
//      funkcia nevydáva meno/fotku človeka podľa `user_id` (zámok z `get_member_profiles`, adresa člena je
//      poradové číslo). Treba RPC `list_feed_moments()` s menom, fotkou a číslom psa.
//    (Cudzie PRÍSPEVKY a fotka autora výletu prišli 26. 10. 2026 — `useFeedPosts`, `useTripAuthors` nižšie.)
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { onPostsChanged, type MePost } from '@/components/pack/profile/mePosts';
import { readLocalTrails, visibleLocalTrails } from '@/components/pack/tripShared';
import { onPackStoreHydrated, readLocalTrailMeta } from '@/lib/packStore';
import { intlLocale } from '@/i18n/bcp47';

export interface FeedTrip {
  trail: HeroTrail;
  /** Kedy bol výlet zapísaný (ms) — z `local-<ms>-…`; bez neho dátum jazdy, inak 0. */
  at: number;
  mine: boolean;
  author: string;
}

/** `local-1791717315327-13795` → 1791717315327. Kurátorovaný dataset (`zaruby-…`) čas nenesie. */
function stampOf(id: string): number {
  if (!id.startsWith('local-')) return NaN;
  return Number(id.split('-')[1]);
}

function readFeedTrips(): FeedTrip[] {
  const meta = readLocalTrailMeta();
  return visibleLocalTrails(readLocalTrails())
    // Plán a prepis datasetu nie sú príspevky; do feedu ide len SCHVÁLENÝ výlet s fotkou.
    .filter((t) => !t.id.startsWith('plan-') && !t.id.startsWith('ovr-'))
    .filter((t) => meta[t.id]?.status === 'approved' && (t.photos?.length ?? 0) > 0)
    .map((trail) => {
      const stamp = stampOf(trail.id);
      const ride = trail.date ? Date.parse(trail.date) : NaN;
      return {
        trail,
        at: Number.isFinite(stamp) ? stamp : Number.isFinite(ride) ? ride : 0,
        mine: !!meta[trail.id]?.mine,
        author: (trail.author || '').trim(),
      };
    })
    .sort((a, b) => b.at - a.at);
}

// ── POLOHA ČITATEĽA + VÝLETY Z MAPY V OKOLÍ (Sniffer vo feede, 23. 11. 2026) ─────────────────────────
// Poloha sa NIKDY nepýta sama pri otvorení feedu: berie sa, len keď je povolenie už udelené (Permissions API),
// alebo keď človek ťukne „Zobraziť vzdialenosť“. Drží sa zaokrúhlená (0,01° ≈ 1 km) a do servera ide len takto.
export interface FeedPos { lat: number; lon: number }
const POS_KEY = 'dogypt-feed-pos-v1';
const POS_TTL = 6 * 3_600_000;
const coarse = (n: number) => Math.round(n * 100) / 100;
function readPos(): FeedPos | null {
  try {
    const v = JSON.parse(localStorage.getItem(POS_KEY) || 'null') as { lat: number; lon: number; at: number } | null;
    return v && Date.now() - v.at < POS_TTL ? { lat: v.lat, lon: v.lon } : null;
  } catch { return null; }
}
const askGeo = (): Promise<FeedPos | null> => new Promise((res) => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) { res(null); return; }
  navigator.geolocation.getCurrentPosition(
    (p) => {
      const pos = { lat: coarse(p.coords.latitude), lon: coarse(p.coords.longitude) };
      try { localStorage.setItem(POS_KEY, JSON.stringify({ ...pos, at: Date.now() })); } catch { /* plné úložisko */ }
      res(pos);
    },
    () => res(null), { timeout: 8000, maximumAge: 3_600_000, enableHighAccuracy: false });
});

/** `ask()` vyvolá systémovú otázku o polohe (len po ťuknutí); `canAsk` = poloha chýba a nebola odmietnutá. */
export function useFeedPos(): { pos: FeedPos | null; canAsk: boolean; ask: () => void } {
  const [pos, setPos] = useState<FeedPos | null>(readPos);
  const [denied, setDenied] = useState(false);
  useEffect(() => {
    if (!navigator.geolocation || !navigator.permissions?.query) return;
    let alive = true;
    void navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((st) => {
      if (!alive) return;
      if (st.state === 'denied') setDenied(true);
      if (st.state === 'granted') void askGeo().then((p) => { if (alive && p) setPos(p); });
    }).catch(() => {});
    return () => { alive = false; };
  }, []);
  const ask = useCallback(() => { void askGeo().then((p) => { if (p) setPos(p); else setDenied(true); }); }, []);
  return { pos, canAsk: !pos && !denied && typeof navigator !== 'undefined' && !!navigator.geolocation, ask };
}

const kmBetween = (a: FeedPos, lat: number, lon: number): number => {
  const r = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(r(lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(lat)) * Math.sin(r(lon - a.lon) / 2) ** 2;
  return 12742 * Math.asin(Math.min(1, Math.sqrt(h)));
};
const NEAR_KM = 80;
const NEAR_MAX = 10;
const NO_POS_MAX = 6;

/**
 * VÝLETY Z MAPY V OKOLÍ (Matej 23. 11. 2026, bod g): náš zber (`HERO_TRAILS`, to, čo je na mape) s fotkou do 80 km od čitateľa,
 * najbližšie prvé. Bez polohy ostane pár najlepšie hodnotených, aby feed nebol prázdny. Karta nemá autora ani čas (ako v hľadaní).
 * Dataset je veľký, preto ide ako samostatný chunk až keď feed beží.
 */
export function useNearbyMapTrips(pos: FeedPos | null, skip: Set<string>): FeedTrip[] {
  const [all, setAll] = useState<HeroTrail[]>([]);
  useEffect(() => {
    let alive = true;
    void import('@/data/heroTrails.generated').then(({ HERO_TRAILS }) => {
      if (alive) setAll(HERO_TRAILS.filter((tr) => !tr.id.startsWith('plan-') && !tr.id.startsWith('ovr-') && (tr.photos?.length ?? 0) > 0));
    }).catch(() => {});
    return () => { alive = false; };
  }, []);
  const lat = pos?.lat, lon = pos?.lon;
  return useMemo(() => {
    const mk = (trail: HeroTrail): FeedTrip => ({ trail, at: 0, mine: false, author: (trail.author || '').trim() || 'Hekthor & Matej' });
    const free = all.filter((tr) => !skip.has(tr.id));
    if (lat == null || lon == null) return [...free].sort((a, b) => b.stars - a.stars).slice(0, NO_POS_MAX).map(mk);
    const here = { lat, lon };
    return free
      .map((tr) => ({ tr, d: tr.path?.[0] ? kmBetween(here, tr.path[0][0], tr.path[0][1]) : Infinity }))
      .filter((x) => x.d <= NEAR_KM)
      .sort((a, b) => a.d - b.d)
      .slice(0, NEAR_MAX)
      .map((x) => mk(x.tr));
  }, [all, lat, lon, skip]);
}

// ── SNIFFER (príspevky so štítkom `t:sniffer`, server `list_sniffer_posts`) ───────────────────────
export interface SnifferRow { fp: FeedPost; km: number | null; mine: boolean; expired: boolean; at: string }

/** Téma Sniffer + polička „Hľadajú parťáka“. Server vráti len km od čitateľa, nikdy polohu autora; bez polohy radí podľa času.
 *  Moje príspevky sú v zozname aj po 30 dňoch (s `expired`), aby sa dali obnoviť. */
export function useSnifferPosts(enabled: boolean, pos: FeedPos | null): { rows: SnifferRow[]; reload: () => void; ready: boolean } {
  const [rows, setRows] = useState<SnifferRow[]>([]);
  const [ready, setReady] = useState(false);
  const lat = pos?.lat, lon = pos?.lon;
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const load = useCallback(async () => {
    if (!enabled) return;
    const { data, error } = await db.rpc('list_sniffer_posts', { p_lat: lat ?? null, p_lon: lon ?? null, p_limit: 60 });
    if (!alive.current) return;
    setReady(true);
    if (error) { setRows([]); return; }
    setRows(((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
      fp: postOf(r), km: r.km == null ? null : Number(r.km), mine: r.mine === true, expired: r.expired === true, at: String(r.sniffer_at ?? r.created_at),
    })));
  }, [enabled, lat, lon]);
  useEffect(() => { void load(); }, [load]);
  // Nový príspevok (aj Sniffer) z okna písania: zoznam sa načíta znova.
  useEffect(() => onPostsChanged(() => { void load(); }), [load]);
  const reload = useCallback(() => { void load(); }, [load]);
  return { rows, reload, ready };
}

/** „Obnoviť“ = ďalších 30 dní v téme Sniffer. */
export async function renewSniffer(postId: string): Promise<boolean> {
  const { data, error } = await db.rpc('renew_post_sniffer', { p_post: postId });
  return !error && data === true;
}

/** Najnovšie výlety členov. Číta lokálnu zrkadlovú kópiu a prekreslí sa po dobehnutí hydratácie. */
export function useFeedTrips(limit = 8): FeedTrip[] {
  const [trips, setTrips] = useState<FeedTrip[]>(() => readFeedTrips());
  useEffect(() => {
    const load = () => setTrips(readFeedTrips());
    load();
    return onPackStoreHydrated(load);
  }, []);
  return trips.slice(0, limit);
}

/** „pred 2 h" — v jazyku appky, bez knižnice. */
export function agoLabel(ms: number, lang: string): string {
  if (!ms) return '';
  const min = Math.max(1, Math.round((Date.now() - ms) / 60000));
  const rtf = new Intl.RelativeTimeFormat(intlLocale(lang), { numeric: 'auto', style: 'short' });
  if (min < 60) return rtf.format(-min, 'minute');
  const h = Math.round(min / 60);
  if (h < 48) return rtf.format(-h, 'hour');
  const d = Math.round(h / 24);
  if (d < 60) return rtf.format(-d, 'day');
  return rtf.format(-Math.round(d / 30), 'month');
}

/** Názov výletu v jazyku appky: SK a CS majú zdroj, ostatné idú cez EN preklad, ak existuje. */
export const tripTitle = (t: HeroTrail, lang: string): string =>
  (lang === 'sk' || lang === 'cs' ? t.name : (t.nameEN || t.name));

export const firstWord = (s: string): string => s.split(/\s+/)[0] || s;

// ── LABKA a ☆ NA OBJEKTE, KTORÝ NIE JE PRÍSPEVOK ───────────────────────────────────────────────
// Výlet, citát, značka z mapy a príbeh AINUBISA nie sú riadky `posts`, takže `post_marks` ich nevezme.
// Od 26. 10. 2026 ich drží `feed_marks` (migrácia 20261104_feed_server.sql), kľúč = `trip:<slug>`,
// `quote:<id>`, `map:<id>`, `story:<id>`. Počty pýta feed po dávkach cez `feed_social(targets[])`.
// ⚠️ Kým server migráciu nemá (LIVE pred „ok"), RPC padne a hook sa ticho vráti k tomuto zariadeniu
//    (localStorage, ten istý tvar ako dovtedy) — feed nesmie zhasnúť len preto, že chýba tabuľka.
const LOCAL_KEY = 'dogypt-feed-likes-v1';
const db = supabase as any;

/** `saves` = koľko ľudí uložilo (výlet: koľko ho má v TRIPLISTe), `saved` pri výlete = môj TRIPLIST
 *  v okamihu dopytu — migrácia 20261105_feed_saves.sql, Matej 27. 10.: *„počet pri labkách, komentoch aj uloženiach"*. */
export interface FeedSoc { likes: number; liked: boolean; saved: boolean; comments: number; saves: number }
const NONE: FeedSoc = { likes: 0, liked: false, saved: false, comments: 0, saves: 0 };

/** Starý lokálny zápis: `trip:x` = labka, `quote-save:x` = ☆ citátu `quote:x`. */
const localKey = (target: string, kind: 'like' | 'save') => {
  if (kind === 'like') return target;
  const i = target.indexOf(':');
  return `${target.slice(0, i)}-save${target.slice(i)}`;
};
function readLocal(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') as string[]); } catch { return new Set(); }
}

export interface FeedMarks {
  get: (target: string) => FeedSoc;
  toggle: (target: string, kind: 'like' | 'save') => void;
  /** Feed ohlási, čo práve ukazuje; neznáme ciele sa dopýtajú jedným volaním. */
  want: (targets: string[]) => void;
}

export function useFeedMarks(): FeedMarks {
  const [soc, setSoc] = useState<Map<string, FeedSoc>>(() => new Map());
  const [server, setServer] = useState(true);
  const asked = useRef<Set<string>>(new Set());
  const local = useRef<Set<string>>(readLocal());

  const want = useCallback((targets: string[]) => {
    const fresh = targets.filter((x) => !asked.current.has(x));
    if (!fresh.length || !server) return;
    fresh.forEach((x) => asked.current.add(x));
    const run = (attempt: number) => void db.rpc('feed_social', { p_targets: fresh }).then(({ data, error }: { data: Array<FeedSoc & { target: string }> | null; error: { code?: string } | null }) => {
      if (error) {
        // LOKÁLNY REŽIM len keď funkcia na serveri naozaj NIE JE (42883 Postgres, PGRST202 PostgREST). Každé iné zlyhanie
        // (sieť, 5xx, vypršaná relácia) je prechodné: jedno opakovanie a potom sa ciele uvoľnia na ďalší pokus —
        // predtým jedno zlyhanie preplo lajky do localStorage až do konca session (audit 30. 10. 2026).
        if (error.code === '42883' || error.code === 'PGRST202') { setServer(false); return; }
        if (attempt < 1) { window.setTimeout(() => run(attempt + 1), 1500); return; }
        fresh.forEach((x) => asked.current.delete(x));
        return;
      }
      setSoc((prev) => {
        const next = new Map(prev);
        for (const r of data ?? []) next.set(r.target, { likes: r.likes, liked: r.liked, saved: r.saved, comments: r.comments, saves: Number(r.saves) || 0 });
        return next;
      });
    });
    run(0);
  }, [server]);

  const get = useCallback((target: string): FeedSoc => {
    if (server) return soc.get(target) ?? NONE;
    const liked = local.current.has(localKey(target, 'like'));
    const saved = local.current.has(localKey(target, 'save'));
    return { likes: liked ? 1 : 0, liked, saved, comments: 0, saves: saved ? 1 : 0 };
  }, [soc, server]);

  const toggle = useCallback((target: string, kind: 'like' | 'save') => {
    if (!server) {
      const k = localKey(target, kind);
      if (local.current.has(k)) local.current.delete(k); else local.current.add(k);
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify([...local.current])); } catch { /* súkromné okno */ }
      setSoc((m) => new Map(m));
      return;
    }
    // Optimisticky — akcia nesmie čakať na server (ten istý vzor ako FeedPostCard).
    const cur = soc.get(target) ?? NONE;
    const on = kind === 'like' ? !cur.liked : !cur.saved;
    const apply = (v: boolean) => setSoc((prev) => {
      const next = new Map(prev);
      const c = next.get(target) ?? NONE;
      next.set(target, kind === 'like'
        ? { ...c, liked: v, likes: Math.max(0, c.likes + (v === c.liked ? 0 : v ? 1 : -1)) }
        : { ...c, saved: v, saves: Math.max(0, c.saves + (v === c.saved ? 0 : v ? 1 : -1)) });
      return next;
    });
    apply(on);
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) { apply(!on); return; }
      const { error } = on
        ? await db.from('feed_marks').insert({ target, user_id: uid, kind })
        : await db.from('feed_marks').delete().eq('target', target).eq('user_id', uid).eq('kind', kind);
      // 23505 = už tam bola (druhé ťuknutie z iného zariadenia) — stav je aj tak „zapnuté".
      if (error && (error as { code?: string }).code !== '23505') apply(!on);
    })();
  }, [soc, server]);

  return { get, toggle, want };
}

/**
 * ↗ POSLAŤ — systémové zdieľanie, inak odkaz do schránky. Akcia človeka NEODNESIE preč (lock §4.2).
 * ⚠️ Žiadny `await` pred `navigator.share` — iOS pustí zdieľanie len priamo v ťuknutí.
 * Vráti `'copied'`, keď šlo o schránku (volajúci ukáže hlášku), inak `'shared'` / `'cancelled'`.
 */
export async function shareOut(data: { title: string; text?: string; url: string }): Promise<'shared' | 'copied' | 'cancelled'> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try { await navigator.share(data); return 'shared'; } catch { return 'cancelled'; }
  }
  try { await navigator.clipboard.writeText(data.url); return 'copied'; } catch { return 'cancelled'; }
}

// ── CUDZIE PRÍSPEVKY a AUTOR VÝLETU (server, 26. 10. 2026) ───────────────────────────────────────
// `list_feed_posts` vydá cudzie verejné príspevky s krstným menom, fotkou a číslom majiteľa — bez `user_id`.
// Moje, story a zablokovaných vynechá server. Bez migrácie RPC padne ⇒ prázdny zoznam (feed ostane pri mojich).
export interface FeedPost { post: MePost; name: string; avatar: string | null; ownerN: number | null }

/** Jeden príspevok podľa id (odkaz z upozornenia `?post=`): aj starší než 60 načítaných, aj môj. `null` = neexistuje / nesmiem. */
export async function fetchFeedPost(id: string): Promise<(FeedPost & { mine: boolean }) | null> {
  const { data, error } = await db.rpc('get_feed_post', { p_id: id });
  const r = Array.isArray(data) ? (data[0] as Record<string, unknown> | undefined) : undefined;
  if (error || !r) return null;
  return {
    post: {
      id: String(r.id), body: String(r.body ?? ''), photos: Array.isArray(r.photos) ? (r.photos as string[]) : [],
      tags: (r.tags as string[]) ?? [], attach: (r.attach as MePost['attach']) ?? {}, visibility: 'public',
      createdAt: String(r.created_at), actedBy: null, actedName: null,
    },
    name: String(r.first_name ?? ''), avatar: (r.photo as string | null) ?? null,
    ownerN: r.owner_n == null ? null : Number(r.owner_n), mine: r.mine === true,
  };
}

const POSTS_PAGE = 30;
const REFRESH_MS = 30_000;

const postOf = (r: Record<string, unknown>): FeedPost => ({
  post: {
    id: String(r.id),
    body: String(r.body ?? ''),
    photos: Array.isArray(r.photos) ? (r.photos as string[]) : [],
    tags: (r.tags as string[]) ?? [],
    attach: (r.attach as MePost['attach']) ?? {},
    visibility: 'public',
    createdAt: String(r.created_at),
    actedBy: null,
    actedName: null,
  },
  name: String(r.first_name ?? ''),
  avatar: (r.photo as string | null) ?? null,
  ownerN: r.owner_n == null ? null : Number(r.owner_n),
});

/**
 * Cudzie príspevky po stránkach (`p_before` = čas najstaršieho načítaného). `loadMore()` dobrá ďalšiu stránku pri konci
 * scrollu; návrat na kartu (visibility/focus, najviac raz za 30 s) obnoví prvú stránku a nové príspevky pridá navrch.
 * `done` = server už nemá starších (alebo RPC nie je) ⇒ feed môže ukázať „videl si všetko".
 */
// POSLEDNÉ PRÍSPEVKY V ZARIADENÍ (5. 11. 2026): feed ich ukáže hneď a pri otvorení ich nahradí to, čo vráti server
// (zmazaný príspevok teda zmizne). Sú to verejné príspevky, ktoré vidí každý člen, kópia preto nie je viazaná na účet.
const POSTS_STORE = 'feed-posts-v1';
const POSTS_STORED = 12;
const readStoredPosts = (): FeedPost[] => {
  try { return (JSON.parse(localStorage.getItem(POSTS_STORE) || '[]') as FeedPost[]) || []; } catch { return []; }
};

export function useFeedPosts(enabled: boolean): { rows: FeedPost[]; loadMore: () => void; done: boolean } {
  const [rows, setRows] = useState<FeedPost[]>(readStoredPosts);
  const fromServer = useRef(false);
  const [done, setDone] = useState(false);
  const busy = useRef(false);
  const doneRef = useRef(false);
  const lastRun = useRef(0);
  const oldest = useRef<string | null>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const page = useCallback(async (before: string | null, first: boolean) => {
    if (busy.current) return;
    busy.current = true;
    const had = oldest.current !== null;
    try {
      const { data, error } = await db.rpc('list_feed_posts', { p_limit: POSTS_PAGE, ...(before ? { p_before: before } : {}) });
      if (!alive.current) return;
      if (error) { if (!first) { doneRef.current = true; setDone(true); } return; }
      const got = ((data ?? []) as Array<Record<string, unknown>>).map(postOf);
      setRows((prev) => {
        const by = new Map((fromServer.current ? prev : []).map((x) => [x.post.id, x]));
        fromServer.current = true;
        got.forEach((x) => by.set(x.post.id, x));
        const all = [...by.values()].sort((a, b) => Date.parse(b.post.createdAt) - Date.parse(a.post.createdAt));
        oldest.current = all.length ? all[all.length - 1].post.createdAt : null;
        return all;
      });
      if (first) { try { localStorage.setItem(POSTS_STORE, JSON.stringify(got.slice(0, POSTS_STORED))); } catch { /* plné úložisko */ } }
      // Obnova prvej stránky stav „hotovo" nemení (starších stránok sa netýka); prvé načítanie alebo dobratie ho nastaví.
      if (got.length < POSTS_PAGE && (!first || !had)) { doneRef.current = true; setDone(true); }
    } finally { busy.current = false; }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    lastRun.current = Date.now();
    void page(null, true);
    // Návrat do appky / na kartu: príspevky mohli pribudnúť, kým bola na pozadí.
    const back = () => {
      if (document.visibilityState !== 'visible' || Date.now() - lastRun.current < REFRESH_MS) return;
      lastRun.current = Date.now();
      void page(null, true);
    };
    document.addEventListener('visibilitychange', back);
    window.addEventListener('focus', back);
    return () => { document.removeEventListener('visibilitychange', back); window.removeEventListener('focus', back); };
  }, [enabled, page]);

  const loadMore = useCallback(() => {
    if (!enabled || doneRef.current || !oldest.current) return;
    void page(oldest.current, false);
  }, [enabled, page]);

  return { rows, loadMore, done };
}

/** Mená psov k príspevkom (označení + psi autora) — len pre HĽADANIE. Pýta sa po dávkach, jedno volanie na dávku. */
export function useFeedPostDogs(ids: string[], enabled: boolean): Map<string, string[]> {
  const [map, setMap] = useState<Map<string, string[]>>(() => new Map());
  const asked = useRef<Set<string>>(new Set());
  const key = ids.join('|');
  useEffect(() => {
    if (!enabled) return;
    const fresh = ids.filter((x) => !asked.current.has(x)).slice(0, 200);
    if (!fresh.length) return;
    fresh.forEach((x) => asked.current.add(x));
    void db.rpc('feed_post_dog_names', { p_posts: fresh }).then(({ data, error }: { data: Array<{ post_id: string; names: string[] }> | null; error: unknown }) => {
      if (error) { fresh.forEach((x) => asked.current.delete(x)); return; }
      setMap((prev) => {
        const next = new Map(prev);
        for (const r of data ?? []) next.set(r.post_id, r.names ?? []);
        return next;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);
  return map;
}

export interface TripAuthor { photo: string | null; ownerN: number | null; name: string | null }

/** Fotka a číslo autora výletu (karta mala len meno z payloadu). Pýta sa len na nové slugy. */
export function useTripAuthors(slugs: string[]): Map<string, TripAuthor> {
  const [map, setMap] = useState<Map<string, TripAuthor>>(() => new Map());
  const asked = useRef<Set<string>>(new Set());
  const key = slugs.join('|');
  useEffect(() => {
    const fresh = slugs.filter((x) => !asked.current.has(x)).slice(0, 200);
    if (!fresh.length) return;
    fresh.forEach((x) => asked.current.add(x));
    void db.rpc('feed_trip_authors', { p_slugs: fresh }).then(({ data, error }: { data: Array<{ slug: string; first_name: string | null; photo: string | null; owner_n: number | null }> | null; error: unknown }) => {
      if (error) return;
      setMap((prev) => {
        const next = new Map(prev);
        for (const r of data ?? []) next.set(r.slug, { photo: r.photo, ownerN: r.owner_n, name: r.first_name?.trim() || null });
        return next;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return map;
}

/**
 * SWIPE KARUSELU FOTIEK (Matej 28. 10. 2026): dotyk (potiahnutie do strany) aj trackpad (vodorovný scroll) listujú
 * fotky; šípky ostávajú pre myš. `touch-action:pan-y` na prvku nechá zvislý scroll stránky prejsť.
 * `moved()` povie, či ťuk bol vlastne potiahnutie — kliknutie na fotku (otvor výlet) sa potom ignoruje.
 */
export function useSwipe(n: number, step: (dir: 1 | -1) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const wheel = useRef({ acc: 0, at: 0, fired: false });
  return {
    moved: () => { const d = dragged.current; dragged.current = false; return d; },
    handlers: {
      onTouchStart: (e: React.TouchEvent) => { if (n < 2) return; start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; dragged.current = false; },
      onTouchEnd: (e: React.TouchEvent) => {
        const s = start.current; start.current = null;
        if (!s || n < 2) return;
        const dx = e.changedTouches[0].clientX - s.x;
        const dy = e.changedTouches[0].clientY - s.y;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) { dragged.current = true; step(dx < 0 ? 1 : -1); }
      },
      onWheel: (e: React.WheelEvent) => {
        if (n < 2 || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        const w = wheel.current;
        const now = Date.now();
        if (now - w.at > 250) { w.acc = 0; w.fired = false; }   // nové gesto trackpadu = nová séria udalostí
        w.at = now;
        if (w.fired) return;                                    // jedna fotka na gesto, zvyšok zotrvačnosti sa zahodí
        w.acc += e.deltaX;
        if (Math.abs(w.acc) > 40) { w.fired = true; step(w.acc > 0 ? 1 : -1); }
      },
    },
  };
}
