import { config } from 'dotenv';
config({ path: '.env.local' });
import PocketBase from 'pocketbase';

async function main() {
	const pb = new PocketBase(process.env.PUBLIC_POCKETBASE_URL);
	await pb.collection('_superusers').authWithPassword(
		process.env.PB_ADMIN_EMAIL!,
		process.env.PB_ADMIN_PASSWORD!
	);

	console.log('Fetching photos collection...');
	const collections = await pb.collections.getFullList();
	const photos = collections.find((c) => c.name === 'photos');

	if (!photos) {
		console.error('Photos collection not found!');
		process.exit(1);
	}

	const existingFields = ((photos as any).fields || []) as Array<{ name: string; type: string }>;
	const existingNames = existingFields.map((f) => f.name);

	console.log('Current fields:', existingNames.join(', '));

	// Define all required fields
	const requiredFields = [
		{ name: 'filename', type: 'text', required: true },
		{ name: 'keywords', type: 'json', required: false },
		{ name: 'assessment', type: 'text', required: false },
		{ name: 'embedding', type: 'json', required: false },
		{ name: 'image_url', type: 'url', required: false },
		{ name: 'thumbnail_url', type: 'url', required: false },
		{ name: 'needs_reassessment', type: 'bool', required: false }
	];

	// Find missing fields
	const fieldsToAdd = requiredFields.filter((f) => !existingNames.includes(f.name));

	if (fieldsToAdd.length === 0) {
		console.log('All fields already exist.');
		return;
	}

	console.log('Adding missing fields:', fieldsToAdd.map((f) => f.name).join(', '));

	// Merge existing with new fields
	const updatedFields = [...existingFields, ...fieldsToAdd];

	await pb.collections.update(photos.id, {
		fields: updatedFields
	});

	console.log('Schema updated successfully!');

	// Verify
	const updated = await pb.collections.getOne(photos.id);
	const newFields = ((updated as any).fields || []) as Array<{ name: string }>;
	console.log('New fields:', newFields.map((f) => f.name).join(', '));
}

main().catch(console.error);
