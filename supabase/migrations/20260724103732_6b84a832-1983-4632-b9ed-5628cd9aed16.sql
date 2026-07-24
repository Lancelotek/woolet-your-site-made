
CREATE TABLE public.meta_capi_lead_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id uuid NOT NULL,
  event_id text NOT NULL,
  event_name text NOT NULL DEFAULT 'Lead',
  source text,
  email_hash text,
  http_status integer,
  ok boolean NOT NULL DEFAULT false,
  error text,
  response_snippet text,
  duration_ms integer,
  meta_event_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_meta_capi_lead_log_created_at ON public.meta_capi_lead_log (created_at DESC);
CREATE INDEX idx_meta_capi_lead_log_correlation_id ON public.meta_capi_lead_log (correlation_id);

GRANT ALL ON public.meta_capi_lead_log TO service_role;

ALTER TABLE public.meta_capi_lead_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only_meta_capi_lead_log"
  ON public.meta_capi_lead_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
