ALTER TABLE public.bespoke_orders
  ADD COLUMN IF NOT EXISTS courier text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS parcel_weight_kg numeric,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS dispatch_note text;