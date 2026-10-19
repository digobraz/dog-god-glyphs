import type { CapacitorConfig } from '@capacitor/cli';

// ── APPKA DOGYPT (Capacitor, 19. 10. 2026) ──────────────────────────────────────
// Appka = len /pack pre členov, v appke sa NEKUPUJE (plány/appka-store-plan-2026-10-05.md).
// 🔴 appId sa po prvom nahratí do obchodu NEDÁ zmeniť (Matej 19. 10.: „ok“ na com.dogypt.app).
// Obsah sa balí z `dist/` (`npm run app:sync`), neťahá sa naživo z dogypt.com.
const config: CapacitorConfig = {
  appId: 'com.dogypt.app',
  appName: 'DOGYPT',
  webDir: 'dist',
  android: {
    // Mapa, fotky a Supabase idú cez https; zmiešaný obsah netreba.
    allowMixedContent: false,
  },
};

export default config;
