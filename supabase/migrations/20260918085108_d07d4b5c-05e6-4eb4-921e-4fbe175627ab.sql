ALTER TABLE public.bespoke_orders
  ADD COLUMN IF NOT EXISTS crm_stage integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS crm_stage_1_at timestamptz,
  ADD COLUMN IF NOT EXISTS crm_stage_2_at timestamptz,
  ADD COLUMN IF NOT EXISTS crm_stage_3_at timestamptz,
  ADD COLUMN IF NOT EXISTS crm_stage_4_at timestamptz,
  ADD COLUMN IF NOT EXISTS crm_stage_5_at timestamptz,
  ADD COLUMN IF NOT EXISTS crm_stage_6_at timestamptz,
  ADD COLUMN IF NOT EXISTS crm_notes text;

ALTER TABLE public.bespoke_orders
  ADD CONSTRAINT bespoke_orders_crm_stage_range CHECK (crm_stage BETWEEN 1 AND 6);

UPDATE public.bespoke_orders
   SET crm_stage_1_at = COALESCE(crm_stage_1_at, created_at)
 WHERE crm_stage_1_at IS NULL;

CREATE TABLE IF NOT EXISTS public.bespoke_crm_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.bespoke_orders(id) ON DELETE CASCADE,
  from_stage integer,
  to_stage integer,
  note text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.bespoke_crm_events TO service_role;

ALTER TABLE public.bespoke_crm_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS bespoke_crm_events_order_idx
  ON public.bespoke_crm_events (order_id, created_at DESC);