// Shared helpers untuk Pages Functions (D1 + R2, pengganti Supabase)
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export function requireAdmin(context) {
  const expected = context.env.ADMIN_API_TOKEN;
  // Jika belum di-set, izinkan (mode dev). Wajib di-set di production!
  if (!expected) return null;
  const req = context.request;
  const auth = req.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (token !== expected) return json({ error: 'Unauthorized' }, 401);
  return null;
}

export function publicR2Url(context, key) {
  const base = (context.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
  if (!base || base.includes('pub-xxx')) return null;
  return `${base}/${key}`;
}

export function extOf(name, fallback = 'webp') {
  const m = /\.([a-zA-Z0-9]+)(\?.*)?$/.exec(name || '');
  if (!m) return fallback;
  const e = m[1].toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(e)) return e === 'jpeg' ? 'jpg' : e;
  return fallback;
}
