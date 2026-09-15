create sequence if not exists public.bsp_seq start 1;

alter table public.bespoke_orders
  add column if not exists case_no text,
  add column if not exists case_seq int,
  add column if not exists stage text not null default 'paid',
  add column if not exists scan_token uuid not null default gen_random_uuid(),
  add column if not exists customer_token uuid not null default gen_random_uuid(),
  add column if not exists calendly_event_uri text,
  add column if not exists calendly_invitee_uri text,
  add column if not exists interview_at timestamptz,
  add column if not exists interview_timezone text,
  add column if not exists interview_answers jsonb,
  add column if not exists interview_completed_at timestamptz;

create unique index if not exists bespoke_orders_case_no_key on public.bespoke_orders(case_no) where case_no is not null;

create table if not exists public.bespoke_stage_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.bespoke_orders(id) on delete cascade,
  from_stage text,
  to_stage text not null,
  actor text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists bespoke_stage_history_order_idx on public.bespoke_stage_history(order_id, created_at desc);

grant all on public.bespoke_stage_history to service_role;

alter table public.bespoke_stage_history enable row level security;