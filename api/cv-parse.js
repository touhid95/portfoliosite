/**
 * /api/cv-parse.js
 * Vercel Edge Function — Parse uploaded CV (PDF/DOCX) and extract portfolio fields using AI
 * Protected by ADMIN_PASSWORD
 *
 * POST multipart/form-data with field "cv" (file)
 * Returns structured JSON with extracted fields for the admin CMS
 */
export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

/* ── Extract raw text from PDF bytes using pdf.js compatible approach ── */
async function extractTextFromPDF(bytes) {
  /* PDF text extraction via simple regex-based approach for Edge runtime */
  const decoder = new TextDecoder('latin1');
  const text = decoder.decode(bytes);

  /* Extract text between BT...ET (PDF text objects) */
  const chunks = [];
  const btEtRegex = /BT([\s\S]*?)ET/g;
  let match;
  while ((match = btEtRegex.exec(text)) !== null) {
    const block = match[1];
    /* Extract strings from parentheses */
    const strRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
    let s;
    while ((s = strRegex.exec(block)) !== null) {
      const raw = s[1]
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\')
        .replace(/\\([()\\])/g, '$1');
      if (raw.trim().length > 1) chunks.push(raw.trim());
    }
  }

  /* Also try hex strings */
  const hexRegex = /<([0-9A-Fa-f]+)>/g;
  while ((match = hexRegex.exec(text)) !== null) {
    const hex = match[1];
    if (hex.length > 2 && hex.length % 2 === 0) {
      let str = '';
      for (let i = 0; i < hex.length; i += 2) {
        const code = parseInt(hex.slice(i, i + 2), 16);
        if (code > 31 && code < 127) str += String.fromCharCode(code);
      }
      if (str.trim().length > 2) chunks.push(str.trim());
    }
  }

  return chunks.join(' ').replace(/\s+/g, ' ').trim();
}

/* ── Extract text from DOCX (ZIP-based XML) ── */
async function extractTextFromDOCX(bytes) {
  /* DOCX is a ZIP. We look for the word/document.xml inside it */
  /* Simple approach: scan for XML-like text patterns in the bytes */
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const raw = decoder.decode(bytes);

  /* Find word/document.xml content */
  const xmlMatch = raw.match(/word\/document\.xml([\s\S]*?)(?=word\/)/);
  if (xmlMatch) {
    const xml = xmlMatch[1];
    /* Strip XML tags */
    return xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /* Fallback: extract any readable text */
  return raw.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
}

/* ── Call AI to parse CV text into structured fields ── */
async function parseWithAI(cvText, cfg) {
  const prompt = `You are a CV/resume parser. Extract structured information from the following CV text and return ONLY a valid JSON object with exactly these fields. Do not include any explanation, markdown, or extra text — only the raw JSON object.

Extract these fields:
{
  "name": "full name",
  "email": "email address",
  "phone": "phone number",
  "location": "city, country",
  "linkedin": "full LinkedIn URL (https://...)",
  "linkedinText": "LinkedIn display text (without https://)",
  "github": "full GitHub URL (https://...)",
  "githubText": "GitHub display text (without https://)",
  "subtitle": "professional title or tagline (e.g. 'Data Analyst · BBA Undergraduate')",
  "university": "current university full name",
  "degree": "current degree and status (e.g. 'B.B.A. (Ongoing) — 6 Semesters')",
  "department": "current department or faculty",
  "cgpa": "current GPA/CGPA with scale (e.g. '3.24 / 4.00')",
  "intro": "2-3 sentence professional summary / introduction",
  "objective": "career objective or professional goal statement",
  "careerGoal": "long-term career aspiration",
  "strengths": "personal strengths (one concise sentence)",
  "expTitle": "most recent job title",
  "expDesc": "description of most recent work experience",
  "currentStatus": "current education status description",
  "skills": "comma-separated list of technical skills",
  "whoami1": "first biographical paragraph about the person",
  "whoami2": "second paragraph about their vision or goals"
}

If a field cannot be found in the CV, use an empty string "" for that field. Never make up information.

CV TEXT:
---
${cvText.slice(0, 8000)}
---

Return only the JSON object:`;

  /* Try NVIDIA first */
  if (cfg.nvidia.apiKey) {
    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.nvidia.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          model: cfg.nvidia.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
          temperature: 0.1,
          stream: false
        })
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content || '';
        return reply;
      }
    } catch (e) {
      console.error('NVIDIA CV parse error:', e);
    }
  }

  /* Fallback to Gemini */
  if (cfg.gemini.apiKey) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${cfg.gemini.model}:generateContent?key=${cfg.gemini.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
        })
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
  }

  throw new Error('No AI provider configured. Set NVIDIA_API_KEY or GEMINI_API_KEY.');
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
    return new Response(JSON.stringify({ error: 'Admin not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
  const auth = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
  if (auth !== adminPwd) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  const cfg = {
    nvidia: {
      apiKey: process.env.NVIDIA_API_KEY || '',
      model:  process.env.NVIDIA_MODEL   || 'meta/llama-3.1-8b-instruct'
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model:  process.env.GEMINI_MODEL   || 'gemini-2.0-flash'
    }
  };

  try {
    const formData = await request.formData();
    const file     = formData.get('cv');

    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: 'No CV file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
    }

    const filename  = (file.name || '').toLowerCase();
    const isPDF     = filename.endsWith('.pdf') || file.type === 'application/pdf';
    const isDOCX    = filename.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!isPDF && !isDOCX) {
      return new Response(JSON.stringify({ error: 'Only PDF and DOCX files are supported.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
    }

    const bytes = await file.arrayBuffer();

    /* Extract text from file */
    let cvText = '';
    if (isPDF) {
      cvText = await extractTextFromPDF(new Uint8Array(bytes));
    } else {
      cvText = await extractTextFromDOCX(new Uint8Array(bytes));
    }

    if (!cvText || cvText.length < 50) {
      return new Response(
        JSON.stringify({ error: 'Could not extract text from the CV. Make sure it is not a scanned image PDF. Try a Word (.docx) version instead.' }),
        { status: 422, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }

    /* Ask AI to extract fields */
    const aiReply = await parseWithAI(cvText, cfg);

    /* Parse JSON from AI response */
    let extracted = {};
    try {
      /* Find JSON object in response */
      const jsonMatch = aiReply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extracted = JSON.parse(jsonMatch[0]);
      }
    } catch {
      return new Response(
        JSON.stringify({ error: 'AI could not parse CV fields. Try again or fill fields manually.', raw: aiReply.slice(0, 500) }),
        { status: 422, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, fields: extracted, charCount: cvText.length }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );

  } catch (err) {
    console.error('CV parse error:', err);
    return new Response(JSON.stringify({ error: err.message || 'CV parsing failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
}
