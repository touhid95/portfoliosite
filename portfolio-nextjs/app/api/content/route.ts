export const runtime = 'edge';
import { NextRequest } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey    = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/portfolio_kv?key=eq.touhid_content&select=value`,
      {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
        cache: 'no-store',
      }
    );
    if (!res.ok) {
      return new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
    }
    const rows: { value: string }[] = await res.json();
    const content = rows.length > 0 && rows[0].value ? JSON.parse(rows[0].value) : {};
    return new Response(JSON.stringify(content), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch {
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }
}
