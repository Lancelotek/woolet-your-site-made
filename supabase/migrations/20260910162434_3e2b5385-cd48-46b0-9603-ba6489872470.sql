alter table public.bespoke_scan_profiles add column if not exists session_ref uuid;

alter table public.bespoke_orders
  add column if not exists scan_id text,
  add column if not exists session_ref uuid,
  add column if not exists workshop_token uuid not null default gen_random_uuid(),
  add column if not exists delivered_at timestamptz,
  add column if not exists purge_after timestamptz,
  add column if not exists purged_at timestamptz,
  add column if not exists production_blocked boolean not null default false;

create index if not exists bespoke_orders_workshop_token_idx on public.bespoke_orders(workshop_token);
create index if not exists bespoke_scan_profiles_session_ref_idx on public.bespoke_scan_profiles(session_ref);

create table if not exists public.bespoke_order_photos (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.bespoke_orders(id) on delete cascade,
  status text not null default 'pending',
  photo_path text,
  geometry_path text,
  vto_path text,
  photo_width_px int,
  photo_height_px int,
  card_px numeric,
  mm_per_px numeric,
  temple_left_px numeric,
  temple_right_px numeric,
  photo_temple_to_temple_mm numeric,
  scan_temple_to_temple_mm numeric,
  delta_mm numeric,
  frame_front_width_mm numeric,
  frame_bridge_mm numeric,
  shape_id text,
  mapping_version text,
  consent_text text not null,
  consent_version text not null,
  consent_at timestamptz not null,
  consent_ip_hash text,
  consent_locale text,
  consent_withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists bespoke_order_photos_order_key on public.bespoke_order_photos(order_id);

grant all on public.bespoke_order_photos to service_role;
alter table public.bespoke_order_photos enable row level security;
create policy "Service role manages bespoke order photos"
  on public.bespoke_order_photos for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create trigger bespoke_order_photos_updated_at
  before update on public.bespoke_order_photos
  for each row execute function public.bespoke_orders_set_updated_at();

create table if not exists public.bespoke_report_verifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.bespoke_orders(id) on delete cascade,
  revision int not null default 1,
  cad_values_frame jsonb,
  cad_image_path text,
  deltas jsonb,
  verdict text,
  notes text,
  qc_checklist jsonb,
  signed_off_by text,
  signed_off_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bespoke_report_verifications_order_idx
  on public.bespoke_report_verifications(order_id, created_at desc);

grant all on public.bespoke_report_verifications to service_role;
alter table public.bespoke_report_verifications enable row level security;
create policy "Service role manages bespoke report verifications"
  on public.bespoke_report_verifications for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create trigger bespoke_report_verifications_updated_at
  before update on public.bespoke_report_verifications
  for each row execute function public.bespoke_orders_set_updated_at();