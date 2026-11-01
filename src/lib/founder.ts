// Účet zakladateľa — vlastný ľahký modul (perf 7. 10. 2026). MapGate je v hlavnom balíku a kvôli
// tejto jednej konštante doňho cez packCommunity.ts ťahal packStore, tripShared, mapu SR a ďalšie
// (~70 kB). packCommunity.ts ju ďalej exportuje, ostatné importy sa nemenia.
export const FOUNDER_ACCOUNT_EMAIL = 'hekthorsk@gmail.com';
export const isFounderEmail = (email?: string | null) =>
  (email ?? '').toLowerCase() === FOUNDER_ACCOUNT_EMAIL;

// Testeri appky (Matej 1. 11. 2026) — ID účtov, nie e-maily: tento súbor ide do verejného balíka.
// Nelka (iPhone) · Danka (Android) · Peťo (Android, účet Evičky).
const APP_TESTER_IDS = new Set([
  'dc0cb9dd-ddee-483a-a110-465a3712fe71',
  '87e7fcff-7fc8-4a2f-9f10-fe0302ac39d7',
  '5ee60d42-e7e3-45b6-a476-479d69247c96',
]);
export const isAppTester = (userId?: string | null) => APP_TESTER_IDS.has(userId ?? '');
