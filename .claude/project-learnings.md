# Project Learnings

Persistent knowledge captured from sessions. This file accumulates useful discoveries, quirks, and decisions that should be remembered across sessions.

<!-- Entries added by /session-end -->

## 2026-01-03

### AWS SDK v3 + Backblaze B2

Add checksum config to S3Client to avoid `IncompleteBody` errors:

```typescript
const s3 = new S3Client({
  endpoint: `https://${endpoint}`,
  region: 'auto',
  credentials: { accessKeyId, secretAccessKey },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED'
});
```

### B2 Bucket Location

Bucket `kline-martin-photos` is in `us-west-000`. Use `region: 'auto'` in S3Client config (not hardcoded region).

### SvelteKit + Docker: Use Dynamic Env

For Docker builds, use `$env/dynamic/*` instead of `$env/static/*`:

```typescript
// Won't work - requires env at build time
import { GOOGLE_API_KEY } from '$env/static/private';

// Works - reads env at runtime
import { env } from '$env/dynamic/private';
// Then access: env.GOOGLE_API_KEY
```

For public vars: `$env/dynamic/public` instead of `$env/static/public`.

### PocketBase OTP Auth

For passwordless login with whitelist behavior:

1. Enable OTP in Collection → Options → OTP toggle
2. Configure email template with link: `https://domain.com/auth/otp?otpId={OTP_ID}&password={OTP}`
3. Use `requestOTP(email)` - fails silently if user doesn't exist (security)
4. Handle callback with `authWithOTP(otpId, password)`

### SMTP with Resend

- Port 465 requires "TLS" encryption (not "Auto/StartTLS")
- Sender must be from verified domain (e.g., `noreply@haugaard.dev`)
