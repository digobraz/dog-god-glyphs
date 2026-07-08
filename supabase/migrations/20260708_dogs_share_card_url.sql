-- Share card (personalized square 1080x1080 PNG) — client-side toPng render,
-- uploaded to Cloudinary, saved here. Mirrors heroglyph_png_url pattern.
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS share_card_url TEXT;
