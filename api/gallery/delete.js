/**
 * /api/gallery/delete.js
 * Vercel Edge Function — Delete image from Blob + KV
 * Protected by ADMIN_PASSWORD
 *
 * POST { id: "img_xxx", url: "https://..." }
 */
export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS });
  }

  /* Auth */
  const adminPwd = process.env.ADMIN_PASSWORD;
  if (!adminPwd) {
    return new Response(JSON.stringify({ error: 'Admin not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
  const auth = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
  if (auth !== adminPwd) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  let id, url;
  try {
    const body = await request.json();
    id  = body.id;
    url = body.url;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  const kvUrl   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN  || process.env.UPSTASH_REDIS_REST_TOKEN;

  try {


    /* Remove from KV list */
    if (kvUrl && kvToken) {
      const listRes  = await fetch(`${kvUrl}/get/touhid_gallery`, { headers: { Authorization: `Bearer ${kvToken}` } });
      const listData = listRes.ok ? await listRes.json() : {};
      let gallery    = [];
      try { gallery = listData.result ? JSON.parse(listData.result) : []; } catch {}
      gallery = gallery.filter(item => item.id !== id);

      await fetch(`${kvUrl}/set/touhid_gallery`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(JSON.stringify(gallery))
      });
    }

    return new Response(JSON.stringify({ ok: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });

  } catch (err) {
    console.error('Gallery delete error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Delete failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
}
