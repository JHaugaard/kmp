import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const otpId = url.searchParams.get('otpId');
	const password = url.searchParams.get('password');

	if (!otpId || !password) {
		// Missing params, redirect to login
		redirect(303, '/login');
	}

	try {
		// Authenticate with OTP from email link
		await locals.pb.collection('users').authWithOTP(otpId, password);

		// Success - redirect to gallery
		redirect(303, '/gallery');
	} catch (err) {
		console.error('OTP auth failed:', err);
		// Failed - redirect to login with error
		redirect(303, '/login?error=invalid_link');
	}
};
