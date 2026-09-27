// GET /r2/<key> -> serve file R2 (fallback jika belum pakai custom domain)
// Setelah custom domain aktif, pakai R2_PUBLIC_URL langsung (lebih cepat + cache).
export async function onRequestGet(context) {
  try {
    const key = context.params.key;
    const obj = await context.env.IMAGES.get(Array.isArray(key) ? key.join('/') : key);
    if (!obj) return new Response('Not found', { status: 404 });
    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return new Response(obj.body, { headers });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
