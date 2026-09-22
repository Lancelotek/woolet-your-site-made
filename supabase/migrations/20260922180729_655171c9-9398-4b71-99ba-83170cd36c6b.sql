ALTER TABLE public.bespoke_orders
  ADD COLUMN IF NOT EXISTS source text;

ALTER TABLE public.bespoke_orders
  DROP CONSTRAINT IF EXISTS bespoke_orders_source_check;

ALTER TABLE public.bespoke_orders
  ADD CONSTRAINT bespoke_orders_source_check CHECK (
    source IS NULL OR source IN (
      'ChatGPT',
      'Other AI assistant (Perplexity, Gemini, Claude)',
      'Google',
      'Instagram',
      'TikTok',
      'Facebook',
      'Friend',
      'Other'
    )
  );