import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const pb = locals.pb;

	const [photosCount, reviewedPhotos, needsReassessment, peopleCount, recentReviews] =
		await Promise.all([
			pb.collection('photos').getList(1, 1).then((r) => r.totalItems),
			pb
				.collection('reviews')
				.getList(1, 1, { filter: 'photo != ""' })
				.then((r) => r.totalItems)
				.catch(() => 0),
			pb
				.collection('photos')
				.getList(1, 1, { filter: 'needs_reassessment = true' })
				.then((r) => r.totalItems)
				.catch(() => 0),
			pb
				.collection('people')
				.getList(1, 1)
				.then((r) => r.totalItems)
				.catch(() => 0),
			pb
				.collection('reviews')
				.getList(1, 5, {
					sort: '-reviewed_at',
					expand: 'reviewer,photo'
				})
				.then((r) => r.items)
				.catch(() => [])
		]);

	return {
		stats: {
			totalPhotos: photosCount,
			reviewedPhotos,
			unreviewedPhotos: photosCount - reviewedPhotos,
			needsReassessment,
			peopleCount
		},
		recentReviews
	};
};
