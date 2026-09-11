CREATE TABLE public.bespoke_tryon_renders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selection_key text,
  image_url text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, DELETE ON public.bespoke_tryon_renders TO authenticated;
GRANT ALL ON public.bespoke_tryon_renders TO service_role;

ALTER TABLE public.bespoke_tryon_renders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own try-on renders"
  ON public.bespoke_tryon_renders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own try-on renders"
  ON public.bespoke_tryon_renders FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX bespoke_tryon_renders_user_idx ON public.bespoke_tryon_renders (user_id, created_at DESC);