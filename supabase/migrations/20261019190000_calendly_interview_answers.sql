-- Fitting-interview answers from Calendly + the reference glasses the customer
-- brings to the call. Filled by the calendly-webhook function on every booking.
alter table public.bespoke_orders
  add column if not exists interview_answers jsonb,
  add column if not exists interview_fitlens_answer text,
  add column if not exists reference_glasses_raw text,
  add column if not exists reference_glasses jsonb,
  add column if not exists reference_glasses_checked_at timestamptz;

comment on column public.bespoke_orders.interview_answers is
  'Calendly questions_and_answers from the fitting-interview booking (latest booking wins).';
comment on column public.bespoke_orders.reference_glasses is
  'Parsed sizes (deterministic) + AI identification (unverified) of the customer''s reference glasses.';
