ALTER TABLE public.waitlist_attribution
  ADD COLUMN IF NOT EXISTS landing_url text,
  ADD COLUMN IF NOT EXISTS referrer text;