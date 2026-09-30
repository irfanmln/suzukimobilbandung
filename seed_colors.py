#!/usr/bin/env python3
"""Seed warna mobil: copy foto ke images/colors/<slug>/, update tab HTML,
tulis seed_colors.json (dipakai POST ke /api/color-variants setelah deploy).

Jalankan dari D:/Irfan/suzukimobilbandung :  py seed_colors.py
Fase seed API terpisah:  py seed_colors_post.py  (setelah push + deploy)
"""
import json
import pathlib
import re
import shutil

SRC = pathlib.Path('D:/Irfan/suzukimobilbandung performance/Warna Mobil')
DST = pathlib.Path('D:/Irfan/suzukimobilbandung/images/colors')
REPO = pathlib.Path('D:/Irfan/suzukimobilbandung')

SLUG = {'APV': 'apv', 'Carry Pickup': 'new-carry-pick-up', 'Ertiga': 'all-new-ertiga',
        'Fronx': 'fronx', 'Grand Vitara': 'grand-vitara', 'Jimny': 'jimny',
        'Spresso': 's-presso', 'XL7': 'new-xl7'}

# grup baru per halaman bertab (harus sama persis dengan folder)
TABS = {
    'all-new-ertiga.html': ['CRUISE HYBRID AT', 'CRUISE HYBRID AT 2TONE', 'GA MT', 'GL AT', 'GX HYBRID AT'],
    'fronx.html': ['GX AT', 'SGX 2TONE AT', 'SGX AT', 'SGX AT KURO'],
    'jimny.html': ['3-DOOR SINGLE TONE AT', '3-DOOR TWO TONE AT', '5-DOOR 2TONE AT', '5-DOOR SINGLE TONE AT'],
    'new-xl7.html': ['Alpha AT', 'Alpha AT Hybrid 2tone', 'Beta AT Hybrid', 'Zeta AT'],
}

HEX = {
 'MELLOW DEEP RED': '#8B1A1A', 'METALLIC SILKY SILVER': '#7A7A7A',
 'COOL BLACK': '#1A1A1A', 'SNOW WHITE PEARL': '#F5F5F5',
 'METALLIC MAGMA GREY': '#7A7A7A', 'COOL BLACK METALLIC': '#1A1A1A',
 'SILKY SILVER METALLIC': '#C0BDB8', 'GRAPHITE GREY METALLIC': '#555555',
 'BURGUNDY RED': '#6B1020', 'PEARL WHITE METALLIC': '#F0F0F0',
 'SAVANNA IVORY': '#D4C99A', 'SAVANA IVORY': '#D4C99A',
 'ICE GRAYISH BLUE - BLACK': '#A8C8D8', 'PEARL SNOW WHITE - BLACK': '#F5F5F5',
 'SAVANNA IVORY - BLACK': '#D4C99A', 'PEARL SNOW WHITE': '#F5F5F5',
 'PRIME SPLENDID SILVER + BLACK': '#A8A8A8', 'PEARL ARCTIC WHITE + BLACK': '#F0F0F0',
 'PEARL MIDNIGHT BLACK': '#1A1A1A', 'PEARL CAVE BLACK': '#2C2C2C',
 'WHITE RHINO': '#F5F5F5', 'METALLIC SIZZLING RED + PEARL BLUISH BLACK 4': '#CC2020',
 'KINETIC YELLOW 2 + PEARL BLUISH BLACK 4': '#D4C020',
 'METALLIC CHIFFON IVORY 2 + PEARL BLUISH BLACK 4': '#D4C99A',
 'JUNGLE GREEN 2': '#3A4A2A', 'PEARL BLUISH BLACK 4': '#1A1E24',
 'GRANITE GRAY METALLIC': '#5A5A5A',
 'METALLIC CHIFFON IVORY + PEARL BLUISH BLACK 3': '#D4C99A',
 'METALLIC BRISK BLUE + PEARL BLUISH BLACK 3': '#3A6A9A',
 'KINETIC YELLOW + PEARL BLUISH BLACK 3': '#D4C020',
 'PEARL BLUISH BLACK 3': '#1A1E24', 'PEARL BLUISH BLACK': '#1A1E24', 'MEDIUM GRAY': '#8A8A8A',
 'PEARL PURE WHITE': '#F5F5F5', 'JUNGLE GREEN': '#3A4A2A',
 'WHITE': '#F5F5F5', 'REAL BLACK': '#1A1A1A',
 'NEW SAVANNA IVORY 2 - BLACK': '#D4C99A', 'WHITE - BLACK': '#F0F0F0',
 'SUNRISE ORANGE - BLACK': '#E05A1A', 'SIZZLE ORANGE': '#E8640A',
 'SOLID FIRE RED': '#CC1414', 'MARBLE BLACK': '#1A1A1A',
 'PEARL SNOW WHITE + MARBLE BLACK': '#F5F5F5',
 'ICE GRAYISH BLUE + BLACK': '#A8C8D8', 'PEARL SNOW WHITE + BLACK': '#F5F5F5',
 'SAVANNA IVORY + BLACK': '#D4C99A', 'KINETIC YELLOW + PEARL BLUISH BLACK 4': '#D4C020',
 'METALLIC CHIFFON IVORY + PEARL BLUISH BLACK 4': '#D4C99A',
}

def sanitize(name: str) -> str:
    s = name.lower().replace('+', '-plus-')
    s = re.sub(r'[\s_]+', '-', s)
    s = re.sub(r'[^a-z0-9.\-]', '', s)
    s = re.sub(r'-{2,}', '-', s).strip('-')
    return s

rows = []
n_files = 0
missing_hex = set()
for car_dir in sorted(SRC.iterdir()):
    if not car_dir.is_dir():
        continue
    slug = SLUG[car_dir.name]
    subdirs = sorted([d for d in car_dir.iterdir() if d.is_dir()])
    groups = [(d.name, sorted(d.glob('*.*'))) for d in subdirs] if subdirs else [('', sorted(car_dir.glob('*.*')))]
    for group, files in groups:
        files = [f for f in files if f.is_file()]
        for i, f in enumerate(files):
            color = f.stem.upper().replace('_', ' ').strip()
            if color == 'SAVANA IVORY':
                color = 'SAVANNA IVORY'
            hexv = HEX.get(color)
            if not hexv:
                missing_hex.add(color)
                hexv = '#999999'
            ext = f.suffix.lower()
            base = f'{group}-{f.stem}{ext}' if group else f'{f.stem}{ext}'
            dest = DST / slug / sanitize(base)
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(f, dest)
            n_files += 1
            rows.append({
                'car_slug': slug, 'variant_group': group, 'color_name': color,
                'hex_color': hexv,
                'image_url': f"https://www.suzukimobilbandung.com/images/colors/{slug}/{dest.name}",
                'sort_order': i,
            })

(REPO / 'seed_colors.json').write_text(json.dumps(rows, indent=1), encoding='utf-8')
print(f'files copied: {n_files}, rows: {len(rows)}')
print('missing hex:', sorted(missing_hex) if missing_hex else 'none')

# --- update tab + panel 4 halaman ---
PANEL = ('<div class="ctab-panel{act}" id="cpanel-{g}">'
         '<div class="color-swatches" id="colorSwatches-{g}"></div></div>')
PANEL_RE = re.compile(
    r'<div class="ctab-panel active" id="cpanel-[^"]*"><div class="color-swatches" id="colorSwatches-[^"]*"></div></div>'
    r'(?:<div class="ctab-panel" id="cpanel-[^"]*"><div class="color-swatches" id="colorSwatches-[^"]*"></div></div>)*')
CTABS_RE = re.compile(r'<div class="ctabs">.*?</div>', re.DOTALL)
for fname, groups in TABS.items():
    p = REPO / fname
    c = p.read_text(encoding='utf-8')
    btns = ''.join(
        f'<button class="ctab{" active" if i == 0 else ""}" '
        f'onclick="switchColorTab(\'{g}\',this)">{g}</button>'
        for i, g in enumerate(groups))
    c2, n1 = CTABS_RE.subn(f'<div class="ctabs">{btns}</div>', c, count=1)
    panels = ''.join(PANEL.format(act=' active' if i == 0 else '', g=g) for i, g in enumerate(groups))
    c2, n2 = PANEL_RE.subn(panels, c2, count=1)
    assert n1 == 1 and n2 == 1, f'{fname}: match gagal ({n1},{n2})'
    p.write_text(c2, encoding='utf-8')
    print(f'{fname}: tabs -> {groups}')
print('DONE fase A (copy + tabs + seed_colors.json)')
