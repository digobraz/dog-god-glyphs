// Central Supabase endpoint config. DEV overrides via .env.development;
// production (Lovable) falls back to the live project so a missing env var never breaks prod.
export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) || 'https://lnzurwmdgvzlqhsbhrvi.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuenVyd21kZ3Z6bHFoc2JocnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDAxMzIsImV4cCI6MjA5MjI3NjEzMn0.oMdBisx_0Mla4PI1JtUT4lM1vgZVvbpcORfA8kbdWQY';

export const EDGE_BASE = `${SUPABASE_URL}/functions/v1`;
