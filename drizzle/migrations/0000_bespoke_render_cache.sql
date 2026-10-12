CREATE TABLE public.bespoke_render_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  selection_key text NOT NULL UNIQUE,
  key_version int NOT NULL DEFAULT 2,
  shape text,
  front_code text,
  front_name text,
  temple_code text,
  temple_name text,
  finish text,
  lens_type text,
  lens_tint text,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  alt_text text NOT NULL,
  model text,
  prompt_version text,
  hits int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_served_at timestamptz
);
GRANT SELECT ON public.bespoke_render_cache TO anon, authenticated;
GRANT ALL ON public.bespoke_render_cache TO service_role;
ALTER TABLE public.bespoke_render_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Render cache is public product imagery"
  ON public.bespoke_render_cache FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read bespoke renders"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'bespoke-renders');