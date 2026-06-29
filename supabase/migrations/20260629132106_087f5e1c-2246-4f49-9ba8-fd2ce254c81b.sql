
CREATE TABLE public.server_event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_id TEXT,
  email_hash TEXT,
  phone_hash TEXT,
  external_id_hash TEXT,
  event_source_url TEXT,
  client_ip TEXT,
  user_agent TEXT,
  fbp TEXT,
  fbc TEXT,
  ttclid TEXT,
  rdt_uuid TEXT,
  custom_data JSONB,
  user_data_hashed JSONB,
  destinations JSONB,
  request_summary JSONB,
  status TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_server_event_log_created_at ON public.server_event_log (created_at DESC);
CREATE INDEX idx_server_event_log_event_id ON public.server_event_log (event_id);
CREATE INDEX idx_server_event_log_event_name ON public.server_event_log (event_name);
CREATE INDEX idx_server_event_log_email_hash ON public.server_event_log (email_hash);

GRANT ALL ON public.server_event_log TO service_role;

ALTER TABLE public.server_event_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only_server_event_log"
  ON public.server_event_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
