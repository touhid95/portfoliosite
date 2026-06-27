/**
 * /api/jobs/upload-cv.js
 * Vercel Edge Function — Upload CV PDF/DOCX to Vercel Blob
 * Protected by ADMIN_PASSWORD
 *
 * POST multipart/form-data with field "file"
 * Returns: { url }
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
    return new Response(JSON.stringify({ error: 'Vercel Blob not configured.' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  try {
    const formData = await request.formData();
    const file     = formData.get('file');

    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
    }

    /* Check file type */
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Only PDF and DOCX files are allowed' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
    }

    /* Check file size (max 10MB) */
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large. Maximum 10MB.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
    }

    /* Upload to Vercel Blob */
    const ext      = file.name.split('.').pop().toLowerCase();
    const filename = `jobs/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

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

    return new Response(JSON.stringify({ ok: true, url: blobData.url }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });

  } catch (err) {
    console.error('CV upload error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Upload failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
}
