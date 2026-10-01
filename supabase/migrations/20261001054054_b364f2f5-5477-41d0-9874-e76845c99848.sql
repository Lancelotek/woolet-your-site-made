CREATE TABLE public.reservation_attribution (
  session_id text PRIMARY KEY,
  email text,
  amount integer,
  currency text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  environment text,
  visitor_id text,
  first_touch text,
  last_touch text,
  first_landing text,
  first_seen_at timestamptz,
  days_to_pay integer,
  touch_count integer,
  heard_from text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.reservation_attribution TO service_role;
ALTER TABLE public.reservation_attribution ENABLE ROW LEVEL SECURITY;
CREATE INDEX reservation_attribution_paid_at_idx ON public.reservation_attribution (paid_at DESC);