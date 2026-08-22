import { createRoot } from "react-dom/client";
import posthog from "posthog-js";
import App from "./App.tsx";
import "./index.css";
import { POSTHOG_KEY, POSTHOG_HOST } from "./lib/env";

if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    persistence: 'memory',              // Tier 0: cookieless, bez person profilu (vlna B zapne consent)
    person_profiles: 'identified_only',
    disable_session_recording: true,    // zapne sa vo vlne B po analytics consente
    autocapture: true,
    capture_exceptions: true,           // error tracking zadarmo
    capture_pageview: false,            // pageviews riešime manuálne v App.tsx (SPA routy)
  });
}

// Cache pre Mapy.com dlaždice (viď public/sw-maptiles.js) — bez nej sa DOGYPT
// clean-mode invert vrstva sťahuje z platenej API dvakrát a žiadna dlaždica sa
// nezopakuje ani medzi session (Mapy.com neposiela Cache-Control/ETag).
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw-maptiles.js').catch(() => {});
}

createRoot(document.getElementById("root")!).render(<App />);
