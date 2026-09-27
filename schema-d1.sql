-- ============================================================
-- SCHEMA CLOUDFLARE D1 (SQLite) - SUZUKIMOBILBANDUNG
-- Pengganti Supabase. Tidak pernah pause seperti Supabase free.
-- Cara pakai:
--   npx wrangler d1 create suzukimobilbandung-db
--   npx wrangler d1 execute suzukimobilbandung-db --file=./schema-d1.sql
-- ============================================================

-- 1. Form Test Drive (public INSERT, admin SELECT/DELETE)
CREATE TABLE IF NOT EXISTS test_drive (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  email TEXT,
  no_hp TEXT NOT NULL,
  tipe_mobil TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_test_drive_created ON test_drive(created_at DESC);

-- 2. Form Simulasi Kredit (public INSERT, admin SELECT/DELETE)
CREATE TABLE IF NOT EXISTS simulasi_kredit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  no_hp TEXT NOT NULL,
  tipe_mobil TEXT NOT NULL,
  tenor TEXT,
  uang_muka INTEGER,
  asal_kota TEXT,
  domisili TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_simulasi_created ON simulasi_kredit(created_at DESC);

-- 3. Hero Banner homepage (public SELECT active, admin full CRUD)
CREATE TABLE IF NOT EXISTS hero_banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 4. Gambar produk per mobil (public SELECT, admin UPSERT)
CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  car_slug TEXT NOT NULL UNIQUE,
  img_hero TEXT,
  img_exterior TEXT,
  img_interior TEXT,
  img_listing TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 5. Varian warna per mobil (public SELECT, admin INSERT/DELETE)
CREATE TABLE IF NOT EXISTS color_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  car_slug TEXT NOT NULL,
  variant_group TEXT,
  color_name TEXT NOT NULL,
  hex_color TEXT,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_colors_slug ON color_variants(car_slug, sort_order, id);

-- 6. Harga OTR (public SELECT, admin UPSERT)
-- CATATAN: halaman produk publik masih hardcoded di HTML,
-- tabel ini baru dipakai admin. Nanti bisa dibaca via /api/otr-prices.
CREATE TABLE IF NOT EXISTS otr_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  car_slug TEXT NOT NULL,
  idx INTEGER NOT NULL,
  tipe TEXT NOT NULL,
  harga TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(car_slug, idx)
);

-- 7. Foto delivery (public SELECT, admin INSERT/DELETE)
-- Tabel ini tidak ada di *.sql Supabase lama (dibuat manual di dashboard),
-- di sini dibuat eksplisit agar fresh install langsung jalan.
CREATE TABLE IF NOT EXISTS delivery_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
