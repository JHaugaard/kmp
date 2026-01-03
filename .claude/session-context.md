# Session Context

## Current Focus
KMP admin backend - ready for testing skill

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

## Implementation Complete
- Phase 1-6 code complete (not yet executed)
- Type errors fixed, 0 errors / 24 warnings
- Next: run `/testing` skill, then execute deployment steps

## Next Steps
1. Run `/testing` skill
2. Create B2 bucket `kline-martin-photos`
3. Run `npx tsx scripts/upload-to-b2.ts`
4. Run `npx tsx scripts/setup-pb.ts`
5. Deploy to VPS

## Session Status
Completed: 2026-01-02
No MCP servers to clean up
Tool count: 6 (clean slate)
