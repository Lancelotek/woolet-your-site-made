-- Workshop upload link per Bespoke order (Marek, 20.11.2026).
--
-- Warren gets a private link per order (/en/bespoke/workshop?t=...) and
-- uploads the 3D model video, CAD files and photos straight onto the order.
-- The admin sees them on the order card; files marked for the customer show on
-- the customer's 3D model page once "Model sent" is pressed.
--
-- Every read and write goes through edge functions with the service role:
-- no public policy on the table or the bucket.

-- 1. The link. Random 256-bit token, replaced (old link dies) from the admin.
alter table public.bespoke_orders
  add column if not exists workshop_token text,
  add column if not exists workshop_token_created_at timestamptz;

create unique index if not exists bespoke_orders_workshop_token_key
  on public.bespoke_orders (workshop_token)
  where workshop_token is not null;

comment on column public.bespoke_orders.workshop_token is
  'Key of the workshop upload link /en/bespoke/workshop?t=<token>. Null = no link yet. Replacing it revokes the old link.';

-- 2. The files.
create table if not exists public.bespoke_workshop_files (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.bespoke_orders (id) on delete cascade,
  storage_path     text not null unique,
  file_name        text not null check (length(file_name) between 1 and 200),
  content_type     text,
  size_bytes       bigint,
  kind             text not null check (kind in ('video', 'image', 'cad', 'document', 'archive')),
  note             text check (note is null or length(note) <= 1000),
  uploaded_by      text not null default 'workshop' check (uploaded_by in ('workshop', 'admin')),
  show_to_customer boolean not null default false,
  created_at       timestamptz not null default now(),
  -- Set when the workshop's batch alert went to support@woolet.co.
  notified_at      timestamptz,
  removed_at       timestamptz
);

comment on table public.bespoke_workshop_files is
  'Files the workshop uploaded to a Bespoke order (bucket bespoke-workshop). Written by edge function bespoke-workshop-upload; managed in the admin via bespoke-admin-orders.';
comment on column public.bespoke_workshop_files.show_to_customer is
  'Shown on the customer model page when also uploaded before the last model_sent_at (see _shared/bespoke-workshop.ts).';

create index if not exists bespoke_workshop_files_order_idx
  on public.bespoke_workshop_files (order_id, created_at desc);

alter table public.bespoke_workshop_files enable row level security;

-- 3. Private bucket. 500 MB per file (model videos). The project-wide upload
--    limit in Storage settings must be at least this for large videos to pass.
insert into storage.buckets (id, name, public, file_size_limit)
values ('bespoke-workshop', 'bespoke-workshop', false, 524288000)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;
