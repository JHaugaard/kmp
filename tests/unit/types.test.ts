import { describe, it, expect } from 'vitest';
import type { Photo, Person, Review, User, FilterType } from '$lib/types/admin';

describe('Admin Types', () => {
	describe('Photo type', () => {
		it('should accept valid photo object', () => {
			const photo: Photo = {
				id: 'abc123',
				filename: 'kmp-0001.jpg',
				keywords: ['family', 'outdoor'],
				assessment: 'Family gathering in backyard',
				embedding: [0.1, 0.2, 0.3],
				image_url: 'https://bucket.b2.com/originals/kmp-0001.jpg',
				thumbnail_url: 'https://bucket.b2.com/thumbs/kmp-0001.jpg',
				needs_reassessment: false,
				created: '2024-01-01T00:00:00Z',
				updated: '2024-01-01T00:00:00Z'
			};

			expect(photo.id).toBe('abc123');
			expect(photo.keywords).toHaveLength(2);
			expect(photo.needs_reassessment).toBe(false);
		});

		it('should accept photo with null optional fields', () => {
			const photo: Photo = {
				id: 'abc123',
				filename: 'kmp-0001.jpg',
				keywords: null,
				assessment: null,
				embedding: null,
				image_url: null,
				thumbnail_url: null,
				needs_reassessment: false,
				created: '2024-01-01T00:00:00Z',
				updated: '2024-01-01T00:00:00Z'
			};

			expect(photo.keywords).toBeNull();
			expect(photo.assessment).toBeNull();
		});
	});

	describe('Person type', () => {
		it('should accept valid person with relationships', () => {
			const person: Person = {
				id: 'person123',
				name: 'John Doe',
				aliases: ['Johnny', 'JD'],
				surname: 'Doe',
				generation: 2,
				birth_year_range: '1950-1960',
				physical_description: 'Tall with dark hair',
				relationships: {
					spouse: 'Jane Doe',
					parents: ['Robert Doe', 'Mary Doe'],
					children: ['Jack Doe', 'Jill Doe'],
					siblings: ['Jim Doe']
				},
				often_seen_with: ['Jane Doe', 'Jack Doe'],
				notes: 'Family patriarch',
				sort_order: 1,
				created: '2024-01-01T00:00:00Z',
				updated: '2024-01-01T00:00:00Z'
			};

			expect(person.name).toBe('John Doe');
			expect(person.relationships?.children).toHaveLength(2);
		});
	});

	describe('FilterType', () => {
		it('should accept valid filter values', () => {
			const filters: FilterType[] = ['all', 'unreviewed', 'reviewed', 'needs_reassessment'];

			expect(filters).toContain('all');
			expect(filters).toContain('unreviewed');
			expect(filters).toHaveLength(4);
		});
	});
});
