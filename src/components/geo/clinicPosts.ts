// ============================================================================
// HODNOTENIE KLINIKY DOGYPŤANMI + SPRÁVCA KLINIKY (`20261219_kliniky.sql`).
// Zadanie: `plany/zadanie-veterinar-profil-admin-hodnotenie-2026-11-17.md` §STAVBA 2–4.
//
// Hodnotenie je POSTREH K MIESTU (`place_posts`, druh 'vet') — páruje sa podľa `clinic_id`, nie
// geometriou ako prameň či útulňa (`placePosts.ts`). Rozhodnutia Mateja 17. 11.:
//   b  hodnotí len člen so psom a odklikne „Boli sme tu"; 1 na človeka a kliniku, prepisuje sa;
//      bez bodov pútnika
//   c  naše číslo až od `CLINIC_MIN_RATINGS` hodnotení, dovtedy výzva „Boli ste tu?"
//   d  správy klinike sa nestavajú
// ============================================================================
import { useCallback, useEffect, useState } from 'react';
import { supabase as db } from '@/integrations/supabase/client';
import { hasSession } from '@/lib/hasSession';
import { DEV_NOAUTH } from '@/lib/devMockDogs';

/** Naše číslo sa ukáže až od troch hodnotení (rozhodnutie c). */
export const CLINIC_MIN_RATINGS = 3;

/** „S čím ste prišli" — slovník chipov (DB stráži len tvar). Poradie = poradie v šuplíku. */
export const CLINIC_VISIT_CHIPS = ['er_night', 'injury', 'vaccine', 'surgery', 'checkup'] as const;
export type ClinicVisitChip = (typeof CLINIC_VISIT_CHIPS)[number];

export interface ClinicPost {
  id: string;
  paws: number | null;
  body: string;
  photos: string[];
  chips: string[];
  /** 'pending' vidí len autor — fotky ešte kontroluje AINUBIS */
  review: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  isMine: boolean;
  authorFirst: string | null;
  packNumber: number | null;
  avatarUrl: string | null;
  replyBody: string | null;
  replyAt: string | null;
}

export interface ClinicInfo {
  hasDomain: boolean;
  claimed: boolean;
  iAmAdmin: boolean;
  animals: string[];
  devices: string[];
  languages: string[];
  before: string;
  aboutAt: string | null;
}

// RPC nie sú v `integrations/supabase/types.ts` — tá istá obchádzka ako `placePosts.ts`.
// 🔴 `.bind(db)` je nutné (holé `db.rpc` stratí `this`, pozri `placePosts.ts`).
type Rpc = (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
const rpc = (db.rpc as unknown as Rpc).bind(db);

// ── SÚHRN PRE MAPU A SOS — jedno volanie pre všetky kliniky, raz za život stránky ──
export type PawStat = { n: number; avg: number };
let statsCache: Record<string, PawStat> | null = null;
let statsInflight: Promise<Record<string, PawStat>> | null = null;
const statsListeners = new Set<(s: Record<string, PawStat>) => void>();

export function loadClinicStats(): Promise<Record<string, PawStat>> {
  if (statsCache) return Promise.resolve(statsCache);
  if (!statsInflight) {
    statsInflight = (async () => {
      if (DEV_NOAUTH || !(await hasSession())) return {};
      const { data, error } = await rpc('clinic_paw_stats');
      if (error) throw error;
      const out: Record<string, PawStat> = {};
      for (const r of (data ?? []) as { clinic_id: string; n: number; avg: number | string }[]) {
        out[r.clinic_id] = { n: r.n, avg: Number(r.avg) };
      }
      return out;
    })()
      .then((s) => { statsCache = s; statsListeners.forEach((fn) => fn(s)); return s; })
      .catch(() => ({}))
      .finally(() => { statsInflight = null; });
  }
  return statsInflight;
}

function reloadStats(): void {
  statsCache = null;
  void loadClinicStats();
}

/** Súhrn hodnotení všetkých kliník (`{}` kým nedorazí alebo bez prihlásenia). */
export function useClinicStats(): Record<string, PawStat> {
  const [s, setS] = useState<Record<string, PawStat>>(statsCache ?? {});
  useEffect(() => {
    let alive = true;
    const fn = (x: Record<string, PawStat>) => { if (alive) setS(x); };
    statsListeners.add(fn);
    void loadClinicStats().then(fn);
    return () => { alive = false; statsListeners.delete(fn); };
  }, []);
  return s;
}

/** Číslo, ktoré smie ísť von: `null` pod prahom (vtedy sa ukáže výzva, nie nula). */
export const shownAverage = (st: PawStat | undefined): PawStat | null =>
  st && st.n >= CLINIC_MIN_RATINGS ? st : null;

// ── PROFIL JEDNEJ KLINIKY ──
interface Row {
  id: string; paws: number | null; body: string | null; photos: string[] | null; chips: string[] | null;
  photo_review: string; created_at: string; is_mine: boolean;
  author_first: string | null; pack_number: number | null; avatar_url: string | null;
  reply_body: string | null; reply_at: string | null;
}
const fromRow = (r: Row): ClinicPost => ({
  id: r.id, paws: r.paws, body: r.body ?? '', photos: r.photos ?? [], chips: r.chips ?? [],
  review: (r.photo_review as ClinicPost['review']) ?? 'approved', createdAt: r.created_at,
  isMine: !!r.is_mine, authorFirst: r.author_first, packNumber: r.pack_number, avatarUrl: r.avatar_url,
  replyBody: r.reply_body, replyAt: r.reply_at,
});

/** Postrehy + údaje z DB pre profil. `reload()` po vlastnom zápise. Zlyhanie = prázdny stav. */
export function useClinicProfile(cid: string | undefined): {
  posts: ClinicPost[]; info: ClinicInfo | null; loading: boolean; reload: () => void;
} {
  const [posts, setPosts] = useState<ClinicPost[]>([]);
  const [info, setInfo] = useState<ClinicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!cid) return;
    let alive = true;
    setLoading(true);
    void (async () => {
      try {
        if (DEV_NOAUTH || !(await hasSession())) return;
        const [p, i] = await Promise.all([
          rpc('list_clinic_posts', { p_clinic: cid }),
          rpc('clinic_info', { p_clinic: cid }),
        ]);
        if (!alive) return;
        setPosts(((p.data ?? []) as Row[]).map(fromRow));
        const r = (Array.isArray(i.data) ? i.data[0] : i.data) as Record<string, unknown> | undefined;
        setInfo(r ? {
          hasDomain: !!r.has_domain, claimed: !!r.claimed, iAmAdmin: !!r.i_am_admin,
          animals: (r.about_animals as string[]) ?? [], devices: (r.about_devices as string[]) ?? [],
          languages: (r.about_languages as string[]) ?? [], before: (r.about_before as string) ?? '',
          aboutAt: (r.about_at as string) ?? null,
        } : null);
      } catch { /* prázdny stav */ } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [cid, tick]);
  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { posts, info, loading, reload };
}

export interface NewClinicRating {
  clinicId: string;
  paws: number;
  body: string;
  photos: string[];
  chips: string[];
  beenThere: boolean;
}

/** Zapíše (alebo prepíše) hodnotenie. Fotky hneď pošle AINUBISOVI (cron zametie, čo ostane). */
export async function rateClinic(n: NewClinicRating): Promise<string> {
  const { data, error } = await rpc('rate_clinic', {
    p_clinic: n.clinicId, p_paws: n.paws, p_body: n.body, p_photos: n.photos,
    p_chips: n.chips, p_been_there: n.beenThere,
  });
  if (error) throw error;
  const id = String(data);
  if (n.photos.length) void db.functions.invoke('review-place-photo', { body: { postId: id } });
  reloadStats();
  return id;
}

export async function deleteClinicRating(id: string): Promise<void> {
  const { error } = await rpc('delete_place_post', { p_id: id });
  if (error) throw error;
  reloadStats();
}

export async function reportClinicPost(id: string, reason: string, note?: string): Promise<void> {
  const { error } = await rpc('report_clinic_post', { p_post: id, p_reason: reason, p_note: note ?? null });
  if (error) throw error;
}

// ── SPRÁVCA ──
export async function replyClinicPost(id: string, body: string): Promise<void> {
  const { error } = await rpc('reply_clinic_post', { p_post: id, p_body: body });
  if (error) throw error;
}

export async function updateClinicAbout(cid: string, a: { animals: string[]; devices: string[]; languages: string[]; before: string }): Promise<void> {
  const { error } = await rpc('update_clinic_about', {
    p_clinic: cid, p_animals: a.animals, p_devices: a.devices, p_languages: a.languages, p_before: a.before,
  });
  if (error) throw error;
}

/** Zmena čísla alebo hodín ide AINUBISOVI na posúdenie, nie priamo do profilu. */
export async function requestClinicChange(cid: string, what: 'tel' | 'hours', value: string): Promise<void> {
  const { error } = await rpc('request_clinic_change', { p_clinic: cid, p_what: what, p_value: value });
  if (error) throw error;
}

/** Krok 1 prevzatia: pošle odkaz na e-mail. Chyby: `bad_domain` (e-mail nie je na doméne webu),
 *  `no_domain` (klinika nemá web), `claimed`, `rate_limit`. */
export async function startClinicClaim(cid: string, email: string, lang: string): Promise<void> {
  // Jazyk mailu: sk | cs | inak en (šablóna šatu V1 má tri znenia).
  const mailLang = lang === 'sk' || lang === 'cs' ? lang : 'en';
  const { data, error } = await db.functions.invoke('clinic-claim', { body: { action: 'start', cid, email, lang: mailLang } });
  if (error) {
    let code = 'error';
    try { code = (await (error as { context?: Response }).context?.json())?.error ?? code; } catch { /* nič */ }
    throw new Error(code);
  }
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
}

/** Krok 2: odkaz z mailu (`?prevzat=<token>`) → človek je správca. */
export async function confirmClinicClaim(token: string): Promise<string> {
  const { data, error } = await db.functions.invoke('clinic-claim', { body: { action: 'confirm', token } });
  if (error) {
    let code = 'error';
    try { code = (await (error as { context?: Response }).context?.json())?.error ?? code; } catch { /* nič */ }
    throw new Error(code);
  }
  return (data as { cid: string }).cid;
}
