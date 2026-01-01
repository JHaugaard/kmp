import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import PocketBase from 'pocketbase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuration
const PHOTO_DIR = '/Volumes/dev/kline-martin-photos-top/kline-martin-photos-go';
const METADATA_FILE = './kmp-metadata.json';
const PEOPLE_CONTEXT_FILE = './people-context.json';
const SKIP_EXISTING = false; // Set to false to re-scan everything with new models

async function migrate() {
    const url = process.env.PUBLIC_POCKETBASE_URL;
    const email = process.env.PB_ADMIN_EMAIL;
    const password = process.env.PB_ADMIN_PASSWORD;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!url || !email || !password || !apiKey) {
        console.error('Missing credentials in .env');
        process.exit(1);
    }

    // Initialize Clients
    const pb = new PocketBase(url);
    const genAI = new GoogleGenerativeAI(apiKey);

    // Updated Models requested by user
    const visionModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    try {
        console.log(`Logging into Pocketbase...`);
        await pb.admins.authWithPassword(email, password);
        console.log('Admin login successful.');

        console.log(`Loading metadata...`);
        const metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));

        let peopleContext = "";
        try {
            if (fs.existsSync(PEOPLE_CONTEXT_FILE)) {
                const pc = JSON.parse(fs.readFileSync(PEOPLE_CONTEXT_FILE, 'utf-8'));
                peopleContext = `
                KNOWN PEOPLE & CONTEXT:
                People: ${pc.people.map((p: any) => `${p.name} (${p.description})`).join('; ')}
                Relationships: ${pc.relationships}
                Guidance: ${pc.context}
                `;
                console.log("Loaded people context for assessment.");
            }
        } catch (e) {
            console.warn("Could not load people-context.json, proceeding without specific person context.");
        }

        const filenames = Object.keys(metadata);

        console.log(`Processing total of ${filenames.length} photos...`);

        for (const filename of filenames) {
            const item = metadata[filename];
            const filePath = path.join(PHOTO_DIR, filename);

            if (!fs.existsSync(filePath)) {
                console.warn(`File not found: ${filePath}`);
                continue;
            }

            console.log(`\n--- Processing ${filename} ---`);
            const keywords = item.keywords || [];

            // 0. Check if already exists (RESUME logic)
            const existing = await pb.collection('photos').getFirstListItem(`filename="${filename}"`).catch(() => null);
            if (SKIP_EXISTING && existing && existing.embedding && (existing.embedding as any).length > 0) {
                console.log(`Skipping ${filename} (already indexed).`);
                continue;
            }

            console.log(`Keywords: ${keywords.join(', ')}`);

            // 1. Assessment (Gemini 3 Flash Preview)
            let assessment = existing?.assessment || ""; // Keep existing assessment if we only wanted to re-embed? No, user wants name correction.

            // Re-run assessment always regarding user request for name correction
            try {
                const imgData = fs.readFileSync(filePath).toString('base64');
                const prompt = `This is a family photo from a private archive. 
                Existing keywords: ${keywords.join(', ')}. 
                ${peopleContext}
                Please provide a rich, 2-sentence descriptive caption of what is happening in this photo for a search index. 
                Identify people by name if they match the descriptions or keywords strongly. 
                Focus on people, landmarks, and the overall mood. Be concise but descriptive.`;

                const result = await visionModel.generateContent([
                    prompt,
                    { inlineData: { data: imgData, mimeType: "image/jpeg" } }
                ]);
                assessment = await result.response.text();
                console.log(`Assessment (Gemini 3): ${assessment.trim()}`);
            } catch (err: any) {
                console.error(`Assessment failed for ${filename}:`, err.message);
                if (!existing) continue; // If new and fail, skip. If existing and fail, maybe keep old?
                // For now, if assessment fails, we can't really embed well.
                continue;
            }

            // 2. Embedding (Gemini Embedding 001 - 768 dim)
            let embedding: number[] = [];
            try {
                const embedResult = await embedModel.embedContent({
                    content: { role: 'user', parts: [{ text: assessment }] },
                    outputDimensionality: 768
                } as any);
                embedding = embedResult.embedding.values;
                console.log(`Embedding generated (${embedding.length} dimensions)`);
            } catch (err: any) {
                console.error(`Embedding failed for ${filename}:`, err.message);
                continue;
            }

            // 3. Store in Pocketbase
            try {
                const data = {
                    filename: filename,
                    keywords: keywords,
                    assessment: assessment.trim(),
                    embedding: embedding,
                    image_url: `https://kmp-assets-dev.local/${filename}`
                };

                if (existing) {
                    await pb.collection('photos').update(existing.id, data);
                    console.log(`Updated ${filename} in Pocketbase.`);
                } else {
                    await pb.collection('photos').create(data);
                    console.log(`Created ${filename} in Pocketbase.`);
                }
            } catch (err: any) {
                console.error(`Upload failed for ${filename}:`, err.message);
            }

            // Tiny delay to be nice to APIs
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('\nMigration batch complete!');

    } catch (err: any) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
