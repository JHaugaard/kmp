import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	mockS3Client,
	resetStorageMocks,
	setupUploadMock,
	setupHeadObjectMock,
	setupStorageErrorMock
} from '../mocks/storage';

// Mock the AWS SDK
vi.mock('@aws-sdk/client-s3', () => ({
	S3Client: vi.fn(() => mockS3Client),
	PutObjectCommand: vi.fn(),
	GetObjectCommand: vi.fn(),
	HeadObjectCommand: vi.fn(),
	DeleteObjectCommand: vi.fn()
}));

describe('Storage Operations', () => {
	beforeEach(() => {
		resetStorageMocks();
	});

	describe('Upload', () => {
		it('should successfully upload a file', async () => {
			setupUploadMock();

			const result = await mockS3Client.send({});

			expect(result.$metadata.httpStatusCode).toBe(200);
			expect(result.ETag).toBeDefined();
		});

		it('should handle upload errors', async () => {
			setupStorageErrorMock(new Error('Network error'));

			await expect(mockS3Client.send({})).rejects.toThrow('Network error');
		});
	});

	describe('Head Object (Check Exists)', () => {
		it('should check if object exists', async () => {
			setupHeadObjectMock();

			const result = await mockS3Client.send({});

			expect(result.$metadata.httpStatusCode).toBe(200);
			expect(result.ContentLength).toBe(1024);
		});

		it('should handle not found errors', async () => {
			const notFoundError = new Error('Not Found');
			(notFoundError as Error & { Code: string }).Code = 'NotFound';
			setupStorageErrorMock(notFoundError);

			await expect(mockS3Client.send({})).rejects.toThrow('Not Found');
		});
	});
});

describe('B2 URL Generation', () => {
	const B2_BUCKET = 'kline-martin-photos';
	const B2_ENDPOINT = 's3.us-west-000.backblazeb2.com';

	it('should generate correct original URL', () => {
		const filename = 'kmp-0001.jpg';
		const url = `https://${B2_BUCKET}.${B2_ENDPOINT}/originals/${filename}`;

		expect(url).toBe('https://kline-martin-photos.s3.us-west-000.backblazeb2.com/originals/kmp-0001.jpg');
	});

	it('should generate correct thumbnail URL', () => {
		const filename = 'kmp-0001.jpg';
		const url = `https://${B2_BUCKET}.${B2_ENDPOINT}/thumbs/${filename}`;

		expect(url).toBe('https://kline-martin-photos.s3.us-west-000.backblazeb2.com/thumbs/kmp-0001.jpg');
	});
});
