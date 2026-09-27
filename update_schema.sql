-- 1. Tambah kolom img_listing di product_images (gambar thumbnail kartu mobil)
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS img_listing TEXT;

-- 2. Tambah kolom domisili di simulasi_kredit
ALTER TABLE simulasi_kredit ADD COLUMN IF NOT EXISTS domisili TEXT;
