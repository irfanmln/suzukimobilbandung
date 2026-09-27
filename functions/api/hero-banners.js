// GET /api/hero-banners?active=true -> public (homepage)
// GET /api/hero-banners -> admin list all
// POST /api/hero-banners {image_url, sort_order} -> admin
// DELETE /api/hero-banners?id= -> admin (+ hapus file R2 jika key dikirim)
import { json, requireAdmin } from './_lib.js';

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    if (url.searchParams.get('active') === 'true') {
      const { results } = await context.env.DB.prepare(
        `SELECT * FROM hero_banners WHERE is_active = 1 ORDER BY sort_order, id`
      ).all();
      return json(results || []);
    }
    const denied = requireAdmin(context);
    if (denied) return denied;
    const { results } = await context.env.DB.prepare(
      `SELECT * FROM hero_banners ORDER BY sort_order, id`
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
    const { image_url, sort_order = 0 } = await context.request.json();
    if (!image_url) return json({ error: 'image_url wajib' }, 400);
    await context.env.DB.prepare(
      `INSERT INTO hero_banners (image_url, sort_order, is_active) VALUES (?, ?, 1)`
    ).bind(image_url, Number(sort_order) || 0).run();
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
    await context.env.DB.prepare(`DELETE FROM hero_banners WHERE id = ?`).bind(id).run();
    if (key && context.env.IMAGES) {
      try { await context.env.IMAGES.delete(key); } catch (_) {}
    }
    return json({ success: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
