#!/usr/bin/env python3
"""
Setup Script - Suzuki Dealer Website
=====================================
Jalankan script ini saat setup website untuk klien baru.
Script akan mengganti semua konfigurasi di semua file HTML sekaligus.

Cara pakai:
  1. Clone repo ke folder baru
  2. Jalankan: python setup_klien.py
  3. Ikuti instruksi yang muncul
  4. Push ke GitHub klien
"""

import os
import re

# ─── Warna terminal ───────────────────────────────────────
GREEN  = '\033[92m'
YELLOW = '\033[93m'
RED    = '\033[91m'
BOLD   = '\033[1m'
RESET  = '\033[0m'

def p(msg, color=''): print(f"{color}{msg}{RESET}")

# ─── File HTML yang perlu diupdate ───────────────────────
HTML_FILES = [
    'index.html',
    'produk.html',
    'admin.html',
    'grand-vitara.html',
    'fronx.html',
    'jimny.html',
    'new-xl7.html',
    'all-new-ertiga.html',
    'apv.html',
    's-presso.html',
    'new-carry-pick-up.html',
]

# ─── Nilai lama (dealer Gedebage) ────────────────────────
OLD_VALUES = {
    'sb_url':       'https://jglkpcywzmmaetbxwllr.supabase.co',
    'sb_key':       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnbGtwY3l3em1tYWV0Ynh3bGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyOTUyMjEsImV4cCI6MjA4ODg3MTIyMX0.7qL9gfM6Gjy5wBgxdlxqiW5-TXzwcOBpRcmskZw0jYQ',
    'wa_number':    '6285173340806',
    'dealer_name':  'Suzuki Gedebage Bandung',
    'dealer_addr':  'Jl. Soekarno-Hatta No.700, Cipamokolan, Kec. Rancasari, Kota Bandung, Jawa Barat 40292',
    'dealer_email': 'suzukigedebage@gmail.com',
    'dealer_phone': '+62 851-7334-0806',
    'logo_url':     'https://suzukigedebage.com/wp-content/uploads/2025/06/logo-suzuki-300x57.webp',
}

def get_input(label, old_value):
    p(f"\n  {BOLD}{label}{RESET}", '')
    p(f"  Nilai lama : {old_value}", YELLOW)
    new_val = input(f"  Nilai baru : ").strip()
    if not new_val:
        p("  → Dilewati (tetap pakai nilai lama)", YELLOW)
        return old_value
    return new_val

def replace_in_file(filepath, old, new):
    if old == new:
        return 0
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    count = content.count(old)
    if count > 0:
        content = content.replace(old, new)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    return count

def main():
    p(f"\n{'='*55}", BOLD)
    p(f"  SETUP WEBSITE SUZUKI DEALER — KLIEN BARU", BOLD)
    p(f"{'='*55}", BOLD)
    p("\nScript ini akan mengganti konfigurasi di semua file HTML.")
    p("Kosongkan input dan tekan Enter untuk melewati (skip).\n")

    # ─── Input nilai baru ─────────────────────────────────
    p("[ SUPABASE ]", BOLD)
    new_sb_url  = get_input("Supabase URL", OLD_VALUES['sb_url'])
    new_sb_key  = get_input("Supabase Anon Key", OLD_VALUES['sb_key'][:40]+'...')
    # Untuk key, input penuh
    if new_sb_key.endswith('...'):
        new_sb_key = OLD_VALUES['sb_key']  # skip jika tidak diisi

    p("\n[ KONTAK DEALER ]", BOLD)
    new_wa      = get_input("Nomor WhatsApp (format: 628xxx)", OLD_VALUES['wa_number'])
    new_phone   = get_input("Nomor Telepon (format: +62 xxx)", OLD_VALUES['dealer_phone'])
    new_email   = get_input("Email", OLD_VALUES['dealer_email'])

    p("\n[ INFO DEALER ]", BOLD)
    new_name    = get_input("Nama Dealer", OLD_VALUES['dealer_name'])
    new_addr    = get_input("Alamat Lengkap", OLD_VALUES['dealer_addr'])
    new_logo    = get_input("URL Logo", OLD_VALUES['logo_url'])

    # ─── Konfirmasi ───────────────────────────────────────
    p(f"\n{'─'*55}", '')
    p("  RINGKASAN PERUBAHAN:", BOLD)
    changes = [
        ("Supabase URL",  OLD_VALUES['sb_url'],       new_sb_url),
        ("Supabase Key",  OLD_VALUES['sb_key'][:30]+'...', new_sb_key[:30]+'...'),
        ("WhatsApp",      OLD_VALUES['wa_number'],    new_wa),
        ("Telepon",       OLD_VALUES['dealer_phone'], new_phone),
        ("Email",         OLD_VALUES['dealer_email'], new_email),
        ("Nama Dealer",   OLD_VALUES['dealer_name'],  new_name),
        ("Alamat",        OLD_VALUES['dealer_addr'][:40]+'...', new_addr[:40]+'...'),
        ("Logo URL",      OLD_VALUES['logo_url'][:40]+'...', new_logo[:40]+'...'),
    ]
    for label, old, new in changes:
        status = GREEN+'✓ DIUBAH'+RESET if old != new else YELLOW+'– SAMA'+RESET
        print(f"  {status}  {label}")

    p(f"{'─'*55}", '')
    confirm = input(f"\n{BOLD}Lanjutkan? (y/n): {RESET}").strip().lower()
    if confirm != 'y':
        p("\nDibatalkan.", RED)
        return

    # ─── Mapping old → new ────────────────────────────────
    replacements = [
        (OLD_VALUES['sb_url'],       new_sb_url),
        (OLD_VALUES['sb_key'],       new_sb_key),
        (OLD_VALUES['wa_number'],    new_wa),
        (OLD_VALUES['dealer_phone'], new_phone),
        (OLD_VALUES['dealer_email'], new_email),
        (OLD_VALUES['dealer_name'],  new_name),
        (OLD_VALUES['dealer_addr'],  new_addr),
        (OLD_VALUES['logo_url'],     new_logo),
    ]

    # ─── Proses file ──────────────────────────────────────
    p(f"\n[ PROSES FILE ]", BOLD)
    total_changes = 0
    missing_files = []

    for filename in HTML_FILES:
        if not os.path.exists(filename):
            missing_files.append(filename)
            p(f"  ⚠  {filename} — tidak ditemukan, dilewati", YELLOW)
            continue

        file_changes = 0
        for old, new in replacements:
            if old != new:
                count = replace_in_file(filename, old, new)
                file_changes += count

        total_changes += file_changes
        if file_changes > 0:
            p(f"  ✓  {filename} ({file_changes} perubahan)", GREEN)
        else:
            p(f"  –  {filename} (tidak ada perubahan)", '')

    # ─── Ringkasan ────────────────────────────────────────
    p(f"\n{'='*55}", BOLD)
    p(f"  SELESAI! Total {total_changes} perubahan di {len(HTML_FILES)-len(missing_files)} file.", GREEN+BOLD)
    if missing_files:
        p(f"  ⚠  {len(missing_files)} file tidak ditemukan: {', '.join(missing_files)}", YELLOW)
    p(f"{'='*55}\n", BOLD)

    p("Langkah selanjutnya:", BOLD)
    p("  1. Buat project baru di Supabase klien")
    p("  2. Jalankan semua SQL (setup_supabase.sql, dll)")
    p("  3. Buat Storage buckets: hero-banners, delivery-photos")
    p("  4. Push ke GitHub klien")
    p("  5. Connect ke Vercel klien")
    p("  6. Arahkan domain Hostinger ke Vercel\n")

if __name__ == '__main__':
    main()
