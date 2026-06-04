
CREATE TABLE public.scan_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  face_width_mm integer,
  nose_width_mm integer,
  recommendation_type text,
  confidence text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.scan_sessions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.scan_sessions TO authenticated;
GRANT ALL ON public.scan_sessions TO service_role;

ALTER TABLE public.scan_sessions ENABLE ROW LEVEL SECURITY;

-- Sessions are addressed by an unguessable UUID present only in the QR link.
-- Anyone who knows the ID can read/update that single row.
CREATE POLICY "Anyone can create a scan session"
  ON public.scan_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read a scan session"
  ON public.scan_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update a scan session"
  ON public.scan_sessions FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.scan_sessions_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER scan_sessions_updated_at
  BEFORE UPDATE ON public.scan_sessions
  FOR EACH ROW EXECUTE FUNCTION public.scan_sessions_set_updated_at();

-- Enable realtime so the desktop can listen for the phone's result write.
ALTER TABLE public.scan_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_sessions;
