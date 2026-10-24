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
//    · AUTOR VÝLETU S FOTKOU — `payload.author` je len meno; fotka človeka v `pack_trips` nie je.
//    · LAJKY VÝLETOV A CITÁTU — `post_marks` kľúčuje `posts.id`, výlet ani citát nie je riadok `posts`.
import { useCallback, useEffect, useState } from 'react';
import type { HeroTrail } from '@/data/heroTrails.generated';
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

// ── LAJKY, ktoré zatiaľ nemajú server ────────────────────────────────────────────────────────
// TODO backend: `post_marks` kľúčuje `posts.id`. Výlet (`pack_trips`) ani citát dňa nie je riadok `posts`,
// takže ❤️ tu drží len toto zariadenie. Keď pribudne tabuľka značiek pre výlety (alebo výlet dostane
// príspevok), zmení sa len telo týchto dvoch funkcií.
const LIKES_KEY = 'dogypt-feed-likes-v1';

function readLikes(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LIKES_KEY) || '[]') as string[]); } catch { return new Set(); }
}

export function useLocalLikes(): { has: (id: string) => boolean; toggle: (id: string) => void } {
  const [set, setSet] = useState<Set<string>>(() => readLikes());
  const toggle = useCallback((id: string) => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem(LIKES_KEY, JSON.stringify([...next])); } catch { /* súkromné okno */ }
      return next;
    });
  }, []);
  return { has: (id) => set.has(id), toggle };
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
