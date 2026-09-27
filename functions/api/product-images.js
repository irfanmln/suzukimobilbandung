// GET /api/product-images?car_slug=fronx -> public satu mobil
// GET /api/product-images -> public/admin semua
// POST {car_slug, img_hero?, img_exterior?, img_interior?, img_listing?} -> admin UPSERT
import { json, requireAdmin } from './_lib.js';

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const slug = url.searchParams.get('car_slug');
    if (slug) {
      const row = await context.env.DB.prepare(
        `SELECT * FROM product_images WHERE car_slug = ?`
      ).bind(slug).first();
      return json(row ? [row] : []);
    }
    const { results } = await context.env.DB.prepare(`SELECT * FROM product_images`).all();
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
    const { car_slug, img_hero, img_exterior, img_interior, img_listing } = body || {};
    if (!car_slug) return json({ error: 'car_slug wajib' }, 400);
    const existing = await context.env.DB.prepare(
      `SELECT * FROM product_images WHERE car_slug = ?`
    ).bind(car_slug).first();
    if (!existing) {
      await context.env.DB.prepare(
        `INSERT INTO product_images (car_slug, img_hero, img_exterior, img_interior, img_listing)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(car_slug, img_hero || null, img_exterior || null, img_interior || null, img_listing || null).run();
    } else {
      await context.env.DB.prepare(
        `UPDATE product_images SET
           img_hero = COALESCE(?, img_hero),
           img_exterior = COALESCE(?, img_exterior),
           img_interior = COALESCE(?, img_interior),
           img_listing = COALESCE(?, img_listing)
         WHERE car_slug = ?`
      ).bind(img_hero || null, img_exterior || null, img_interior || null, img_listing || null, car_slug).run();
    }
    return json({ success: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
