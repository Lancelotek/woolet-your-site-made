-- Bespoke deposit plan (decision 11.11.2026).
--
-- The buyer pays a deposit at checkout (fit scan + 3D model). The balance is
-- charged after the buyer approves the 3D model, within 14 days of the day the
-- model was sent. A reminder goes out on day 10. If the balance is not paid in
-- time the order closes and the deposit is kept; the buyer owes nothing more.
--
-- Orders created before this migration keep payment_plan = 'full' and are not
-- touched by any of the deposit logic.

-- 1. Deposit amount lives in the live price table (0 = back to full payment).
alter table public.bespoke_pricing drop constraint if exists bespoke_pricing_key_check;
alter table public.bespoke_pricing
  add constraint bespoke_pricing_key_check
  check (key ~ '^(frame|lens):[a-z0-9-]+$' or key in ('engraving', 'deposit'));

insert into public.bespoke_pricing (key, label, amount_usd, sort_order) values
  ('deposit', 'Deposit paid at checkout (0 = full payment upfront)', 49, 60)
on conflict (key) do nothing;

-- 2. Payment columns on the order.
alter table public.bespoke_orders
  add column if not exists payment_plan text not null default 'full'
    check (payment_plan in ('full', 'deposit')),
  add column if not exists total_cents integer,
  add column if not exists deposit_cents integer,
  add column if not exists balance_cents integer,
  add column if not exists model_sent_at timestamptz,
  add column if not exists balance_due_at timestamptz,
  add column if not exists balance_reminder_sent_at timestamptz,
  add column if not exists balance_expired_at timestamptz,
  add column if not exists balance_paid_at timestamptz,
  add column if not exists balance_paid_cents integer,
  add column if not exists balance_session_id text,
  add column if not exists balance_payment_intent_id text,
  add column if not exists balance_paid_manually boolean not null default false;

comment on column public.bespoke_orders.payment_plan is
  'full = whole order paid at checkout; deposit = deposit at checkout, balance after 3D model approval.';
comment on column public.bespoke_orders.amount_cents is
  'Amount charged at checkout. On the deposit plan this is the deposit; total_cents is the order value.';
comment on column public.bespoke_orders.model_sent_at is
  'Last time the 3D model was sent to the buyer. Starts (or restarts, after a correction) the 14-day balance window.';

create index if not exists bespoke_orders_balance_open_idx
  on public.bespoke_orders (balance_due_at)
  where payment_plan = 'deposit' and balance_paid_at is null and balance_expired_at is null and model_sent_at is not null;

-- 3. Corrections the buyer asks for before approving the model ("fix the bridge").
create table if not exists public.bespoke_model_revisions (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.bespoke_orders (id) on delete cascade,
  note        text not null check (length(note) between 3 and 2000),
  created_at  timestamptz not null default now(),
  -- Set when a corrected model is sent (admin action "model sent").
  resolved_at timestamptz
);

comment on table public.bespoke_model_revisions is
  'Buyer requests to correct the 3D model before approval. Written by edge function bespoke-balance (service role); read by the admin panel.';

create index if not exists bespoke_model_revisions_order_idx
  on public.bespoke_model_revisions (order_id, created_at desc);

-- Server-only: no public policy, every read and write goes through edge functions.
alter table public.bespoke_model_revisions enable row level security;

-- 4. Daily job: day-10 reminder and day-14 expiry.
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.unschedule('bespoke-balance-daily')
where exists (select 1 from cron.job where jobname = 'bespoke-balance-daily');

select cron.schedule(
  'bespoke-balance-daily',
  '10 9 * * *',
  $$
  select net.http_post(
    url := 'https://wmefczrhnsqicikveuhz.supabase.co/functions/v1/bespoke-balance-cron',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
