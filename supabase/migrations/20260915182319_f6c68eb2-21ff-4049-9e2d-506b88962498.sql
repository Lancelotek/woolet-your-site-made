CREATE TABLE public.bespoke_measure_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.bespoke_orders(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  session_hash text,
  session_expires_at timestamptz,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  used_at timestamptz,
  measurement_scan_id text,
  sent_to text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bespoke_measure_invites_order_idx ON public.bespoke_measure_invites(order_id);
CREATE INDEX bespoke_measure_invites_session_idx ON public.bespoke_measure_invites(session_hash);
GRANT ALL ON public.bespoke_measure_invites TO service_role;
ALTER TABLE public.bespoke_measure_invites ENABLE ROW LEVEL SECURITY;