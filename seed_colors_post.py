#!/usr/bin/env python3
"""POST seed_colors.json ke production API (idempotent: lewati yang sudah ada).
Jalankan SETELAH push + deploy Pages selesai (gambar harus sudah live).
  py seed_colors_post.py
"""
import json
import pathlib
import urllib.request

BASE = 'https://www.suzukimobilbandung.com'
ROOT = pathlib.Path('D:/Irfan/suzukimobilbandung')

def api(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method,
                                 headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode() or 'null')

rows = json.loads((ROOT / 'seed_colors.json').read_text(encoding='utf-8'))
existing = {(str(r.get('car_slug')), str(r.get('image_url'))) for r in api('GET', '/api/color-variants')}
print(f'existing di D1: {len(existing)}')
ins = 0
for row in rows:
    if (row['car_slug'], row['image_url']) in existing:
        continue
    api('POST', '/api/color-variants', row)
    ins += 1
print(f'INSERTED: {ins}, SKIPPED: {len(rows) - ins}')
