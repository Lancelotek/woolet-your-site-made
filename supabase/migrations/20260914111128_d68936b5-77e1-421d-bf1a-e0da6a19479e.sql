ALTER TABLE public.bespoke_orders
  ADD COLUMN IF NOT EXISTS scan_source text,
  ADD COLUMN IF NOT EXISTS scan_received_at timestamptz,
  ADD COLUMN IF NOT EXISTS scan_payload jsonb;