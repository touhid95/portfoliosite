<!-- BEGIN:nextjs-api-route-exports -->
When creating or editing Next.js API routes in the `app/` directory (App Router), you MUST use named HTTP method exports (e.g., `export async function POST(request)`). Do NOT use `export default function handler`, as this will cause build failures in Next.js 13+.
<!-- END:nextjs-api-route-exports -->

<!-- BEGIN:portfolio-ai-okf-files -->
In this portfolio project, the AI assistant's RAG knowledge documents (OKF files) are strictly stored in `public/okf/*.md`. When creating or updating a knowledge document, ensure it is placed in `public/okf/` and its filename is added to the `files` array inside `app/api/chat/route.js`'s `fetchOkfKnowledge` function.
<!-- END:portfolio-ai-okf-files -->
