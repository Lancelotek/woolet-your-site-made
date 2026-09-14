ALTER TABLE public.bespoke_orders ADD COLUMN IF NOT EXISTS ai_inner_canthal_mm numeric;

CREATE TABLE IF NOT EXISTS public.integration_secrets (
  name text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.integration_secrets TO service_role;

ALTER TABLE public.integration_secrets ENABLE ROW LEVEL SECURITY;