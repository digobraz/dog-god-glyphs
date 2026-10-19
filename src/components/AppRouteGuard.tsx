import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IS_APP } from '@/lib/isApp';

// ── STRÁŽ CIEST V APPKE (19. 10. 2026) ──────────────────────────────────────────
// Appka = len /pack (+ prihlásenie a právne texty). Čokoľvek iné je web: stena, DOGMA,
// karta psa `/dog/…` — tie sa otvoria v systémovom prehliadači a appka ostane, kde bola.
// Nákup (`/heroglyph…`) sa v appke neotvorí VÔBEC, ani v prehliadači (Apple 3.1.1).
// Odkazy na nákup skrýva CSS pravidlo `html.is-app a[href^="/heroglyph"]` v index.css;
// táto stráž chytá zvyšok — programové `navigate()` a priame adresy.
// Na webe sa komponent nevykreslí vôbec.

const APP_PATHS = /^\/(pack|login|privacy|terms)(\/|$|\?)/;
const PURCHASE = /^\/(heroglyph|entry|welcome)(\/|$)/;

function Guard() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (APP_PATHS.test(pathname)) return;
    if (!PURCHASE.test(pathname) && pathname !== '/') {
      const url = `https://dogypt.com${pathname}${search}`;
      void import('@capacitor/browser').then(({ Browser }) => Browser.open({ url }));
    }
    // Späť tam, odkiaľ človek prišiel; keď nie je kam (studený štart na cudzej ceste), na /pack.
    if (window.history.length > 1) navigate(-1);
    else navigate('/pack', { replace: true });
  }, [pathname, search, navigate]);

  return null;
}

export function AppRouteGuard() {
  return IS_APP ? <Guard /> : null;
}
