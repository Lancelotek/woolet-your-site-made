create table public.founding_members (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  recommended_sku text,
  stripe_session_id text not null unique,
  stripe_payment_intent_id text,
  amount_cents integer not null default 100,
  currency text not null default 'usd',
  environment text not null default 'sandbox',
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_founding_members_email on public.founding_members(email);
create index idx_founding_members_env_created on public.founding_members(environment, created_at desc);

alter table public.founding_members enable row level security;

create policy "Service role manages founding_members"
  on public.founding_members for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.founding_members_count(check_env text default 'live')
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.founding_members where environment = check_env;
$$;

grant execute on function public.founding_members_count(text) to anon, authenticated;