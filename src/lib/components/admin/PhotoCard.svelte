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
		background: var(--glass-bg);
		border: 2px solid transparent;
		border-radius: 12px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
		padding: 0;
		width: 100%;
	}

	.photo-card:hover {
		border-color: var(--accent-primary);
		transform: translateY(-2px);
	}

	.photo-card.selected {
		border-color: var(--accent-primary);
		box-shadow: 0 0 0 2px hsla(210, 100%, 60%, 0.3);
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
		color: var(--text-secondary);
		font-size: 0.75rem;
	}

	.badge {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.badge.reviewed {
		background: hsl(140, 60%, 40%);
	}

	.badge.reassess {
		background: hsl(40, 90%, 50%);
		color: hsl(0, 0%, 10%);
	}

	.info {
		padding: 0.75rem;
	}

	.filename {
		display: block;
		font-size: 0.75rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--text-primary);
	}

	.meta {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.25rem;
		font-size: 0.625rem;
		color: var(--text-secondary);
	}

	.keywords {
		background: hsla(0, 0%, 100%, 0.1);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
	}

	.reviewer {
		background: hsla(210, 100%, 60%, 0.2);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
	}
</style>
