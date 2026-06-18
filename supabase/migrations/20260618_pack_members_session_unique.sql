-- Idempotency guard for the Stripe webhook.
--
-- Bug (2026-06-18): a single checkout produced TWO pack_members rows (two WALL
-- numbers) and TWO confirmation emails. Root cause: stripe-webhook re-runs when
-- Stripe retries / the endpoint is registered twice, and pack_members had no
-- UNIQUE on stripe_session_id, so the duplicate INSERT succeeded with a fresh
-- pack_number instead of failing.
--
-- Fix: UNIQUE(stripe_session_id). The webhook now relies on this to fail the
-- duplicate INSERT, fall through to SELECT the existing row, flag it as a
-- duplicate, and skip re-sending the email. (NULLs stay allowed — seeded founder
-- rows like Hekthor have no session — and Postgres permits multiple NULLs.)

-- Safety: collapse any pre-existing non-null duplicates first (keep lowest
-- pack_number) so the constraint can be added cleanly.
DELETE FROM public.pack_members a
USING public.pack_members b
WHERE a.stripe_session_id IS NOT NULL
  AND a.stripe_session_id = b.stripe_session_id
  AND a.pack_number > b.pack_number;

ALTER TABLE public.pack_members
  ADD CONSTRAINT pack_members_stripe_session_id_unique UNIQUE (stripe_session_id);
