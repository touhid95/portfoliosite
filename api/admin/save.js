/**
 * /api/admin/save.js
 * Vercel Edge Function — Save all admin data to Supabase
 * Protected by ADMIN_PASSWORD environment variable
 *
 * Uses Supabase REST API upsert (INSERT ... ON CONFLICT DO UPDATE)
 * Env vars required:
 *   ADMIN_PASSWORD       — password checked in Authorization header
 *   SUPABASE_URL         — e.g. https://xxxx.supabase.co
 *   SUPABASE_SERVICE_KEY — service_role secret key (server-side only)
 */
export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache'
};

/**
 * Upsert a single key-value row into portfolio_kv table.
 * Uses Supabase's "Prefer: resolution=merge-duplicates" for upsert behaviour.
 */
async function kvSet(supabaseUrl, serviceKey, key, value) {
  const res = await fetch(`${supabaseUrl}/rest/v1/portfolio_kv`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() })
  });
  return res;
}

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

  /* Parse body */
  let knowledge, systemPrompt, content, jobs;
  try {
    const body   = await request.json();
    knowledge    = (body.knowledge    || '').trim();
    systemPrompt = (body.systemPrompt || '').trim();
    content      = body.content || null;
    jobs         = body.jobs    || null;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  /* Supabase config */
  const supabaseUrl  = process.env.SUPABASE_URL;
  const serviceKey   = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ error: 'Supabase not configured — add SUPABASE_URL and SUPABASE_SERVICE_KEY to Vercel env vars' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  try {
    const writes = [];

    /* Always write knowledge */
    writes.push(kvSet(supabaseUrl, serviceKey, 'touhid_knowledge', knowledge));

    /* Only write system prompt if provided */
    if (systemPrompt) {
      writes.push(kvSet(supabaseUrl, serviceKey, 'touhid_system_prompt', systemPrompt));
    }

    /* Write content object if provided */
    if (content !== null) {
      writes.push(kvSet(supabaseUrl, serviceKey, 'touhid_content', JSON.stringify(content)));
    }

    /* Write jobs if provided */
    if (jobs !== null) {
      writes.push(kvSet(supabaseUrl, serviceKey, 'touhid_jobs', JSON.stringify(jobs)));
    }

    const results = await Promise.all(writes);
    if (results.some(r => !r.ok)) {
      // Collect error details for debugging
      const errorTexts = await Promise.all(
        results.filter(r => !r.ok).map(r => r.text())
      );
      console.error('Supabase write errors:', errorTexts);
      return new Response(
        JSON.stringify({ error: 'Failed to save one or more fields', details: errorTexts }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );

  } catch (err) {
    console.error('Save handler error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
}
