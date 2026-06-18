-- Reserve WALL #1 for the founder dog Hekthor.
--
-- Bug (2026-06-18): the first REAL purchase received pack #1 — colliding with
-- Hekthor, who is the permanent founder #1. Root cause: pack_members.pack_number
-- is an auto-increment identity that starts at 1, and there was NO seed row for
-- Hekthor in pack_members. The frontend (GodsGrid) hardcodes Hekthor's #1 badge
-- and the WALL/welcome count logic (get-session-data, get-grid-dogs) reserves #1
-- by adding +2 to the paid-non-tester count — but pack_members itself was never
-- seeded, so the email + certificate (which read pack_members.pack_number) handed
-- #1 to the first buyer. The 20260618_pack_members_session_unique.sql comment
-- ("seeded founder rows like Hekthor have no session") assumed a seed that never
-- actually existed.
--
-- Fix: seed Hekthor as pack_number = 1 (stripe_session_id NULL — founder has no
-- checkout) and bump the identity sequence so the next real buyer gets #2. This
-- aligns pack_members with get-session-data (count + 2) → both now agree:
-- Hekthor #1, first real buyer #2, etc. Idempotent — safe to re-run.

INSERT INTO public.pack_members (pack_number, dog_name, email, stripe_session_id)
OVERRIDING SYSTEM VALUE
SELECT 1, 'Hekthor', 'hekthorsk@gmail.com', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.pack_members WHERE pack_number = 1);

-- Advance the identity sequence past the highest existing number so future
-- auto-assigned rows never collide with the seeded founder.
SELECT setval(
  pg_get_serial_sequence('public.pack_members', 'pack_number'),
  GREATEST((SELECT COALESCE(MAX(pack_number), 1) FROM public.pack_members), 1),
  true
);
