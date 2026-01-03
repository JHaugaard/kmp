# Session Context

## Current Focus
Tidying / housekeeping

## MCP Servers Added This Session
| Server | Tools | Status |
|--------|-------|--------|
| (none) | -     | -      |

## Key Decisions
- Naming: `kline-martin-photos` for site, B2 bucket, all external-facing names
- PocketBase 0.20.x: use `.model` not `.record`, `requestVerification` for email flow
- Backblaze B2 for image storage (S3-compatible)
- Homelab VPS (vps2.haugaard.dev) for hosting
- Multiple reviewer tracking (who + when)

## Implementation Status
- Phase 1-6 code complete (not yet executed)
- Type errors fixed, 0 errors / 24 warnings

## Pending Steps
1. Run `/testing` skill
2. Create B2 bucket `kline-martin-photos`
3. Run `npx tsx scripts/upload-to-b2.ts`
4. Run `npx tsx scripts/setup-pb.ts`
5. Deploy to VPS

## Pre-Deployment Reminder
- Dockerfile: change runner stage to use `npm ci --omit=dev` instead of copying all node_modules (smaller image)
- Use `docker compose --env-file .env.local up` to load env vars

## Session Status
Completed: 2026-01-02
No MCP servers to clean up
Tool count: 6 (clean slate)

## Notes
- Multi-model review completed (Gemini 2.5 Pro + GPT-4o): no dead code found, 6 fixes applied
