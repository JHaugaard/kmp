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
