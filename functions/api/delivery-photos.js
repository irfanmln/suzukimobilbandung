// GET /api/delivery-photos -> public list (homepage + admin)
// POST {image_url, sort_order} -> admin
// DELETE ?id=&key= -> admin
import { json, requireAdmin } from './_lib.js';

export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT * FROM delivery_photos ORDER BY sort_order, id`
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
      `INSERT INTO delivery_photos (image_url, sort_order) VALUES (?, ?)`
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
    await context.env.DB.prepare(`DELETE FROM delivery_photos WHERE id = ?`).bind(id).run();
    if (key && context.env.IMAGES) {
      try { await context.env.IMAGES.delete(key); } catch (_) {}
    }
    return json({ success: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
