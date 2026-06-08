GRANT DELETE ON public.scan_sessions TO authenticated;
CREATE POLICY "Owners can delete their scans"
  ON public.scan_sessions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());