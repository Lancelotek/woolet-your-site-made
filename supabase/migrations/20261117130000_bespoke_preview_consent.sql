-- Optional consent for an on-face preview (decision 17.11.2026).
--
-- The photo consent covers storage and the workshop, for measuring and
-- producing the frame only. Sending the photograph to an AI image service is
-- a new recipient and a new purpose, so it is recorded separately. All three
-- columns stay null unless the customer ticked the box themselves.
-- A preview may only be made while preview_consent_at is set AND
-- consent_withdrawn_at is null.

alter table public.bespoke_order_photos
  add column if not exists preview_consent_at timestamptz,
  add column if not exists preview_consent_text text,
  add column if not exists preview_consent_version text;

comment on column public.bespoke_order_photos.preview_consent_at is
  'When the customer ticked the optional box allowing an AI on-face preview. Null = not given.';
comment on column public.bespoke_order_photos.preview_consent_text is
  'The preview consent wording exactly as shown to the customer.';
