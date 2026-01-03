import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/svelte';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
	cleanup();
});

// Mock PocketBase
vi.mock('$lib/pb', () => ({
	pb: {
		collection: vi.fn(() => ({
			getList: vi.fn(),
			getOne: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			authWithPassword: vi.fn()
		})),
		authStore: {
			isValid: false,
			model: null,
			token: '',
			clear: vi.fn()
		}
	}
}));

// Mock environment variables
vi.stubEnv('PUBLIC_POCKETBASE_URL', 'http://localhost:8090');
