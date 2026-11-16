-- Bespoke fitting follow-up (decision 16.11.2026).
--
-- bespoke-balance-cron now also chases a fitting form that arrived with holes
-- (no FitLens scan, no side photo, no glasses numbers): ask, one reminder
-- 3 days later, support alert 3 days after that. The ask should reach the
-- customer soon after the form, so the job runs every hour instead of once a
-- day. The function is idempotent: every email is logged before it is sent.

select cron.unschedule('bespoke-balance-daily')
where exists (select 1 from cron.job where jobname = 'bespoke-balance-daily');

select cron.unschedule('bespoke-balance-hourly')
where exists (select 1 from cron.job where jobname = 'bespoke-balance-hourly');

select cron.schedule(
  'bespoke-balance-hourly',
  '10 * * * *',
  $$
  select net.http_post(
    url := 'https://wmefczrhnsqicikveuhz.supabase.co/functions/v1/bespoke-balance-cron',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
