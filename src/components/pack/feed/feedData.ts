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
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { HeroTrail } from '@/data/heroTrails.generated';
import type { MePost } from '@/components/pack/profile/mePosts';
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

export interface FeedSoc { likes: number; liked: boolean; saved: boolean; comments: number }
const NONE: FeedSoc = { likes: 0, liked: false, saved: false, comments: 0 };

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
    void db.rpc('feed_social', { p_targets: fresh }).then(({ data, error }: { data: Array<FeedSoc & { target: string }> | null; error: unknown }) => {
      if (error) { setServer(false); return; }
      setSoc((prev) => {
        const next = new Map(prev);
        for (const r of data ?? []) next.set(r.target, { likes: r.likes, liked: r.liked, saved: r.saved, comments: r.comments });
        return next;
      });
    });
  }, [server]);

  const get = useCallback((target: string): FeedSoc => {
    if (server) return soc.get(target) ?? NONE;
    const liked = local.current.has(localKey(target, 'like'));
    return { likes: liked ? 1 : 0, liked, saved: local.current.has(localKey(target, 'save')), comments: 0 };
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
        : { ...c, saved: v });
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

export function useFeedPosts(enabled: boolean): FeedPost[] {
  const [rows, setRows] = useState<FeedPost[]>([]);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    void db.rpc('list_feed_posts', { p_limit: 60 }).then(({ data, error }: { data: Array<Record<string, unknown>> | null; error: unknown }) => {
      if (!alive || error) return;
      setRows((data ?? []).map((r) => ({
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
      })));
    });
    return () => { alive = false; };
  }, [enabled]);
  return rows;
}

export interface TripAuthor { photo: string | null; ownerN: number | null }

/** Fotka a číslo autora výletu (karta mala len meno z payloadu). Pýta sa len na nové slugy. */
export function useTripAuthors(slugs: string[]): Map<string, TripAuthor> {
  const [map, setMap] = useState<Map<string, TripAuthor>>(() => new Map());
  const asked = useRef<Set<string>>(new Set());
  const key = slugs.join('|');
  useEffect(() => {
    const fresh = slugs.filter((x) => !asked.current.has(x)).slice(0, 200);
    if (!fresh.length) return;
    fresh.forEach((x) => asked.current.add(x));
    void db.rpc('feed_trip_authors', { p_slugs: fresh }).then(({ data, error }: { data: Array<{ slug: string; photo: string | null; owner_n: number | null }> | null; error: unknown }) => {
      if (error) return;
      setMap((prev) => {
        const next = new Map(prev);
        for (const r of data ?? []) next.set(r.slug, { photo: r.photo, ownerN: r.owner_n });
        return next;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return map;
}
