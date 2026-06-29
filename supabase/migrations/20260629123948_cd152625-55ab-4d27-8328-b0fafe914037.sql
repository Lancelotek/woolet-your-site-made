
CREATE TABLE IF NOT EXISTS public.waitlist_attribution (
  email text PRIMARY KEY,
  ip_address text,
  user_agent text,
  fbp text,
  fbc text,
  ttclid text,
  rdt_uuid text,
  event_source_url text,
  meta_event_id text,
  extra jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.waitlist_attribution TO service_role;

ALTER TABLE public.waitlist_attribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages waitlist_attribution"
  ON public.waitlist_attribution
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.waitlist_attribution_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS waitlist_attribution_set_updated_at ON public.waitlist_attribution;
CREATE TRIGGER waitlist_attribution_set_updated_at
  BEFORE UPDATE ON public.waitlist_attribution
  FOR EACH ROW EXECUTE FUNCTION public.waitlist_attribution_set_updated_at();
