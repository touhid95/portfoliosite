/**
 * /api/admin/save.js
 * Vercel Edge Function — Save all admin data to Vercel KV
 * Protected by ADMIN_PASSWORD environment variable
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
    jobs         = body.jobs || null;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  /* Write to KV */
  const kvUrl   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN  || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!kvUrl || !kvToken) {
    return new Response(
      JSON.stringify({ error: 'KV store not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  try {
    const writes = [];

    /* Always write knowledge */
    writes.push(
      fetch(`${kvUrl}/set/touhid_knowledge`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(knowledge)
      })
    );

    /* Only write system prompt if provided */
    if (systemPrompt) {
      writes.push(
        fetch(`${kvUrl}/set/touhid_system_prompt`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(systemPrompt)
        })
      );
    }

    /* Write content object if provided */
    if (content !== null) {
      writes.push(
        fetch(`${kvUrl}/set/touhid_content`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(JSON.stringify(content))
        })
      );
    }

    /* Write jobs if provided */
    if (jobs !== null) {
      writes.push(
        fetch(`${kvUrl}/set/touhid_jobs`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(JSON.stringify(jobs))
        })
      );
    }

    const results = await Promise.all(writes);
    if (results.some(r => !r.ok)) {
      return new Response(
        JSON.stringify({ error: 'Failed to save one or more fields' }),
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
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
}
