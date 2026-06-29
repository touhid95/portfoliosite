/**
 * /api/admin/leads.js
 * Vercel Edge Function — Fetches all registered interactors and their chat histories
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

  const adminPwd = process.env.ADMIN_PASSWORD;
  if (!adminPwd) {
    return new Response(JSON.stringify({ error: 'Admin not configured' }), { status: 503, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }

  const authHeader = request.headers.get('Authorization') || '';
  const provided   = authHeader.replace('Bearer ', '').trim();
  if (provided !== adminPwd) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }

  const kvUrl   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN  || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!kvUrl || !kvToken) {
    return new Response(JSON.stringify({ error: 'KV store not configured' }), { status: 503, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }

  try {
    // 1. Get all interactors
    const interactorsRes = await fetch(`${kvUrl}/smembers/touhid_interactors`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });
    const interactorsData = await interactorsRes.json();
    const interactors = interactorsData.result || [];

    // 2. Fetch history for each
    const leads = [];
    for (const username of interactors) {
      const histRes = await fetch(`${kvUrl}/get/chat_history_${encodeURIComponent(username)}`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const histData = await histRes.json();
      let history = [];
      try {
        history = histData.result ? JSON.parse(histData.result) : [];
      } catch (e) {}

      leads.push({
        username,
        messageCount: history.length,
        history
      });
    }

    return new Response(JSON.stringify({ leads }), { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Leads handler error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
}
