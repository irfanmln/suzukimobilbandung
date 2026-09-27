// POST /api/test-drive -> public INSERT (pengganti Supabase test_drive)
// GET  /api/test-drive -> admin list (butuh ADMIN_API_TOKEN jika di-set)
// DELETE /api/test-drive?id= -> admin delete
import { json, requireAdmin } from './_lib.js';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { nama, no_hp, tipe_mobil, tanggal, email = '' } = body || {};
    if (!nama || !no_hp) return json({ error: 'nama dan no_hp wajib' }, 400);
    await context.env.DB.prepare(
      `INSERT INTO test_drive (nama, email, no_hp, tipe_mobil, tanggal) VALUES (?, ?, ?, ?, ?)`
    ).bind(nama, email || '', no_hp, tipe_mobil || '', tanggal || '').run();
    return json({ success: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

export async function onRequestGet(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;
  try {
    const url = new URL(context.request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '1000', 10), 5000);
    const { results } = await context.env.DB.prepare(
      `SELECT * FROM test_drive ORDER BY id DESC LIMIT ?`
    ).bind(limit).all();
    return json(results || []);
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
    if (!id) return json({ error: 'id wajib' }, 400);
    await context.env.DB.prepare(`DELETE FROM test_drive WHERE id = ?`).bind(id).run();
    return json({ success: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
