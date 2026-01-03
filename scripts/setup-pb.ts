import 'dotenv/config';
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
		await pb.admins.authWithPassword(email, password);
		console.log('Admin login successful.\n');

		const collections = await pb.collections.getFullList();
		const getCollection = (name: string) => collections.find((c) => c.name === name);

		// --- Photos Collection ---
		const photosCollection = getCollection('photos');
		if (photosCollection) {
			console.log('Updating "photos" collection with new fields...');
			const existingFields = photosCollection.schema.map((f: { name: string }) => f.name);

			const newFields = [];
			if (!existingFields.includes('thumbnail_url')) {
				newFields.push({ name: 'thumbnail_url', type: 'url', required: false });
			}
			if (!existingFields.includes('needs_reassessment')) {
				newFields.push({
					name: 'needs_reassessment',
					type: 'bool',
					required: false,
					options: { default: false }
				});
			}

			if (newFields.length > 0) {
				await pb.collections.update(photosCollection.id, {
					schema: [...photosCollection.schema, ...newFields]
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
				schema: [
					{ name: 'filename', type: 'text', required: true },
					{ name: 'keywords', type: 'json', required: false, options: { maxSize: 1024 * 1024 } },
					{ name: 'assessment', type: 'text', required: false },
					{
						name: 'embedding',
						type: 'json',
						required: false,
						options: { maxSize: 2 * 1024 * 1024 }
					},
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
			const existingFields = usersCollection.schema.map((f: { name: string }) => f.name);
			if (!existingFields.includes('role')) {
				console.log('\nAdding "role" field to users collection...');
				await pb.collections.update(usersCollection.id, {
					schema: [
						...usersCollection.schema,
						{
							name: 'role',
							type: 'select',
							required: false,
							options: {
								values: ['user', 'reviewer', 'admin']
							}
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
				schema: [
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
				schema: [
					{
						name: 'photo',
						type: 'relation',
						required: true,
						options: {
							collectionId: photosId,
							cascadeDelete: true,
							maxSelect: 1
						}
					},
					{
						name: 'reviewer',
						type: 'relation',
						required: true,
						options: {
							collectionId: usersId,
							cascadeDelete: false,
							maxSelect: 1
						}
					},
					{ name: 'reviewed_at', type: 'autodate', options: { onCreate: true, onUpdate: true } },
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
