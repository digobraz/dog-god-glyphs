// ============================================================================
// PRÍBEHY Z CESTY — dáta (zadanie `plany/zadanie-odysea-pribehy-FRESH-SESSION.md`)
//
// Príbeh NIE JE vlastný typ obsahu. Je to PRÍSPEVOK so štítkom `story` a prílohou
// `trip_slug` — lock `architektura-pack.md` §4.3 („príspevok nemá typ, má štítky
// a prílohy"). Matej vybral tento tvar 22. 9. 2026 proti solitérnej tabuľke:
// keď o rok pribudne feed, je to ďalší štítok, nie ďalšia migrácia.
// Úložisko: `vystupy/supabase/migrations/20260922_pribehy.sql` (+ `_akcie.sql`).
//
// 🔴 PORADIE NESIE SÁM PRÍBEH, nie `trip_walked`. Kto trasu prešiel, je cez RLS
// zámerne neviditeľné a `trip_crowd()` vracia počty bez identity. Kto prešiel
// a nenapísal, v kronike nie je — a nikto o ňom nič neprezradí.
// ============================================================================
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/** Štítok, ktorým sa príspevok stáva príbehom z cesty. Prvý z nich. */
export const TAG_STORY = 'story';

/** Prílohy príbehu. `link` a `youtube` sú PRÍLOHY, nie stĺpce — stĺpec
 *  `youtube_url` by bol typ prezlečený za pole (§4.3). */
export interface StoryAttach {
  trip_slug?: string;
  /** Vlastná tvorba autora o TEJTO ceste (kniha, článok, film). Pravidlo pri poli. */
  link?: string;
  /** Len YouTube — appka ho vie vykresliť ako náhľad, hocijakú URL nie (rozhodnutie 6). */
  youtube?: string;
}

export interface TripStory {
  id: string;
  /** 1 = prešiel PRVÝ. Zlatý odznak na bloku. */
  rank: number;
  isMine: boolean;
  /** Krstné meno z `dogs.owner_name` — rovnaký rozsah identity ako `trip_walkers()`. */
  ownerFirst: string;
  dogs: { name: string; n: number }[];
  body: string;
  photos: string[];
  attach: StoryAttach;
  /** 🔴 DÁTUM PREJDENIA, nie písania (rozhodnutie 1). */
  happenedAt: string | null;
  createdAt: string;
  likes: number;
  liked: boolean;
  saved: boolean;
}

// `types.ts` generuje Supabase a nové RPC v ňom ešte nie sú — rovnaký únik ako
// v `crowdOthers.ts`. Netýka sa to návratového typu, ten je popísaný vyššie.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const asArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowToStory = (r: any): TripStory => ({
  id: String(r.id),
  rank: Number(r.rank) || 0,
  isMine: !!r.is_mine,
  ownerFirst: r.owner_first ?? '',
  dogs: Array.isArray(r.dogs) ? r.dogs : [],
  body: r.body ?? '',
  photos: asArray(r.photos),
  attach: (r.attach && typeof r.attach === 'object') ? r.attach : {},
  happenedAt: r.happened_at ?? null,
  createdAt: r.created_at ?? '',
  likes: Number(r.likes) || 0,
  liked: !!r.liked,
  saved: !!r.saved,
});

export async function loadTripStories(slug: string): Promise<TripStory[]> {
  const { data, error } = await db.rpc('list_trip_stories', { p_trip_slug: slug });
  if (error || !Array.isArray(data)) return [];
  return data.map(rowToStory);
}

/** „Budeš N-tý, kto to tu má zapísané" (rozhodnutie 7).
 *  ⚠️ Vracia POČET CUDZÍCH zverejnených, takže poradie pri písaní je `+1`.
 *  ⚠️ NIE JE to `rank` z kroniky — tam rozhoduje `happened_at`. Kto prešiel dávno
 *  a píše dnes, dostane v kronike nižšie číslo, než mu sľúbil formulár. */
export async function loadStoryCount(slug: string): Promise<number> {
  const { data, error } = await db.rpc('trip_story_count', { p_trip_slug: slug });
  if (error) return 0;
  return Number(data) || 0;
}

/** ❤️ a 🔖 — jedna tabuľka značiek, dva druhy. Vracia nový stav (optimisticky
 *  ho volajúci prepne skôr, než sa vráti odpoveď: akcia nesmie „čakať"). */
export async function toggleMark(
  postId: string, kind: 'like' | 'save', on: boolean,
): Promise<boolean> {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return !on;
  if (on) {
    const { error } = await db.from('post_marks').insert({ post_id: postId, user_id: uid, kind });
    return error ? !on : on;
  }
  const { error } = await db.from('post_marks')
    .delete().eq('post_id', postId).eq('user_id', uid).eq('kind', kind);
  return error ? !on : on;
}

/** Kronika jednej trasy. Prázdne pole je platný stav — sekcia sa vtedy nevykreslí. */
export function useTripStories(slug: string | undefined) {
  const [stories, setStories] = useState<TripStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setStories([]); setLoading(false); return; }
    let alive = true;
    setLoading(true);
    loadTripStories(slug).then((rows) => {
      if (!alive) return;
      setStories(rows);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [slug]);

  return { stories, loading, setStories };
}

// ════════════════════════════════════════════════════════════════════════════
// PÍSANIE (KROK 4)
// ════════════════════════════════════════════════════════════════════════════

/** Rozpísaný alebo zverejnený príbeh prihláseného človeka k tejto trase. */
export interface MyStory {
  id: string;
  body: string;
  photos: string[];
  link: string;
  youtube: string;
  isPublic: boolean;
  happenedAt: string | null;
}

/** Formulár sa MUSÍ otvoriť s tým, čo už je napísané — inak by „druhý zápis
 *  prepisuje prvý" znamenalo „druhý zápis maže prvý". */
export async function loadMyStory(slug: string): Promise<MyStory | null> {
  const { data, error } = await db.rpc('my_trip_story', { p_trip_slug: slug });
  if (error || !Array.isArray(data) || data.length === 0) return null;
  const r = data[0];
  const attach: StoryAttach = (r.attach && typeof r.attach === 'object') ? r.attach : {};
  return {
    id: String(r.id),
    body: r.body ?? '',
    photos: asArray(r.photos),
    link: attach.link ?? '',
    youtube: attach.youtube ?? '',
    isPublic: r.visibility === 'public',
    happenedAt: r.happened_at ?? null,
  };
}

/** 🔴 Zápis ide cez RPC, nie cez `upsert`. Pravidlo „jeden príbeh na človeka"
 *  stráži čiastočný index NAD VÝRAZOM a PostgREST sa naň odkázať nevie —
 *  `supabase.from('posts').upsert()` by pri druhom zápise vrátil „duplicate key".
 *  RPC navyše overí, že človek trasu naozaj PREŠIEL (vchod je „prešiel som"). */
export async function saveStory(slug: string, s: {
  body: string; photos: string[]; link: string; youtube: string;
  isPublic: boolean; happenedAt: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await db.rpc('save_trip_story', {
    p_trip_slug: slug,
    p_body: s.body,
    p_photos: s.photos,
    p_link: s.link || null,
    p_youtube: s.youtube || null,
    p_public: s.isPublic,
    p_happened_at: s.happenedAt,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}
