import { vi } from 'vitest';

// Mock for S3-compatible storage (Backblaze B2)
export const mockS3Client = {
	send: vi.fn()
};

export const mockUploadResponse = {
	$metadata: { httpStatusCode: 200 },
	ETag: '"mock-etag-12345"'
};

export const mockGetObjectResponse = {
	$metadata: { httpStatusCode: 200 },
	Body: {
		transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
		transformToString: vi.fn().mockResolvedValue('file content')
	},
	ContentType: 'image/jpeg',
	ContentLength: 1024
};

export const mockHeadObjectResponse = {
	$metadata: { httpStatusCode: 200 },
	ContentLength: 1024,
	ContentType: 'image/jpeg'
};

// Reset mocks between tests
export function resetStorageMocks() {
	mockS3Client.send.mockReset();
}

// Setup common mock responses
export function setupUploadMock() {
	mockS3Client.send.mockResolvedValue(mockUploadResponse);
}

export function setupGetObjectMock() {
	mockS3Client.send.mockResolvedValue(mockGetObjectResponse);
}

export function setupHeadObjectMock() {
	mockS3Client.send.mockResolvedValue(mockHeadObjectResponse);
}

export function setupStorageErrorMock(error: Error) {
	mockS3Client.send.mockRejectedValue(error);
}
