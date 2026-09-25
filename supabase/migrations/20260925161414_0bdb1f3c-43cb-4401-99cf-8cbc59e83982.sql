ALTER TABLE public.bespoke_orders
  ADD COLUMN IF NOT EXISTS shipping_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS shipping_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS shipping_consent_version text,
  ADD COLUMN IF NOT EXISTS shipping_consent_text text,
  ADD COLUMN IF NOT EXISTS shipping_form_attempts jsonb NOT NULL DEFAULT '[]'::jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS bespoke_orders_shipping_token_key ON public.bespoke_orders(shipping_token);