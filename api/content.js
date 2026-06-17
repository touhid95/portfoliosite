/**
 * /api/content.js
 * Vercel Edge Function — Public read of portfolio content from KV
 * No authentication required — this is public content
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
    return new Response(
      JSON.stringify({}),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  try {
    const res = await fetch(`${kvUrl}/get/touhid_content`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });

    if (!res.ok) {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS }
      });
    }

    const data = await res.json();
    const content = data.result ? JSON.parse(data.result) : {};

    return new Response(
      JSON.stringify(content),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  } catch (err) {
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS }
    });
  }
}
