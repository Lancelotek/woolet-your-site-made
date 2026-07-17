
CREATE TABLE public.ga4_lp_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  landing_page TEXT NOT NULL,
  sessions INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (snapshot_date, landing_page)
);
GRANT ALL ON public.ga4_lp_snapshots TO service_role;
ALTER TABLE public.ga4_lp_snapshots ENABLE ROW LEVEL SECURITY;
CREATE INDEX ga4_lp_snapshots_date_idx ON public.ga4_lp_snapshots (snapshot_date DESC);

CREATE TABLE public.ad_spend_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  platform TEXT NOT NULL,
  spend NUMERIC(12,2) NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (snapshot_date, platform)
);
GRANT ALL ON public.ad_spend_snapshots TO service_role;
ALTER TABLE public.ad_spend_snapshots ENABLE ROW LEVEL SECURITY;
CREATE INDEX ad_spend_snapshots_date_idx ON public.ad_spend_snapshots (snapshot_date DESC);
