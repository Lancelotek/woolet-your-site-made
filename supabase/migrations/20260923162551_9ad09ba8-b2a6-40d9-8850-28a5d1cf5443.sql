ALTER TABLE public.bespoke_orders ADD COLUMN IF NOT EXISTS lens_tint_code text;
UPDATE public.bespoke_orders
SET lens_tint_code = COALESCE(
  (regexp_match(lens_type, '\((PH-(?:BRN|GRN|GRY))\)'))[1],
  CASE WHEN metadata->>'lens_tint' IN ('PH-BRN', 'PH-GRN', 'PH-GRY') THEN metadata->>'lens_tint' ELSE NULL END
)
WHERE lens_tint_code IS NULL AND (
  lens_type ~ '\(PH-(BRN|GRN|GRY)\)' OR metadata->>'lens_tint' IN ('PH-BRN', 'PH-GRN', 'PH-GRY')
);