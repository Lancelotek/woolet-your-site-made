alter table public.bespoke_order_photos

  add column if not exists profile_path text,

  add column if not exists profile_uploaded_at timestamptz;