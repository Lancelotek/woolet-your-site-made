-- Hourly: one reminder to Bespoke customers who still have no complete shipping
-- address / phone 48 h after paying, plus an alert to support@woolet.co.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.unschedule('bespoke-shipping-reminder-hourly')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'bespoke-shipping-reminder-hourly');

SELECT cron.schedule(
  'bespoke-shipping-reminder-hourly',
  '17 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://wmefczrhnsqicikveuhz.supabase.co/functions/v1/bespoke-shipping-reminder',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
