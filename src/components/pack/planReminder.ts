// PRIPOMIENKA V DEŇ VÝLETU — „bol si tam?" (Matej 2026-08-25).
//
// „v deň výletu príde upozornenie či už človek prešiel výlet -áno alebo nie nebol -može odložiť
//  na neskor alebo vymazať?"
//
// 🔴 PUSH NOTIFIKÁCIA V PROJEKTE NEEXISTUJE. Service worker (`/sw-maptiles.js`, `main.tsx`) je
// LEN na dlaždice mapy — žiadny `pushManager`, žiadne odbery. Prvá verzia sa preto pýta pri
// otvorení appky, kartou na úvodnej stránke. Kanál sa dá neskôr vymeniť (mail, push) bez toho,
// aby sa menilo, NA ČO sa pýtame; to je zámer, nie kompromis naslepo.
//
// Rozhodnutia Mateja (25. 8.), ktoré tento súbor vykonáva:
//  · „nešiel som" = plán ostáva **iba v tripliste u autora, nikde inde** (z mapy aj z plánov von)
//  · karta sa pýta **7 dní**, potom prestane a plán ostane v tripliste ako neuskutočnený
//  · body za plán = 0, takže tu sa nič neodmieňa; odmena príde až za zápis
import { planDeadline } from './addtrip/planDate';

/** Koľko dní po konci plánu sa appka ešte pýta. Potom stíchne. */
export const ASK_WINDOW_DAYS = 7;

const KEY = 'trp-plan-missed';

const store = (() => {
  try { const k = '__trp_plan_probe'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; }
  catch { return sessionStorage; }
})();

/** tripId → kedy človek povedal „nešiel som". */
export function readMissedPlans(): Record<string, number> {
  try { return JSON.parse(store.getItem(KEY) || '{}') as Record<string, number>; }
  catch { return {}; }
}

export function markPlanMissed(tripId: string): void {
  try { store.setItem(KEY, JSON.stringify({ ...readMissedPlans(), [tripId]: Date.now() })); }
  catch { /* plné úložisko — pripomienka sa v horšom prípade spýta znova */ }
}

export function isPlanMissed(tripId: string): boolean {
  return tripId in readMissedPlans();
}

/** Človek plán presunul → prestal byť neuskutočnený, aj keby ním predtým bol. */
export function clearPlanMissed(tripId: string): void {
  try {
    const all = readMissedPlans();
    delete all[tripId];
    store.setItem(KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

const DAY_MS = 86400000;

/** Rozdiel KALENDÁRNYCH dní (rovnaká konvencia ako `NextTripCard.daysFromNow`). */
function dayDiff(iso: string, nowMs: number): number {
  const target = new Date(`${iso}T00:00:00`).getTime();
  const today = new Date(nowMs);
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today.getTime()) / DAY_MS);
}

export type PlanPhase = 'upcoming' | 'ask' | 'gone';

/**
 * V akej fáze je plán s týmto dátumom.
 *
 * ⚠️ POČÍTA SA Z KONCA OBDOBIA, NIE ZO ZAČIATKU. Plán vie byť „niekedy v septembri"; pýtať sa
 * 1. septembra, či tam už bol, je tá istá chyba, akú Matej vytkol pri „nepamätám si dátum" —
 * appka sa pýta na niečo, čo ešte nemohlo nastať. `planDeadline()` vráti posledný deň, ktorý
 * plán pokrýva: pri presnom dátume ten deň, pri týždni jeho koniec, pri mesiaci koniec mesiaca.
 */
export function planPhase(date: string | undefined | null, nowMs: number): PlanPhase {
  const end = planDeadline(date);
  if (!end) return 'upcoming';
  const d = dayDiff(end, nowMs);
  if (d > 0) return 'upcoming';
  if (d >= -ASK_WINDOW_DAYS) return 'ask';
  return 'gone';
}
