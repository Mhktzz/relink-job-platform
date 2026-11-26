-- ========================================================
-- SKEMA DATABASE RELINK (SUPABASE POSTGRESQL)
-- Sesuai spesifikasi PRD.md (FR-101 s/d FR-603) & agent.md
-- ========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================
-- 2. TABEL: PROFILES (Akun Pengguna Klien UMKM, Mitra, Admin)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('klien', 'mitra', 'admin')),
  tier TEXT DEFAULT 'Tier 1' CHECK (tier IN ('Tier 1', 'Tier 2', 'Tier 3')),
  business_name TEXT,
  avatar_url TEXT,
  trust_score INT DEFAULT 98,
  is_verified BOOLEAN DEFAULT TRUE,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    user_id,
    full_name,
    phone,
    role,
    tier,
    business_name,
    trust_score,
    is_verified,
    onboarding_complete
  )
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
      NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
      'Pengguna'
    ),
    NULLIF(NEW.raw_user_meta_data ->> 'phone', ''),
    CASE
      WHEN NEW.raw_user_meta_data ->> 'role' = 'mitra' THEN 'mitra'
      ELSE 'klien'
    END,
    'Tier 1',
    NULLIF(NEW.raw_user_meta_data ->> 'business_name', ''),
    0,
    FALSE,
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

INSERT INTO public.profiles (
  id,
  user_id,
  full_name,
  phone,
  role,
  tier,
  business_name,
  trust_score,
  is_verified,
  onboarding_complete
)
SELECT
  auth_user.id,
  auth_user.id,
  COALESCE(
    NULLIF(auth_user.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(split_part(COALESCE(auth_user.email, ''), '@', 1), ''),
    'Pengguna'
  ),
  NULLIF(auth_user.raw_user_meta_data ->> 'phone', ''),
  CASE
    WHEN auth_user.raw_user_meta_data ->> 'role' = 'mitra' THEN 'mitra'
    ELSE 'klien'
  END,
  'Tier 1',
  NULLIF(auth_user.raw_user_meta_data ->> 'business_name', ''),
  0,
  FALSE,
  FALSE
FROM auth.users AS auth_user
LEFT JOIN public.profiles AS profile ON profile.id = auth_user.id
WHERE profile.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Data verifikasi pribadi mitra; akses dibatasi untuk pemilik akun.
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

-- Preferensi dan pengaturan akun bersifat privat untuk pemilik akun.
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- 3. TABEL: TASKS (Papan Tugas Operasional UMKM)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_code TEXT UNIQUE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  worker_name TEXT,
  worker_tier TEXT DEFAULT 'Tier 1',
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('operasional', 'display', 'kasir', 'inventaris', 'logistik')),
  tier_requirement TEXT NOT NULL DEFAULT 'Tier 1' CHECK (tier_requirement IN ('Tier 1', 'Tier 2', 'Tier 3')),
  budget NUMERIC(12, 2) NOT NULL DEFAULT 85000,
  workers_needed INT NOT NULL DEFAULT 1,
  is_tandem BOOLEAN DEFAULT FALSE,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'review', 'completed', 'disputed')),
  location_address TEXT DEFAULT 'Toko Kue Bu Rina, Tebet',
  due_date TEXT DEFAULT 'Hari ini, 17:00 WIB',
  has_proof BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 4. TABEL: ESCROW_TRANSACTIONS (Proteksi Dana & Auto-Release FR-401 & FR-404)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code TEXT UNIQUE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  task_title TEXT NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  worker_name TEXT NOT NULL,
  worker_tier TEXT DEFAULT 'Tier 1',
  task_amount NUMERIC(12, 2) NOT NULL,
  platform_fee NUMERIC(12, 2) NOT NULL DEFAULT 4000,
  guarantee_fund_fee NUMERIC(12, 2) NOT NULL DEFAULT 1000,
  total_amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'under_review', 'released', 'disputed', 'refunded')),
  auto_release_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 5. TABEL: PROOFS_OF_WORK (Bukti Digital Serah Terima FR-403)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.proofs_of_work (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  gps_latitude NUMERIC(10, 7),
  gps_longitude NUMERIC(10, 7),
  watermark_timestamp TIMESTAMPTZ DEFAULT NOW(),
  client_signature TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 6. TABEL: SUPPORT_TICKETS (Pusat Bantuan & Sengketa 48 Jam FR-601)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code TEXT UNIQUE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  task_name TEXT,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('kualitas', 'escrow', 'mitra', 'teknis')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
  subject TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'investigating' CHECK (status IN ('investigating', 'resolved', 'closed')),
  mediation_deadline TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 7. TABEL: NEARBY_WORKERS (Radar Mitra 1-5 km & Rising Star FR-204 & FR-505)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.nearby_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'Tier 1' CHECK (tier IN ('Tier 1', 'Tier 2', 'Tier 3')),
  rating NUMERIC(2, 1) NOT NULL DEFAULT 4.8,
  completed_tasks INT NOT NULL DEFAULT 12,
  distance_km NUMERIC(3, 1) NOT NULL DEFAULT 1.2,
  is_instant_ready BOOLEAN DEFAULT TRUE,
  is_rising_star BOOLEAN DEFAULT FALSE,
  skills TEXT[] DEFAULT ARRAY['Operasional Toko', 'Packing'],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proofs_of_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nearby_workers ENABLE ROW LEVEL SECURITY;

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

REVOKE ALL ON TABLE public.worker_verifications FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.worker_verifications TO authenticated;
CREATE POLICY "Mitra membaca verifikasi sendiri" ON public.worker_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Mitra mengirim verifikasi sendiri" ON public.worker_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Mitra memperbarui verifikasi sendiri" ON public.worker_verifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

REVOKE ALL ON TABLE public.user_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_settings TO authenticated;
CREATE POLICY "Pengguna membaca pengaturan sendiri" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Pengguna menyimpan pengaturan sendiri" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Pengguna memperbarui pengaturan sendiri" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

GRANT USAGE ON SCHEMA public TO authenticated;
REVOKE ALL ON TABLE public.tasks FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tasks TO authenticated;

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

CREATE POLICY "Akses baca publik escrow_transactions" ON public.escrow_transactions FOR SELECT USING (true);
CREATE POLICY "Akses insert escrow_transactions" ON public.escrow_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Akses update escrow_transactions" ON public.escrow_transactions FOR UPDATE USING (true);
CREATE POLICY "Akses delete publik escrow_transactions" ON public.escrow_transactions FOR DELETE USING (true);

CREATE POLICY "Akses baca publik proofs_of_work" ON public.proofs_of_work FOR SELECT USING (true);
CREATE POLICY "Akses insert proofs_of_work" ON public.proofs_of_work FOR INSERT WITH CHECK (true);
CREATE POLICY "Akses update proofs_of_work" ON public.proofs_of_work FOR UPDATE USING (true);
CREATE POLICY "Akses delete publik proofs_of_work" ON public.proofs_of_work FOR DELETE USING (true);

CREATE POLICY "Akses baca publik support_tickets" ON public.support_tickets FOR SELECT USING (true);
CREATE POLICY "Akses insert support_tickets" ON public.support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Akses update support_tickets" ON public.support_tickets FOR UPDATE USING (true);
CREATE POLICY "Akses delete publik support_tickets" ON public.support_tickets FOR DELETE USING (true);

CREATE POLICY "Akses baca publik nearby_workers" ON public.nearby_workers FOR SELECT USING (true);

-- ========================================================
-- 9. SEED DATA AWAL (Contoh Data Operasional UMKM Toko Kue Bu Rina)
-- ========================================================

-- Profil Admin Toko Kue Bu Rina
INSERT INTO public.profiles (id, full_name, phone, role, tier, business_name, trust_score, is_verified)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Bu Rina',
  '081234567890',
  'klien',
  'Tier 3',
  'Toko Kue Bu Rina',
  98,
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- Data Radar Mitra Terdekat
INSERT INTO public.nearby_workers (name, role_title, tier, rating, completed_tasks, distance_km, is_instant_ready, is_rising_star, skills)
VALUES
  ('Rian Pratama', 'Helper Gudang & Restock', 'Tier 1', 4.9, 14, 0.8, TRUE, TRUE, ARRAY['Bongkar Muat', 'Restock Etalase']),
  ('Siti Aminah', 'Kasir & Packing Toko', 'Tier 2', 4.8, 38, 1.4, TRUE, FALSE, ARRAY['Kasir POS', 'Packing Toples']),
  ('Budi Santoso', 'Spesialis Display & QC', 'Tier 3', 5.0, 92, 2.1, FALSE, FALSE, ARRAY['Lead Tandem', 'Quality Control']),
  ('Dewi Lestari', 'Helper Kitchen & Cuci', 'Tier 1', 4.7, 8, 2.7, TRUE, FALSE, ARRAY['Kitchen Prep', 'Sanitasi'])
ON CONFLICT DO NOTHING;

-- Data Tugas Awal
INSERT INTO public.tasks (id, task_code, title, category, tier_requirement, budget, workers_needed, is_tandem, checklist, status, location_address, due_date, has_proof, worker_name, worker_tier)
VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'TSK-101',
    'Packing & Labeling 500 Toples Nastar',
    'operasional',
    'Tier 1',
    85000,
    1,
    FALSE,
    '["Pasang seal plastik kedap udara", "Tempel stiker expired date 2027", "Susun ke dalam karton isi 12 toples"]'::jsonb,
    'review',
    'Toko Kue Bu Rina, Tebet',
    'Hari ini, 16:30 WIB',
    TRUE,
    'Rian Pratama',
    'Tier 1'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'TSK-102',
    'Bongkar Muat Bahan Baku Tepung 2 Ton',
    'operasional',
    'Tier 2',
    175000,
    2,
    TRUE,
    '["Turunkan karung terigu dari truk ke palet", "Cek kondisi karung dari kebocoran", "Susun bertingkat maksimal 8 lapis"]'::jsonb,
    'in_progress',
    'Gudang Bahan Baku Blok C',
    'Hari ini, 18:00 WIB',
    FALSE,
    'Budi Santoso (Lead)',
    'Tier 3'
  ),
  (
    'b3333333-3333-3333-3333-333333333333',
    'TSK-103',
    'Penataan Display Etalase Kue Basah',
    'display',
    'Tier 1',
    65000,
    1,
    FALSE,
    '["Lap bersih rak kaca etalase depan", "Tata kue lapis dan lemper sesuai label harga", "Foto etalase sebelum toko buka"]'::jsonb,
    'open',
    'Etalase Depan Kasir',
    'Besok, 06:30 WIB',
    FALSE,
    NULL,
    'Tier 1'
  )
ON CONFLICT (id) DO NOTHING;

-- Data Rekening Escrow Awal
INSERT INTO public.escrow_transactions (id, transaction_code, task_id, task_title, worker_name, worker_tier, task_amount, platform_fee, guarantee_fund_fee, total_amount, status, auto_release_at)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'ESC-9081',
    'b1111111-1111-1111-1111-111111111111',
    'Packing & Labeling 500 Toples Nastar',
    'Rian Pratama',
    'Tier 1',
    85000,
    4000,
    1000,
    90000,
    'under_review',
    NOW() + INTERVAL '28 hours'
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'ESC-9082',
    'b2222222-2222-2222-2222-222222222222',
    'Bongkar Muat Bahan Baku Tepung 2 Ton',
    'Budi Santoso',
    'Tier 3',
    175000,
    7000,
    2000,
    184000,
    'held',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- Data Tiket Pengaduan Bantuan Awal
INSERT INTO public.support_tickets (ticket_code, task_name, category, priority, subject, details, status)
VALUES
  (
    'TK-8421',
    'Packing & Labeling 500 Toples Nastar',
    'kualitas',
    'urgent',
    'Pemeriksaan Checklist Toples Bocor',
    'Terdapat 10 toples dengan seal miring, meminta mediasi untuk perbaikan perapian sebelum dana dilepas.',
    'investigating'
  )
ON CONFLICT (ticket_code) DO NOTHING;
