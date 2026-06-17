ALTER FUNCTION public.bespoke_configs_set_updated_at() SECURITY INVOKER;
ALTER FUNCTION public.bespoke_configs_unset_other_current() SECURITY INVOKER;
REVOKE EXECUTE ON FUNCTION public.bespoke_configs_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bespoke_configs_unset_other_current() FROM PUBLIC, anon, authenticated;