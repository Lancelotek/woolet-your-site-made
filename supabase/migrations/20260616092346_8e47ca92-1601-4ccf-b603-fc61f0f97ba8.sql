
-- 1) Add private access_token to scan_sessions for tokenized public access via edge functions
ALTER TABLE public.scan_sessions
  ADD COLUMN IF NOT EXISTS access_token text;

CREATE INDEX IF NOT EXISTS scan_sessions_access_token_idx ON public.scan_sessions(access_token);

-- 2) Tighten RLS on scan_sessions: remove anonymous read/update of unlinked rows.
DROP POLICY IF EXISTS "Read scan sessions (public by row, owner all)" ON public.scan_sessions;
DROP POLICY IF EXISTS "Update scan sessions (anon unlinked, owner own)" ON public.scan_sessions;
DROP POLICY IF EXISTS "Anyone can create a scan session" ON public.scan_sessions;

-- Owner-only direct reads/updates. Anonymous handoff goes through edge functions (service_role).
CREATE POLICY "Owners can read own scans"
  ON public.scan_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Owners can update own scans"
  ON public.scan_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Authenticated users may create rows for themselves only. Anonymous inserts go through edge function.
CREATE POLICY "Authenticated can create own scan"
  ON public.scan_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Revoke anon direct table access (edge functions use service_role)
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.scan_sessions FROM anon;

-- 3) Remove scan_sessions from the realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.scan_sessions;

-- 4) Lock down email-assets storage bucket: service_role only
DROP POLICY IF EXISTS "Public read email-assets" ON storage.objects;

CREATE POLICY "Service role can read email-assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'email-assets' AND auth.role() = 'service_role');

-- 5) Fix function search_path on email queue helpers + revoke public EXECUTE
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pgmq
AS $function$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$function$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
 RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pgmq
AS $function$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pgmq
AS $function$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pgmq
AS $function$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$function$;

-- 6) Revoke EXECUTE from anon/authenticated on SECURITY DEFINER helpers that should be service-only
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.scan_sessions_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.profiles_set_updated_at() FROM PUBLIC, anon, authenticated;

-- link_user_data_by_email is intentionally callable by authenticated users (claims their data on sign-in).
REVOKE EXECUTE ON FUNCTION public.link_user_data_by_email() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_user_data_by_email() TO authenticated;

-- founding_members_count is intentionally public (waitlist progress UI).
GRANT EXECUTE ON FUNCTION public.founding_members_count(text) TO anon, authenticated;
