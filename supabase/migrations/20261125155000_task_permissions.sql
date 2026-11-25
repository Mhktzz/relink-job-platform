ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO authenticated;
REVOKE ALL ON TABLE public.tasks FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tasks TO authenticated;

DROP POLICY IF EXISTS "Akses baca publik tasks" ON public.tasks;
DROP POLICY IF EXISTS "Akses insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Akses update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Akses delete publik tasks" ON public.tasks;
DROP POLICY IF EXISTS "Pengguna melihat tugas tersedia dan miliknya" ON public.tasks;
DROP POLICY IF EXISTS "UMKM membuat tugas miliknya" ON public.tasks;
DROP POLICY IF EXISTS "UMKM dan mitra memperbarui tugas terkait" ON public.tasks;
DROP POLICY IF EXISTS "UMKM menghapus tugas miliknya" ON public.tasks;

CREATE POLICY "Pengguna melihat tugas tersedia dan miliknya"
  ON public.tasks FOR SELECT TO authenticated
  USING (
    client_id = auth.uid()
    OR worker_id = auth.uid()
    OR (worker_id IS NULL AND status IN ('open', 'in_progress'))
  );

CREATE POLICY "UMKM membuat tugas miliknya"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "UMKM dan mitra memperbarui tugas terkait"
  ON public.tasks FOR UPDATE TO authenticated
  USING (
    client_id = auth.uid()
    OR worker_id = auth.uid()
    OR (worker_id IS NULL AND status IN ('open', 'in_progress'))
  )
  WITH CHECK (client_id = auth.uid() OR worker_id = auth.uid());

CREATE POLICY "UMKM menghapus tugas miliknya"
  ON public.tasks FOR DELETE TO authenticated
  USING (client_id = auth.uid());
