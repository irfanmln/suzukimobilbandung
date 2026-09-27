// GET /api/color-variants?car_slug=fronx -> public
// GET /api/color-variants -> admin semua
// POST {car_slug, variant_group, color_name, hex_color, image_url, sort_order} -> admin
// DELETE ?id=&key= -> admin
import { json, requireAdmin } from './_lib.js';

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const slug = url.searchParams.get('car_slug');
    if (slug) {
      const { results } = await context.env.DB.prepare(
        `SELECT * FROM color_variants WHERE car_slug = ? ORDER BY sort_order, id`
      ).bind(slug).all();
      return json(results || []);
    }
    const { results } = await context.env.DB.prepare(
      `SELECT * FROM color_variants ORDER BY car_slug, sort_order, id`
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
    const { car_slug, variant_group, color_name, hex_color, image_url, sort_order = 0 } = body || {};
    if (!car_slug || !color_name || !image_url) return json({ error: 'car_slug, color_name, image_url wajib' }, 400);
    await context.env.DB.prepare(
      `INSERT INTO color_variants (car_slug, variant_group, color_name, hex_color, image_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(car_slug, variant_group || '', color_name, hex_color || '', image_url, Number(sort_order) || 0).run();
    return json({ success: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

export async function onRequestDelete(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    const key = url.searchParams.get('key') || '';
    if (!id) return json({ error: 'id wajib' }, 400);
    await context.env.DB.prepare(`DELETE FROM color_variants WHERE id = ?`).bind(id).run();
    if (key && context.env.IMAGES) {
      try { await context.env.IMAGES.delete(key); } catch (_) {}
    }
    return json({ success: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
