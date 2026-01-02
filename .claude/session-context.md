# Session Context

## Current Focus
KMP family photo archive - semantic search and metadata

## MCP Servers Added This Session
| Server | Tools | Status |
|--------|-------|--------|
| (none) | -     | -      |

## Key Decisions
- Use Gemini 3 Flash for image assessment
- Use gemini-embedding-001 @ 3072 dimensions for embeddings
- Keep JSON vector storage in PocketBase (sufficient for 1,062 images)
- Build people-context.json from worksheet to help AI identify family members

## Notes
- Session started: 2026-01-01
- No MCP servers (Docker not running)
- Created people-worksheet.md for human-in-the-loop metadata gathering

## Session Status
Completed: 2026-01-01
Servers cleaned: none needed
Next: Complete worksheet with Trish, then build people-context.json
