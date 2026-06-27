/**
 * /api/cv-compile.js
 * Vercel Edge Function — Compile LaTeX to PDF using a cloud compilation service
 * Protected by ADMIN_PASSWORD
 *
 * POST { latex: "..." }
 * Returns the PDF binary (application/pdf) on success, or JSON error
 */
export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

const COMPILE_URL = 'https://latexonline.cc/compile?command=pdflatex&filename=cv-touhid';

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS });
  }

  const adminPwd = process.env.ADMIN_PASSWORD;
  if (!adminPwd) {
    return new Response(JSON.stringify({ error: 'Admin not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
  const auth = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
  if (auth !== adminPwd) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  let latex;
  try {
    const body = await request.json();
    latex = (body.latex || '').trim();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  if (!latex || latex.length < 100) {
    return new Response(JSON.stringify({ error: 'LaTeX code is too short or empty' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  try {
    const compileRes = await fetch(COMPILE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: latex
    });

    if (!compileRes.ok) {
      const errText = await compileRes.text();
      throw new Error(`Compilation service returned ${compileRes.status}: ${errText.slice(0, 200)}`);
    }

    const pdfBytes = await compileRes.arrayBuffer();

    if (!pdfBytes || pdfBytes.byteLength < 200) {
      throw new Error('Compilation produced an empty or very small PDF — likely a LaTeX error. Check your template.');
    }

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cv-touhid-tailored.pdf"',
        'Content-Length': pdfBytes.byteLength.toString(),
        ...CORS
      }
    });

  } catch (err) {
    console.error('CV compile error:', err);
    return new Response(
      JSON.stringify({
        error: err.message || 'Compilation failed',
        hint: 'Make sure your LaTeX template is valid. You can still download the .tex file and compile it locally with pdflatex or Overleaf.'
      }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
}
