
CREATE TABLE public.pack_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_number SERIAL NOT NULL,
  dog_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allow anonymous reads (count query) and inserts from the app
ALTER TABLE public.pack_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pack count"
  ON public.pack_members FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert pack members"
  ON public.pack_members FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
