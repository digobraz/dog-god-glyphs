-- Migration: dogs.life_status
-- DEV: applied 2026-06-26 via management API.
-- LIVE: deploy this file when ready (after dev testing).
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS life_status text NOT NULL DEFAULT 'alive';
