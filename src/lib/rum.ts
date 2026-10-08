/**
 * MERANIE U REÁLNYCH NÁVŠTEVNÍKOV (7. 10. 2026, rýchlosť fáza 3).
 *
 * PageSpeed je laboratórium: jeden simulovaný telefón na simulovanom 4G. Či je dogypt.com
 * rýchly naozaj, vedia povedať len ľudia, čo ho otvárajú. Každá návšteva pošle do PostHogu
 * päť čísel (event `web_vital`): LCP, FCP, CLS, INP, TTFB — s cestou, jazykom, typom siete
 * a tým, či stránka prišla s hotovým HTML (`prerender`, scripts/prerender.mjs).
 *
 * `web-vitals` sa dotiahne až po `load` (main.tsx) — hodnoty sa nestratia, knižnica číta
 * záznamy prehliadača spätne (`buffered`). Eventy čakajú vo fronte analytics.ts, kým sa
 * PostHog nezapne. Cesta ide cez `maskPath`-like orez: len prvé dva segmenty, nech
 * sa do analytiky nedostane token ani meno psa.
 *
 * 🔴 LCP 5–40 ms nie je chyba merania: je to `nav: 'back-forward-cache'` — návrat tlačidlom
 * Späť, stránka sa obnoví z pamäte a web-vitals ju rátajú ako novú návštevu (overené
 * v PostHogu 8. 10. 2026, všetky hodnoty pod 50 ms mali tento `nav`). Pri vyhodnotení
 * ber `nav = 'navigate'`, bfcache ukazuj zvlášť.
 */
import { trackVital } from './analytics';

export function startRum(prerendered: boolean) {
  import('web-vitals/attribution').then(({ onLCP, onFCP, onCLS, onINP, onTTFB }) => {
    const path = location.pathname.split('/').slice(0, 3).join('/') || '/';
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType;
    const send = (m: { name: string; value: number; rating: string; navigationType: string; attribution?: unknown }) => {
      const a = m.attribution as Record<string, unknown> | undefined;
      trackVital({
        metric: m.name,
        // CLS je bez jednotky, ostatné v ms.
        value: m.name === 'CLS' ? Math.round(m.value * 1000) / 1000 : Math.round(m.value),
        rating: m.rating,
        path,
        prerender: prerendered,
        nav: m.navigationType,
        conn,
        // Čo bolo najväčšie / čo sa hýbalo / na čo človek ťukol — skrátené, bez textu stránky.
        target: String(a?.target ?? a?.largestShiftTarget ?? a?.interactionTarget ?? '').slice(0, 120) || undefined,
      });
    };
    onLCP(send); onFCP(send); onCLS(send); onINP(send); onTTFB(send);
  }).catch(() => { /* meranie nesmie zhodiť stránku */ });
}
