import { createRoot } from "react-dom/client";
import posthog from "posthog-js";
import App from "./App.tsx";
import "./index.css";
import { POSTHOG_KEY, POSTHOG_HOST } from "./lib/env";
import { scrubSecrets } from "./lib/packAnalytics";
// Testovacie dáta z dielne vstupu (`/lab/heroflow`) musia byť v store SKÔR, než
// sa vykreslí prvá obrazovka — obrazovky flow si store kopírujú do lokálneho
// stavu pri prvom renderi. Telo modulu je celé za `import.meta.env.DEV`.
import "./lib/devSeedApply";

if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    persistence: 'memory',              // Tier 0: cookieless, bez person profilu (vlna B zapne consent)
    person_profiles: 'identified_only',
    disable_session_recording: true,    // zapne sa vo vlne B po analytics consente
    autocapture: true,
    capture_exceptions: true,           // error tracking zadarmo
    capture_pageview: false,            // pageviews riešime manuálne v App.tsx (SPA routy)
    // Heatmapy (21. 9. 2026, v1-posthog): bez `enable_heatmaps` PostHog kliky na súradnice
    // NEZBIERA vôbec a heatmapa v appke ostane prázdna, aj keď `autocapture` beží — sú to dve
    // rôzne veci. Zapína sa globálne (verejný web z toho ťaží rovnako); dáta idú ako
    // `$$heatmap_data` prilepené k pageview, teda bez ďalšieho volania navyše.
    enable_heatmaps: true,
    // Čas na obrazovke (27. 9. 2026): PostHog ho ráta ako `$prev_pageview_duration` na ĎALŠOM
    // pageview, takže posledná obrazovka session nemala čas nikdy — `$pageleave` bolo za 30 dní 0.
    // Heatmapa „kde sa ľudia zdržujú" v dashboarde (Funkcie → TEPLO) by tak mlčala práve o tej
    // obrazovke, na ktorej človek skončil.
    capture_pageleave: true,
    // 🔴 Tajomstvá v URL nesmú do analytiky. `maskPath` čistí len náš `path` — PostHog si
    // `$current_url`, `$pathname`, `$referrer` a `$prev_pageview_pathname` berie sám z okna,
    // takže pozývací token z `/pack/join/<token>` a Supabase tokeny v hashi magic linku
    // odchádzali celé (overené 27. 9. na `$current_url` s `/pack/join/…`).
    before_send: (ev) => (ev ? scrubSecrets(ev) : ev),
  });
}

// Cache pre Mapy.com dlaždice (viď public/sw-maptiles.js) — bez nej sa DOGYPT
// clean-mode invert vrstva sťahuje z platenej API dvakrát a žiadna dlaždica sa
// nezopakuje ani medzi session (Mapy.com neposiela Cache-Control/ETag).
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw-maptiles.js').catch(() => {});
}

createRoot(document.getElementById("root")!).render(<App />);
