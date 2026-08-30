/**
 * /api/cv-parse.js
 * Vercel Edge Function — Parse pasted CV text and extract portfolio fields using AI
 * Protected by ADMIN_PASSWORD
 *
 * POST JSON with { text: "CV contents..." }
 * Returns structured JSON with extracted fields for the admin CMS
 */
export const runtime = 'edge';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

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
${cvText.slice(0, 10000)}
---

Return only the JSON object:`;

  /* Try OpenRouter first */
  if (cfg.openrouter.apiKey) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.openrouter.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://touhid.dev',
          'X-Title': 'CV Parser'
        },
        body: JSON.stringify({
          model: cfg.openrouter.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
          temperature: 0.1
        })
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content || '';
        if (reply) return reply;
      }
    } catch (e) {
      console.error('OpenRouter CV parse error:', e);
    }
  }

  /* Try NVIDIA */
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
          stream: false,
          extra_body: {
            chat_template_kwargs: {
              thinking: true,
              reasoning_effort: "high"
            }
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        let reasoning = data?.choices?.[0]?.message?.reasoning || data?.choices?.[0]?.message?.reasoning_content;
        let reply = data?.choices?.[0]?.message?.content;
        if (!reply && reasoning) {
          reply = reasoning;
        }
        return reply || '';
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

  throw new Error('No AI provider configured. Set OPENROUTER_API_KEY, NVIDIA_API_KEY or GEMINI_API_KEY.');
}

export async function OPTIONS(request) {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request) {
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
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY || '',
      model:  process.env.OPENROUTER_MODEL   || 'google/gemma-4-31b-it:free'
    },
    nvidia: {
      apiKey: process.env.NVIDIA_API_KEY_1 || process.env.NVIDIA_API_KEY || '',
      model:  process.env.NVIDIA_MODEL   || 'deepseek-ai/deepseek-v4-flash-0731'
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model:  process.env.GEMINI_MODEL   || 'gemini-2.0-flash'
    }
  };

  try {
    const body = await request.json();
    const cvText = (body.text || '').trim();

    if (!cvText || cvText.length < 50) {
      return new Response(
        JSON.stringify({ error: 'Provided text is too short to be a valid CV.' }),
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
      } else {
        throw new Error("No JSON found");
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

