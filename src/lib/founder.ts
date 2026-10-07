// Účet zakladateľa — vlastný ľahký modul (perf 7. 10. 2026). MapGate je v hlavnom balíku a kvôli
// tejto jednej konštante doňho cez packCommunity.ts ťahal packStore, tripShared, mapu SR a ďalšie
// (~70 kB). packCommunity.ts ju ďalej exportuje, ostatné importy sa nemenia.
export const FOUNDER_ACCOUNT_EMAIL = 'hekthorsk@gmail.com';
export const isFounderEmail = (email?: string | null) =>
  (email ?? '').toLowerCase() === FOUNDER_ACCOUNT_EMAIL;
