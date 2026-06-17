/**
 * /api/admin/get.js
 * Vercel Edge Function — Read knowledge base from Vercel KV
 * Protected by ADMIN_PASSWORD environment variable
 */
export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS });
  }

  /* Auth */
  const adminPwd = process.env.ADMIN_PASSWORD;
  if (!adminPwd) {
    return new Response(
      JSON.stringify({ error: 'Admin not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  const authHeader = request.headers.get('Authorization') || '';
  const provided = authHeader.replace('Bearer ', '').trim();
  if (provided !== adminPwd) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  /* Read from Vercel KV */
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    return new Response(
      JSON.stringify({ knowledge: '', note: 'KV not configured — using built-in knowledge only' }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  try {
    const res = await fetch(`${kvUrl}/get/touhid_knowledge`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ knowledge: '' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }

    const data = await res.json();
    const knowledge = data.result || '';

    return new Response(
      JSON.stringify({ knowledge }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );

  } catch (err) {
    console.error('Get handler error:', err);
    return new Response(
      JSON.stringify({ knowledge: '' }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
}
