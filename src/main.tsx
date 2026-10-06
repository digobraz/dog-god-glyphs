import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { preloadActiveLang } from "./i18n/LanguageContext";
import { initAnalytics } from "./lib/analytics";
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

// PostHog sa načíta lenivo po `load` + voľnom čase (viď `lib/analytics.ts`) — nesmie brzdiť prvé vykreslenie.
{
  const start = () => initAnalytics(scrubSecrets);
  const later = () => ('requestIdleCallback' in window
    ? (window as any).requestIdleCallback(start, { timeout: 4000 })
    : setTimeout(start, 2000));
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later, { once: true });
}

// Cache pre Mapy.com dlaždice (viď public/sw-maptiles.js) — bez nej sa DOGYPT
// clean-mode invert vrstva sťahuje z platenej API dvakrát a žiadna dlaždica sa
// nezopakuje ani medzi session (Mapy.com neposiela Cache-Control/ETag).
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw-maptiles.js').catch(() => {});
}

// Aktívny jazyk (SK/CS/…) sa dotiahne pred prvým renderom, aby neblikla angličtina.
// Pád chunku nesmie zhodiť appku — vtedy ide render hneď a `t()` padne na EN.
preloadActiveLang().catch(() => {}).finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
