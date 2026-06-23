// ============================================================================
// PACK feature flags — LIVE (trimmed) vs DEV (full) split.
//
// DEV_FULL=false (default, incl. Lovable production build) → trimmed LIVE pack:
//   only profile + documents + Wall message are interactive; everything else
//   ships as "coming soon". This is what goes out to customers.
//
// DEV_FULL=true → the full backoffice, frozen in its current state. The full
//   code is NEVER deleted — it stays gated behind this flag so post-launch we
//   keep building from where we left off, not from scratch.
//
// Run the full dev version locally:   VITE_PACK_FULL=true npm run web
// ============================================================================
export const DEV_FULL = import.meta.env.VITE_PACK_FULL === 'true';
