-- FIX9 Memorial mód — dátum úmrtia psa (deň, keď prešiel do anjelskej podoby).
-- Nullable: psy zapísané ako 'deceased' pred touto migráciou ho nemajú —
-- majiteľ ho doplní cez self-service edit na profile (PackDogDetail / MemorialControl).
-- life_status ('alive' | 'deceased') už existuje z 20260626_dogs_life_status.sql.
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS death_date date;
