# Mission: Elite Multimodal Embedding Pipeline (Option C)

## Objective
Enrich the photo archive using Gemini 3 Flash for visual assessment and Vertex AI for multimodal embeddings. Migrated 1,063 photos and their semantic search vectors to the remote Pocketbase instance.

## Implementation Plan

### Phase 1: Environment & Schema
- [ ] Define the `photos` collection schema in Pocketbase (ID, filename, keywords, assessment, embedding, image_url).
- [ ] Ensure Google Cloud API credentials are available (Vertex AI + Gemini).
- [ ] Install necessary libraries (`@google-cloud/vertexai` or `google-auth-library`).

### Phase 2: The Migration Script (`scripts/migrate.ts`)
- [ ] **Load**: Parse the 14,000+ line `kmp-metadata.json`.
- [ ] **Assessment (Gemini 1.5 Flash)**: 
    - Loop through images.
    - Send image + existing keywords to Gemini for a 2-sentence rich description.
- [ ] **Embedding (Vertex AI)**:
    - Send the description + image to Vertex AI Multimodal Embedding model.
    - Retrieve the 1,408-dimension vector.
- [ ] **Upload**: Patch the data into the remote Pocketbase.
- [ ] **Batching**: Implement a `--limit` flag for testing and a `--resume` flag to handle failures.

### Phase 3: SvelteKit Search Integration
- [ ] Create `src/routes/api/search/+server.ts` to:
    - Receive query text.
    - Embed query using Vertex AI.
    - Perform Cosine Similarity against the Pocketbase records.
- [ ] Update `src/routes/gallery/+page.svelte` to include a functional search bar.

### Phase 4: Verification
// turbo
- [ ] Run the migration for the first 10 photos.
- [ ] Verify the data in the Pocketbase admin panel.
- [ ] Perform a "Live Search" in the browser and record the results.
