// ── NATÍVNA APPKA (Capacitor, 19. 10. 2026) ─────────────────────────────────────
// Appka = len /pack pre členov a v appke sa NEKUPUJE (Apple 3.1.1 — nákup mimo IAP),
// plány/appka-plan-krok-po-kroku-2026-10-19.md fáza 0. Všetko, čo appka nesmie ukázať
// (ceny, pokladňa, heroflow, cookie lišta), sa pýta TU — nie vlastnou kontrolou na mieste.
//
// `window.Capacitor` vloží natívna strana pred skriptmi stránky; na webe neexistuje.
// Vyhodnotí sa raz — za behu sa to nemení.

type CapWindow = Window & { Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string } };

const cap = typeof window !== 'undefined' ? (window as CapWindow).Capacitor : undefined;

/** Beží kód v natívnej appke (iOS/Android), nie v prehliadači? */
export const IS_APP: boolean = !!cap?.isNativePlatform?.();

/** 'ios' | 'android' v appke, 'web' inde. */
export const APP_PLATFORM: string = IS_APP ? (cap?.getPlatform?.() ?? 'web') : 'web';
