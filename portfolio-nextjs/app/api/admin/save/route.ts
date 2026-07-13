export const runtime = 'edge';
import { NextRequest } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
};

async function kvSet(supabaseUrl: string, serviceKey: string, key: string, value: string) {
  return fetch(`${supabaseUrl}/rest/v1/portfolio_kv`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request: NextRequest) {
  const adminPwd = process.env.ADMIN_PASSWORD;
  if (!adminPwd) {
    return new Response(JSON.stringify({ error: 'Admin not configured' }), { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
  const provided = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
  if (provided !== adminPwd) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  let knowledge = '', systemPrompt = '', content: unknown = null, jobs: unknown = null;
  try {
    const body = await request.json();
    knowledge    = (body.knowledge    || '').trim();
    systemPrompt = (body.systemPrompt || '').trim();
    content      = body.content ?? null;
    jobs         = body.jobs    ?? null;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ error: 'Supabase not configured — add SUPABASE_URL and SUPABASE_SERVICE_KEY to Vercel env vars' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  try {
    const writes: Promise<Response>[] = [];
    writes.push(kvSet(supabaseUrl, serviceKey, 'touhid_knowledge', knowledge));
    if (systemPrompt) writes.push(kvSet(supabaseUrl, serviceKey, 'touhid_system_prompt', systemPrompt));
    if (content !== null) writes.push(kvSet(supabaseUrl, serviceKey, 'touhid_content', JSON.stringify(content)));
    if (jobs !== null) writes.push(kvSet(supabaseUrl, serviceKey, 'touhid_jobs', JSON.stringify(jobs)));

    const results = await Promise.all(writes);
    if (results.some(r => !r.ok)) {
      const errorTexts = await Promise.all(results.filter(r => !r.ok).map(r => r.text()));
      return new Response(
        JSON.stringify({ error: 'Failed to save one or more fields', details: errorTexts }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
}
