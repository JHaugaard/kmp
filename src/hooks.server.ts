import { pb } from '$lib/pb';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // 1. Load auth state from cookie
    pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

    try {
        // 2. Refresh auth if valid
        if (pb.authStore.isValid) {
            await pb.collection('users').authRefresh();
        }
    } catch (_) {
        // 3. Clear store if refresh fails
        pb.authStore.clear();
    }

    // 4. Set locals for use in load functions and actions
    event.locals.pb = pb;
    event.locals.user = pb.authStore.model;

    const response = await resolve(event);

    // 5. Update cookie for the client
    response.headers.append('set-cookie', pb.authStore.exportToCookie({ httpOnly: true }));

    return response;
};
