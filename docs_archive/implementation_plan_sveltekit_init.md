# Mission: Initialize SvelteKit Project

## Objective
Set up a foundational SvelteKit project for Kline-Martin Photos (kmp) following the aesthetic and technical requirements in `GEMINI.md`.

## Implementation Plan

### Phase 1: Scaffolding
- [ ] Run `npx -y create-svelte@latest ./` to initialize the project.
- [ ] Select options: `Skeleton project`, `Yes, using TypeScript syntax`, `Add ESLint`, `Add Prettier`.
- [ ] Run `npm install`.

### Phase 2: Design System Foundation
- [ ] Create `src/app.css` with HSL color tokens, glassmorphism utilities, and typography.
- [ ] Update `src/routes/+layout.svelte` to import `src/app.css`.
- [ ] Update `src/app.html` to include Google Fonts (Inter and Outfit).

### Phase 3: Verification
// turbo
- [ ] Run `npm run dev` in the background.
- [ ] Open a browser to `http://localhost:5173`.
- [ ] Verify the page renders and styles are applied.
- [ ] Record a browser session illustrating the base setup.
