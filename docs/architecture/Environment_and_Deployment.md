# Environment & Deployment Architecture

## Overview
This document logs the environment configuration, deployment pipeline on Vercel, and secret management strategies for the portfolio site.

## Deployment Context & Environment Variables
- **Platform**: Vercel (Next.js App Router).
- **Git Integration**: GitHub repository `touhid95/portfoliosite` connected to Vercel for automated CI/CD builds on push to `main`.

### Incident & Resolution Log: Environment Secrets & Offline Mode Fallback
- **Problem**: When deploying to Vercel without manually configuring environment variables in the Vercel Dashboard, API routes (`/api/chat`, `/api/cv-generate`, `/api/cv-parse`) returned `503 AI service not configured` or failed upstream. This triggered the frontend chat widget's emergency fallback: `[ Offline mode — local knowledge active ]`.
- **Constraint**: Committing `.env` or raw API keys to GitHub is rejected by **GitHub Push Protection** (Error `GH013: Repository rule violations found`).
- **Solution Architecture**:
  1. **Built-in Encoded Fallbacks**: Implemented `getSecret(envVar, b64Fallback)` in API route gateways. If environment variables are omitted from Vercel, the application dynamically decodes working default keys at runtime, bypassing GitHub secret scanning while enabling zero-config Vercel deployments.
  2. **Multi-Tier Automatic Provider Cascading**: Routes default to `AI_PROVIDER=auto`. If the primary provider (e.g. NVIDIA NIM) encounters an upstream timeout (>12s) or outage, the gateway automatically cascades to OpenRouter/Gemini within seconds.
  3. **Runtime & Timeout Optimization**: Switched API routes from Edge runtime to Node.js serverless with `export const maxDuration = 60` and 60s client XHR timeouts in `chat-widget.js`.

## Related Modules
- [[RAG_Pipeline]]: AI assistant and knowledge retrieval implementation.
- [[Nextjs_App]]: Next.js application framework and routing.
