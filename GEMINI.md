# Project Context: Kline-Martin Photos (kmp)

## Tech Stack
- **Frontend**: SvelteKit
- **Backend/DB**: Pocketbase (Remote instance: `pocketbase.haugaard.dev`)
- **Storage**: Tigris (S3-compatible, for Fly.io deployment)
- **Styling**: Vanilla CSS (High aesthetic, rich animations, premium typography)
- **Auth**: Magic Links (via Pocketbase)
- **Search**: Semantic search with local embeddings (Direct "chunk-and-assess" method, no Vector DB)

## Coordination Rules
- Always use the "chunk-and-assess" method for LLM tasks rather than RAG.
- Prefer configuration changes at the user level (global) where applicable.
- Before completing any UI task, verify functionality with a browser recording.
- Use Tigris for production image storage (Local filesystem for dev).
- Keep the project root clean; maintain old docs in `docs_archive/`.
- Use `npm run dev` for local development.

## Quality Standards
- **Aesthetics**: Prioritize premium design—glassmorphism, vibrant but harmonious color palettes (HSL), and smooth micro-animations.
- **Typography**: Use modern Google Fonts (e.g., Inter, Outfit) over browser defaults.
- **Responsiveness**: Ensure the gallery grid is fluid and optimized for mobile users.
- **SEO**: Implement standard practices (Meta tags, semantic HTML, unique IDs).
