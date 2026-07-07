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
export const POSTHOG_KEY = import.meta.env.PROD
  ? LIVE_POSTHOG_KEY
  : ((import.meta.env.VITE_POSTHOG_KEY as string) || LIVE_POSTHOG_KEY);
export const POSTHOG_HOST = 'https://eu.i.posthog.com';
