import type { PageServerLoad, Actions } from './$types';
import type { Photo, Review } from '$lib/types/admin';

const PAGE_SIZE = 50;

export const load: PageServerLoad = async ({ locals, url }) => {
	const pb = locals.pb;
	const page = parseInt(url.searchParams.get('page') || '1');
	const filter = url.searchParams.get('filter') || 'all';

	let filterQuery = '';
	if (filter === 'unreviewed') {
		// Get IDs of all reviewed photos, then exclude them
		const reviewedPhotos = await pb.collection('reviews').getFullList({
			fields: 'photo'
		});
		const reviewedIds = [...new Set(reviewedPhotos.map((r) => r.photo))];
		if (reviewedIds.length > 0) {
			filterQuery = reviewedIds.map((id) => `id != "${id}"`).join(' && ');
		}
	} else if (filter === 'reviewed') {
		// Get IDs of reviewed photos, then include only them
		const reviewedPhotos = await pb.collection('reviews').getFullList({
			fields: 'photo'
		});
		const reviewedIds = [...new Set(reviewedPhotos.map((r) => r.photo))];
		if (reviewedIds.length > 0) {
			filterQuery = reviewedIds.map((id) => `id = "${id}"`).join(' || ');
		} else {
			// No reviews exist, return empty result
			filterQuery = 'id = ""';
		}
	} else if (filter === 'needs_reassessment') {
		filterQuery = 'needs_reassessment = true';
	}

	const photos = await pb.collection('photos').getList<Photo>(page, PAGE_SIZE, {
		sort: 'filename',
		filter: filterQuery || undefined
	});

	// Get all reviews for the current page of photos
	const photoIds = photos.items.map((p) => p.id);
	let reviews: Review[] = [];
	if (photoIds.length > 0) {
		const reviewFilter = photoIds.map((id) => `photo = "${id}"`).join(' || ');
		const reviewsResult = await pb.collection('reviews').getFullList<Review>({
			filter: reviewFilter,
			expand: 'reviewer'
		});
		reviews = reviewsResult;
	}

	// Get all unique keywords for autocomplete
	const allPhotos = await pb.collection('photos').getFullList<Photo>({
		fields: 'keywords'
	});
	const keywordSet = new Set<string>();
	for (const photo of allPhotos) {
		if (photo.keywords) {
			for (const kw of photo.keywords) {
				keywordSet.add(kw);
			}
		}
	}

	return {
		photos: photos.items,
		totalPages: photos.totalPages,
		currentPage: page,
		totalItems: photos.totalItems,
		filter,
		reviews,
		allKeywords: Array.from(keywordSet).sort()
	};
};

export const actions: Actions = {
	updatePhoto: async ({ request, locals }) => {
		const pb = locals.pb;
		const formData = await request.formData();

		const photoId = formData.get('photoId') as string;
		const keywords = formData.get('keywords') as string;
		const assessment = formData.get('assessment') as string;
		const needsReassessment = formData.get('needsReassessment') === 'true';
		const markReviewed = formData.get('markReviewed') === 'true';

		const keywordsArray = keywords
			? keywords
					.split(',')
					.map((k) => k.trim())
					.filter(Boolean)
			: [];

		// Get original photo to check for changes
		const original = await pb.collection('photos').getOne<Photo>(photoId);
		const keywordsChanged =
			JSON.stringify(original.keywords?.sort()) !== JSON.stringify(keywordsArray.sort());
		const assessmentChanged = original.assessment !== assessment;

		// Update photo
		await pb.collection('photos').update(photoId, {
			keywords: keywordsArray,
			assessment,
			needs_reassessment: needsReassessment
		});

		// Create review record if marked as reviewed
		if (markReviewed && locals.user) {
			await pb.collection('reviews').create({
				photo: photoId,
				reviewer: locals.user.id,
				notes: '',
				keywords_changed: keywordsChanged,
				assessment_changed: assessmentChanged
			});
		}

		return { success: true };
	}
};
