-- ============================================================
-- SETUP LENGKAP SUPABASE - SUZUKI NJS GEDEBAGE
-- Jalankan SQL ini di: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tabel untuk form Test Drive
CREATE TABLE IF NOT EXISTS test_drive (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT,
  no_hp TEXT NOT NULL,
  tipe_mobil TEXT NOT NULL,
  tanggal DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel untuk form Simulasi Kredit
CREATE TABLE IF NOT EXISTS simulasi_kredit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  no_hp TEXT NOT NULL,
  tipe_mobil TEXT NOT NULL,
  tenor TEXT,
  uang_muka BIGINT,
  asal_kota TEXT,
  domisili TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel untuk Hero Banner (slider homepage)
CREATE TABLE IF NOT EXISTS hero_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel untuk gambar produk (per mobil)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_slug TEXT NOT NULL UNIQUE,
  img_hero TEXT,
  img_exterior TEXT,
  img_interior TEXT,
  img_listing TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel untuk pilihan warna per mobil
CREATE TABLE IF NOT EXISTS color_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_slug TEXT NOT NULL,
  variant_group TEXT,
  color_name TEXT NOT NULL,
  hex_color TEXT,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE test_drive ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulasi_kredit ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_variants ENABLE ROW LEVEL SECURITY;

-- Policy: izinkan SELECT publik (untuk website load gambar & data)
CREATE POLICY "Allow public select" ON hero_banners FOR SELECT USING (true);
CREATE POLICY "Allow public select" ON product_images FOR SELECT USING (true);
CREATE POLICY "Allow public select" ON color_variants FOR SELECT USING (true);
CREATE POLICY "Allow public select" ON test_drive FOR SELECT USING (true);
CREATE POLICY "Allow public select" ON simulasi_kredit FOR SELECT USING (true);

-- Policy: izinkan INSERT publik (untuk form website)
CREATE POLICY "Allow public insert" ON test_drive FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON simulasi_kredit FOR INSERT WITH CHECK (true);

-- Policy: izinkan DELETE publik (untuk panel admin)
CREATE POLICY "Allow public delete" ON test_drive FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON simulasi_kredit FOR DELETE USING (true);

-- ============================================================
-- SELESAI! Upload gambar ke Supabase Storage lalu masukkan
-- URL ke tabel product_images dan color_variants.
-- ============================================================
