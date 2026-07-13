-- ============================================================
-- Portfolio CMS — Supabase Schema
-- Run this in: Supabase → SQL Editor → New Query → Run (▶)
-- ============================================================

-- 1. Create the key-value store table
CREATE TABLE IF NOT EXISTS portfolio_kv (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE portfolio_kv ENABLE ROW LEVEL SECURITY;

-- 3. Public read policy (used by /api/content.js for public pages)
CREATE POLICY "Public read" ON portfolio_kv
  FOR SELECT USING (true);

-- 4. Service role write policy (used by admin API routes only)
CREATE POLICY "Service role write" ON portfolio_kv
  FOR ALL USING (auth.role() = 'service_role');


-- ============================================================
-- Keys used by this project (for reference)
-- These are inserted/updated via the Admin Panel
-- ============================================================
-- touhid_content       → JSON string: { projects: [...], research: [...] }
-- touhid_knowledge     → Plain text: AI chatbot knowledge base
-- touhid_system_prompt → Plain text: AI chatbot system prompt
-- touhid_jobs          → JSON string: [...] job/work experience entries


-- ============================================================
-- Optional: seed with empty rows so keys exist from the start
-- ============================================================
INSERT INTO portfolio_kv (key, value) VALUES
  ('touhid_content',       '{}'),
  ('touhid_knowledge',     ''),
  ('touhid_system_prompt', ''),
  ('touhid_jobs',          '[]')
ON CONFLICT (key) DO NOTHING;
