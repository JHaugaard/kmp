import { config } from 'dotenv';
config({ path: '.env.local' });
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';

const SOURCE_DIR = '/Volumes/dev/kline-martin-photos-top/kline-martin-photos-go';
const THUMB_WIDTH = 400;
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

interface UploadResult {
	filename: string;
	originalUrl: string;
	thumbnailUrl: string;
}

async function main() {
	const bucket = process.env.B2_BUCKET;
	const endpoint = process.env.B2_ENDPOINT;
	const accessKeyId = process.env.B2_ACCESS_KEY_ID;
	const secretAccessKey = process.env.B2_SECRET_ACCESS_KEY;

	if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
		console.error('Missing B2 credentials. Required env vars:');
		console.error('  B2_BUCKET, B2_ENDPOINT, B2_ACCESS_KEY_ID, B2_SECRET_ACCESS_KEY');
		process.exit(1);
	}

	const s3 = new S3Client({
		endpoint: `https://${endpoint}`,
		region: 'auto',
		credentials: {
			accessKeyId,
			secretAccessKey
		},
		// B2 doesn't support AWS SDK v3 checksums
		requestChecksumCalculation: 'WHEN_REQUIRED',
		responseChecksumValidation: 'WHEN_REQUIRED'
	});

	console.log(`Reading images from: ${SOURCE_DIR}`);
	const files = await readdir(SOURCE_DIR);
	const imageFiles = files.filter((f) =>
		SUPPORTED_EXTENSIONS.includes(extname(f).toLowerCase())
	);

	console.log(`Found ${imageFiles.length} images to upload`);

	const results: UploadResult[] = [];
	let uploaded = 0;
	let skipped = 0;

	for (const filename of imageFiles) {
		const originalKey = `originals/${filename}`;
		const thumbKey = `thumbs/${filename}`;

		// Check if already uploaded
		try {
			await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: originalKey }));
			console.log(`[SKIP] ${filename} already exists`);
			skipped++;

			// Still add to results for URL mapping
			results.push({
				filename,
				originalUrl: `https://${bucket}.${endpoint}/${originalKey}`,
				thumbnailUrl: `https://${bucket}.${endpoint}/${thumbKey}`
			});
			continue;
		} catch {
			// Object doesn't exist, proceed with upload
		}

		try {
			const filePath = join(SOURCE_DIR, filename);
			const imageBuffer = await readFile(filePath);

			// Generate thumbnail
			const thumbBuffer = await sharp(imageBuffer)
				.resize(THUMB_WIDTH, null, { withoutEnlargement: true })
				.jpeg({ quality: 80 })
				.toBuffer();

			// Upload original
			await s3.send(
				new PutObjectCommand({
					Bucket: bucket,
					Key: originalKey,
					Body: imageBuffer,
					ContentLength: imageBuffer.length,
					ContentType: getContentType(filename)
				})
			);

			// Upload thumbnail
			await s3.send(
				new PutObjectCommand({
					Bucket: bucket,
					Key: thumbKey,
					Body: thumbBuffer,
					ContentLength: thumbBuffer.length,
					ContentType: 'image/jpeg'
				})
			);

			const originalUrl = `https://${bucket}.${endpoint}/${originalKey}`;
			const thumbnailUrl = `https://${bucket}.${endpoint}/${thumbKey}`;

			results.push({ filename, originalUrl, thumbnailUrl });
			uploaded++;

			console.log(`[${uploaded}/${imageFiles.length}] Uploaded ${filename}`);
		} catch (err) {
			console.error(`[ERROR] Failed to upload ${filename}:`, err);
		}
	}

	// Write URL mapping for PocketBase update
	const outputPath = 'scripts/b2-url-mapping.json';
	await writeFile(outputPath, JSON.stringify(results, null, 2));

	console.log('\n--- Summary ---');
	console.log(`Uploaded: ${uploaded}`);
	console.log(`Skipped (already exists): ${skipped}`);
	console.log(`URL mapping saved to: ${outputPath}`);
}

function getContentType(filename: string): string {
	const ext = extname(filename).toLowerCase();
	const types: Record<string, string> = {
		'.jpg': 'image/jpeg',
		'.jpeg': 'image/jpeg',
		'.png': 'image/png',
		'.gif': 'image/gif',
		'.webp': 'image/webp'
	};
	return types[ext] || 'application/octet-stream';
}

main().catch(console.error);
