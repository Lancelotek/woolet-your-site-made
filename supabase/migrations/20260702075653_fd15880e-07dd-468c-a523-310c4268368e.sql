
CREATE TABLE public.reservation_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  phone text,
  product text NOT NULL,
  locale text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  user_agent text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX reservation_leads_email_idx ON public.reservation_leads (lower(email));
CREATE INDEX reservation_leads_product_created_idx ON public.reservation_leads (product, created_at DESC);

GRANT INSERT ON public.reservation_leads TO anon;
GRANT INSERT ON public.reservation_leads TO authenticated;
GRANT ALL ON public.reservation_leads TO service_role;

ALTER TABLE public.reservation_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a reservation lead"
  ON public.reservation_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) BETWEEN 3 AND 320
    AND product IN ('007','009','bespoke')
    AND (phone IS NULL OR length(phone) <= 40)
  );

CREATE POLICY "Service role manages reservation_leads"
  ON public.reservation_leads
  FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
