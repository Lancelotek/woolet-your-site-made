CREATE TABLE public.bespoke_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  config JSONB NOT NULL,
  pricing_total_eur NUMERIC(10,2),
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX bespoke_configs_user_id_idx ON public.bespoke_configs(user_id);
CREATE UNIQUE INDEX bespoke_configs_one_current_per_user
  ON public.bespoke_configs(user_id) WHERE is_current = true;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bespoke_configs TO authenticated;
GRANT ALL ON public.bespoke_configs TO service_role;

ALTER TABLE public.bespoke_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own bespoke configs"
  ON public.bespoke_configs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own bespoke configs"
  ON public.bespoke_configs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own bespoke configs"
  ON public.bespoke_configs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete their own bespoke configs"
  ON public.bespoke_configs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.bespoke_configs_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER bespoke_configs_updated_at
  BEFORE UPDATE ON public.bespoke_configs
  FOR EACH ROW EXECUTE FUNCTION public.bespoke_configs_set_updated_at();

CREATE OR REPLACE FUNCTION public.bespoke_configs_unset_other_current()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.is_current THEN
    UPDATE public.bespoke_configs
       SET is_current = false
     WHERE user_id = NEW.user_id
       AND id <> NEW.id
       AND is_current = true;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER bespoke_configs_one_current
  AFTER INSERT OR UPDATE OF is_current ON public.bespoke_configs
  FOR EACH ROW EXECUTE FUNCTION public.bespoke_configs_unset_other_current();