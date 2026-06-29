/**
 * /api/gallery/upload.js
 * Vercel Edge Function — Save Image URL / Google Drive link to gallery
 * Protected by ADMIN_PASSWORD
 *
 * POST JSON with { url, caption, section }
 * Returns: { ok, url, caption, id, uploadedAt }
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

  /* KV config */
  const kvUrl   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN  || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!kvUrl || !kvToken) {
    return new Response(JSON.stringify({ error: 'Vercel KV not configured.' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  try {
    const body = await request.json();
    let { url, caption, section } = body;
    
    url = (url || '').trim();
    caption = (caption || '').trim();
    section = (section || 'personal').trim();

    if (!url) {
      return new Response(JSON.stringify({ error: 'No URL provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
    }

    /* Convert standard Google Drive share links into direct embed links */
    const gDriveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)\/view/);
    if (gDriveMatch) {
      url = `https://drive.google.com/uc?export=view&id=${gDriveMatch[1]}`;
    }

    /* Build image record */
    const imageId = `img_${Date.now()}`;
    const record  = { id: imageId, url, caption, section, uploadedAt: new Date().toISOString() };

    /* Save to KV: append to gallery list */
    const listRes  = await fetch(`${kvUrl}/get/touhid_gallery`, { headers: { Authorization: `Bearer ${kvToken}` } });
    const listData = listRes.ok ? await listRes.json() : {};
    let gallery    = [];
    try { gallery = listData.result ? JSON.parse(listData.result) : []; } catch {}
    gallery.push(record);

    await fetch(`${kvUrl}/set/touhid_gallery`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(JSON.stringify(gallery))
    });

    return new Response(JSON.stringify({ ok: true, ...record }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });

  } catch (err) {
    console.error('Gallery save error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Save failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
}
