import { config } from 'dotenv';
config({ path: '.env.local' });
import PocketBase from 'pocketbase';
import { readFile } from 'fs/promises';

interface UrlMapping {
	filename: string;
	originalUrl: string;
	thumbnailUrl: string;
}

interface PhotoMetadata {
	keywords?: string[];
	format: string;
	fileSize: number;
	dimensions: {
		width: number;
		height: number;
	};
}

async function main() {
	const url = process.env.PUBLIC_POCKETBASE_URL;
	const email = process.env.PB_ADMIN_EMAIL;
	const password = process.env.PB_ADMIN_PASSWORD;

	if (!url || !email || !password) {
		console.error('Missing PB credentials in .env.local');
		console.error('Required: PUBLIC_POCKETBASE_URL, PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD');
		process.exit(1);
	}

	console.log(`Connecting to PocketBase: ${url}`);
	const pb = new PocketBase(url);

	try {
		await pb.collection('_superusers').authWithPassword(email, password);
		console.log('Authenticated as superuser.\n');
	} catch (err) {
		console.error('Failed to authenticate:', err);
		process.exit(1);
	}

	// Load the two JSON files
	console.log('Loading data files...');
	const urlMappingRaw = await readFile('scripts/b2-url-mapping.json', 'utf-8');
	const metadataRaw = await readFile('kmp-metadata.json', 'utf-8');

	const urlMappings: UrlMapping[] = JSON.parse(urlMappingRaw);
	const metadata: Record<string, PhotoMetadata> = JSON.parse(metadataRaw);

	console.log(`  URL mappings: ${urlMappings.length} entries`);
	console.log(`  Metadata: ${Object.keys(metadata).length} entries\n`);

	// Create a map for quick lookup
	const urlMap = new Map<string, UrlMapping>();
	for (const entry of urlMappings) {
		urlMap.set(entry.filename, entry);
	}

	// Check for existing photos to avoid duplicates
	console.log('Checking for existing photos...');
	const existingPhotos = await pb.collection('photos').getFullList({
		fields: 'filename'
	});
	const existingFilenames = new Set(existingPhotos.map((p) => p.filename));
	console.log(`  Found ${existingFilenames.size} existing photos in database.\n`);

	// Import photos
	let created = 0;
	let skipped = 0;
	let errors = 0;

	const filenames = Object.keys(metadata).sort();
	console.log(`Importing ${filenames.length} photos...`);

	for (const filename of filenames) {
		// Skip if already exists
		if (existingFilenames.has(filename)) {
			skipped++;
			continue;
		}

		const urls = urlMap.get(filename);
		const meta = metadata[filename];

		if (!urls) {
			console.warn(`  [WARN] No URL mapping for ${filename}`);
			errors++;
			continue;
		}

		// Clean up keywords - remove escaped quotes
		const keywords = meta.keywords?.map((k) => k.replace(/^"|"$/g, '').replace(/\\"/g, '"')) || [];

		try {
			await pb.collection('photos').create({
				filename,
				keywords,
				image_url: urls.originalUrl,
				thumbnail_url: urls.thumbnailUrl,
				needs_reassessment: false
			});
			created++;

			if (created % 100 === 0) {
				console.log(`  [${created}] Created ${filename}`);
			}
		} catch (err) {
			console.error(`  [ERROR] Failed to create ${filename}:`, err);
			errors++;
		}
	}

	console.log('\n--- Import Complete ---');
	console.log(`Created: ${created}`);
	console.log(`Skipped (already exists): ${skipped}`);
	console.log(`Errors: ${errors}`);
}

main().catch(console.error);
