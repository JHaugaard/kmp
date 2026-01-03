import { config } from 'dotenv';
config({ path: '.env.local' });
import PocketBase from 'pocketbase';

async function setup() {
	const url = process.env.PUBLIC_POCKETBASE_URL;
	const email = process.env.PB_ADMIN_EMAIL;
	const password = process.env.PB_ADMIN_PASSWORD;

	if (!url || !email || !password) {
		console.error('Missing PB credentials in .env');
		process.exit(1);
	}

	console.log(`Connecting to: ${url}`);
	const pb = new PocketBase(url);

	try {
		// PocketBase 0.23+ uses _superusers collection instead of admins
		await pb.collection('_superusers').authWithPassword(email, password);
		console.log('Superuser login successful.\n');

		const collections = await pb.collections.getFullList();
		const getCollection = (name: string) => collections.find((c) => c.name === name);

		// --- Photos Collection ---
		const photosCollection = getCollection('photos');
		if (photosCollection) {
			console.log('Updating "photos" collection with new fields...');
			// PocketBase 0.23+ uses 'fields' instead of 'schema'
			const collectionFields = photosCollection.fields || photosCollection.schema || [];
			const existingFields = collectionFields.map((f: { name: string }) => f.name);

			const newFields = [];
			if (!existingFields.includes('thumbnail_url')) {
				newFields.push({ name: 'thumbnail_url', type: 'url', required: false });
			}
			if (!existingFields.includes('needs_reassessment')) {
				newFields.push({
					name: 'needs_reassessment',
					type: 'bool',
					required: false
				});
			}

			if (newFields.length > 0) {
				await pb.collections.update(photosCollection.id, {
					fields: [...collectionFields, ...newFields]
				});
				console.log(`  Added fields: ${newFields.map((f) => f.name).join(', ')}`);
			} else {
				console.log('  All fields already exist.');
			}
		} else {
			console.log('Creating "photos" collection...');
			await pb.collections.create({
				name: 'photos',
				type: 'base',
				fields: [
					{ name: 'filename', type: 'text', required: true },
					{ name: 'keywords', type: 'json', required: false },
					{ name: 'assessment', type: 'text', required: false },
					{ name: 'embedding', type: 'json', required: false },
					{ name: 'image_url', type: 'url', required: false },
					{ name: 'thumbnail_url', type: 'url', required: false },
					{ name: 'needs_reassessment', type: 'bool', required: false }
				],
				listRule: '',
				viewRule: '',
				createRule: null,
				updateRule: null,
				deleteRule: null
			});
			console.log('  Created.');
		}

		// --- Users Collection (add role field) ---
		const usersCollection = getCollection('users');
		if (usersCollection) {
			// PocketBase 0.23+ uses 'fields' instead of 'schema'
			const collectionFields = usersCollection.fields || usersCollection.schema || [];
			const existingFields = collectionFields.map((f: { name: string }) => f.name);
			if (!existingFields.includes('role')) {
				console.log('\nAdding "role" field to users collection...');
				await pb.collections.update(usersCollection.id, {
					fields: [
						...collectionFields,
						{
							name: 'role',
							type: 'select',
							required: false,
							values: ['user', 'reviewer', 'admin']
						}
					]
				});
				console.log('  Added role field.');
			} else {
				console.log('\nUsers collection already has role field.');
			}
		}

		// --- People Collection ---
		if (!getCollection('people')) {
			console.log('\nCreating "people" collection...');
			await pb.collections.create({
				name: 'people',
				type: 'base',
				fields: [
					{ name: 'name', type: 'text', required: true },
					{ name: 'aliases', type: 'json', required: false },
					{ name: 'surname', type: 'text', required: false },
					{ name: 'generation', type: 'number', required: false },
					{ name: 'birth_year_range', type: 'text', required: false },
					{ name: 'physical_description', type: 'text', required: false },
					{ name: 'relationships', type: 'json', required: false },
					{ name: 'often_seen_with', type: 'json', required: false },
					{ name: 'notes', type: 'text', required: false },
					{ name: 'sort_order', type: 'number', required: false }
				],
				listRule: '@request.auth.id != ""',
				viewRule: '@request.auth.id != ""',
				createRule: '@request.auth.role = "admin"',
				updateRule: '@request.auth.role = "admin"',
				deleteRule: '@request.auth.role = "admin"'
			});
			console.log('  Created.');
		} else {
			console.log('\n"people" collection already exists.');
		}

		// --- Reviews Collection ---
		if (!getCollection('reviews')) {
			console.log('\nCreating "reviews" collection...');

			// Get collection IDs for relations
			const photosId = getCollection('photos')?.id;
			const usersId = getCollection('users')?.id;

			if (!photosId || !usersId) {
				console.error('Cannot create reviews: missing photos or users collection');
				process.exit(1);
			}

			await pb.collections.create({
				name: 'reviews',
				type: 'base',
				fields: [
					{
						name: 'photo',
						type: 'relation',
						required: true,
						collectionId: photosId,
						cascadeDelete: true,
						maxSelect: 1
					},
					{
						name: 'reviewer',
						type: 'relation',
						required: true,
						collectionId: usersId,
						cascadeDelete: false,
						maxSelect: 1
					},
					{ name: 'reviewed_at', type: 'autodate', onCreate: true, onUpdate: true },
					{ name: 'notes', type: 'text', required: false },
					{ name: 'keywords_changed', type: 'bool', required: false },
					{ name: 'assessment_changed', type: 'bool', required: false }
				],
				listRule: '@request.auth.id != ""',
				viewRule: '@request.auth.id != ""',
				createRule: '@request.auth.role = "admin" || @request.auth.role = "reviewer"',
				updateRule: '@request.auth.role = "admin"',
				deleteRule: '@request.auth.role = "admin"'
			});
			console.log('  Created.');
		} else {
			console.log('\n"reviews" collection already exists.');
		}

		console.log('\n--- Setup Complete ---');
	} catch (err: unknown) {
		const error = err as { message?: string; data?: unknown };
		console.error('Setup failed:', error.message);
		if (error.data) {
			console.error('Details:', JSON.stringify(error.data, null, 2));
		}
		process.exit(1);
	}
}

setup();
