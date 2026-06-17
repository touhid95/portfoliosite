/**
 * /api/gallery/upload.js
 * Vercel Edge Function — Upload image to Vercel Blob
 * Protected by ADMIN_PASSWORD
 *
 * POST multipart/form-data with field "image"
 * Returns: { url, caption, id, uploadedAt }
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

  /* Vercel Blob token */
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    return new Response(JSON.stringify({ error: 'Vercel Blob not configured. Add BLOB_READ_WRITE_TOKEN to your Vercel env vars.' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  /* KV config */
  const kvUrl   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN  || process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    /* Parse multipart form data */
    const formData = await request.formData();
    const file     = formData.get('image');
    const caption  = (formData.get('caption') || '').trim();
    const section  = (formData.get('section') || 'personal').trim();

    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: 'No image file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
    }

    /* Check file type */
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Only JPEG, PNG, GIF, WebP images are allowed' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
    }

    /* Check file size (max 5MB) */
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Image too large. Maximum 5MB.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
    }

    /* Upload to Vercel Blob */
    const ext      = file.name.split('.').pop().toLowerCase();
    const filename = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const blobRes = await fetch(`https://blob.vercel-storage.com/${filename}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${blobToken}`,
        'Content-Type': file.type,
        'x-api-version': '7'
      },
      body: bytes
    });

    if (!blobRes.ok) {
      const errText = await blobRes.text();
      throw new Error(`Blob upload failed: ${blobRes.status} ${errText}`);
    }

    const blobData = await blobRes.json();
    const imageUrl = blobData.url;

    /* Build image record */
    const imageId = `img_${Date.now()}`;
    const record  = { id: imageId, url: imageUrl, caption, section, uploadedAt: new Date().toISOString() };

    /* Save to KV: append to gallery list */
    if (kvUrl && kvToken) {
      /* Get existing list */
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
    }

    return new Response(JSON.stringify({ ok: true, ...record }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });

  } catch (err) {
    console.error('Gallery upload error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Upload failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
}
