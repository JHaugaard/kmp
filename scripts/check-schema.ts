import { config } from 'dotenv';
config({ path: '.env.local' });
import PocketBase from 'pocketbase';

async function main() {
	const pb = new PocketBase(process.env.PUBLIC_POCKETBASE_URL);
	await pb.collection('_superusers').authWithPassword(
		process.env.PB_ADMIN_EMAIL!,
		process.env.PB_ADMIN_PASSWORD!
	);

	const collections = await pb.collections.getFullList();
	const photos = collections.find((c) => c.name === 'photos');

	if (photos) {
		console.log('Photos collection fields:');
		const fields = (photos as any).fields || (photos as any).schema || [];
		for (const f of fields) {
			console.log(`  - ${f.name} (${f.type})${f.required ? ' *required' : ''}`);
		}
	} else {
		console.log('Photos collection not found');
	}
}

main().catch(console.error);
