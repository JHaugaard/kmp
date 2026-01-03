import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(303, '/login');
	}

	const role = locals.user.role;
	if (role !== 'admin' && role !== 'reviewer') {
		redirect(303, '/gallery?error=unauthorized');
	}

	return {
		user: {
			id: locals.user.id,
			email: locals.user.email,
			role: locals.user.role
		}
	};
};
