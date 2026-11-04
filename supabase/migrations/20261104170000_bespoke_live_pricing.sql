-- Live Bespoke pricing: one table the configurator, checkout and Stripe charge
-- all read. Edit in /en/admin/bespoke → Pricing; changes reach open browsers
-- within seconds (Realtime) and the next checkout session immediately.
--
-- Keys: frame:base, frame:<frameId> (optional override), lens:<lensTypeId>, engraving.
-- Defaults mirror src/content/bespokePrices.ts.

create table if not exists public.bespoke_pricing (
  key         text primary key check (key ~ '^(frame|lens):[a-z0-9-]+$' or key = 'engraving'),
  label       text not null,
  amount_usd  numeric(10,2) not null check (amount_usd >= 0 and amount_usd <= 10000),
  sort_order  int not null default 0,
  updated_at  timestamptz not null default now()
);

comment on table public.bespoke_pricing is
  'Live Woolet Bespoke prices (USD). Read by the configurator (anon select) and create-bespoke-checkout (service role). Writes only via bespoke-pricing-admin.';

alter table public.bespoke_pricing enable row level security;

drop policy if exists "bespoke_pricing public read" on public.bespoke_pricing;
create policy "bespoke_pricing public read" on public.bespoke_pricing
  for select to anon, authenticated using (true);

insert into public.bespoke_pricing (key, label, amount_usd, sort_order) values
  ('frame:base',      'Bespoke frame (all models)',    480, 10),
  ('lens:none',       'No lenses - frame only',          0, 20),
  ('lens:plano',      'Plano - clear, no correction',   30, 30),
  ('lens:blue-light', 'Blue Light Lenses',              84, 40),
  ('engraving',       'Temple engraving',               10, 50)
on conflict (key) do nothing;

-- Coupons: server-only (no public policy), so codes are never shipped to the browser.
create table if not exists public.bespoke_coupons (
  code         text primary key check (code = upper(code) and length(code) between 3 and 40),
  percent_off  int not null check (percent_off between 1 and 100),
  active       boolean not null default true,
  note         text,
  updated_at   timestamptz not null default now()
);

comment on table public.bespoke_coupons is
  'Bespoke discount codes. Service role only; validated by create-bespoke-checkout.';

alter table public.bespoke_coupons enable row level security;

insert into public.bespoke_coupons (code, percent_off, note) values
  ('KICKSTARTER2026', 40, 'Kickstarter backers')
on conflict (code) do nothing;

-- Push price edits to open configurators.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bespoke_pricing'
     ) then
    alter publication supabase_realtime add table public.bespoke_pricing;
  end if;
end $$;
