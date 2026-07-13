/**
 * /api/content.js
 * Vercel Edge Function — Public read of portfolio content from Supabase
 * No authentication required — this is public content (Row Level Security: public read allowed)
 */
export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache'
};

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS });
  }

  const supabaseUrl  = process.env.SUPABASE_URL;
  const supabaseKey  = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({}),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  try {
    // Fetch the single row where key = 'touhid_content'
    const res = await fetch(
      `${supabaseUrl}/rest/v1/portfolio_kv?key=eq.touhid_content&select=value`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      }
    );

    if (!res.ok) {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS }
      });
    }

    const rows = await res.json();
    const content = (rows && rows.length > 0 && rows[0].value)
      ? JSON.parse(rows[0].value)
      : {};

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
