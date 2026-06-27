/**
 * /api/cv-generate.js
 * Vercel Edge Function — Generate a LaTeX CV tailored to a job description using AI
 * Uses a fixed LaTeX template with AI-generated content sections.
 * Protected by ADMIN_PASSWORD
 *
 * POST { jobDescription: "..." }
 * Returns { latex: "...", filename: "cv-touhid-tailored.tex" }
 */
export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

const OWNER_NAME  = 'Mahfujul Kader Touhid';
const OWNER_EMAIL = 'm.k.touhid95@gmail.com';

/* ── Fixed LaTeX preamble ────────────────────────────────── */
const LATEX_PREAMBLE = `\\documentclass[11pt,a4paper]{moderncv}
\\moderncvstyle{banking}
\\moderncvcolor{blue}
\\usepackage[scale=0.75]{geometry}
\\usepackage{hyperref}

\\name{Mahfujul Kader}{Touhid}
\\email{${OWNER_EMAIL}}
\\phone{+880 1734773509}
\\address{Sector-6, Uttara, Dhaka, Bangladesh}
\\social[linkedin]{linkedin.com/in/mktouhid/}
\\social[github]{github.com/touhid95/portfolio}

\\begin{document}
\\makecvtitle

`;

const LATEX_POSTAMBLE = `

\\end{document}`;

const BASE_KNOWLEDGE = `
PERSON: ${OWNER_NAME}
ROLE: Data Analyst & BBA Undergraduate
UNIVERSITY: IBA, Jahangirnagar University, Savar, Dhaka — CGPA 3.24/4.00 (6 semesters)
LOCATION: Sector-6, Uttara, Dhaka, Bangladesh
EMAIL: ${OWNER_EMAIL}
PHONE: +880 1734773509
LINKEDIN: linkedin.com/in/mktouhid/
GITHUB: github.com/touhid95/portfolio

EDUCATION:
- BBA (Ongoing) — IBA, Jahangirnagar University, 2021–Present, CGPA 3.24
- HSC — Mirzapur Cadet College, Science, 2020, GPA 5.00/5.00
- SSC — Mirzapur Cadet College, Science, 2019, GPA 5.00/5.00

SKILLS (TECHNICAL):
- SQL — 5-star Gold rated on HackerRank
- Python — Pandas, NumPy, Matplotlib, Seaborn, Scikit-Learn
- Power BI, Tableau, Microsoft Excel
- R language, SQL Server, 3NF Design, Window Functions, CTEs

CERTIFICATIONS:
- Data Science (Sololearn) — CC-9FYOGHRZ
- SQL (Sololearn) — CC-RPHT4UCX
- R (Sololearn) — CC-ONCVDTPD
- Python Core (Sololearn) — CT-VIWPDMXG
- HTML (Sololearn) — CC-PCKFQGVS

PROJECTS:
1. Financial Market Predictive Analytics — Python, Pandas, NumPy, Power BI, yfinance
2. Retail Sales Database Optimization — SQL Server, 3NF Design, Window Functions, CTEs, Tableau
3. Customer Segmentation & RFM Analysis — Python, Scikit-Learn, Pandas, KMeans Clustering, RFM Modeling
4. Cadet College Sports Analytics — Python, Excel VBA, Matplotlib, Data Cleaning

EXPERIENCE:
- Data Analyst (academic/research) — IBA-JU, worked on business data projects

CAREER GOAL:
- Become a data-driven decision-maker at the intersection of finance and technology
- Aspiration: build at the scale of BlackRock's Aladdin risk management platform

PERSONAL STRENGTHS:
- Learns fast, maintains deadlines, thrives under pressure
`.trim();

async function getKnowledge() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/touhid_knowledge`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result || null;
  } catch {
    return null;
  }
}

function buildContentPrompt(knowledge, jobDescription) {
  return `You are a professional CV writer. Generate ONLY the LaTeX \\\\section{...} content blocks for a moderncv document. Do NOT include \\\\documentclass, preamble, \\\\begin{document}, \\\\makecvtitle, or \\\\end{document} — only the section blocks.

## PERSON'S PROFILE
---
${knowledge || BASE_KNOWLEDGE}
---

## TARGET JOB DESCRIPTION
The CV content must be tailored for this specific role:
---
${jobDescription}
---

## OUTPUT REQUIREMENTS
1. Output ONLY the section blocks — nothing before, nothing after
2. Start with \\\\section{Education} and list education entries using \\\\cventry
3. Follow with \\\\section{Technical Skills} using \\\\cvitem for each skill group
4. Follow with \\\\section{Projects} using \\\\cventry — highlight the 2-3 most relevant projects, describe them in terms matching the job keywords
5. End with \\\\section{Certifications} using \\\\cvitem
6. Rewrite project bullet points to emphasize skills and achievements relevant to the job posting
7. Keep all factual information accurate — do not fabricate experience, skills, or credentials
8. Use proper LaTeX escaping for special characters (&, %, $, #, _, {, }, ~, ^)
9. Use \\\\cventry for timeline entries and \\\\cvitem for simple lists
10. Keep descriptions concise and achievement-oriented`;
}

async function callNvidia(cfg, prompt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${cfg.nvidia.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        model: cfg.nvidia.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
        temperature: 0.2,
        top_p: 0.95,
        stream: false
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`NVIDIA ${res.status}: ${errText}`);
    }
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) throw new Error('NVIDIA returned empty response');
    return reply.trim();
  } finally {
    clearTimeout(timer);
  }
}

async function callGemini(cfg, prompt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${cfg.gemini.model}:generateContent?key=${cfg.gemini.apiKey}`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
        })
      }
    );
    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error('Gemini returned empty response');
    return reply.trim();
  } finally {
    clearTimeout(timer);
  }
}

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

  let jobDescription;
  try {
    const body = await request.json();
    jobDescription = (body.jobDescription || '').trim();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  if (!jobDescription || jobDescription.length < 20) {
    return new Response(JSON.stringify({ error: 'Job description is too short. Please paste a full job posting.' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
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

  const hasNvidia = !!cfg.nvidia.apiKey;
  const hasGemini = !!cfg.gemini.apiKey;
  if (!hasNvidia && !hasGemini) {
    return new Response(JSON.stringify({ error: 'AI service not configured. Set NVIDIA_API_KEY or GEMINI_API_KEY.' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  try {
    const extraKnowledge = await getKnowledge();
    const prompt = buildContentPrompt(extraKnowledge, jobDescription);

    let aiContent;
    if (hasNvidia) {
      try {
        aiContent = await callNvidia(cfg, prompt);
      } catch (nvidiaErr) {
        console.error('NVIDIA failed, falling back to Gemini:', nvidiaErr.message);
        if (hasGemini) {
          aiContent = await callGemini(cfg, prompt);
        } else {
          throw nvidiaErr;
        }
      }
    } else {
      aiContent = await callGemini(cfg, prompt);
    }

    /* Strip markdown code fences if AI wrapped the output */
    aiContent = aiContent.replace(/^```(?:latex)?\s*/i, '').replace(/\s*```$/i, '').trim();

    if (!aiContent || aiContent.length < 50) {
      throw new Error('Generated content is too short or empty');
    }

    const latex = LATEX_PREAMBLE + aiContent + LATEX_POSTAMBLE;
    const filename = `cv-${OWNER_NAME.toLowerCase().replace(/\s+/g, '-')}-tailored.tex`;

    return new Response(
      JSON.stringify({ latex, filename, contentLength: aiContent.length }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );

  } catch (err) {
    console.error('CV generate error:', err);
    return new Response(JSON.stringify({ error: err.message || 'LaTeX generation failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
}
