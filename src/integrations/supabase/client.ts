import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';
import { IS_APP } from '@/lib/isApp';
import { appAuthStorage } from '@/lib/appSession';

const SUPABASE_PUBLISHABLE_KEY = SUPABASE_ANON_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// ── PRIHLÁSENIE NA MOBILNÝCH DÁTACH (28. 10. 2026) ──────────────────────────────
// Obnova tokenu pri štarte appky (`/auth/v1/token`) nemá v fetch žiadny limit. Keď sa pri
// prebúdzaní rádia požiadavka zasekne (nespadne, len visí), auth-js čaká a celý /pack stojí
// na „NAČÍTAVAM…“ — Matej 27. 10.: 30 s. Po AUTH_TIMEOUT_MS ju zrušíme; auth-js to berie
// ako sieťovú chybu a skúsi znova čerstvým spojením. Len auth a len v appke — upload fotky
// smie trvať dlhšie a web to netrápi.
const AUTH_TIMEOUT_MS = 8_000;
const appFetch: typeof fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (!url.includes('/auth/v1/') || init?.signal) return fetch(input, init);
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), AUTH_TIMEOUT_MS);
  return fetch(input, { ...init, signal: ctl.signal }).finally(() => clearTimeout(t));
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  ...(IS_APP ? { global: { fetch: appFetch } } : {}),
  auth: {
    // V appke natívne úložisko (iOS čistí localStorage WebView) — lib/appSession.ts. Web ostáva na localStorage.
    storage: IS_APP ? appAuthStorage : localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});