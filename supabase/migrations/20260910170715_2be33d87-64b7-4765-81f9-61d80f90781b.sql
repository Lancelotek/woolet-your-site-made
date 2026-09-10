CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.unschedule('bespoke-photo-purge-daily')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'bespoke-photo-purge-daily');

SELECT cron.schedule(
  'bespoke-photo-purge-daily',
  '20 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://wmefczrhnsqicikveuhz.supabase.co/functions/v1/bespoke-photo-purge',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);