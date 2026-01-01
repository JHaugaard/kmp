import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // If already logged in, go to gallery
    if (locals.user) {
        throw redirect(303, '/gallery');
    }
};

export const actions: Actions = {
    requestMagicLink: async ({ request, locals }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;

        if (!email) {
            return fail(400, { email, missing: true });
        }

        try {
            await locals.pb.collection('users').requestPasswordlessCode('email', email);
            return { success: true };
        } catch (err) {
            console.error('Magic link request failed:', err);
            return fail(500, { email, error: true });
        }
    }
};
