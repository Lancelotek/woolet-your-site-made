ALTER TABLE public.bespoke_order_photos
  ALTER COLUMN order_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS session_ref uuid,
  ADD COLUMN IF NOT EXISTS uploaded_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS bespoke_order_photos_session_ref_idx
  ON public.bespoke_order_photos(session_ref);

CREATE UNIQUE INDEX IF NOT EXISTS bespoke_order_photos_session_ref_pre_order_idx
  ON public.bespoke_order_photos(session_ref)
  WHERE order_id IS NULL AND session_ref IS NOT NULL;