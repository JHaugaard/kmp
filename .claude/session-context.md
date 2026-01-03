# Session Context

## Current Focus
**MILESTONE: Admin Phase Ready** - 1,063 photos imported, admin UI themed and functional

## Project URLs
- **Gallery**: https://kline-martin-photos.com
- **PocketBase Admin**: https://pocketbase.haugaard.dev/_/
- **B2 Storage**: https://kline-martin-photos.s3.us-west-000.backblazeb2.com

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Backblaze B2 Storage                                       │
│  ├── originals/kmp-0001.jpg ... kmp-1063.jpg (full-res)    │
│  └── thumbs/kmp-0001.jpg ... kmp-1063.jpg (400px)          │
└─────────────────────────────────────────────────────────────┘
                              ↑
                         URL pointers
                              │
┌─────────────────────────────────────────────────────────────┐
│  PocketBase (vps8 - pocketbase.haugaard.dev)               │
│  Collections:                                               │
│  ├── photos (1,063 records) - metadata + B2 URLs           │
│  ├── people - family member registry                        │
│  ├── reviews - photo review audit trail                     │
│  └── users - OTP auth, roles (user/reviewer/admin)         │
└─────────────────────────────────────────────────────────────┘
                              ↑
                          API calls
                              │
┌─────────────────────────────────────────────────────────────┐
│  SvelteKit App (vps2 - kline-martin-photos.com)            │
│  ├── /          - Landing page (light Notion theme)        │
│  ├── /login     - OTP passwordless auth                     │
│  ├── /admin     - Dashboard with stats                      │
│  ├── /admin/photos - Photo grid with thumbnails            │
│  └── /admin/people - Family member management              │
└─────────────────────────────────────────────────────────────┘
```

## PocketBase `photos` Collection Schema

| Field | Type | Purpose |
|-------|------|---------|
| `id` | text | PocketBase auto ID |
| `filename` | text | `kmp-0001.jpg` |
| `keywords` | json | `["Martin", "Jack", "Nebraska"]` |
| `assessment` | text | AI-generated description (future) |
| `embedding` | json | Vector for semantic search (future) |
| `image_url` | url | Full-resolution B2 URL |
| `thumbnail_url` | url | 400px thumbnail B2 URL |
| `needs_reassessment` | bool | Flag for review workflow |

## Runbook - Common Commands

### Deployment
```bash
# Full deploy (code changes)
ssh vps2 'cd ~/vps-setup/apps/kmp && git pull && docker compose up -d --build'

# Quick restart (config changes only)
ssh vps2 'cd ~/vps-setup/apps/kmp && docker compose restart'

# View logs
ssh vps2 'docker logs kmp-app --tail=100'
ssh vps2 'docker logs kmp-app -f'  # follow mode
```

### Local Development
```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
npm run check    # TypeScript checking
npm run lint     # ESLint + Prettier check
npm run format   # Format with Prettier
```

### PocketBase Scripts (run from project root)
```bash
# Schema setup (creates/updates collections)
npx tsx scripts/setup-pb.ts

# Fix photos schema (add missing fields)
npx tsx scripts/fix-photos-schema.ts

# Check current schema
npx tsx scripts/check-schema.ts

# Import photos (merge metadata + B2 URLs into PocketBase)
npx tsx scripts/import-photos.ts

# Upload images to B2 (already done - 1,063 photos)
npx tsx scripts/upload-to-b2.ts
```

### Required Environment Variables (.env.local)
```bash
PUBLIC_POCKETBASE_URL=https://pocketbase.haugaard.dev
PB_ADMIN_EMAIL=<superuser email>
PB_ADMIN_PASSWORD=<superuser password>
B2_BUCKET=kline-martin-photos
B2_ENDPOINT=s3.us-west-000.backblazeb2.com
B2_ACCESS_KEY_ID=<key>
B2_SECRET_ACCESS_KEY=<secret>
```

## Key Data Files

| File | Purpose |
|------|---------|
| `kmp-metadata.json` | Keywords, dimensions, file sizes for 1,063 photos |
| `scripts/b2-url-mapping.json` | B2 URLs (original + thumbnail) for each photo |
| `scripts/import-photos.ts` | Merges above files → PocketBase |
| `scripts/setup-pb.ts` | Creates PocketBase collections |

## What Was Accomplished This Session

### 1. UI Theme Overhaul
- Replaced dark glassmorphism with light Notion-inspired design
- Updated all admin pages and components
- Added Sign in + Admin buttons to landing page

### 2. PocketBase Integration Fixed
- Fixed auto-cancellation error on `/admin` (parallel requests)
- Completed photos collection schema (was missing 5 fields)
- Imported all 1,063 photos with keywords and B2 URLs

### 3. Scripts Created
- `import-photos.ts` - Photo import pipeline
- `fix-photos-schema.ts` - Schema repair utility
- `check-schema.ts` - Schema inspection utility

## Current State

| Component | Status |
|-----------|--------|
| B2 Storage | 1,063 originals + 1,063 thumbnails uploaded |
| PocketBase Schema | Complete (photos, people, reviews, users) |
| Photo Records | 1,063 imported with keywords + URLs |
| Admin Dashboard | Shows correct counts |
| Admin Photos Grid | Displays thumbnails from B2 |
| Admin People | Ready for family member entry |
| Auth | OTP passwordless working |
| Theme | Light Notion-style complete |

## Next Phase: Front-Facing Gallery

When ready to build the public gallery:

1. **Gallery Grid** (`/gallery`) - Infinite scroll, thumbnail grid
2. **Lightbox View** - Full-resolution viewing, navigation
3. **Search** - Keyword search initially, semantic search later
4. **Share Links** - Public links to individual photos
5. **Download** - Full-resolution download option

### Future Enhancements (V2)
- AI assessments (Gemini descriptions)
- Embeddings for semantic search
- Natural language queries ("Christmas at the cabin")

## Infrastructure Summary

| Service | Location | Purpose |
|---------|----------|---------|
| SvelteKit App | vps2 (Docker) | Frontend + SSR |
| PocketBase | vps8 | Backend API + Auth |
| Backblaze B2 | Cloud | Image storage |
| Caddy | vps2 | Reverse proxy + HTTPS |
| Resend | Cloud | Transactional email (OTP) |

## Session Log
- **2026-01-03**: Major milestone - Admin phase complete
  - Theme updated to light Notion style
  - PocketBase schema fixed and populated
  - 1,063 photos imported with metadata
  - Ready for metadata cleanup work
