-- Bespoke "visualization first" plan (decision 17.11.2026).
--
-- flow_version 1: deposit -> 3D model -> balance (every order so far).
-- flow_version 2: deposit -> visualization with dimensions -> balance ->
--                 3D model with up to 3 corrections -> build.
-- Existing orders stay on 1. Nothing sets 2 until the checkout is switched.

alter table public.bespoke_orders
  add column if not exists flow_version smallint not null default 1,
  add column if not exists preview_sent_at timestamptz,
  add column if not exists model_approved_at timestamptz;

comment on column public.bespoke_orders.flow_version is
  '1 = balance after the 3D model. 2 = balance after the visualization, then the 3D model with up to 3 corrections.';
comment on column public.bespoke_orders.preview_sent_at is
  'Flow 2: when the visualization with dimensions went to the customer. Starts the 3-day window for the balance.';
comment on column public.bespoke_orders.model_approved_at is
  'Flow 2: when the customer approved the 3D model (the balance is already paid by then).';
