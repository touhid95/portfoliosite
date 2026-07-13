# 🗄️ Supabase Setup Guide — Portfolio CMS

A step-by-step guide to connect your portfolio site to Supabase so the Admin Panel saves data that actually appears on your live site.

---

## Step 1 — Create a Supabase Account & Project

1. Go to **[https://supabase.com](https://supabase.com)** and click **Start your project**
2. Sign in with GitHub (easiest)
3. Click **New Project**
4. Fill in:
   - **Name**: `portfolio-cms` (or anything you like)
   - **Database Password**: choose a strong password and **save it somewhere**
   - **Region**: pick the one closest to you (e.g. Southeast Asia → Singapore)
5. Click **Create new project** and wait ~2 minutes for it to spin up

---

## Step 2 — Create the Database Table

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Paste the following SQL and click **Run** (▶):

```sql
-- Create the key-value table for CMS storage
CREATE TABLE IF NOT EXISTS portfolio_kv (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE portfolio_kv ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (needed for public pages like projects, research)
CREATE POLICY "Public read" ON portfolio_kv
  FOR SELECT USING (true);

-- Only service_role (your server-side API) can write
CREATE POLICY "Service role write" ON portfolio_kv
  FOR ALL USING (auth.role() = 'service_role');
```

4. You should see **"Success. No rows returned"** — this is correct ✅

---

## Step 3 — Get Your API Keys

1. In your Supabase project, go to **Project Settings** (gear icon ⚙️ in the left sidebar)
2. Click **API** under the Configuration section
3. You need **three values** — copy each one:

| What to copy | Where it is | Which env var |
|---|---|---|
| **Project URL** | Top of the page, looks like `https://abcdefgh.supabase.co` | `SUPABASE_URL` |
| **anon / public** key | Under "Project API keys" — the `anon` key | `SUPABASE_ANON_KEY` |
| **service_role** key | Under "Project API keys" — click **Reveal** on `service_role` | `SUPABASE_SERVICE_KEY` |

> ⚠️ **Never share the `service_role` key publicly.** It bypasses all security rules. It's only safe because it lives in Vercel's server-side environment variables.

---

## Step 4 — Add Environment Variables to Vercel

1. Go to **[https://vercel.com/dashboard](https://vercel.com/dashboard)**
2. Click on your portfolio project
3. Go to **Settings → Environment Variables**
4. Add each variable below by clicking **Add New**:

### Variable 1
- **Key**: `SUPABASE_URL`
- **Value**: *(paste your Project URL)*
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### Variable 2
- **Key**: `SUPABASE_ANON_KEY`
- **Value**: *(paste your anon key)*
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### Variable 3
- **Key**: `SUPABASE_SERVICE_KEY`
- **Value**: *(paste your service_role key)*
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

5. Click **Save** after adding each one

> You can also **remove** the old `KV_REST_API_URL` and `KV_REST_API_TOKEN` variables — they are no longer used.

---

## Step 5 — Redeploy Your Site

Vercel does not automatically apply new environment variables to existing deployments. You need to redeploy:

### Option A — Push to Git (recommended)
```bash
git add .
git commit -m "migrate backend from Vercel KV to Supabase"
git push
```
Vercel will auto-deploy within ~30 seconds.

### Option B — Manual redeploy in Vercel
1. Go to your Vercel project → **Deployments** tab
2. Click the **⋯** menu next to the latest deployment
3. Click **Redeploy** → confirm

---

## Step 6 — Verify It Works

### Quick test from your browser
Open your live site, press **F12** (DevTools) → go to **Console** tab → paste this:

```js
fetch('/api/content').then(r => r.json()).then(console.log)
```

- **Before saving anything**: you'll see `{}` (empty object — normal)
- **After saving from Admin Panel**: you'll see your projects and research data

### Full test flow
1. Open your Admin Panel on the live site
2. Make a small change (e.g. edit a project title)
3. Click **Save**
4. Open `projects.html` or `research.html` — the change should appear

### Verify data in Supabase
1. Go to your Supabase project → **Table Editor** → `portfolio_kv`
2. After saving from admin panel, you should see rows like:

| key | value |
|-----|-------|
| `touhid_content` | `{"projects":[...],"research":[...]}` |
| `touhid_knowledge` | *(your AI knowledge text)* |

---

## Troubleshooting

### Admin panel says "saved" but pages don't update
Run in browser console:
```js
fetch('/api/content').then(r => r.json()).then(console.log)
```
If it returns `{}`, check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in Vercel.

### Save returns an error
Open DevTools → Network tab → look at the `POST /api/admin/save` response body. The error will say exactly what went wrong (e.g. "Supabase not configured").

### Getting a 401 Unauthorized on save
Your admin password in the admin panel doesn't match the `ADMIN_PASSWORD` environment variable in Vercel.

### RLS error / permission denied
Make sure you ran the full SQL in Step 2, including the two `CREATE POLICY` statements.

---

## Environment Variables Summary

| Variable | Used by | Purpose |
|---|---|---|
| `SUPABASE_URL` | All 3 API files | Your Supabase project endpoint |
| `SUPABASE_ANON_KEY` | `api/content.js` | Public read access |
| `SUPABASE_SERVICE_KEY` | `api/admin/save.js`, `api/admin/get.js` | Privileged write access (server-side only) |
| `ADMIN_PASSWORD` | `api/admin/save.js`, `api/admin/get.js` | Protects admin endpoints |
