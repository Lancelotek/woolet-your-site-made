
-- 1. profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  locale text DEFAULT 'en',
  marketing_opt_in boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.profiles_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_set_updated_at();

-- 2. trigger creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, locale)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'locale', 'en'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. scan_sessions.user_id + tighten RLS
ALTER TABLE public.scan_sessions
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX scan_sessions_user_id_idx ON public.scan_sessions(user_id);
CREATE INDEX scan_sessions_email_idx ON public.scan_sessions(lower(email));

DROP POLICY IF EXISTS "Anyone can read a scan session" ON public.scan_sessions;
DROP POLICY IF EXISTS "Anyone can update a scan session" ON public.scan_sessions;

-- keep anonymous INSERT for phone scans
-- new SELECT: anyone (anon) by id (existing handoff flow polls by id), authenticated owner sees own
CREATE POLICY "Read scan sessions (public by row, owner all)" ON public.scan_sessions
  FOR SELECT USING (
    user_id IS NULL OR user_id = auth.uid()
  );

CREATE POLICY "Update scan sessions (anon unlinked, owner own)" ON public.scan_sessions
  FOR UPDATE USING (
    user_id IS NULL OR user_id = auth.uid()
  ) WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

GRANT SELECT, INSERT, UPDATE ON public.scan_sessions TO authenticated;

-- 4. founding_members.user_id
ALTER TABLE public.founding_members
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX founding_members_user_id_idx ON public.founding_members(user_id);
CREATE INDEX founding_members_email_idx ON public.founding_members(lower(email));

CREATE POLICY "Users read own founding membership" ON public.founding_members
  FOR SELECT TO authenticated USING (user_id = auth.uid());

GRANT SELECT ON public.founding_members TO authenticated;

-- 5. backfill helper: link scans & orders by email to current user
CREATE OR REPLACE FUNCTION public.link_user_data_by_email()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  uemail text;
  linked_scans int := 0;
  linked_orders int := 0;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT email INTO uemail FROM auth.users WHERE id = uid;
  IF uemail IS NULL THEN
    RETURN jsonb_build_object('linked_scans', 0, 'linked_orders', 0);
  END IF;

  UPDATE public.scan_sessions
    SET user_id = uid
    WHERE user_id IS NULL AND lower(email) = lower(uemail);
  GET DIAGNOSTICS linked_scans = ROW_COUNT;

  UPDATE public.founding_members
    SET user_id = uid
    WHERE user_id IS NULL AND lower(email) = lower(uemail);
  GET DIAGNOSTICS linked_orders = ROW_COUNT;

  RETURN jsonb_build_object('linked_scans', linked_scans, 'linked_orders', linked_orders);
END; $$;

GRANT EXECUTE ON FUNCTION public.link_user_data_by_email() TO authenticated;
