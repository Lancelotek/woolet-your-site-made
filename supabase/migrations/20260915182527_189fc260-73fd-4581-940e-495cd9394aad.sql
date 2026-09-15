ALTER TABLE public.bespoke_measure_invites
  ADD COLUMN consent_at timestamptz,
  ADD COLUMN consent_version text,
  ADD COLUMN consent_locale text;