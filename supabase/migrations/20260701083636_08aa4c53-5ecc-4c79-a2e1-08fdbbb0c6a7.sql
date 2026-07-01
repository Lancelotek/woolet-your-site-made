
CREATE TABLE public.bespoke_ai_previews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selection_key text NOT NULL,
  image_url text NOT NULL,
  shape text,
  front_color text,
  temple_color text,
  finish text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX bespoke_ai_previews_user_created_idx
  ON public.bespoke_ai_previews (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bespoke_ai_previews TO authenticated;
GRANT ALL ON public.bespoke_ai_previews TO service_role;

ALTER TABLE public.bespoke_ai_previews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI previews"
  ON public.bespoke_ai_previews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI previews"
  ON public.bespoke_ai_previews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI previews"
  ON public.bespoke_ai_previews FOR DELETE
  USING (auth.uid() = user_id);
