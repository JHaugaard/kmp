export interface Photo {
	id: string;
	filename: string;
	keywords: string[] | null;
	assessment: string | null;
	embedding: number[] | null;
	image_url: string | null;
	thumbnail_url: string | null;
	needs_reassessment: boolean;
	created: string;
	updated: string;
}

export interface Person {
	id: string;
	name: string;
	aliases: string[] | null;
	surname: string | null;
	generation: number | null;
	birth_year_range: string | null;
	physical_description: string | null;
	relationships: {
		spouse?: string;
		parents?: string[];
		children?: string[];
		siblings?: string[];
	} | null;
	often_seen_with: string[] | null;
	notes: string | null;
	sort_order: number | null;
	created: string;
	updated: string;
}

export interface Review {
	id: string;
	photo: string;
	reviewer: string;
	reviewed_at: string;
	notes: string | null;
	keywords_changed: boolean;
	assessment_changed: boolean;
	expand?: {
		reviewer?: {
			id: string;
			email: string;
			name?: string;
		};
	};
}

export interface User {
	id: string;
	email: string;
	name?: string;
	role: 'user' | 'reviewer' | 'admin';
	created: string;
	updated: string;
}

export type FilterType = 'all' | 'unreviewed' | 'reviewed' | 'needs_reassessment';
