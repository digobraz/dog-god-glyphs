-- Pack backoffice: extend dogs table for /pack profile + magic link auth
-- Issue #13 — Sprint /pack backoffice
--
-- Notes:
--   * dogs table is assumed to already exist (created via Supabase Studio
--     during MVP rollout). This migration only ALTERs it with IF NOT EXISTS.
--   * RLS: each user can only read their own rows; writes restricted to
--     service_role (webhook + edge functions). No anon writes.

-- ---------------------------------------------------------------------------
-- Defensive: ensure dogs table exists before altering. If it does not, create
-- a minimal stub so subsequent ALTERs succeed in fresh environments. Existing
-- columns from prior schema (id, dog_name, email, stripe_session_id, etc.)
-- are preserved when present.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- New columns (idempotent)
-- ---------------------------------------------------------------------------
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS cloudinary_main_url TEXT;
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS cloudinary_extras TEXT[];
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS pdf_cert_url TEXT;
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS pdf_vertical_url TEXT;
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS pdf_horizontal_url TEXT;
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS heroglyph_code TEXT;
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS breed TEXT;
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS birth_year INT;
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS patron_svg TEXT;
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS patron_svg2 TEXT;

-- Helpful index for /pack listing (user → all their dogs, newest first)
CREATE INDEX IF NOT EXISTS dogs_user_id_created_idx
  ON public.dogs (user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;

-- Drop legacy permissive policies if they exist so we can replace them.
DROP POLICY IF EXISTS "Service role bypass dogs"          ON public.dogs;
DROP POLICY IF EXISTS "Users can read own dogs"           ON public.dogs;
DROP POLICY IF EXISTS "Users can update own dogs"         ON public.dogs;
DROP POLICY IF EXISTS "Service role can insert dogs"      ON public.dogs;
DROP POLICY IF EXISTS "Service role can update dogs"      ON public.dogs;
DROP POLICY IF EXISTS "Service role can delete dogs"      ON public.dogs;

-- 1) Service role can do anything (webhook / Edge Functions / admin).
CREATE POLICY "Service role bypass dogs"
  ON public.dogs
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 2) Authenticated users can SELECT their own rows.
CREATE POLICY "Users can read own dogs"
  ON public.dogs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 3) Authenticated users may UPDATE only metadata they own (e.g. preferences).
--    Insert + delete remain service-role-only to keep the purchase flow as the
--    sole source of truth for new dog rows.
CREATE POLICY "Users can update own dogs"
  ON public.dogs
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
