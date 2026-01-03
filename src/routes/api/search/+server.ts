import { json } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

// Lazy initialization for runtime env access
let embedModel: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

function getEmbedModel() {
    if (!embedModel) {
        if (!env.GOOGLE_API_KEY) {
            throw new Error('GOOGLE_API_KEY not configured');
        }
        const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
        embedModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    }
    return embedModel;
}

export const POST: RequestHandler = async ({ request, locals }) => {
    const { query } = await request.json();

    if (!query) {
        return json({ error: 'Missing query' }, { status: 400 });
    }

    try {
        // 1. Embed the search query
        const result = await getEmbedModel().embedContent({
            content: { role: 'user', parts: [{ text: query }] },
            outputDimensionality: 768
        } as any);
        const queryEmbedding = result.embedding.values;

        // 2. Fetch all photo metadata (filename, assessment, keywords, embedding)
        // Note: In a larger app, we might paginate or use a specialized index
        // For 1,100 photos, fetching all is very fast.
        const photos = await locals.pb.collection('photos').getFullList({
            fields: 'id,filename,keywords,assessment,embedding,image_url'
        });

        // 3. Perform Cosine Similarity
        const scoredPhotos = photos.map(photo => {
            const similarity = cosineSimilarity(queryEmbedding, photo.embedding);
            return {
                ...photo,
                score: similarity,
                embedding: undefined // Don't send the vector back to frontend
            };
        });

        // 4. Sort and limit
        const results = scoredPhotos
            .sort((a, b) => b.score - a.score)
            .slice(0, 20); // Top 20 results

        return json({ results });

    } catch (err: any) {
        console.error('Search failed:', err);
        return json({ error: 'Search failed' }, { status: 500 });
    }
};

function cosineSimilarity(vecA: number[], vecB: number[]) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
