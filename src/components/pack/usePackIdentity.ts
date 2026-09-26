import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getMyAffiliate, getPackStats } from '@/lib/sharedFetch';
import { hydratePackStore } from '@/lib/packStore';
import { DEV_NOAUTH, DEV_MOCK_DOGS } from '@/lib/devMockDogs';
import { getAccessibleDogIds } from '@/lib/dogRights';

export interface PackDog {
  id: string;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  // 17. 9. 2026 (B20 psie km): pribudlo kvôli pripisovaniu výletu psom — nový výlet
  // sa nemá ako pripísať psovi, ktorý už odišiel. Chýbajúca hodnota = 'alive'
  // (starý riadok, DEV mock), rovnako ako to číta zvyšok appky.
  life_status?: string | null;
}

export interface PackIdentity {
  session: Session | null;
  loading: boolean;
  dogs: PackDog[];
  devotion: number;
  bones: number;
  avatarUrl: string | null;
  avatarInitial: string;
  packTotal: number | null;
  packToday: number | null;
}


// Shared identity hook for every /pack surface — session load + auth redirect
// (/login) + dogs (payment_status='paid') + devotion + bones (affiliate
// points) + avatarUrl + empire stats (packTotal/packToday). Extracted 1:1 from
// PackLayout so full-bleed surfaces (Portal Trips map) can render their own
// <DevotionHeader> without going through PackLayout's max-w column shell.
// LOCKED pattern — PackLayout.tsx consumes this same hook; behavior MUST stay
// byte-identical to what was inline before this extraction (2026-07-22).
export function usePackIdentity(): PackIdentity {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  /**
   * PRIHLÁSENIE JE ZNÁME (26. 9. 2026, audit /pack/map B4). `loading` padá až po štyroch
   * volaniach za sebou (session → link_my_dogs → my_dog_rights → dogs); mapa k vykresleniu
   * potrebuje len prvé. Kto chce kresliť skôr, pýta sa tohto — `loading` sa NEMENÍ, lebo
   * povrchy ako „nemáš živého psa" (`!loading && !hasLiveDog`) čítajú prázdny zoznam psov
   * ako odpoveď a skorší pád by ich oklamal.
   */
  const [sessionReady, setSessionReady] = useState(false);
  const [dogs, setDogs] = useState<PackDog[]>([]);
  const [devotion, setDevotion] = useState(100);
  const [bones, setBones] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [packTotal, setPackTotal] = useState<number | null>(null);
  const [packToday, setPackToday] = useState<number | null>(null);

  // Empire stats — identical header on every tab so the member always sees live state.
  useEffect(() => {
    let alive = true;
    getPackStats<{ total?: number; last24h?: number }>()
      .then((j) => {
        if (!alive) return;
        setPackTotal(typeof j?.total === 'number' ? j.total : null);
        setPackToday(typeof j?.last24h === 'number' ? j.last24h : null);
      })
      .catch(() => { /* best-effort */ });
    return () => { alive = false; };
  }, []);

  // Live devotion refresh — listens for grant events dispatched by Pack.tsx / VisionRoadmap.tsx.
  useEffect(() => {
    function handler(e: Event) {
      const total = (e as CustomEvent<{ total: number }>).detail?.total;
      if (typeof total === 'number') setDevotion(total);
    }
    window.addEventListener('dogypt:devotion', handler);
    return () => { window.removeEventListener('dogypt:devotion', handler); };
  }, []);

  useEffect(() => {
    let mounted = true;

    // DEV-ONLY auto sign-in for local /pack review. Guarded by import.meta.env.DEV,
    // which is FALSE in any production build (Lovable publish) → this branch is dead code
    // in prod. Opt-in via VITE_DEV_AUTH=1 + creds in .env.local (gitignored). Never ships.
    const DEV_AUTH =
      import.meta.env.DEV &&
      import.meta.env.VITE_DEV_AUTH === '1' &&
      !!import.meta.env.VITE_DEV_AUTH_EMAIL &&
      !!import.meta.env.VITE_DEV_AUTH_PASSWORD;

    // DEV-ONLY no-auth bypass for local/tunnel review of gated /pack. Never
    // ships (import.meta.env.DEV). Opt-in via VITE_PACK_NOAUTH=1. NECOMMITOVAŤ.
    const DEV_NOAUTH = import.meta.env.DEV && import.meta.env.VITE_PACK_NOAUTH === '1';
    const MOCK_SESSION = {
      user: { id: '00000000-0000-0000-0000-000000000000', email: 'guest@dogypt.dev', user_metadata: {} },
    } as unknown as Session;

    async function ensureSession(): Promise<Session | null> {
      if (DEV_NOAUTH) return MOCK_SESSION;
      const { data: { session: s } } = await supabase.auth.getSession();
      if (s || !DEV_AUTH) return s;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: import.meta.env.VITE_DEV_AUTH_EMAIL as string,
        password: import.meta.env.VITE_DEV_AUTH_PASSWORD as string,
      });
      if (error) console.warn('[DEV_AUTH] auto sign-in failed:', error.message);
      return data.session;
    }

    ensureSession().then(async (s) => {
      if (!mounted) return;
      if (s) {
        setSession(s);
        setSessionReady(true);
        // ⚠️ Pri DEV_NOAUTH sa Supabase NEVOLÁ. Mock session nemá token, takže tieto
        // volania aj tak nič nevrátia — ale nie sú zadarmo: `rpc()` si pýta prístupový
        // token, a ten sa berie cez zámok prehliadača (`navigator.locks`). Keď ten zámok
        // v profile uviazne (stáva sa po tvrdom zabití karty), volanie sa NEVRÁTI NIKDY
        // a celý `/pack` ostane na „NAČÍTAVAM…" — vyzerá to ako mŕtva appka, pritom je to
        // zaseknutý prehliadač. Preskočením zámku prežije prehliadka aj taký profil.
        if (!DEV_NOAUTH) {
          try { await supabase.rpc('link_my_dogs'); } catch { /* non-blocking */ }
        }
        if (!mounted) return;
        // Perzistencia výletov (issue #32): raz za návštevu stiahne stav z Supabase do
        // localStorage a odošle, čo sa naklikalo offline. Zámerne BEZ await — hydratácia
        // nesmie zdržať vykreslenie /packu; hotové povrchy si prečítajú znova cez
        // onPackStoreHydrated(). Pri DEV_NOAUTH (mock session bez reálneho tokenu) sa
        // vnútri sama vypne a store beží lokálne.
        void hydratePackStore();
        try {
          // B3c: zoznam ide z práv (`my_dog_rights()`), nie z vlastníctva. Majiteľovi
          // vráti tú istú množinu; pri `null` (RPC zlyhala) ostáva dnešný filter.
          const accessIds = DEV_NOAUTH ? null : await getAccessibleDogIds();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let identityQuery = DEV_NOAUTH ? null : (supabase as any)
            .from('dogs')
            .select('id, dog_name, cloudinary_main_url, created_at, life_status')
            // paid only — link_my_dogs also links abandoned checkout drafts by
            // email, so without this the header switcher lists a dog once per
            // attempt (BELGA showed 3×: 1 paid + 2 drafts). Pack.tsx already
            // filters the same way; keep the two in sync.
            .eq('payment_status', 'paid');
          if (identityQuery) {
            identityQuery = accessIds
              ? identityQuery.in('id', accessIds)
              : identityQuery.eq('user_id', s.user.id);
          }
          const { data: dogRows } = identityQuery
            ? await identityQuery.order('created_at', { ascending: true }) as { data: PackDog[] | null }
            : { data: null };
          if (mounted && dogRows) setDogs(dogRows.map(d => ({
            id: d.id,
            dog_name: d.dog_name ?? null,
            cloudinary_main_url: d.cloudinary_main_url ?? null,
            life_status: d.life_status ?? null,
          })));
          // DEV bez prihlásenia: mock session existuje, ale v DEV projekte žiadny pes nie je,
          // takže každý povrch, ktorý svorku ukazuje (hlavička mapy, reveal po zápise výletu),
          // vyzerá ako človek bez psa. To je chýbajúce dáta, nie dizajn — presne ten omyl,
          // pre ktorý vznikol `devMockDogs.ts`. Zapája sa TEN ISTÝ modul, nie ďalšia kópia.
          if (mounted && DEV_NOAUTH && !(dogRows && dogRows.length)) {
            setDogs(DEV_MOCK_DOGS.map((d) => ({
              id: d.id,
              dog_name: d.dog_name,
              cloudinary_main_url: d.cloudinary_main_url,
            })));
          }
        } catch { /* non-blocking */ }
        if (!mounted) return;
        const meta = (s.user.user_metadata ?? {}) as Record<string, unknown>;
        if (mounted) {
          setDevotion(Number(meta.devotion) || 100);
          setAvatarUrl((meta.avatar_url || meta.avatar || null) as string | null);
        }
        // BONES = affiliate currency (affiliates.points). Single source of truth
        // for the header chip — NOT user_metadata.bones (legacy, always 0).
        // ⚠️ Od 26. 9. 2026 BEZ `await`: BONES čaká len čip v hlavičke, nie celá stránka.
        //    Dovtedy bolo toto piate volanie v rade pred `setLoading(false)` a celý `/pack`
        //    kvôli nemu ukazoval „NAČÍTAVAM…" o jedno kolo dlhšie. Volanie sa zdieľa
        //    s Pack.tsx a FounderInvite (`sharedFetch`), takže ide na sieť raz.
        if (!DEV_NOAUTH) {
          void getMyAffiliate<{ points?: number }>().then(({ data: aff }) => {
            const row = aff?.[0];
            if (mounted && row) setBones(Number(row.points) || 0);
          });
        }
      }
      setSession(s);
      setLoading(false);
      if (!s) {
        const ret = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?return=${ret}`, { replace: true });
      }
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return;
      // INITIAL_SESSION duplikuje ensureSession() vyššie — bez tohto guardu sa
      // pri mounte bez session zavolal navigate('/login') dvakrát.
      if (event === 'INITIAL_SESSION') return;
      if (!s && DEV_NOAUTH) return;
      setSession(s);
      if (!s) {
        const ret = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?return=${ret}`, { replace: true });
      }
    });
    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const avatarInitial = (session?.user?.email?.[0] ?? 'D').toUpperCase();

  return { session, loading, sessionReady, dogs, devotion, bones, avatarUrl, avatarInitial, packTotal, packToday };
}
