# Test Strategy

**Project:** KMP (Kline-Martin Photos)
**Created:** 2026-01-03
**Framework:** Vitest + Testing Library

## Testing Philosophy

This project follows a testing pyramid approach:
- Many unit tests (fast, isolated)
- Fewer integration tests (verify component interaction)
- E2E tests deferred until core functionality is stable

## Test Types

### Unit Tests
**Location:** `tests/unit/`
**Purpose:** Test individual functions and components in isolation
**Run:** `npm test` or `npm run test:run`

**What to test:**
- Type definitions and interfaces
- Utility functions (cosine similarity, URL generation)
- Storage operations (mocked)
- Component rendering (when components are added)

### Integration Tests
**Location:** `tests/integration/`
**Purpose:** Test API endpoints and PocketBase interactions
**Run:** `npm test tests/integration`

**What to test:**
- Search API endpoint
- Photo CRUD operations
- Authentication flows

## Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run all tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ui` | Open visual test UI |

## Coverage Goals

**Current:** Scaffolding only
**Target:** 70-80% for critical paths

Focus coverage on:
- Search/embedding logic
- Photo metadata operations
- Authentication flows
- Storage URL generation

## Storage Testing

**Storage Type:** Backblaze B2 (S3-Compatible)

### Unit Tests (Mocked)
Location: `tests/unit/storage.test.ts`
Purpose: Test storage logic without external dependencies

- Mock S3 client responses
- Test upload/download logic
- Test error handling
- Test URL generation

### Mocking Approach
```typescript
// tests/mocks/storage.ts provides:
- mockS3Client
- setupUploadMock()
- setupHeadObjectMock()
- setupStorageErrorMock()
```

### B2 URL Format
- Originals: `https://kline-martin-photos.s3.us-west-000.backblazeb2.com/originals/{filename}`
- Thumbnails: `https://kline-martin-photos.s3.us-west-000.backblazeb2.com/thumbs/{filename}`

## Writing New Tests

### Naming Convention
- Test files: `*.test.ts`
- Test descriptions: "should [expected behavior] when [condition]"

### Test Structure
```typescript
describe('ComponentName', () => {
  describe('method or behavior', () => {
    it('should do something when condition', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

### Best Practices
1. One assertion per test (when practical)
2. Test behavior, not implementation
3. Use descriptive test names
4. Keep tests independent
5. Mock external dependencies (PocketBase, B2, Gemini)

## Mocking Strategy

### PocketBase
Mocked globally in `tests/setup.ts`:
```typescript
vi.mock('$lib/pb', () => ({
  pb: {
    collection: vi.fn(),
    authStore: { ... }
  }
}))
```

### External APIs
- **Gemini/Google AI:** Mock embedding responses for search tests
- **B2 Storage:** Mock S3 client for upload/download tests

## CI Integration

Tests should run on:
- Every push to `main` branch
- Every pull request

Add to CI workflow:
```yaml
- name: Run tests
  run: npm run test:run
```

## Resources

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Svelte Testing Library](https://testing-library.com/docs/svelte-testing-library/intro/)
