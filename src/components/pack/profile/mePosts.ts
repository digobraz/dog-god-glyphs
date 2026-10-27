// PRÍSPEVKY Z PROFILU JA — príspevok · story · album (23. 10. 2026).
//
// Matej 23. 10.: *„treba poriešiť aj akčné tlačítko = pridať príspevok, story, album, zápisku …
// postaviť stories funkčnosť — obruč ktorá žiari … a plusko pri otvorenom profile"*.
//
// 🔴 ŽIADNA NOVÁ TABUĽKA. Story aj album sú riadky `posts` so ŠTÍTKOM (lock architektura-pack
//    §4.3: „príspevok nemá typ, má štítky") — ten istý stôl, ktorý od 22. 9. nesie príbehy z cesty.
// ⚠️ ŠTÍTOK `story` UŽ JE OBSADENÝ = príbeh z cesty (`story/storyData.ts`, jeden na trasu, unikátny
//    index). 24-hodinová story preto nesie štítok `moment` — keby dostala `story`, druhá story
//    toho istého človeka by narazila na index „jeden príbeh na človeka a trasu".
// ⚠️ 24 h STRÁŽI ČÍTAČ, nie DB. Po 24 h sa riadok nemaže — ostáva v ARCHÍVE (karta STORIES, len ja),
//    presne ako na IG. Cudzím ju neskôr ukáže až FEED a ten si 24 h odfiltruje rovnako (`isLive`).
import { supabase } from '@/integrations/supabase/client';
import { compressFile } from '@/lib/photoIntake';
import { uploadMemberPostPhoto, uploadMemberDogPhoto } from '@/services/cloudinaryService';
import type { HumanProfile } from '@/components/pack/profile/packProfile';

// `posts` nie je v generovaných typoch (rovnaký únik ako `storyData.ts`).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const TAG_POST = 'post';
export const TAG_MOMENT = 'moment';
export const TAG_ALBUM = 'album';
/** Fotka z výletu alebo z prírody (povinná otázka pri pridaní, FEED 2 26. 10. 2026) ⇒ vo feede sa ukladá
 *  ako 🎯 TRIPWISH, nie ☆. `posts.tags` je voľné `text[]` — štítok nepotrebuje migráciu. */
export const TAG_NATURE = 'nature';
/** Štítok príbehu z cesty — vlastní ho `story/storyData.ts`, tu ho len rozoznávame. */
const TAG_TRIP_STORY = 'story';

export type ComposeMode = 'post' | 'moment' | 'album';
export type Visibility = 'public' | 'private';

export interface MePost {
  id: string;
  body: string;
  photos: string[];
  tags: string[];
  attach: { trip_slug?: string; dogs?: string[]; title?: string; place?: { name: string; lat?: number; lon?: number } };
  visibility: Visibility;
  createdAt: string;
  /** K4: kto to NAOZAJ urobil, keď to nebol autor (pawmate z pawtnerovho profilu). Plní ho DB trigger. */
  actedBy: string | null;
  /** Meno zapísané pri čine — štítok prežije zánik účtu pawmata. */
  actedName: string | null;
}

export const DAY_MS = 24 * 60 * 60 * 1000;
export const isMoment = (p: MePost) => p.tags.includes(TAG_MOMENT);
export const isAlbum = (p: MePost) => p.tags.includes(TAG_ALBUM);
export const isTripStory = (p: MePost) => p.tags.includes(TAG_TRIP_STORY);
export const isNature = (p: MePost) => p.tags.includes(TAG_NATURE) || p.tags.includes('t:trip');
/** Story žije 24 h od zverejnenia. */
export const isLive = (p: MePost, now = Date.now()) => isMoment(p) && now - Date.parse(p.createdAt) < DAY_MS;

export async function fetchMyPosts(uid: string): Promise<MePost[]> {
  const { data, error } = await db.from('posts')
    .select('id, body, photos, tags, attach, visibility, created_at, acted_by, acted_name')
    .eq('author_id', uid).order('created_at', { ascending: false }).limit(200);
  if (error) throw error;
  return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    id: String(r.id),
    body: typeof r.body === 'string' ? r.body : '',
    photos: Array.isArray(r.photos) ? r.photos.filter((p): p is string => typeof p === 'string') : [],
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    attach: (r.attach ?? {}) as MePost['attach'],
    visibility: r.visibility === 'public' ? 'public' : 'private',
    createdAt: String(r.created_at),
    actedBy: typeof r.acted_by === 'string' ? r.acted_by : null,
    actedName: typeof r.acted_name === 'string' ? r.acted_name : null,
  }));
}

// ── ZBERNICA: kto zverejnil, dá vedieť profilu (composer žije v lište, profil ho nemountuje).
const CHANGED = 'dogypt:posts-changed';
export const emitPostsChanged = () => window.dispatchEvent(new Event(CHANGED));
export function onPostsChanged(fn: () => void): () => void {
  window.addEventListener(CHANGED, fn);
  return () => window.removeEventListener(CHANGED, fn);
}

async function uploadAll(files: File[], uid: string): Promise<string[]> {
  const out: string[] = [];
  for (const [i, f] of files.entries()) {
    const { blob } = await compressFile(f);
    const r = await uploadMemberPostPhoto(blob, uid, `${Date.now()}-${i}`);
    out.push(r.secureUrl);
  }
  return out;
}

/** Zverejní z profilu. Story = JEDEN riadok na fotku (každá snímka má vlastných 24 h a vlastné
 *  zmazanie); príspevok a album = jeden riadok so všetkými fotkami. */
export async function publish(opts: {
  uid: string;
  /** K4 MODEL A: pawmate píše Z PAWTNEROVHO profilu — riadok nesie pawtnerovo `author_id`,
   *  `acted_by` doplní server. Bez neho = vlastný profil. */
  author?: string | null;
  mode: ComposeMode;
  files: File[];
  body: string;
  title?: string;
  dogIds: string[];
  visibility: Visibility;
  place?: { name: string; lat?: number; lon?: number } | null;
  /** Odpoveď na „Je fotka z výletu alebo z prírody?" — len príspevok. */
  nature?: boolean;
  /** Pilulky tém (`t:trip`…, FEED 2 krok 5) — voliteľné, najviac 2; nahrádzajú otázku `nature`. */
  topics?: string[];
}): Promise<void> {
  const photos = await uploadAll(opts.files, opts.uid);
  const attach: MePost['attach'] = {};
  if (opts.dogIds.length) attach.dogs = opts.dogIds;
  if (opts.mode === 'album' && opts.title?.trim()) attach.title = opts.title.trim();
  if (opts.place?.name.trim()) attach.place = { ...opts.place, name: opts.place.name.trim() };
  const tag = opts.mode === 'moment' ? TAG_MOMENT : opts.mode === 'album' ? TAG_ALBUM : TAG_POST;
  const tags = opts.mode === 'post' ? [tag, ...(opts.nature ? [TAG_NATURE] : []), ...(opts.topics ?? []).slice(0, 2)] : [tag];
  const base = { author_id: opts.author || opts.uid, body: opts.body.trim(), tags, attach, visibility: opts.visibility };
  const rows = opts.mode === 'moment' ? photos.map((p) => ({ ...base, photos: [p] })) : [{ ...base, photos }];
  const { error } = await db.from('posts').insert(rows);
  if (error) throw error;
  emitPostsChanged();
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await db.from('posts').delete().eq('id', id);
  if (error) throw error;
  emitPostsChanged();
}

// ── TITULKA: jedna fotka, alebo album striedaný po dni ─────────────────────────────────────
/** Album titulky vrátane staršej jedinej titulky (tá bola pred albumom a nesmie sa stratiť). */
export function coverAlbumOf(h: Pick<HumanProfile, 'coverPhoto' | 'coverAlbum'> | null | undefined): string[] {
  const all = [...(h?.coverAlbum ?? []), ...(h?.coverPhoto ? [h.coverPhoto] : [])];
  return all.filter((u, i) => !!u && all.indexOf(u) === i);
}

/** Číslo dňa v MIESTNOM čase — titulka sa mení o polnoci človeka, nie o polnoci UTC. */
const localDay = (d = new Date()) => Math.floor((d.getTime() - d.getTimezoneOffset() * 60_000) / DAY_MS);

/** Dnešná titulka. Pri striedaní ide album dookola po dni; inak stojí vybraná fotka. */
export function coverOfDay(h: Pick<HumanProfile, 'coverPhoto' | 'coverAlbum' | 'coverRotate'> | null | undefined): string | null {
  const album = coverAlbumOf(h);
  if (h?.coverRotate && album.length > 1) return album[localDay() % album.length];
  return h?.coverPhoto || album[0] || null;
}

// ── OTVORENIE TVORBY odkiaľkoľvek (panel `+` v lište, `+` na fotke v profile) ───────────────
// Composer mountuje LIŠTA (`PackLayout`), nie stránka — ten istý vzor ako denník: akcia nikoho
// neodnesie preč (lock §4.2) a profil nemusí vedieť, kto ho otvoril.
const OPEN = 'dogypt:compose';
export const openCompose = (mode: ComposeMode) => window.dispatchEvent(new CustomEvent<ComposeMode>(OPEN, { detail: mode }));
export function onOpenCompose(fn: (mode: ComposeMode) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<ComposeMode>).detail);
  window.addEventListener(OPEN, h);
  return () => window.removeEventListener(OPEN, h);
}

// ── HLAVNÁ FOTKA PSA (UPRAVIŤ PROFIL → SVORKA, 23. 10. 2026) ──────────────────────────────
/** Nahrá a zapíše novú hlavnú fotku psa. RLS + trigger `dogs_pawtner_columns` pustí majiteľa
 *  a toho, kto má právo `dog.photo`. Vráti novú adresu. */
export async function changeDogMainPhoto(dogId: string, file: File): Promise<string> {
  const { blob } = await compressFile(file);
  const { secureUrl } = await uploadMemberDogPhoto(blob, dogId);
  const { error } = await supabase.from('dogs').update({ cloudinary_main_url: secureUrl }).eq('id', dogId);
  if (error) throw new Error(error.message);
  return secureUrl;
}

// ── ❤️ 💬 POD PRÍSPEVKOM (25. 10. 2026, migrácia `20261025_post_social.sql`) ─────────────────
export type PostSocial = { likes: number; comments: number; liked: boolean; saved: boolean; saves: number };
export type PostComment = { id: string; mine: boolean; canDelete: boolean; name: string; photo: string | null; ownerN: number | null; body: string; createdAt: string; actedBy: string | null; actedName: string | null };

export async function fetchPostSocial(postId: string): Promise<PostSocial> {
  const { data } = await db.rpc('post_social', { p_post: postId });
  const r = Array.isArray(data) ? data[0] : null;
  return { likes: Number(r?.likes) || 0, comments: Number(r?.comments) || 0, liked: !!r?.liked, saved: !!r?.saved, saves: Number(r?.saves) || 0 };
}

export async function fetchComments(postId: string): Promise<PostComment[]> {
  const { data, error } = await db.rpc('list_post_comments', { p_post: postId });
  if (error || !Array.isArray(data)) return [];
  return (data as Array<Record<string, unknown>>).map((r) => ({
    id: String(r.id), mine: !!r.mine, canDelete: !!r.can_delete,
    name: typeof r.first_name === 'string' ? r.first_name : '',
    photo: typeof r.photo === 'string' ? r.photo : null,
    ownerN: r.owner_n == null ? null : Number(r.owner_n),
    body: String(r.body ?? ''), createdAt: String(r.created_at),
    actedBy: typeof r.acted_by === 'string' ? r.acted_by : null,
    actedName: typeof r.acted_name === 'string' ? r.acted_name : null,
  }));
}

export async function addComment(postId: string, uid: string, body: string): Promise<void> {
  // K4 MODEL A: pawmate bez vlastného psa komentuje za pawtnera — za koho, povie server
  // (`act_for_owner`), `acted_by` dopíše trigger. Pawmate BEZ práva dostane null = len prezerá.
  const { data: actFor, error: actErr } = await db.rpc('act_for_owner', { p_right: 'social' });
  if (!actErr && actFor == null) throw new Error('pawmate without the social right');
  const author = typeof actFor === 'string' ? actFor : uid;
  const { error } = await db.from('post_comments').insert({ post_id: postId, user_id: author, body: body.trim() });
  if (error) throw error;
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await db.from('post_comments').delete().eq('id', id);
  if (error) throw error;
}

/** Kto dal ❤️ (ako na IG, Matej 25. 10. 2026). Adresa človeka = poradové číslo psa (`/pack/u/:n`). */
export type PostLiker = { name: string; photo: string | null; ownerN: number | null; mine: boolean };
export async function fetchLikers(postId: string): Promise<PostLiker[]> {
  const { data, error } = await db.rpc('list_post_likers', { p_post: postId });
  if (error || !Array.isArray(data)) return [];
  return (data as Array<Record<string, unknown>>).map((r) => ({
    name: typeof r.first_name === 'string' ? r.first_name : '',
    photo: typeof r.photo === 'string' ? r.photo : null,
    ownerN: r.owner_n == null ? null : Number(r.owner_n),
    mine: !!r.mine,
  }));
}

/** Odkaz do Mapy.cz s bodom — ten istý tvar ako pri výletoch. */
export const mapyPointUrl = (lat: number, lon: number) =>
  `https://mapy.com/turisticka?source=coor&id=${lon},${lat}&x=${lon}&y=${lat}&z=16`;
