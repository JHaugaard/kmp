# Mission: Pocketbase Integration & Auth Setup

## Objective
Connect the SvelteKit frontend to the remote Pocketbase instance (`https://pocketbase.haugaard.dev`) and implement the authentication gatekeeper.

## Implementation Plan

### Phase 1: Environment & SDK
- [ ] Create `.env` and `.env.example` with `PUBLIC_POCKETBASE_URL`.
- [ ] Install the `pocketbase` npm package.
- [ ] Create `src/lib/pb.ts` to export a configured PocketBase client.

### Phase 2: Auth Gatekeeper
- [ ] Create `src/hooks.server.ts` to:
    - Load the auth store from the request cookie.
    - Export the auth state to `event.locals`.
    - Handle cookie synchronization back to the client.

### Phase 3: Login Workflow
- [ ] Create `src/routes/login/+page.svelte` (Premium design).
- [ ] Implement `src/routes/login/+page.server.ts` to handle the Magic Link request action.
- [ ] Create a "protected" route at `src/routes/gallery/+page.svelte` that redirects to `/login` if not authenticated.

### Phase 4: Verification
// turbo
- [ ] Start the dev server.
- [ ] Use the browser to navigate to `/gallery`.
- [ ] Verify the automatic redirect to `/login`.
- [ ] Record a video showing the high-end Login UI and the redirect behavior.
