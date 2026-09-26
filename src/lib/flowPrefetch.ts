// ═══════════════════════════════════════════════════════════════════════════
// PREDNAČÍTANIE ĎALŠIEHO KROKU VSTUPU (26. 9. 2026)
//
// Matej 26. 9.: *„chceme mať súrodý krásny onboarding, hlavne rýchly"*.
// Každý krok je vlastný lazy chunk (`App.tsx`) a do 26. 9. sa začal sťahovať až
// po ťuknutí na POKRAČOVAŤ — medzitým svietila prázdna `RouteFallback` plocha
// (na mobilnej sieti 300–800 ms na každom kroku). Odteraz si krok N, keď je
// prehliadač nečinný, stiahne kód aj Hektorov ksicht kroku N+1.
//
// ⚠️ `import()` tu a `lazy(() => import(...))` v `App.tsx` mieria na TEN ISTÝ
//    modul, takže bundler z nich spraví jeden chunk a druhé volanie ho už len
//    vytiahne z cache. Cesty sa preto musia zhodovať s `App.tsx`.
// ⚠️ Mapa je len o NOVOM vstupe. Chýbajúca cesta = nič sa nestiahne, nič sa
//    nerozbije — krok sa len načíta postaru, po kliku.
// ═══════════════════════════════════════════════════════════════════════════
import { hekthorFaceForPath } from '@/lib/hekthorFaces';

const LOADERS: Record<string, () => Promise<unknown>> = {
  '/heroglyph/name': () => import('@/components/screens/NameScreen'),
  '/heroglyph/dogs': () => import('@/components/screens/DogsScreen'),
  '/heroglyph/email': () => import('@/components/screens/EmailScreen'),
  '/heroglyph/essence': () => import('@/components/screens/EssenceScreen'),
  '/heroglyph/breed': () => import('@/components/screens/PatronScreen'),
  '/heroglyph/dog-character': () => import('@/components/screens/CharacterScreen'),
  '/heroglyph/owner-info': () => import('@/components/screens/OwnerScreen'),
  '/heroglyph/reveal': () => import('@/components/screens/FlowRevealScreen'),
  '/checkout': () => import('@/components/screens/FlowCheckoutScreen'),
};

const done = new Set<string>();

const whenIdle = (fn: () => void) => {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 1500 });
  else window.setTimeout(fn, 400);
};

/** Stiahne kód a ksicht kroku `path` na pozadí. Volá sa opakovane bez škody. */
export function prefetchFlowStep(path: string | undefined) {
  if (!path || done.has(path)) return;
  done.add(path);
  whenIdle(() => {
    LOADERS[path]?.().catch(() => done.delete(path));
    if (path.startsWith('/heroglyph/')) {
      const img = new Image();
      img.decoding = 'async';
      img.src = hekthorFaceForPath(path);
    }
  });
}
