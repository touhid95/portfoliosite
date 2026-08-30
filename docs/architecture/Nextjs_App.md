# Next.js App

## Overview
The project is built using Next.js 14+ with the App Router architecture. 

## Key Directories
- `app/`: Contains all route segments, pages (`page.tsx`), layouts, and API routes (`route.ts`).
- `components/`: Contains reusable React components.
- `lib/`: Contains utility functions and shared logic.
- `public/okf/`: Stores the markdown files used for the [[RAG_Pipeline]].

## Integration Points
- Fetches data from the [[Database]] via Supabase clients.
- API routes handle chat interactions and proxy them to AI models via the [[RAG_Pipeline]].
