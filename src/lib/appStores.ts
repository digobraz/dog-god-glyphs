// ════════════════════════════════════════════════════════════════════════════
// APPKA V OBCHODOCH — JEDEN VYPÍNAČ PRE CELÝ WEB (17. 11. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 17. 11. nad koncom heroflowu: *„ok (ale pri flipe budeme počítať s tým, že appka už bude ready —
// prípadne to dajme na web, ale musíme myslieť na to, že ak bude appka ready, musíme to zmeniť)"*.
//
// Kým `APP_IN_STORES` je false, „do appky" znamená webovú appku `/pack` (človek je po kóde z e-mailu
// už prihlásený). Keď appka vyjde v App Store a Google Play, prepni na true — koniec heroflowu sa sám
// zmení na „Stiahnuť appku" a pošle človeka na `/get`.
// 🔑 ADRESY OBCHODOV SÚ NA JEDNOM MIESTE: `/get` vo workeri (`scripts/cloudflare/worker.js`, APP_STORE ·
//    PLAY_STORE) presmeruje podľa telefónu, PC ide na `/`. Tu sa nepíšu druhýkrát.
// ════════════════════════════════════════════════════════════════════════════

export const APP_IN_STORES = false;

/** Kam vedie „do appky": `/get` (worker → obchod podľa telefónu), kým appka nie je vonku, webová appka. */
export function appTarget(): { href: string; store: boolean } {
  return APP_IN_STORES ? { href: '/get', store: true } : { href: '/pack', store: false };
}
