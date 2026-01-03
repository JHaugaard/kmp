import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// If already logged in, go to gallery
	if (locals.user) {
		redirect(303, '/gallery');
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
			// Request OTP - sends email with login link/code
			// Only works if user exists in the collection (whitelist behavior)
			await locals.pb.collection('users').requestOTP(email);
			return { success: true, email };
		} catch (err) {
			console.error('OTP request failed:', err);
			// Don't reveal if user exists or not
			return { success: true, email };
		}
	},

	verifyOTP: async ({ request, locals, cookies }) => {
		const formData = await request.formData();
		const otpId = formData.get('otpId') as string;
		const password = formData.get('password') as string;

		if (!otpId || !password) {
			return fail(400, { otpError: true, message: 'Missing OTP code' });
		}

		try {
			// Authenticate with OTP
			const authData = await locals.pb.collection('users').authWithOTP(otpId, password);

			// Cookie is set automatically via hooks.server.ts
			redirect(303, '/gallery');
		} catch (err) {
			console.error('OTP verification failed:', err);
			return fail(400, { otpError: true, message: 'Invalid or expired code' });
		}
	}
};
