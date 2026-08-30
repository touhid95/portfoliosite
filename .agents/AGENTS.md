<!-- BEGIN:nextjs-api-route-exports -->
When creating or editing Next.js API routes in the `app/` directory (App Router), you MUST use named HTTP method exports (e.g., `export async function POST(request)`). Do NOT use `export default function handler`, as this will cause build failures in Next.js 13+.
<!-- END:nextjs-api-route-exports -->

<!-- BEGIN:portfolio-ai-okf-files -->
In this portfolio project, the AI assistant's RAG knowledge documents (OKF files) are strictly stored in `public/okf/*.md`. When creating or updating a knowledge document, ensure it is placed in `public/okf/` and its filename is added to the `files` array inside `app/api/chat/route.js`'s `fetchOkfKnowledge` function.
<!-- END:portfolio-ai-okf-files -->

<!-- BEGIN:codebase-obsidian-graph -->
## Codebase Understanding via Obsidian Graph
This project uses an Obsidian-style markdown graph to document the codebase architecture, stored in `docs/architecture/`.

1. **Before implementing complex changes**, the AI MUST consult `Index.md` in `docs/architecture/` and follow the `[[links]]` to understand relevant modules.
2. **When creating new features, components, or services**, the AI MUST update the graph by:
   - Creating a new markdown file for the module if it doesn't exist.
   - Using Obsidian-style links (e.g., `[[Module_Name]]`) to connect it to existing components.
   - Updating `Index.md` if it's a major system component.
3. The AI MUST treat this graph as the single source of truth for high-level architectural context.
<!-- END:codebase-obsidian-graph -->
