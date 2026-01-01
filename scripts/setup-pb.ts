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

    // Test with plain fetch first to debug 404
    const testUrl = `${url}/api/admins/auth-with-password`;
    console.log(`Testing plain fetch to: ${testUrl}`);
    const res = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password: password })
    });

    console.log(`Fetch status: ${res.status}`);
    if (res.status !== 200) {
        const body = await res.text();
        console.log(`Fetch body: ${body}`);
    }

    const pb = new PocketBase(url);

    try {
        console.log(`Logging into ${url} via SDK...`);
        await pb.admins.authWithPassword(email, password);
        console.log('Admin login successful.');

        const collections = await pb.collections.getFullList();
        const exists = collections.find(c => c.name === 'photos');

        if (exists) {
            console.log('Collection "photos" already exists.');
        } else {
            console.log('Creating collection "photos"...');
            await pb.collections.create({
                name: 'photos',
                type: 'base',
                schema: [
                    {
                        name: 'filename',
                        type: 'text',
                        required: true,
                    },
                    {
                        name: 'keywords',
                        type: 'json',
                        required: false,
                        options: { maxSize: 1024 * 1024 }
                    },
                    {
                        name: 'assessment',
                        type: 'text',
                        required: false
                    },
                    {
                        name: 'embedding',
                        type: 'json',
                        required: false,
                        options: { maxSize: 2 * 1024 * 1024 }
                    },
                    {
                        name: 'image_url',
                        type: 'url',
                        required: false
                    }
                ],
                listRule: '',
                viewRule: '',
                createRule: null,
                updateRule: null,
                deleteRule: null
            });
            console.log('Collection "photos" created successfully.');
        }
    } catch (err: any) {
        console.error('Setup failed:', err.message);
        if (err.data) {
            console.error('Details:', JSON.stringify(err.data, null, 2));
        }
        process.exit(1);
    }
}

setup();
