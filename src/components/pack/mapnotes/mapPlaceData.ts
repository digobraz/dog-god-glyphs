// PROFIL MIESTA NA MAPE — hodnotenie a postrehy k značke (parkovisko, unikát).
// Migrácia: `vystupy/supabase/migrations/20270110_map_place_profil.sql` · nákres `plany/nakresy/parkovisko-camping-2026-11-23/`.
//
// Nie je to nová tabuľka recenzií (lock /pack §4.3): postreh je `place_posts` s druhom 'note' a väzbou `note_id`
// na značku — rovnaká cesta ako hodnotenie kliniky (`geo/clinicPosts.ts`). Fotky (max 3) posúdi AINUBIS
// (`review-place-photo`) ako pri každom postreh k miestu. Hodnotí člen so psom, ktorý odklikne „Boli sme tu".
//
// ⚠️ DEV BEZ PRIHLÁSENIA (`VITE_PACK_NOAUTH=1`): RPC nejdú (anon), postrehy žijú v `localStorage` ako rekvizita
// pre jednu skúšku flow — rovnaký dôvod ako `devMockNotes.ts`. Do produkčného buildu sa vetva nedostane.
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { hasSession } from '@/lib/hasSession';
import { DEV_NOAUTH } from './devMockNotes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const PLACE_MAX_PHOTOS = 3;
export const PLACE_BODY_MAX = 1200;

export interface PlaceProfilePost {
  id: string;
  paws: number | null;
  body: string;
  photos: string[];
  /** 'pending' vidí len autor — fotky ešte kontroluje AINUBIS */
  review: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  isMine: boolean;
  authorFirst: string | null;
  packNumber: number | null;
  avatarUrl: string | null;
}

interface Row {
  id: string; paws: number | null; body: string | null; photos: string[] | null; photo_review: string;
  created_at: string; is_mine: boolean; author_first: string | null; pack_number: number | null; avatar_url: string | null;
}
const fromRow = (r: Row): PlaceProfilePost => ({
  id: r.id, paws: r.paws, body: r.body ?? '', photos: r.photos ?? [],
  review: (r.photo_review as PlaceProfilePost['review']) ?? 'approved', createdAt: r.created_at,
  isMine: !!r.is_mine, authorFirst: r.author_first, packNumber: r.pack_number, avatarUrl: r.avatar_url,
});

// ── DEV mock ────────────────────────────────────────────────────────────────
const MOCK_KEY = 'dogypt.dev.mapplace.v1';
type MockRow = PlaceProfilePost & { noteId: string };
const mockRead = (): MockRow[] => { try { return JSON.parse(localStorage.getItem(MOCK_KEY) ?? '[]') as MockRow[]; } catch { return []; } };
const mockWrite = (l: MockRow[]) => { try { localStorage.setItem(MOCK_KEY, JSON.stringify(l)); } catch { /* plné úložisko */ } };

export interface PlaceStats { n: number; avg: number }

export function useMapPlacePosts(noteId: string | undefined): {
  posts: PlaceProfilePost[]; stats: PlaceStats | null; loading: boolean; reload: () => void;
} {
  const [posts, setPosts] = useState<PlaceProfilePost[]>([]);
  const [stats, setStats] = useState<PlaceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!noteId) return;
    let alive = true;
    setLoading(true);
    void (async () => {
      try {
        if (DEV_NOAUTH) {
          const list = mockRead().filter((m) => m.noteId === noteId);
          const rated = list.filter((m) => m.paws != null);
          if (!alive) return;
          setPosts(list.filter((m) => m.isMine || m.body.trim() || m.photos.length));
          setStats(rated.length ? { n: rated.length, avg: rated.reduce((s, m) => s + (m.paws ?? 0), 0) / rated.length } : null);
          return;
        }
        if (!(await hasSession())) return;
        const [p, s] = await Promise.all([
          db.rpc('list_map_place_posts', { p_note: noteId }),
          db.rpc('map_place_paw_stats', { p_note: noteId }),
        ]);
        if (!alive) return;
        setPosts(((p.data ?? []) as Row[]).map(fromRow));
        const r = (Array.isArray(s.data) ? s.data[0] : s.data) as { n?: number; avg?: number | string } | undefined;
        setStats(r && r.n ? { n: r.n, avg: Number(r.avg) } : null);
      } catch { /* prázdny stav */ } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [noteId, tick]);
  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { posts, stats, loading, reload };
}

export interface NewPlaceRating {
  noteId: string;
  /** null = len fotka zakladateľa pri vzniku miesta */
  paws: number | null;
  body: string;
  photos: string[];
}

/** Zapíše (alebo prepíše) hodnotenie. Fotky hneď pošle AINUBISOVI (cron zametie, čo ostane). */
export async function rateMapPlace(n: NewPlaceRating): Promise<string> {
  if (DEV_NOAUTH) {
    const id = `dev-place-${Date.now()}`;
    mockWrite([...mockRead().filter((m) => !(m.noteId === n.noteId && m.isMine)), {
      id, noteId: n.noteId, paws: n.paws, body: n.body, photos: n.photos, review: 'approved', createdAt: new Date().toISOString(),
      isMine: true, authorFirst: 'Matej', packNumber: 1, avatarUrl: null,
    }]);
    return id;
  }
  const { data, error } = await db.rpc('rate_map_place', {
    p_note: n.noteId, p_paws: n.paws, p_body: n.body, p_photos: n.photos, p_been_there: true,
  });
  if (error) throw error;
  const id = String(data);
  if (n.photos.length) void supabase.functions.invoke('review-place-photo', { body: { postId: id } });
  return id;
}

export async function deleteMapPlacePost(id: string): Promise<void> {
  if (DEV_NOAUTH) { mockWrite(mockRead().filter((m) => m.id !== id)); return; }
  const { error } = await db.rpc('delete_place_post', { p_id: id });
  if (error) throw error;
}

export async function reportMapPlacePost(id: string, reason: string): Promise<void> {
  if (DEV_NOAUTH) return;
  const { error } = await db.rpc('report_map_place_post', { p_post: id, p_reason: reason, p_note: null });
  if (error) throw error;
}

/** Staré parkovisko bez údaja o cene: doplní ho prvý, kto vie. `false` = už ho niekto doplnil. */
export async function fillParkingPaid(noteId: string, paid: boolean): Promise<boolean> {
  if (DEV_NOAUTH) {
    try {
      const raw = JSON.parse(localStorage.getItem('dogypt.dev.mapnotes.v1') ?? '[]') as { id: string; paid: boolean | null }[];
      localStorage.setItem('dogypt.dev.mapnotes.v1', JSON.stringify(raw.map((x) => (x.id === noteId && x.paid == null ? { ...x, paid } : x))));
    } catch { /* nič */ }
    return true;
  }
  const { data, error } = await db.rpc('fill_parking_paid', { p_note: noteId, p_paid: paid });
  if (error) throw error;
  return !!data;
}
