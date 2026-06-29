/**
 * /api/gallery/save-all.js
 * Vercel Edge Function — Bulk save gallery to KV
 * Protected by ADMIN_PASSWORD
 *
 * POST JSON with { gallery: [{ id, url, caption, section, uploadedAt }, ...] }
 * Returns: { ok: true }
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
    let gallery = body.gallery || [];
    
    if (!Array.isArray(gallery)) {
      return new Response(JSON.stringify({ error: 'Gallery must be an array' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
    }

    // Process URLs to convert Google Drive share links to embeds just in case
    gallery = gallery.map(item => {
      let url = (item.url || '').trim();
      const gDriveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)\/view/);
      if (gDriveMatch) {
        url = `https://drive.google.com/uc?export=view&id=${gDriveMatch[1]}`;
      }
      return {
        ...item,
        url,
        id: item.id || `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        uploadedAt: item.uploadedAt || new Date().toISOString()
      };
    }).filter(item => item.url);

    await fetch(`${kvUrl}/set/touhid_gallery`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(JSON.stringify(gallery))
    });

    return new Response(JSON.stringify({ ok: true, count: gallery.length }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });

  } catch (err) {
    console.error('Gallery bulk save error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Save failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
}
