<script lang="ts">
	interface Props {
		data: {
			stats: {
				totalPhotos: number;
				reviewedPhotos: number;
				unreviewedPhotos: number;
				needsReassessment: number;
				peopleCount: number;
			};
			recentReviews: Array<{
				id: string;
				reviewed_at: string;
				expand?: {
					reviewer?: { email: string };
					photo?: { filename: string };
				};
			}>;
		};
	}

	let { data }: Props = $props();

	const stats = [
		{ label: 'Total Photos', value: data.stats.totalPhotos, href: '/admin/photos' },
		{
			label: 'Reviewed',
			value: data.stats.reviewedPhotos,
			href: '/admin/photos?filter=reviewed'
		},
		{
			label: 'Unreviewed',
			value: data.stats.unreviewedPhotos,
			href: '/admin/photos?filter=unreviewed'
		},
		{
			label: 'Needs Reassessment',
			value: data.stats.needsReassessment,
			href: '/admin/photos?filter=needs_reassessment'
		},
		{ label: 'People', value: data.stats.peopleCount, href: '/admin/people' }
	];

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="dashboard">
	<h1>Dashboard</h1>

	<div class="stats-grid">
		{#each stats as stat}
			<a href={stat.href} class="stat-card glass-card hover-lift">
				<span class="stat-value">{stat.value}</span>
				<span class="stat-label">{stat.label}</span>
			</a>
		{/each}
	</div>

	<section class="recent-activity">
		<h2>Recent Reviews</h2>
		{#if data.recentReviews.length === 0}
			<p class="empty-state">No reviews yet</p>
		{:else}
			<ul class="review-list">
				{#each data.recentReviews as review}
					<li class="review-item glass-card">
						<span class="review-photo">{review.expand?.photo?.filename || 'Unknown'}</span>
						<span class="review-meta">
							by {review.expand?.reviewer?.email || 'Unknown'}
							<time>{formatDate(review.reviewed_at)}</time>
						</span>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<style>
	.dashboard h1 {
		margin: 0 0 2rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1rem;
		margin-bottom: 3rem;
	}

	.stat-card {
		padding: 1.5rem;
		text-decoration: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.stat-value {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--accent-primary);
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.recent-activity h2 {
		margin: 0 0 1rem;
		font-size: 1.25rem;
	}

	.empty-state {
		color: var(--text-secondary);
		font-style: italic;
	}

	.review-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.review-item {
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.review-photo {
		font-weight: 500;
	}

	.review-meta {
		font-size: 0.875rem;
		color: var(--text-secondary);
		display: flex;
		gap: 0.5rem;
	}

	.review-meta time {
		color: var(--text-secondary);
	}
</style>
