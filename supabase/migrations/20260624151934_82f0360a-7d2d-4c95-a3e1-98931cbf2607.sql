
CREATE POLICY "bespoke_scans_user_select" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'bespoke-scans' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "bespoke_scans_user_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'bespoke-scans' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "bespoke_scans_user_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'bespoke-scans' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "bespoke_scans_user_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'bespoke-scans' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Anonymous scans live under an "anon/<scanId>/" prefix; we allow inserts only
-- so the edge function (or signed-out flow) can write frames. Reads/deletes
-- stay restricted to service_role for privacy.
CREATE POLICY "bespoke_scans_anon_insert" ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'bespoke-scans' AND (storage.foldername(name))[1] = 'anon');
