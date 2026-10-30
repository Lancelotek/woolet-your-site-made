-- Side-profile photo for Bespoke orders: lets us classify the nose bridge
-- (low / standard / high) from where the bridge starts against the eye line.
-- The front photo only shows bridge width, not how high or deep it sits.
alter table public.bespoke_order_photos
  add column if not exists profile_path text,
  add column if not exists profile_uploaded_at timestamptz;

comment on column public.bespoke_order_photos.profile_path is
  'Strict side-profile photo with a bank card on the cheek (bespoke-photos bucket). Used to judge nose-bridge height and projection.';
