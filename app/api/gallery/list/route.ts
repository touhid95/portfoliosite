export const runtime = 'edge';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey    = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/portfolio_kv?key=eq.touhid_gallery&select=value`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }, cache: 'no-store' }
    );
    const rows: { value: string }[] = res.ok ? await res.json() : [];
    const gallery = rows.length > 0 ? JSON.parse(rows[0].value) : [];
    return new Response(JSON.stringify(gallery), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
  } catch {
    return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
}
