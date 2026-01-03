import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Person } from '$lib/types/admin';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const role = locals.user.role;
	if (role !== 'admin' && role !== 'reviewer') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const pb = locals.pb;
	const people = await pb.collection('people').getFullList<Person>({
		sort: 'sort_order,name'
	});

	// Format for AI context consumption
	const exportData = people.map((p) => ({
		name: p.name,
		aliases: p.aliases || [],
		surname: p.surname,
		generation: p.generation,
		birth_year_range: p.birth_year_range,
		physical_description: p.physical_description,
		relationships: p.relationships || {},
		often_seen_with: p.often_seen_with || [],
		notes: p.notes
	}));

	return json(exportData);
};
