// POST /api/upload (multipart form: file, prefix) -> admin upload ke R2
// prefix: delivery-photos | hero-banners | product-images/<slug>
// Return: { url, key }
// URL = R2_PUBLIC_URL + / + key. Wajib set R2_PUBLIC_URL + buat R2 custom domain.
import { json, requireAdmin, publicR2Url, extOf } from './_lib.js';

export async function onRequestPost(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;
  try {
    const form = await context.request.formData();
    const file = form.get('file');
    let prefix = String(form.get('prefix') || 'misc').replace(/[^a-zA-Z0-9\-\/]/g, '');
    if (!prefix) prefix = 'misc';
    if (!file || typeof file === 'string') return json({ error: 'file wajib' }, 400);

    const ext = extOf(file.name);
    const key = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    await context.env.IMAGES.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
    });

    const url = publicR2Url(context, key) || `/r2/${key}`;
    return json({ success: true, url, key });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
