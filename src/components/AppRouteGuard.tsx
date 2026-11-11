import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IS_APP } from '@/lib/isApp';

// ── STRÁŽ CIEST V APPKE (19. 10. 2026) ──────────────────────────────────────────
// Appka = len /pack (+ prihlásenie a právne texty). Čokoľvek iné je web: stena, DOGMA,
// karta psa `/dog/…` — tie sa otvoria v systémovom prehliadači a appka ostane, kde bola.
// Nákup sa v appke neotvorí VÔBEC, ani v prehliadači (Apple 3.1.1): `/checkout`, `/payment`, `/entry`,
// `/welcome`, holé `/heroglyph` a z flowu pokladničné kroky `/heroglyph/stay`, `/heroglyph/vstupne` a `/heroglyph/welcome`.
// 🆕 7. 11. 2026 (registrácia zadarmo): samotný HEROFLOW `/heroglyph/<krok>` appka PUSTÍ — vytvorenie
// heroglyfu je zadarmo a končí hosťom + kódom na e-mail (`lib/appRegister.ts`), nie pokladňou.
// Tlačidlo odhalenia v appke preto nejde na `/checkout` (viď `FlowRevealScreen`).
// Odkazy na nákup `a[href^="/heroglyph"]` skrýva CSS pravidlo v index.css (ostáva); tlačidlá flowu sú
// <button>, nie <a>, takže ich nezasiahne. Táto stráž chytá zvyšok — programové `navigate()` a priame adresy.
// Na webe sa komponent nevykreslí vôbec.

const APP_PATHS = /^\/(pack|login|privacy|terms|lost)(\/|$|\?)/;
const PURCHASE = /^\/(checkout|payment|entry|welcome)(\/|$)|^\/heroglyph(\/?$|\/(stay|welcome|vstupne)(\/|$))/;
const FLOW = /^\/heroglyph\/[^/]+/;

function Guard() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (APP_PATHS.test(pathname) || (FLOW.test(pathname) && !PURCHASE.test(pathname))) return;
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
