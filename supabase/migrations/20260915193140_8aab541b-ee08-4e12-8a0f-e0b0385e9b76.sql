alter table public.bespoke_orders
  add column if not exists scan_email_sent_at timestamptz,
  add column if not exists mr_no text;

create table if not exists public.calendly_unmatched (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  invitee_uri text,
  event_uri text,
  email text,
  reason text,
  payload jsonb not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
grant all on public.calendly_unmatched to service_role;
alter table public.calendly_unmatched enable row level security;

create table if not exists public.bespoke_scan_contexts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.bespoke_orders(id) on delete cascade,
  case_no text not null,
  session_ref text,
  created_at timestamptz not null default now()
);
create index if not exists bespoke_scan_contexts_session_idx on public.bespoke_scan_contexts(session_ref);
create index if not exists bespoke_scan_contexts_case_idx on public.bespoke_scan_contexts(case_no);
grant all on public.bespoke_scan_contexts to service_role;
alter table public.bespoke_scan_contexts enable row level security;