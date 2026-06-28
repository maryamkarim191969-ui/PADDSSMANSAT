
CREATE TABLE IF NOT EXISTS public.system_settings (
  id text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
GRANT SELECT ON public.system_settings TO authenticated;
GRANT ALL ON public.system_settings TO service_role;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "system_settings read" ON public.system_settings;
CREATE POLICY "system_settings read" ON public.system_settings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "system_settings admin write" ON public.system_settings;
CREATE POLICY "system_settings admin write" ON public.system_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.backup ADD COLUMN IF NOT EXISTS bytes bigint;
ALTER TABLE public.backup ADD COLUMN IF NOT EXISTS storage_path text;

-- Ensure admins can manage backup rows; readers can list.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.backup TO authenticated;
GRANT ALL ON public.backup TO service_role;
ALTER TABLE public.backup ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "backup read" ON public.backup;
CREATE POLICY "backup read" ON public.backup
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "backup admin write" ON public.backup;
CREATE POLICY "backup admin write" ON public.backup
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin can purge / delete log_aktivitas rows.
DROP POLICY IF EXISTS "log admin delete" ON public.log_aktivitas;
CREATE POLICY "log admin delete" ON public.log_aktivitas
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
