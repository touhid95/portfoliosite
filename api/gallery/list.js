/**
 * /api/gallery/list.js
 * Vercel Edge Function — Public read of gallery image list from KV
 * No authentication required
 */
export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS });
  }

  const kvUrl   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN  || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!kvUrl || !kvToken) {
    return new Response(JSON.stringify([]),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  try {
    const res  = await fetch(`${kvUrl}/get/touhid_gallery`, { headers: { Authorization: `Bearer ${kvToken}` } });
    const data = res.ok ? await res.json() : {};
    let gallery = [];
    try { gallery = data.result ? JSON.parse(data.result) : []; } catch {}

    return new Response(JSON.stringify(gallery),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
  } catch {
    return new Response(JSON.stringify([]),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
}
