<script lang="ts">
	import type { Photo, Review } from '$lib/types/admin';

	interface Props {
		photo: Photo;
		reviews: Review[];
		selected?: boolean;
		onclick?: () => void;
	}

	let { photo, reviews = [], selected = false, onclick }: Props = $props();

	const reviewCount = $derived(reviews.filter((r) => r.photo === photo.id).length);
	const lastReview = $derived(
		reviews.filter((r) => r.photo === photo.id).sort((a, b) =>
			new Date(b.reviewed_at).getTime() - new Date(a.reviewed_at).getTime()
		)[0]
	);
	const keywordCount = $derived(photo.keywords?.length || 0);
</script>

<button type="button" class="photo-card" class:selected onclick={onclick}>
	<div class="thumbnail">
		{#if photo.thumbnail_url}
			<img src={photo.thumbnail_url} alt={photo.filename} loading="lazy" />
		{:else if photo.image_url}
			<img src={photo.image_url} alt={photo.filename} loading="lazy" />
		{:else}
			<div class="no-image">No image</div>
		{/if}

		{#if photo.needs_reassessment}
			<span class="badge reassess">Needs Review</span>
		{:else if reviewCount > 0}
			<span class="badge reviewed">Reviewed</span>
		{/if}
	</div>

	<div class="info">
		<span class="filename" title={photo.filename}>{photo.filename}</span>
		<div class="meta">
			{#if keywordCount > 0}
				<span class="keywords">{keywordCount} keywords</span>
			{/if}
			{#if lastReview}
				<span class="reviewer" title={lastReview.expand?.reviewer?.email}>
					{lastReview.expand?.reviewer?.email?.split('@')[0] || 'reviewed'}
				</span>
			{/if}
		</div>
	</div>
</button>

<style>
	.photo-card {
		background: var(--bg-primary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		overflow: hidden;
		cursor: pointer;
		transition: border-color 0.1s ease, box-shadow 0.1s ease;
		text-align: left;
		padding: 0;
		width: 100%;
	}

	.photo-card:hover {
		border-color: var(--accent-primary);
	}

	.photo-card.selected {
		border-color: var(--accent-primary);
		box-shadow: 0 0 0 2px rgba(35, 131, 226, 0.2);
	}

	.thumbnail {
		position: relative;
		aspect-ratio: 1;
		background: var(--bg-secondary);
	}

	.thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.no-image {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--text-tertiary);
		font-size: 12px;
	}

	.badge {
		position: absolute;
		top: var(--space-sm);
		right: var(--space-sm);
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
	}

	.badge.reviewed {
		background: #dbeddb;
		color: #1e7b1e;
	}

	.badge.reassess {
		background: #fdecc8;
		color: #9a6700;
	}

	.info {
		padding: var(--space-sm);
	}

	.filename {
		display: block;
		font-size: 12px;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--text-primary);
	}

	.meta {
		display: flex;
		gap: var(--space-xs);
		margin-top: var(--space-xs);
		font-size: 10px;
		color: var(--text-secondary);
	}

	.keywords {
		background: var(--bg-secondary);
		padding: 1px 4px;
		border-radius: var(--radius-sm);
	}

	.reviewer {
		background: #e8f4fd;
		color: var(--accent-primary);
		padding: 1px 4px;
		border-radius: var(--radius-sm);
	}
</style>
