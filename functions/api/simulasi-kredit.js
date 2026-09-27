// POST /api/simulasi-kredit -> public INSERT (pengganti simulasi_kredit)
// GET  /api/simulasi-kredit -> admin list
// DELETE /api/simulasi-kredit?id= -> admin delete
import { json, requireAdmin } from './_lib.js';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { nama, no_hp, tipe_mobil, tenor, uang_muka, asal_kota, domisili } = body || {};
    if (!nama || !no_hp) return json({ error: 'nama dan no_hp wajib' }, 400);
    await context.env.DB.prepare(
      `INSERT INTO simulasi_kredit (nama, no_hp, tipe_mobil, tenor, uang_muka, asal_kota, domisili)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      nama, no_hp, tipe_mobil || '', tenor || '',
      uang_muka != null && uang_muka !== '' ? Number(uang_muka) : null,
      asal_kota || '', domisili || (asal_kota || '')
    ).run();
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
      `SELECT * FROM simulasi_kredit ORDER BY id DESC LIMIT ?`
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
    await context.env.DB.prepare(`DELETE FROM simulasi_kredit WHERE id = ?`).bind(id).run();
    return json({ success: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
