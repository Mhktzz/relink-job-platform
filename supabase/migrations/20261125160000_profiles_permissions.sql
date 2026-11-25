-- Tambahkan kolom onboarding_complete jika belum ada (dipakai saat upsert profil di AuthPage)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

-- Pastikan role authenticated memiliki izin akses schema & tabel inti
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 1. Permissions & RLS untuk public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;

DROP POLICY IF EXISTS "Akses baca publik profiles" ON public.profiles;
DROP POLICY IF EXISTS "Akses insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Akses update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Pengguna membaca profil sendiri" ON public.profiles;
DROP POLICY IF EXISTS "Pengguna membuat profil sendiri" ON public.profiles;
DROP POLICY IF EXISTS "Pengguna memperbarui profil sendiri" ON public.profiles;

CREATE POLICY "Pengguna membaca profil sendiri"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Pengguna membuat profil sendiri"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Pengguna memperbarui profil sendiri"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

-- 2. Pastikan tabel operasional lain juga bisa diakses oleh user yang sudah login
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.escrow_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.proofs_of_work TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.support_tickets TO authenticated;
GRANT SELECT ON TABLE public.nearby_workers TO anon, authenticated;
