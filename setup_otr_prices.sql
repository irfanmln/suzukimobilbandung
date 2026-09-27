-- Jalankan SQL ini di: Supabase Dashboard → SQL Editor
-- Menyimpan harga OTR yang diedit lewat tab "Update OTR" di admin panel.
-- CATATAN: halaman produk publik (jimny.html, dll) masih menampilkan harga
-- hardcoded di HTML, belum membaca dari tabel ini.

CREATE TABLE IF NOT EXISTS otr_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_slug TEXT NOT NULL,
  idx INT NOT NULL,
  tipe TEXT NOT NULL,
  harga TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(car_slug, idx)
);

ALTER TABLE otr_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON otr_prices FOR SELECT USING (true);
CREATE POLICY "Allow public upsert" ON otr_prices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON otr_prices FOR UPDATE USING (true);

-- Jaga-jaga: product_images dan color_variants di setup_supabase_full.sql hanya
-- punya policy SELECT publik. Tab "Gambar Produk" dan "Warna Mobil" di admin
-- perlu INSERT/UPDATE/DELETE juga. Aman dijalankan ulang (drop dulu jika sudah ada).
DROP POLICY IF EXISTS "Allow public insert" ON product_images;
DROP POLICY IF EXISTS "Allow public update" ON product_images;
CREATE POLICY "Allow public insert" ON product_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON product_images FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON color_variants;
DROP POLICY IF EXISTS "Allow public delete" ON color_variants;
CREATE POLICY "Allow public insert" ON color_variants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON color_variants FOR DELETE USING (true);
