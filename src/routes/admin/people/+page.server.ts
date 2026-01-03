import type { PageServerLoad, Actions } from './$types';
import type { Person } from '$lib/types/admin';

export const load: PageServerLoad = async ({ locals }) => {
	const pb = locals.pb;

	const people = await pb.collection('people').getFullList<Person>({
		sort: 'sort_order,name'
	});

	return { people };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const pb = locals.pb;
		const formData = await request.formData();

		const data = parsePersonFormData(formData);
		await pb.collection('people').create(data);

		return { success: true };
	},

	update: async ({ request, locals }) => {
		const pb = locals.pb;
		const formData = await request.formData();
		const id = formData.get('id') as string;

		const data = parsePersonFormData(formData);
		await pb.collection('people').update(id, data);

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const pb = locals.pb;
		const formData = await request.formData();
		const id = formData.get('id') as string;

		await pb.collection('people').delete(id);

		return { success: true };
	}
};

function parsePersonFormData(formData: FormData) {
	const aliasesStr = formData.get('aliases') as string;
	const aliases = aliasesStr
		? aliasesStr
				.split(',')
				.map((a) => a.trim())
				.filter(Boolean)
		: null;

	const oftenSeenWithStr = formData.get('often_seen_with') as string;
	const oftenSeenWith = oftenSeenWithStr
		? oftenSeenWithStr
				.split(',')
				.map((a) => a.trim())
				.filter(Boolean)
		: null;

	const generation = formData.get('generation') as string;
	const sortOrder = formData.get('sort_order') as string;

	// Parse relationships
	const spouse = formData.get('spouse') as string;
	const parentsStr = formData.get('parents') as string;
	const childrenStr = formData.get('children') as string;
	const siblingsStr = formData.get('siblings') as string;

	const relationships: Person['relationships'] = {};
	if (spouse) relationships.spouse = spouse;
	if (parentsStr) {
		relationships.parents = parentsStr
			.split(',')
			.map((p) => p.trim())
			.filter(Boolean);
	}
	if (childrenStr) {
		relationships.children = childrenStr
			.split(',')
			.map((c) => c.trim())
			.filter(Boolean);
	}
	if (siblingsStr) {
		relationships.siblings = siblingsStr
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}

	return {
		name: formData.get('name') as string,
		aliases,
		surname: (formData.get('surname') as string) || null,
		generation: generation ? parseInt(generation) : null,
		birth_year_range: (formData.get('birth_year_range') as string) || null,
		physical_description: (formData.get('physical_description') as string) || null,
		relationships: Object.keys(relationships).length > 0 ? relationships : null,
		often_seen_with: oftenSeenWith,
		notes: (formData.get('notes') as string) || null,
		sort_order: sortOrder ? parseInt(sortOrder) : null
	};
}
