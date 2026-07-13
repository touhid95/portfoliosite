export const runtime = 'edge';
import { NextRequest } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request: NextRequest) {
  const adminPwd = process.env.ADMIN_PASSWORD;
  if (!adminPwd) return new Response(JSON.stringify({ error: 'Admin not configured' }), { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } });
  const auth = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
  if (auth !== adminPwd) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...CORS } });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: 'Supabase not configured' }), { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } });

  try {
    const body = await request.json();
    let gallery = (body.gallery || []) as { id?: string; url?: string; caption?: string; uploadedAt?: string }[];
    if (!Array.isArray(gallery)) return new Response(JSON.stringify({ error: 'Gallery must be an array' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });

    gallery = gallery.map(item => {
      let url = (item.url || '').trim();
      const gDriveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)\/view/);
      if (gDriveMatch) url = `https://drive.google.com/uc?export=view&id=${gDriveMatch[1]}`;
      return { ...item, url, id: item.id || `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`, uploadedAt: item.uploadedAt || new Date().toISOString() };
    }).filter(item => item.url);

    await fetch(`${supabaseUrl}/rest/v1/portfolio_kv`, {
      method: 'POST',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ key: 'touhid_gallery', value: JSON.stringify(gallery), updated_at: new Date().toISOString() }),
    });

    return new Response(JSON.stringify({ ok: true, count: gallery.length }), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
}
