import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';
import { IS_APP } from '@/lib/isApp';
import { appAuthStorage } from '@/lib/appSession';

const SUPABASE_PUBLISHABLE_KEY = SUPABASE_ANON_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    // V appke natívne úložisko (iOS čistí localStorage WebView) — lib/appSession.ts. Web ostáva na localStorage.
    storage: IS_APP ? appAuthStorage : localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});