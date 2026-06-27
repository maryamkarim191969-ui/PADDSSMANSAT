DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','staff_tu','viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Aktif',
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
  ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'staff_tu' THEN 2 ELSE 3 END
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name',''), COALESCE(NEW.email,''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

DROP POLICY IF EXISTS "profiles read own" ON public.profiles;
CREATE POLICY "profiles read own" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "profiles self update" ON public.profiles;
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "user_roles read own" ON public.user_roles;
CREATE POLICY "user_roles read own" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "user_roles admin insert" ON public.user_roles;
CREATE POLICY "user_roles admin insert" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "user_roles admin update" ON public.user_roles;
CREATE POLICY "user_roles admin update" ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "user_roles admin delete" ON public.user_roles;
CREATE POLICY "user_roles admin delete" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.arsip (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_surat text NOT NULL,
  judul text NOT NULL,
  kategori text NOT NULL,
  jenis text NOT NULL,
  tahun integer NOT NULL,
  lokasi_fisik text,
  status text NOT NULL DEFAULT 'Aktif',
  deskripsi text,
  pdf_url text,
  storage_provider text,
  bucket_name text,
  storage_path text,
  file_name text,
  mime_type text,
  file_size bigint,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.arsip
  ADD COLUMN IF NOT EXISTS storage_provider text,
  ADD COLUMN IF NOT EXISTS bucket_name text,
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS file_size bigint;
CREATE UNIQUE INDEX IF NOT EXISTS arsip_storage_path_unique
  ON public.arsip (storage_path) WHERE storage_path IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.arsip TO authenticated;
GRANT ALL ON public.arsip TO service_role;
ALTER TABLE public.arsip ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "arsip read all authed" ON public.arsip;
CREATE POLICY "arsip read all authed" ON public.arsip FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "arsip write staff admin" ON public.arsip;
CREATE POLICY "arsip write staff admin" ON public.arsip FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'staff_tu') OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "arsip update staff admin" ON public.arsip;
CREATE POLICY "arsip update staff admin" ON public.arsip FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'staff_tu') OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "arsip delete admin" ON public.arsip;
CREATE POLICY "arsip delete admin" ON public.arsip FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff_tu'));

CREATE TABLE IF NOT EXISTS public.kategori (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  kode text NOT NULL UNIQUE,
  deskripsi text,
  status text NOT NULL DEFAULT 'Aktif',
  jumlah_arsip integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kategori TO authenticated;
GRANT ALL ON public.kategori TO service_role;
ALTER TABLE public.kategori ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kategori read all authed" ON public.kategori;
CREATE POLICY "kategori read all authed" ON public.kategori FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "kategori write staff admin" ON public.kategori;
CREATE POLICY "kategori write staff admin" ON public.kategori FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'staff_tu') OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "kategori update staff admin" ON public.kategori;
CREATE POLICY "kategori update staff admin" ON public.kategori FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'staff_tu') OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "kategori delete admin" ON public.kategori;
CREATE POLICY "kategori delete admin" ON public.kategori FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.lokasi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  kode text NOT NULL UNIQUE,
  ruangan text,
  rak text,
  status text NOT NULL DEFAULT 'Aktif',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lokasi ADD COLUMN IF NOT EXISTS deskripsi text;
ALTER TABLE public.lokasi ADD COLUMN IF NOT EXISTS jumlah_arsip integer NOT NULL DEFAULT 0;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lokasi TO authenticated;
GRANT ALL ON public.lokasi TO service_role;
ALTER TABLE public.lokasi ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lokasi read all authed" ON public.lokasi;
CREATE POLICY "lokasi read all authed" ON public.lokasi FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "lokasi write staff admin" ON public.lokasi;
CREATE POLICY "lokasi write staff admin" ON public.lokasi FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'staff_tu') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'staff_tu') OR public.has_role(auth.uid(),'admin'));

INSERT INTO public.lokasi (nama, kode, ruangan, rak, status)
SELECT * FROM (VALUES
  ('Lemari A1','LMA-1','Ruang Arsip','Rak 1','Aktif'),
  ('Lemari A2','LMA-2','Ruang Arsip','Rak 2','Aktif'),
  ('Rak B1','RKB-1','Ruang Arsip','Rak 3','Aktif'),
  ('Rak B2','RKB-2','Ruang Arsip','Rak 4','Aktif'),
  ('Gudang Arsip','GDA-1','Gudang','Rak Utama','Aktif')
) AS v(nama, kode, ruangan, rak, status)
WHERE NOT EXISTS (SELECT 1 FROM public.lokasi);

CREATE TABLE IF NOT EXISTS public.qr_code (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  arsip_id uuid REFERENCES public.arsip(id) ON DELETE CASCADE,
  nomor_surat text,
  nama_arsip text,
  public_link text NOT NULL,
  status text NOT NULL DEFAULT 'Aktif',
  total_scan integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qr_code TO authenticated;
GRANT ALL ON public.qr_code TO service_role;
ALTER TABLE public.qr_code ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "qr read all authed" ON public.qr_code;
CREATE POLICY "qr read all authed" ON public.qr_code FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "qr write staff admin" ON public.qr_code;
CREATE POLICY "qr write staff admin" ON public.qr_code FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'staff_tu') OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "qr update staff admin" ON public.qr_code;
CREATE POLICY "qr update staff admin" ON public.qr_code FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'staff_tu') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.backup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  scope text NOT NULL DEFAULT 'full',
  size text NOT NULL DEFAULT '0 KB',
  type text NOT NULL DEFAULT 'Manual',
  status text NOT NULL DEFAULT 'Proses',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.backup TO authenticated;
GRANT ALL ON public.backup TO service_role;
ALTER TABLE public.backup ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "backup read admin" ON public.backup;
CREATE POLICY "backup read admin" ON public.backup FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff_tu'));
DROP POLICY IF EXISTS "backup write admin" ON public.backup;
CREATE POLICY "backup write admin" ON public.backup FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.log_aktivitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_name text,
  action text NOT NULL,
  detail text,
  tool_name text,
  target_id text,
  status text NOT NULL DEFAULT 'success',
  source text NOT NULL DEFAULT 'manual',
  at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.log_aktivitas TO authenticated;
GRANT ALL ON public.log_aktivitas TO service_role;
ALTER TABLE public.log_aktivitas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "log read own or admin" ON public.log_aktivitas;
CREATE POLICY "log read own or admin" ON public.log_aktivitas FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "log write self or system" ON public.log_aktivitas;
CREATE POLICY "log write self or system" ON public.log_aktivitas FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.user_security_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  security_code_hash text NOT NULL,
  failed_attempts integer NOT NULL DEFAULT 0,
  last_failed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_security_settings TO authenticated;
GRANT ALL ON public.user_security_settings TO service_role;
ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sec self read" ON public.user_security_settings;
CREATE POLICY "sec self read" ON public.user_security_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "sec self upsert" ON public.user_security_settings;
CREATE POLICY "sec self upsert" ON public.user_security_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "sec self update" ON public.user_security_settings;
CREATE POLICY "sec self update" ON public.user_security_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id);