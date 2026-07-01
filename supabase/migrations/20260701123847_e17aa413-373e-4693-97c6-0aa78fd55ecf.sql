
CREATE TABLE IF NOT EXISTS public.bespoke_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  environment TEXT NOT NULL DEFAULT 'live',
  amount_cents INTEGER,
  currency TEXT DEFAULT 'usd',
  frame_id TEXT,
  frame_name TEXT,
  front_code TEXT,
  temple_code TEXT,
  finish_id TEXT,
  lens_type TEXT,
  engraving_text TEXT,
  ai_preview_url TEXT,
  ai_face_width_mm NUMERIC,
  ai_temple_to_temple_mm NUMERIC,
  ai_bridge_width_mm NUMERIC,
  ai_pd_mm NUMERIC,
  ai_notes TEXT,
  manual_face_width_mm NUMERIC,
  manual_temple_to_temple_mm NUMERIC,
  manual_bridge_width_mm NUMERIC,
  manual_pd_mm NUMERIC,
  manual_temple_length_mm NUMERIC,
  manual_head_circumference_mm NUMERIC,
  manual_ear_to_ear_mm NUMERIC,
  manual_notes TEXT,
  measurements_submitted_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.bespoke_orders TO service_role;

ALTER TABLE public.bespoke_orders ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated: all access is via SECURITY DEFINER edge functions using service_role.

CREATE OR REPLACE FUNCTION public.bespoke_orders_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_bespoke_orders_updated_at ON public.bespoke_orders;
CREATE TRIGGER trg_bespoke_orders_updated_at
BEFORE UPDATE ON public.bespoke_orders
FOR EACH ROW EXECUTE FUNCTION public.bespoke_orders_set_updated_at();
