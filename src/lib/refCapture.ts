// ─────────────────────────────────────────────────────────────────────────
// Affiliate referral capture. A visitor arriving via dogypt.com/?ref=<code>
// gets the code stored locally (FIRST-TOUCH: the first link that brought them
// wins). It's read again at checkout (PaymentScreen) and sent to create-checkout
// so the referrer earns BONES when the purchase completes.
// ─────────────────────────────────────────────────────────────────────────

const REF_KEY = 'dogypt_ref';

/** Store a ?ref=<code> on first touch only (never overwrite an earlier one). */
export function captureRefFromSearch(search: string): void {
  try {
    const code = new URLSearchParams(search).get('ref');
    if (!code) return;
    const clean = code.trim().slice(0, 40);
    if (!clean) return;
    if (localStorage.getItem(REF_KEY)) return; // first-touch wins
    localStorage.setItem(REF_KEY, clean);
  } catch {
    /* private mode / no storage — ignore */
  }
}

/** Read the stored referral code (or null) — used by the checkout payload. */
export function getStoredRef(): string | null {
  try {
    const v = localStorage.getItem(REF_KEY);
    return v && v.trim() ? v.trim() : null;
  } catch {
    return null;
  }
}
