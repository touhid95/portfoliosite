/**
 * /api/admin/get.js
 * Vercel Edge Function — Read all admin data from Supabase
 * Protected by ADMIN_PASSWORD environment variable
 *
 * Env vars required:
 *   ADMIN_PASSWORD       — password checked in Authorization header
 *   SUPABASE_URL         — e.g. https://xxxx.supabase.co
 *   SUPABASE_SERVICE_KEY — service_role secret key (server-side only)
 */
export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache'
};

/**
 * Read multiple keys from portfolio_kv in a single Supabase query.
 * Returns a plain object: { key => value }
 */
async function kvGetMany(supabaseUrl, serviceKey, keys) {
  const keyList = keys.map(k => `"${k}"`).join(',');
  const res = await fetch(
    `${supabaseUrl}/rest/v1/portfolio_kv?key=in.(${keyList})&select=key,value`,
    {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    }
  );

  if (!res.ok) return {};

  const rows = await res.json();
  const result = {};
  if (Array.isArray(rows)) {
    rows.forEach(row => {
      result[row.key] = row.value;
    });
  }
  return result;
}

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
  const provided   = authHeader.replace('Bearer ', '').trim();
  if (provided !== adminPwd) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  /* Supabase config */
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({
        knowledge: '', systemPrompt: '', content: {}, jobs: [],
        note: 'Supabase not configured — add SUPABASE_URL and SUPABASE_SERVICE_KEY to Vercel env vars'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  try {
    const rows = await kvGetMany(supabaseUrl, serviceKey, [
      'touhid_knowledge',
      'touhid_system_prompt',
      'touhid_content',
      'touhid_jobs'
    ]);

    const knowledge    = rows['touhid_knowledge']     || '';
    const systemPrompt = rows['touhid_system_prompt'] || '';

    let content = {};
    try { content = rows['touhid_content'] ? JSON.parse(rows['touhid_content']) : {}; } catch {}

    let jobs = [];
    try { jobs = rows['touhid_jobs'] ? JSON.parse(rows['touhid_jobs']) : []; } catch {}

    return new Response(
      JSON.stringify({ knowledge, systemPrompt, content, jobs }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );

  } catch (err) {
    console.error('Get handler error:', err);
    return new Response(
      JSON.stringify({ knowledge: '', systemPrompt: '', content: {}, jobs: [] }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
}
