// Central Supabase endpoint config.
//
// PRODUCTION IS HARD-PINNED to the live DOGYPT project. Do NOT make prod read
// VITE_SUPABASE_URL — Lovable's bot (gpt-engineer-app) periodically rewrites
// .env to its own managed project (wjyrnowkjrqxvnvbzgwu). Because Vite loads
// .env in prod builds too, that silently repointed the whole live app at an
// empty project and broke everything (WALL empty, all edge fns 404) on
// 2026-06-27 (and once before). Pinning prod here means no .env rewrite can
// ever affect production again.
//
// DEV still reads the env vars, so `npm run web` against .env.development keeps
// pointing local dev at the DOGYPT DEV project. To debug against LIVE locally,
// rename .env.development (e.g. .env.development.off).
//
// NOTHING OUTSIDE THIS FILE MAY READ VITE_SUPABASE_* (rule added 2026-08-21).
// The pin only covers callers that go through SUPABASE_URL / SUPABASE_ANON_KEY.
// Three files used to read VITE_SUPABASE_PUBLISHABLE_KEY straight from the env
// (DailyPrayers, FeatureSurveyCard, PackDogDetail) and so sent Lovable's anon
// key to the pinned LIVE url -> 401 "No suitable key was found to decode the
// JWT" on those surfaces only, while the rest of the app looked healthy. That
// is worse than the 2026-06-27 outage, not better: it fails quietly. Import
// SUPABASE_ANON_KEY from here instead. `scripts/go-live.sh` fails the preflight
// if a new direct reader shows up.

const LIVE_SUPABASE_URL = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co';
const LIVE_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuenVyd21kZ3Z6bHFoc2JocnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDAxMzIsImV4cCI6MjA5MjI3NjEzMn0.oMdBisx_0Mla4PI1JtUT4lM1vgZVvbpcORfA8kbdWQY';

export const SUPABASE_URL = import.meta.env.PROD
  ? LIVE_SUPABASE_URL
  : ((import.meta.env.VITE_SUPABASE_URL as string) || LIVE_SUPABASE_URL);

export const SUPABASE_ANON_KEY = import.meta.env.PROD
  ? LIVE_SUPABASE_ANON_KEY
  : ((import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || LIVE_SUPABASE_ANON_KEY);

export const EDGE_BASE = `${SUPABASE_URL}/functions/v1`;

// PostHog (EU cloud). Project API key je VEREJNÝ write-only (phc_...), rovnako ako
// Supabase anon key — bezpečný vo verejnom bundli. Projekt 218037. Keychain: dogypt-posthog-key.
const LIVE_POSTHOG_KEY = 'phc_uz2yLbgP6oxs5CapQsj4jyLwDegrbjB5ueAcTvLc4coM';
// DEV ZÁMERNE BEZ FALLBACKU NA LIVE KĽÚČ (2026-08-06). Predtým tu bolo
// `|| LIVE_POSTHOG_KEY`, takže `npm run web` posielal eventy z localhostu do
// produkčného projektu 218037 — návštevnosť sa musela pri každej otázke ručne
// filtrovať cez `$host`, a keď sa na to zabudlo, čísla boli nafúknuté a trend
// obrátený (30.7.: dashboard hlásil −30 %, realita +46 %). Prázdny kľúč =
// `main.tsx` nezavolá posthog.init() = `enabled()` je false = všetky track()
// volania sú bezpečný no-op. dataLayer beží ďalej, takže GTM sa v deve ladiť dá.
// Debug proti LIVE projektu: dopíš VITE_POSTHOG_KEY do .env.development.
export const POSTHOG_KEY = import.meta.env.PROD
  ? LIVE_POSTHOG_KEY
  : ((import.meta.env.VITE_POSTHOG_KEY as string) || '');
export const POSTHOG_HOST = 'https://eu.i.posthog.com';

// Mapy.com (Seznam.cz) tiles for DOGYPT Trails (/pack/trails). Key is
// referrer-protected (like the Supabase publishable key) — safe to hard-pin
// in the public bundle.
// Referrer lock is LIVE since 2026-08-14 (project `dogypt-trails`, id 17895,
// developer.mapy.com → API klíče → NASTAVENÍ KLÍČE → Omezení API klíče):
// allowed = dogypt.com · *.dogypt.com · localhost · localhost:8080–8083.
// Everything else gets 403 — including `*.lovable.app` previews and dev
// servers on other ports (5173 etc.), so run `/pack/map` on 8080–8083.
export const MAPY_API_KEY = 'GoBI7Tac9Hjr0cCbkAiUl28bZyrPYz_ZHb90sFkTCG0';

/**
 * ZÁKLAD VOLANÍ MAPY.COM — v prehliadači sa NEPÍŠE natvrdo, berie sa odtiaľto.
 *
 * Prod: priamo `https://api.mapy.com` (referrer = dogypt.com, teda vo whiteliste).
 * Dev:  vlastný pôvod `/mapyapi`, kde Vite proxy dosadí `Referer: https://dogypt.com/`
 *       (vite.config.ts). Bez toho dostane 403 každý dev náhľad mimo localhostu —
 *       mobil cez cloudflared tunel aj telefón na LAN IP — a mapa ostane prázdna.
 *
 * ⚠️ Nové volanie na api.mapy.com píš cez `MAPY_BASE`, nie reťazcom. Natvrdo napísaná
 * adresa funguje na tvojom localhoste a padne až na Matejovom telefóne.
 */
export const MAPY_BASE = import.meta.env.DEV ? '/mapyapi' : 'https://api.mapy.com';

export const mapyTiles = (style: string = 'outdoor') =>
  `${MAPY_BASE}/v1/maptiles/${style}/256/{z}/{x}/{y}?apikey=${MAPY_API_KEY}`;
