CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.user_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_settings TO authenticated;

DROP POLICY IF EXISTS "Pengguna membaca pengaturan sendiri" ON public.user_settings;
DROP POLICY IF EXISTS "Pengguna menyimpan pengaturan sendiri" ON public.user_settings;
DROP POLICY IF EXISTS "Pengguna memperbarui pengaturan sendiri" ON public.user_settings;

CREATE POLICY "Pengguna membaca pengaturan sendiri"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Pengguna menyimpan pengaturan sendiri"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna memperbarui pengaturan sendiri"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
