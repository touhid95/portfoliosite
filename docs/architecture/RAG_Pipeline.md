# RAG Pipeline

## Overview
The project features an AI assistant powered by Retrieval-Augmented Generation (RAG).

## Implementation Details
- **Knowledge Base**: The system uses markdown documents stored in `public/okf/` (Obsidian Knowledge Files) as the grounding context for the AI.
- **Retrieval Mechanism**: When a user asks a question, the API route (e.g. `app/api/chat/route.js`) fetches the content from these OKF files via a function like `fetchOkfKnowledge`.
- **Generation**: The retrieved context is passed alongside the user's prompt to an LLM provider (OpenRouter with reasoning support as primary/default, with automatic fallback to NVIDIA NIM or Google Gemini) to generate an informed response.

## Integration & Configuration
- The pipeline is exposed to the frontend via API endpoints within the [[Nextjs_App]].
- Environment variables, provider failover mechanisms, and deployment strategies are documented in [[Environment_and_Deployment]].
