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
	<header class="page-header">
		<h1>Dashboard</h1>
		<a href="/" class="back-link">Back to home</a>
	</header>

	<div class="stats-grid">
		{#each stats as stat}
			<a href={stat.href} class="stat-card card">
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
					<li class="review-item card">
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
	.dashboard {
		max-width: 1000px;
		margin: 0 auto;
		padding: var(--space-lg);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-lg);
	}

	.back-link {
		font-size: 14px;
		color: var(--text-secondary);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: var(--space-md);
		margin-bottom: var(--space-xl);
	}

	.stat-card {
		text-decoration: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		transition: background-color 0.1s ease;
	}

	.stat-card:hover {
		background-color: var(--bg-secondary);
		text-decoration: none;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.stat-label {
		font-size: 13px;
		color: var(--text-secondary);
	}

	.recent-activity h2 {
		margin-bottom: var(--space-md);
	}

	.empty-state {
		color: var(--text-tertiary);
	}

	.review-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.review-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.review-photo {
		font-weight: 500;
	}

	.review-meta {
		font-size: 13px;
		color: var(--text-secondary);
		display: flex;
		gap: var(--space-sm);
	}
</style>
