
CREATE TABLE public.bespoke_scan_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  face_width_mm numeric(5,2),
  nose_bridge_width_mm numeric(5,2),
  nose_bridge_height_mm numeric(5,2),
  temple_length_left_mm numeric(5,2),
  temple_length_right_mm numeric(5,2),
  pantoscopic_angle_deg numeric(4,1),
  asymmetry_mm numeric(4,2),
  pd_mm numeric(5,2),
  confidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_frames jsonb NOT NULL DEFAULT '{}'::jsonb,
  capture_method text NOT NULL DEFAULT 'card-multi-frame',
  status text NOT NULL DEFAULT 'in_progress',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bespoke_scan_profiles TO authenticated;
GRANT ALL ON public.bespoke_scan_profiles TO service_role;

ALTER TABLE public.bespoke_scan_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own bespoke scan profiles"
  ON public.bespoke_scan_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER bespoke_scan_profiles_set_updated_at
  BEFORE UPDATE ON public.bespoke_scan_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.scan_sessions_set_updated_at();

CREATE INDEX bespoke_scan_profiles_user_id_idx ON public.bespoke_scan_profiles(user_id);
CREATE INDEX bespoke_scan_profiles_email_idx ON public.bespoke_scan_profiles(lower(email));
