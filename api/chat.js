/**
 * /api/chat.js — Portfolio AI Assistant
 * Vercel Edge Function
 *
 * ──────────────────────────────────────────────────────────────────
 *  CONFIGURABLE VIA VERCEL ENVIRONMENT VARIABLES
 * ──────────────────────────────────────────────────────────────────
 *  AI_PROVIDER          "nvidia" | "gemini" | "auto"  (default: auto)
 *                        auto → tries NVIDIA first, falls back to Gemini
 *
 *  NVIDIA_API_KEY       Your NVIDIA NIM API key
 *  NVIDIA_MODEL         Model slug (default: minimaxai/minimax-m3)
 *  NVIDIA_MAX_TOKENS    Max tokens (default: 512)
 *  NVIDIA_TEMPERATURE   Temperature 0-1 (default: 0.7)
 *
 *  GEMINI_API_KEY       Your Google AI Studio / Gemini API key
 *  GEMINI_MODEL         Model slug (default: gemini-2.0-flash)
 *  GEMINI_MAX_TOKENS    Max tokens (default: 400)
 *  GEMINI_TEMPERATURE   Temperature 0-1 (default: 0.7)
 *
 *  KV_REST_API_URL      Vercel KV endpoint (optional, for RAG knowledge)
 *  KV_REST_API_TOKEN    Vercel KV token (optional)
 * ──────────────────────────────────────────────────────────────────
 */
export const config = { runtime: 'edge' };

/* ── CORS ────────────────────────────────────────────────── */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

/* ── Owner info ──────────────────────────────────────────── */
const OWNER_NAME = 'Mahfujul Kader Touhid';
const OWNER_EMAIL = 'm.k.touhid95@gmail.com';

/* ── Dynamic OKF Knowledge via Fetch ─────────────────────── */
async function fetchOkfKnowledge(request) {
  try {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    const files = ['profile.md', 'experience.md', 'education.md', 'projects.md'];
    let knowledgeBase = '';
    
    for (const file of files) {
      const res = await fetch(`${baseUrl}/okf/${file}`);
      if (res.ok) {
        const content = await res.text();
        // Extract basic OKF info if present
        let meta = {};
        let body = content;
        if (content.startsWith('---')) {
          const parts = content.split('---');
          if (parts.length >= 3) {
            body = parts.slice(2).join('---').trim();
            parts[1].trim().split('\n').forEach(line => {
              const colonIdx = line.indexOf(':');
              if (colonIdx !== -1) {
                const key = line.slice(0, colonIdx).trim();
                const val = line.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
                meta[key] = val;
              }
            });
          }
        }
        knowledgeBase += `[DOCUMENT ID: ${meta.id || file}] (Type: ${meta.type || 'unknown'})\n`;
        if (meta.title) knowledgeBase += `TITLE: ${meta.title}\n`;
        knowledgeBase += `\n${body}\n\n`;
      }
    }
    return knowledgeBase.trim();
  } catch (err) {
    console.error('Failed to fetch OKF files:', err);
    return 'Knowledge base unavailable.';
  }
}

/* ── Runtime config (resolved from env vars) ─────────────── */
function getConfig() {
  return {
    provider: (process.env.AI_PROVIDER || 'auto').toLowerCase().trim(),

    nvidia: {
      apiKey: process.env.NVIDIA_API_KEY || '',
      model: process.env.NVIDIA_MODEL || 'meta/llama-3.1-8b-instruct',
      maxTokens: parseInt(process.env.NVIDIA_MAX_TOKENS || '512', 10),
      temperature: parseFloat(process.env.NVIDIA_TEMPERATURE || '0.7')
    },

    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '400', 10),
      temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7')
    }
  };
}

/* ── System prompt ───────────────────────────────────────── */
function buildSystemPrompt(knowledge) {
  return `You are a deeply emotionally intelligent personal assistant representing 
${OWNER_NAME}. Your character is modeled on the highest standard of human 
conduct — patient, compassionate, self-aware, and wise. You speak on 
behalf of ${OWNER_NAME} with professionalism, warmth, and integrity.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO YOU REPRESENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You represent ${OWNER_NAME} — a person of thoughtful character, strong 
values, and genuine care for the people around him. You are his voice 
when he is unavailable, and you reflect his attitude faithfully in 
every interaction.

You are not just an assistant. You are a trusted presence — steady, 
kind, and professional.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE ATTITUDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- You never react with harshness, sarcasm, or impatience — no matter 
  how the user phrases something
- You pause before responding, choosing words with care and intention
- You assume the best of the person you are speaking with
- You correct gently, guide with wisdom, and never shame or dismiss
- You make every person feel heard, valued, and respected
- You model calm even when the topic is charged or sensitive

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW YOU COMMUNICATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- You are warm but grounded — never hollow or performative
- You are direct when needed, but always with softness in tone
- You listen deeply to what is said AND what is left unsaid
- You tailor your response to where the person is emotionally, 
  not just intellectually
- You never lecture or overwhelm — you give what is needed, 
  when it is needed
- You lead with empathy, then insight
- You offer clarity without arrogance
- You encourage without flattery
- When you don't know something, you admit it with grace
- You end every interaction leaving the person better than 
  you found them

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EMOTIONAL REGULATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- You never escalate tension — you de-escalate
- If the person is frustrated or confused, you acknowledge 
  it before solving anything
- You hold space for emotion without being swept away by it
- You model patience and emotional maturity in every reply
- You never make a person feel judged for what they feel or ask

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HANDLING QUESTIONS ABOUT MESSAGES OR CONVERSATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If someone is curious about a specific message, conversation, 
or context involving ${OWNER_NAME}, respond with transparency 
and care. Do not speculate or invent details. If the matter 
requires ${OWNER_NAME}'s direct input, acknowledge it honestly 
and professionally:

  "That's something ${OWNER_NAME} would be best to address 
  personally. I'd recommend reaching out to him directly 
  so he can give you the full context and attention 
  this deserves."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIRECTING PEOPLE TO CONTACT ${OWNER_NAME}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When a conversation requires personal attention, deeper 
discussion, or direct communication with ${OWNER_NAME}, 
professionally guide the person to reach out through 
the appropriate channel:

  FOR GENERAL OR PERSONAL MATTERS — WhatsApp:
  "For a more personal conversation, you are welcome to 
  reach ${OWNER_NAME} directly on WhatsApp at 
  +880 1734773509. He values direct communication 
  and will respond with care."

  FOR WRITTEN OR FORMAL CORRESPONDENCE — Email:
  "If you prefer written correspondence, you may reach 
  ${OWNER_NAME} via email at ${OWNER_EMAIL}. 
  Please allow reasonable time for a thoughtful response."

Always frame these redirections warmly and professionally — 
never abruptly. Make the person feel that reaching out is 
welcomed, not a burden.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU NEVER DO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- You never speak ill of anyone
- You never share private information without clear authorization
- You never respond dismissively or with impatience
- You never make promises on behalf of ${OWNER_NAME} 
  that he has not explicitly authorized
- You never use harsh, cold, or robotic language
- You never make someone feel like a burden for asking

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR CLOSING STANDARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every response you give should reflect the character of 
someone who leads with mercy, speaks with wisdom, and 
acts with sincerity. You are not just answering questions 
— you are representing a person's name, reputation, 
and values. Handle that with the utmost care.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KNOWLEDGE BASE (OKF FORMAT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You MUST use the following knowledge base to answer any questions about ${OWNER_NAME}'s projects, skills, or background.
Do not invent information. If the answer is not here, gracefully direct them to contact ${OWNER_NAME}.

${knowledge}
`;
}

/* ── Read knowledge from Vercel KV ──────────────────────── */
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

/* ── Read custom system prompt from Vercel KV ────────────── */
async function getCustomSystemPrompt() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/touhid_system_prompt`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result || null;
  } catch {
    return null;
  }
}

/* ── KV Chat History ─────────────────────────────────────── */
async function getChatHistory(username) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token || !username) return [];
  try {
    const res = await fetch(`${url}/get/chat_history_${encodeURIComponent(username)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.result ? JSON.parse(data.result) : [];
  } catch {
    return [];
  }
}

async function saveChatHistory(username, history) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token || !username) return;
  try {
    await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['SET', `chat_history_${encodeURIComponent(username)}`, JSON.stringify(history)],
        ['SADD', 'touhid_interactors', username]
      ])
    });
  } catch (err) {
    console.error('Failed to save history', err);
  }
}

/* ── Simple RAG: chunk retrieval by keyword relevance ────── */
function retrieveRelevantChunks(baseKnowledge, extraKnowledge, query, maxChars = 3000) {
  let combinedKnowledge = baseKnowledge;
  if (extraKnowledge) {
    combinedKnowledge += '\n\n--- ADDITIONAL KV KNOWLEDGE ---\n\n' + extraKnowledge;
  }

  const chunks = combinedKnowledge
    .split(/\n{2,}/)
    .map(c => c.trim())
    .filter(c => c.length > 20);

  if (!chunks.length) return baseKnowledge;

  const queryTerms = query.toLowerCase()
    .split(/\s+/)
    .filter(t => t.length > 2);

  if (queryTerms.length === 0) return combinedKnowledge.slice(0, maxChars);

  const scored = chunks.map(chunk => {
    const lower = chunk.toLowerCase();
    const score = queryTerms.reduce((acc, term) => {
      const occurrences = (lower.match(new RegExp(term, 'g')) || []).length;
      return acc + occurrences;
    }, 0);
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  let context = '';
  let chars = 0;

  for (const { chunk } of scored) {
    if (chars + chunk.length > maxChars) break;
    context += chunk + '\n\n';
    chars += chunk.length + 2;
  }

  return context.trim() || combinedKnowledge.slice(0, maxChars);
}

/* ── NVIDIA NIM call ─────────────────────────────────────── */
async function callNvidia(cfg, systemPrompt, message, history = []) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 22000); // 22s — safely under Edge 25s limit

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.text
    })),
    { role: 'user', content: message }
  ];

  try {
    const res = await fetch(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${cfg.nvidia.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          model: cfg.nvidia.model,
          messages: apiMessages,
          max_tokens: cfg.nvidia.maxTokens,
          temperature: cfg.nvidia.temperature,
          top_p: 0.95,
          stream: false
        })
      }
    );

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

/* ── Gemini call ─────────────────────────────────────────── */
async function callGemini(cfg, systemPrompt, message, history = []) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 22000); // 22s safety timeout

  const apiContents = [
    ...history.map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.text }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${cfg.gemini.model}:generateContent?key=${cfg.gemini.apiKey}`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: apiContents,
          generationConfig: {
            temperature: cfg.gemini.temperature,
            maxOutputTokens: cfg.gemini.maxTokens
          }
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

/* ── JSON response helper ────────────────────────────────── */
function jsonResponse(body, status = 200) {
  return new Response(
    JSON.stringify(body),
    { status, headers: { 'Content-Type': 'application/json', ...CORS } }
  );
}

/* ── Main handler ────────────────────────────────────────── */
export default async function handler(request, context) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS });
  }

  let message, username, fetchHistory;
  try {
    const body = await request.json();
    message = (body.message || '').trim();
    username = (body.username || '').trim();
    fetchHistory = !!body.fetchHistory;
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  if (fetchHistory && username) {
    const history = await getChatHistory(username);
    return jsonResponse({ reply: '', history: history });
  }

  if (!message && !fetchHistory) {
    return jsonResponse({ error: 'Message is required' }, 400);
  }

  const cfg = getConfig();

  /* Validate: at least one key must be present */
  const hasNvidia = !!cfg.nvidia.apiKey;
  const hasGemini = !!cfg.gemini.apiKey;

  if (!hasNvidia && !hasGemini) {
    return jsonResponse({ error: 'AI service not configured' }, 503);
  }

  /* Fetch all necessary KV data and static files in parallel */
  const [baseKnowledge, extraKnowledge, customPrompt, history] = await Promise.all([
    fetchOkfKnowledge(request),
    getKnowledge(),
    getCustomSystemPrompt(),
    username ? getChatHistory(username) : Promise.resolve([])
  ]);
  
  const relevantContext = retrieveRelevantChunks(baseKnowledge, extraKnowledge, message);

  /* Use admin-saved system prompt if available, otherwise use built-in */
  let systemPrompt;
  if (customPrompt) {
    /* Inject knowledge into custom prompt if it contains the placeholder */
    systemPrompt = customPrompt.includes('{{KNOWLEDGE}}')
      ? customPrompt.replace('{{KNOWLEDGE}}', relevantContext)
      : customPrompt + '\n\n## KNOWLEDGE BASE\n' + relevantContext;
  } else {
    systemPrompt = buildSystemPrompt(relevantContext);
  }

  try {
    let reply;

    switch (cfg.provider) {

      /* ── Force Gemini only ── */
      case 'gemini':
        if (!hasGemini) return jsonResponse({ error: 'GEMINI_API_KEY not set' }, 503);
        reply = await callGemini(cfg, systemPrompt, message, history);
        break;

      /* ── Force NVIDIA only ── */
      case 'nvidia':
        if (!hasNvidia) return jsonResponse({ error: 'NVIDIA_API_KEY not set' }, 503);
        reply = await callNvidia(cfg, systemPrompt, message, history);
        break;

      /* ── Auto: NVIDIA first, Gemini fallback ── */
      case 'auto':
      default:
        if (hasNvidia) {
          try {
            reply = await callNvidia(cfg, systemPrompt, message, history);
          } catch (nvidiaErr) {
            console.error('NVIDIA failed, falling back to Gemini:', nvidiaErr.message);
            if (hasGemini) {
              reply = await callGemini(cfg, systemPrompt, message, history);
            } else {
              throw nvidiaErr;
            }
          }
        } else if (hasGemini) {
          reply = await callGemini(cfg, systemPrompt, message, history);
        }
        break;
    }

    if (username) {
      history.push({ role: 'user', text: message });
      history.push({ role: 'ai', text: reply });
      
      const savePromise = saveChatHistory(username, history);
      if (context && context.waitUntil) {
        context.waitUntil(savePromise);
      } else {
        await savePromise;
      }
    }

    return jsonResponse({ reply });

  } catch (err) {
    console.error('Handler error:', err);
    return jsonResponse({ error: 'AI request failed. Please try again.' }, 502);
  }
}
