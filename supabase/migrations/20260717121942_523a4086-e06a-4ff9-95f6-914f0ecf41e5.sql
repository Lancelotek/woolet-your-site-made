CREATE TABLE IF NOT EXISTS public.ga4_channel_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  channel TEXT NOT NULL,
  sessions INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (snapshot_date, channel)
);
GRANT ALL ON public.ga4_channel_snapshots TO service_role;
ALTER TABLE public.ga4_channel_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role only" ON public.ga4_channel_snapshots FOR ALL USING (false) WITH CHECK (false);
CREATE INDEX IF NOT EXISTS ga4_channel_snapshots_date_idx ON public.ga4_channel_snapshots (snapshot_date);