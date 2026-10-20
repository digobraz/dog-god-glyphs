// ── ODKAZY VON Z APPKY (Capacitor, 20. 10. 2026) ────────────────────────────────
// Appka = len /pack, prihlásenie a právne texty. Všetko ostatné (stena `/`, DOGMA, `/dog/…`,
// externé URL, Mapy.com, mailto) sa otvorí v SYSTÉMOVOM prehliadači, nie vo vnútri appky.
// JEDNO centrálne miesto: globálny click na `<a>` + `window.open` + `openExternal()` pre kód,
// ktorý odkaz nekreslí. Nákup (`/heroglyph…`) sa v appke neotvorí vôbec (Apple 3.1.1) —
// rovnaké pravidlo ako `AppRouteGuard.tsx` (ten chytá programové `navigate()`).
// Na webe sa nič nespustí: `startAppLinks()` je za `IS_APP`.

import { IS_APP } from '@/lib/isApp';

const APP_PATHS = /^\/(pack|login|privacy|terms)(\/|$|\?)/;
const PURCHASE = /^\/(heroglyph|entry|welcome)(\/|$)/;
const WEB_ORIGIN = 'https://dogypt.com';

/** Otvorí adresu v systémovom prehliadači (v appke); na webe nový tab. */
export function openExternal(url: string): void {
  if (!IS_APP) { window.open(url, '_blank', 'noopener,noreferrer'); return; }
  void import('@capacitor/browser').then(({ Browser }) => Browser.open({ url }));
}

/** 'app' = ostáva v appke · 'out' = systémový prehliadač (sprostredkovaná adresa) · 'block' = nákup, nikam · 'native' = mailto/tel */
function classify(raw: string): { kind: 'app' | 'out' | 'block' | 'native'; url?: string } {
  let u: URL;
  try { u = new URL(raw, window.location.href); } catch { return { kind: 'app' }; }
  if (u.protocol === 'mailto:' || u.protocol === 'tel:' || u.protocol === 'sms:') return { kind: 'native' };
  if (u.protocol !== 'http:' && u.protocol !== 'https:' && u.protocol !== 'capacitor:') return { kind: 'app' }; // blob:, data:, javascript:
  if (u.origin === window.location.origin) {
    if (APP_PATHS.test(u.pathname + u.search) || u.pathname === '/') return { kind: 'app' };
    if (PURCHASE.test(u.pathname)) return { kind: 'block' };
    return { kind: 'out', url: WEB_ORIGIN + u.pathname + u.search + u.hash };
  }
  return { kind: 'out', url: u.href };
}

export function startAppLinks(): void {
  if (!IS_APP) return;

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a || a.hasAttribute('download')) return;
    const href = a.getAttribute('href') || '';
    if (!href || href.startsWith('#')) return;
    const c = classify(href);
    if (c.kind === 'app') return;
    e.preventDefault();
    e.stopPropagation();
    if (c.kind === 'out' && c.url) openExternal(c.url);
    else if (c.kind === 'native') window.location.href = href;
  }, true);

  const nativeOpen = window.open.bind(window);
  window.open = ((url?: string | URL, target?: string, features?: string) => {
    if (url == null || url === '') return nativeOpen(url as undefined, target, features);
    const c = classify(String(url));
    if (c.kind === 'app') return nativeOpen(url, target, features);
    if (c.kind === 'out' && c.url) openExternal(c.url);
    else if (c.kind === 'native') window.location.href = String(url);
    return null;
  }) as typeof window.open;
}
