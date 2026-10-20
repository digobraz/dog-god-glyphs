import type { CapacitorConfig } from '@capacitor/cli';

// ── APPKA DOGYPT (Capacitor, 19. 10. 2026) ──────────────────────────────────────
// Appka = len /pack pre členov, v appke sa NEKUPUJE (plány/appka-store-plan-2026-10-05.md).
// 🔴 appId sa po prvom nahratí do obchodu NEDÁ zmeniť (Matej 19. 10.: „ok“ na com.dogypt.app).
// ⚠️ iPhone ostrá appka má bundle **com.dogypt.ios** (project.pbxproj) — com.dogypt.app zabral 20. 10.
//    bezplatný osobný Apple tím pri teste v telefóne; Matej 20. 10.: „daj to ios“. Android ostáva com.dogypt.app.
// Obsah sa balí z `dist/` (`npm run app:sync`), neťahá sa naživo z dogypt.com.
//
// DVE APPKY (20. 10. 2026): `CAP_TARGET=dev` = „DOGYPT DEV" na DEV Supabase, obsah z
// `dist-appdev/` (`npm run app:sync:dev`). Iné ID (`com.dogypt.app.dev`) určuje natívna
// strana — Android flavor `dev`, iOS build setting pri `app:ios:dev` — tu sa mení len to,
// odkiaľ sa berie web.
const DEV = process.env.CAP_TARGET === 'dev';

const config: CapacitorConfig = {
  appId: 'com.dogypt.app',
  appName: 'DOGYPT',
  webDir: DEV ? 'dist-appdev' : 'dist',
  android: {
    // Mapa, fotky a Supabase idú cez https; zmiešaný obsah netreba.
    allowMixedContent: false,
  },
  plugins: {
    // AKTUALIZÁCIE BEZ OBCHODU (20. 10. 2026): appka si po každom `go-live` stiahne z dogypt.com
    // zmenené súbory webu (`lib/appUpdate.ts`, zoznam `dist/app-update.json`). Režim RUČNÝ —
    // o všetkom rozhoduje náš kód, žiadny server Capgo. Všetky ich adresy sú prázdne: appka
    // nikam nehlási zariadenie ani štatistiky (GDPR, `/privacy`).
    CapacitorUpdater: {
      autoUpdate: false,
      updateUrl: '',
      statsUrl: '',
      channelUrl: '',
      // Nová verzia, ktorá do 10 s nezavolá notifyAppReady (spadla pri štarte), sa sama vráti späť.
      appReadyTimeout: 10000,
      // Nová appka z obchodu zahodí stiahnuté verzie a začne zo svojho balíka.
      resetWhenUpdate: true,
    },
  },
};

export default config;
