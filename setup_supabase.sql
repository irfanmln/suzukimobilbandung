-- ============================================================
-- SETUP SUPABASE UNTUK SUZUKI GEDEBAGE
-- Jalankan SQL ini di: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tabel untuk Test Drive
CREATE TABLE IF NOT EXISTS test_drive (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT,
  no_hp TEXT NOT NULL,
  tipe_mobil TEXT NOT NULL,
  tanggal DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel untuk Simulasi Kredit
CREATE TABLE IF NOT EXISTS simulasi_kredit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  no_hp TEXT NOT NULL,
  tipe_mobil TEXT NOT NULL,
  tenor TEXT,
  uang_muka BIGINT,
  asal_kota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE test_drive ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulasi_kredit ENABLE ROW LEVEL SECURITY;

-- 4. Buat Policy: izinkan INSERT dari semua orang (untuk form website)
CREATE POLICY "Allow public insert" ON test_drive
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert" ON simulasi_kredit
  FOR INSERT WITH CHECK (true);

-- 5. Buat Policy: izinkan SELECT & DELETE hanya dengan anon key
--    (Untuk admin, gunakan service_role key atau autentikasi Supabase)
CREATE POLICY "Allow anon read" ON test_drive
  FOR SELECT USING (true);

CREATE POLICY "Allow anon read" ON simulasi_kredit
  FOR SELECT USING (true);

CREATE POLICY "Allow anon delete" ON test_drive
  FOR DELETE USING (true);

CREATE POLICY "Allow anon delete" ON simulasi_kredit
  FOR DELETE USING (true);

-- ============================================================
-- SELESAI! Sekarang masukkan URL dan Key ke file HTML
-- ============================================================
