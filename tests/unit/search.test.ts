import { describe, it, expect } from 'vitest';

// Test the cosine similarity function directly
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

describe('Cosine Similarity', () => {
	it('should return 1 for identical vectors', () => {
		const vec = [1, 2, 3, 4, 5];
		const similarity = cosineSimilarity(vec, vec);
		expect(similarity).toBeCloseTo(1, 5);
	});

	it('should return 0 for orthogonal vectors', () => {
		const vecA = [1, 0, 0];
		const vecB = [0, 1, 0];
		const similarity = cosineSimilarity(vecA, vecB);
		expect(similarity).toBeCloseTo(0, 5);
	});

	it('should return -1 for opposite vectors', () => {
		const vecA = [1, 2, 3];
		const vecB = [-1, -2, -3];
		const similarity = cosineSimilarity(vecA, vecB);
		expect(similarity).toBeCloseTo(-1, 5);
	});

	it('should handle normalized vectors', () => {
		const vecA = [0.6, 0.8, 0]; // unit vector
		const vecB = [0.8, 0.6, 0]; // unit vector
		const similarity = cosineSimilarity(vecA, vecB);
		// cos(angle) = 0.6*0.8 + 0.8*0.6 = 0.96
		expect(similarity).toBeCloseTo(0.96, 5);
	});

	it('should return 0 for null vectors', () => {
		expect(cosineSimilarity(null as unknown as number[], [1, 2, 3])).toBe(0);
		expect(cosineSimilarity([1, 2, 3], null as unknown as number[])).toBe(0);
	});

	it('should return 0 for mismatched lengths', () => {
		const vecA = [1, 2, 3];
		const vecB = [1, 2, 3, 4];
		expect(cosineSimilarity(vecA, vecB)).toBe(0);
	});

	it('should work with embedding-sized vectors', () => {
		// Simulate 768-dimension embeddings
		const vecA = Array.from({ length: 768 }, (_, i) => Math.sin(i * 0.01));
		const vecB = Array.from({ length: 768 }, (_, i) => Math.sin(i * 0.01 + 0.1));

		const similarity = cosineSimilarity(vecA, vecB);
		// Similar vectors should have high similarity
		expect(similarity).toBeGreaterThan(0.9);
	});
});

describe('Search Result Ranking', () => {
	it('should sort results by descending similarity score', () => {
		const results = [
			{ id: '1', score: 0.5 },
			{ id: '2', score: 0.9 },
			{ id: '3', score: 0.7 },
			{ id: '4', score: 0.3 }
		];

		const sorted = results.sort((a, b) => b.score - a.score);

		expect(sorted[0].id).toBe('2');
		expect(sorted[1].id).toBe('3');
		expect(sorted[2].id).toBe('1');
		expect(sorted[3].id).toBe('4');
	});

	it('should limit results to top N', () => {
		const results = Array.from({ length: 100 }, (_, i) => ({
			id: String(i),
			score: Math.random()
		}));

		const topN = results.sort((a, b) => b.score - a.score).slice(0, 20);

		expect(topN).toHaveLength(20);
		expect(topN[0].score).toBeGreaterThanOrEqual(topN[19].score);
	});
});
