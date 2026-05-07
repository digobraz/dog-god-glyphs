-- Auto-link dogs.user_id when buyer signs in via magic link.
-- Webhook chain creates dogs row with email but user_id=null (user doesn't exist
-- yet). When magic-link signup creates auth.users row, this trigger backfills
-- user_id on all matching dogs rows so /pack listing finds them.
--
-- Idempotent: replaces function + trigger if they exist.

CREATE OR REPLACE FUNCTION public.link_dogs_to_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
BEGIN
  UPDATE public.dogs
     SET user_id = NEW.id
   WHERE email = NEW.email
     AND user_id IS NULL;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS link_dogs_on_signup ON auth.users;

CREATE TRIGGER link_dogs_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.link_dogs_to_new_user();
