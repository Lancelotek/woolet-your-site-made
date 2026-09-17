ALTER TABLE public.bespoke_orders
  ADD COLUMN IF NOT EXISTS reading_strength_mode text,
  ADD COLUMN IF NOT EXISTS reading_strength text,
  ADD COLUMN IF NOT EXISTS reading_strength_left text,
  ADD COLUMN IF NOT EXISTS reading_strength_right text;