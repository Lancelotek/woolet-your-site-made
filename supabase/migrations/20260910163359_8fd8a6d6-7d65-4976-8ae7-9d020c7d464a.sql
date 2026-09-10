alter table public.bespoke_orders
  add column if not exists dossier_path text,
  add column if not exists dossier_rev int not null default 0;