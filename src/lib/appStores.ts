// ════════════════════════════════════════════════════════════════════════════
// APPKA V OBCHODOCH — JEDEN VYPÍNAČ PRE CELÝ WEB (17. 11. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 17. 11. nad koncom heroflowu: *„ok (ale pri flipe budeme počítať s tým, že appka už bude ready —
// prípadne to dajme na web, ale musíme myslieť na to, že ak bude appka ready, musíme to zmeniť)"*.
//
// Kým `APP_IN_STORES` je false, „do appky" znamená webovú appku `/pack` (človek je po kóde z e-mailu
// už prihlásený). Keď appka vyjde v App Store a Google Play: doplň dve adresy nižšie a prepni na true —
// koniec heroflowu sa sám zmení na „Stiahnuť appku" s odkazom do obchodu podľa telefónu.
// 🔴 Nikde inde sa obchod nerieši natvrdo — nový odkaz „stiahni appku" ber odtiaľto.
// ════════════════════════════════════════════════════════════════════════════

export const APP_IN_STORES = false;
export const APP_STORE_URL = '';
export const PLAY_STORE_URL = '';

/** Kam vedie „do appky": obchod podľa telefónu, inak webová appka. */
export function appTarget(): { href: string; store: boolean } {
  if (APP_IN_STORES && typeof navigator !== 'undefined') {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua) && APP_STORE_URL) return { href: APP_STORE_URL, store: true };
    if (/Android/i.test(ua) && PLAY_STORE_URL) return { href: PLAY_STORE_URL, store: true };
  }
  return { href: '/pack', store: false };
}
