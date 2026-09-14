ALTER TABLE public.bespoke_scan_profiles ADD COLUMN IF NOT EXISTS measurement_ref text;
CREATE UNIQUE INDEX IF NOT EXISTS bespoke_scan_profiles_measurement_ref_key
  ON public.bespoke_scan_profiles (measurement_ref)
  WHERE measurement_ref IS NOT NULL;