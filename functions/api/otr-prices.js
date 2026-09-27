// GET /api/otr-prices?car_slug=fronx -> public (untuk refactor harga hardcoded nanti)
// GET /api/otr-prices -> semua
// POST {car_slug, idx, tipe, harga} atau {rows:[...]} -> admin UPSERT
import { json, requireAdmin } from './_lib.js';

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const slug = url.searchParams.get('car_slug');
    if (slug) {
      const { results } = await context.env.DB.prepare(
        `SELECT * FROM otr_prices WHERE car_slug = ? ORDER BY idx`
      ).bind(slug).all();
      return json(results || []);
    }
    const { results } = await context.env.DB.prepare(
      `SELECT * FROM otr_prices ORDER BY car_slug, idx`
    ).all();
    return json(results || []);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

export async function onRequestPost(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;
  try {
    const body = await context.request.json();
    const rows = Array.isArray(body) ? body : (body.rows || [body]);
    for (const r of rows) {
      if (!r.car_slug || r.idx == null) continue;
      await context.env.DB.prepare(
        `INSERT INTO otr_prices (car_slug, idx, tipe, harga, updated_at)
         VALUES (?, ?, ?, ?, datetime('now'))
         ON CONFLICT(car_slug, idx) DO UPDATE SET tipe=excluded.tipe, harga=excluded.harga, updated_at=datetime('now')`
      ).bind(r.car_slug, Number(r.idx), r.tipe || '', String(r.harga || '')).run();
    }
    return json({ success: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
