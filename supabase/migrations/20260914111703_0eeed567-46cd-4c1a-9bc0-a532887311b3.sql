ALTER TABLE public.bespoke_scan_profiles
  ADD COLUMN IF NOT EXISTS scan_id text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.bespoke_orders(id),
  ADD COLUMN IF NOT EXISTS temple_to_temple_mm numeric,
  ADD COLUMN IF NOT EXISTS pd_left_mm numeric,
  ADD COLUMN IF NOT EXISTS pd_right_mm numeric,
  ADD COLUMN IF NOT EXISTS payload_version text,
  ADD COLUMN IF NOT EXISTS semantics_version text DEFAULT 'current',
  ADD COLUMN IF NOT EXISTS confidence_tier text,
  ADD COLUMN IF NOT EXISTS spread_mm numeric,
  ADD COLUMN IF NOT EXISTS raw_payload jsonb;

ALTER TABLE public.bespoke_scan_profiles ALTER COLUMN status SET DEFAULT 'unverified';
ALTER TABLE public.bespoke_scan_profiles ALTER COLUMN capture_method DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS bespoke_scan_profiles_scan_id_key
  ON public.bespoke_scan_profiles(scan_id);

ALTER TABLE public.bespoke_orders
  ADD COLUMN IF NOT EXISTS ai_source text,
  ADD COLUMN IF NOT EXISTS ai_overrides jsonb;