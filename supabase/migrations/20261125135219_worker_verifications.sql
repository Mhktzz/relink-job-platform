CREATE TABLE IF NOT EXISTS public.worker_verifications (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  domicile TEXT NOT NULL,
  marital_status TEXT NOT NULL CHECK (marital_status IN ('belum_menikah', 'menikah', 'cerai_hidup', 'cerai_mati')),
  nik TEXT NOT NULL CHECK (nik ~ '^[0-9]{16}$'),
  mother_name TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'submitted' CHECK (verification_status IN ('submitted', 'verified', 'rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.worker_verifications ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.worker_verifications FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.worker_verifications TO authenticated;

DROP POLICY IF EXISTS "Mitra membaca verifikasi sendiri" ON public.worker_verifications;
DROP POLICY IF EXISTS "Mitra mengirim verifikasi sendiri" ON public.worker_verifications;
DROP POLICY IF EXISTS "Mitra memperbarui verifikasi sendiri" ON public.worker_verifications;

CREATE POLICY "Mitra membaca verifikasi sendiri"
  ON public.worker_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Mitra mengirim verifikasi sendiri"
  ON public.worker_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mitra memperbarui verifikasi sendiri"
  ON public.worker_verifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
