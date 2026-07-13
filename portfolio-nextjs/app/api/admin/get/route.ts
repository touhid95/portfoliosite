export const runtime = 'edge';
import { NextRequest } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
};

async function kvGetMany(supabaseUrl: string, serviceKey: string, keys: string[]) {
  const keyList = keys.map(k => `"${k}"`).join(',');
  const res = await fetch(
    `${supabaseUrl}/rest/v1/portfolio_kv?key=in.(${keyList})&select=key,value`,
    {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
  );
  if (!res.ok) return {} as Record<string, string>;
  const rows: { key: string; value: string }[] = await res.json();
  const result: Record<string, string> = {};
  rows.forEach(r => { result[r.key] = r.value; });
  return result;
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(request: NextRequest) {
  const adminPwd = process.env.ADMIN_PASSWORD;
  if (!adminPwd) {
    return new Response(JSON.stringify({ error: 'Admin not configured' }), { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
  const provided = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
  if (provided !== adminPwd) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ knowledge: '', systemPrompt: '', content: {}, jobs: [], note: 'Supabase not configured' }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  try {
    const rows = await kvGetMany(supabaseUrl, serviceKey, ['touhid_knowledge', 'touhid_system_prompt', 'touhid_content', 'touhid_jobs']);
    const knowledge    = rows['touhid_knowledge']     || '';
    const systemPrompt = rows['touhid_system_prompt'] || '';
    let content = {};
    let jobs: unknown[] = [];
    try { content = rows['touhid_content'] ? JSON.parse(rows['touhid_content']) : {}; } catch {}
    try { jobs = rows['touhid_jobs'] ? JSON.parse(rows['touhid_jobs']) : []; } catch {}
    return new Response(JSON.stringify({ knowledge, systemPrompt, content, jobs }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch (err) {
    return new Response(JSON.stringify({ knowledge: '', systemPrompt: '', content: {}, jobs: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }
}
