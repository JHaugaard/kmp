# Session Context

## Current Focus
Deployed and live at https://kline-martin-photos.com

## MCP Servers Added This Session
| Server | Tools | Status |
|--------|-------|--------|
| (none) | -     | -      |

## Key Decisions
- Naming: `kline-martin-photos` for site, B2 bucket, all external-facing names
- PocketBase 0.23+: use `_superusers` collection, `fields` not `schema`
- Backblaze B2 for image storage (S3-compatible)
- Deployment target: vps2 (srv993275.hstgr.cloud)
- OTP-based passwordless auth for family whitelist

## Implementation Status
- B2 uploads complete: 1063 originals + 1063 thumbnails
- PocketBase collections created: photos, people, reviews, user roles
- Testing infrastructure: Vitest configured, 19 tests passing
- **Deployed to vps2**: Docker container `kmp-app` on `jhh-net`
- **Auth system**: OTP passwordless login via PocketBase

## Deployment Details
- URL: https://kline-martin-photos.com
- Host: vps2 (srv993275.hstgr.cloud / 31.97.131.163)
- Backend: PocketBase on vps8 (pocketbase.haugaard.dev)
- Reverse proxy: Caddy with automatic HTTPS
- SMTP: Resend (noreply@haugaard.dev)

## Runbook
```bash
# Deploy
ssh vps2 'cd ~/vps-setup/apps/kmp && git pull && docker compose up -d --build'

# Logs
ssh vps2 'docker logs kmp-app --tail=100'

# Restart
ssh vps2 'cd ~/vps-setup/apps/kmp && docker compose restart'
```

## Session Status
Started: 2026-01-03
Focus: App refinement
No MCP servers
Tool count: 6

## Notes
- Switched from `$env/static/*` to `$env/dynamic/*` for Docker build compatibility
- OTP email template configured in PocketBase: Collections → users → Options
- SMTP requires TLS (not StartTLS) for port 465
