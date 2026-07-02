
CREATE TABLE public.gsc_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  page_path TEXT NOT NULL,
  query TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC(6,4) NOT NULL DEFAULT 0,
  position NUMERIC(6,2) NOT NULL DEFAULT 0,
  threshold_ctr NUMERIC(6,4),
  threshold_met BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (snapshot_date, page_path, query)
);

GRANT ALL ON public.gsc_snapshots TO service_role;
ALTER TABLE public.gsc_snapshots ENABLE ROW LEVEL SECURITY;
-- No end-user policies: only service_role (edge functions with admin password) can read/write.

CREATE INDEX gsc_snapshots_page_date_idx ON public.gsc_snapshots (page_path, snapshot_date DESC);
CREATE INDEX gsc_snapshots_flagged_idx ON public.gsc_snapshots (threshold_met, snapshot_date DESC) WHERE threshold_met = false;
