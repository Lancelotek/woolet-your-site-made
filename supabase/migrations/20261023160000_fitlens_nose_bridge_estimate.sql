-- FitLens noseBridgeEstimateMm (nasal sidewall 134-363). Separate from
-- nose_bridge_width_mm, which holds the inner-canthal distance (133-362).
ALTER TABLE public.bespoke_scan_profiles
  ADD COLUMN IF NOT EXISTS nose_bridge_estimate_mm numeric;
COMMENT ON COLUMN public.bespoke_scan_profiles.nose_bridge_estimate_mm IS
  'FitLens noseBridgeEstimateMm - nasal sidewall estimate (MediaPipe 134-363). Not a validated frame contact width.';
