import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { preloadActiveLang } from "./i18n/LanguageContext";
import { initAnalytics } from "./lib/analytics";
import { startEarlyGridDogs } from "./lib/earlyFetch";
import { scrubSecrets } from "./lib/packAnalytics";
// Testovacie dáta z dielne vstupu (`/lab/heroflow`) musia byť v store SKÔR, než
// sa vykreslí prvá obrazovka — obrazovky flow si store kopírujú do lokálneho
// stavu pri prvom renderi. Telo modulu je celé za `import.meta.env.DEV`.
import "./lib/devSeedApply";

// ── STARÁ ZÁLOŽKA PO DEPLOYI (5. 10. 2026, test po FLIPe) ─────────────────────
// Každý deploy zmení hashe chunkov. Záložka otvorená pred deployom pri lazy navigácii
// pýta starý chunk, Cloudflare (SPA fallback) vráti index.html a import padne na
// „MIME type text/html" ⇒ „Something went wrong". Vite vtedy vyšle `vite:preloadError`:
// stránku raz obnovíme (dostane nový index aj chunky). Poistka proti slučke: ďalší
// reload najskôr o 30 s — keby chunk chýbal aj v novom builde, ukáže sa chyba ako doteraz.
window.addEventListener("vite:preloadError", (event) => {
  try {
    const last = Number(sessionStorage.getItem("dogypt_chunk_reload") || 0);
    if (Date.now() - last < 30_000) return;
    sessionStorage.setItem("dogypt_chunk_reload", String(Date.now()));
  } catch { return; /* bez sessionStorage nevieme ustrážiť slučku — ostane chyba ako doteraz */ }
  event.preventDefault();
  window.location.reload();
});

// PostHog (218 KB) a GTM sa pustia až PO štarte: po `load` + 2,5 s, alebo hneď pri prvom dotyku
// či scrolle (čo príde skôr). Na mobile s 4× pomalším CPU bol parse posthogu súčasťou
// dlhých úloh práve pri rozbehu filmu. Eventy čakajú vo fronte (analytics.ts) a idú s pôvodnou
// časovou pečiatkou; GTM má `dataLayer` plný od začiatku, takže nič neutečie.
{
  let done = false;
  const start = () => {
    if (done) return; done = true;
    initAnalytics(scrubSecrets);
    (window as any).__loadGtm?.();
  };
  const arm = () => {
    const idle = () => ('requestIdleCallback' in window ? (window as any).requestIdleCallback(start, { timeout: 2000 }) : start());
    const t = window.setTimeout(idle, 2500);
    const first = () => { window.clearTimeout(t); start(); };
    for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) window.addEventListener(ev, first, { once: true, passive: true });
  };
  if (document.readyState === 'complete') arm();
  else window.addEventListener('load', arm, { once: true });
}

// Cache pre Mapy.com dlaždice (viď public/sw-maptiles.js) — bez nej sa DOGYPT
// clean-mode invert vrstva sťahuje z platenej API dvakrát a žiadna dlaždica sa
// nezopakuje ani medzi session (Mapy.com neposiela Cache-Control/ETag).
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw-maptiles.js').catch(() => {});
}

if (location.pathname === "/onepage") startEarlyGridDogs();

// Aktívny jazyk (SK/CS/…) sa dotiahne pred prvým renderom, aby neblikla angličtina.
// Pád chunku nesmie zhodiť appku — vtedy ide render hneď a `t()` padne na EN.
preloadActiveLang().catch(() => {}).finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
