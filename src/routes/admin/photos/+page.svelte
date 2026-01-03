<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { Photo, Review, FilterType } from '$lib/types/admin';
	import PhotoCard from '$lib/components/admin/PhotoCard.svelte';
	import PhotoEditPanel from '$lib/components/admin/PhotoEditPanel.svelte';

	interface Props {
		data: {
			photos: Photo[];
			totalPages: number;
			currentPage: number;
			totalItems: number;
			filter: string;
			reviews: Review[];
			allKeywords: string[];
		};
	}

	let { data }: Props = $props();

	let selectedPhoto = $state<Photo | null>(null);
	let saving = $state(false);

	const filters: { value: FilterType; label: string }[] = [
		{ value: 'all', label: 'All' },
		{ value: 'unreviewed', label: 'Unreviewed' },
		{ value: 'reviewed', label: 'Reviewed' },
		{ value: 'needs_reassessment', label: 'Needs Reassessment' }
	];

	function selectPhoto(photo: Photo) {
		selectedPhoto = photo;
	}

	function closePanel() {
		selectedPhoto = null;
	}

	async function handleSave(saveData: {
		keywords: string[];
		assessment: string;
		needsReassessment: boolean;
		markReviewed: boolean;
	}) {
		if (!selectedPhoto) return;

		saving = true;
		const formData = new FormData();
		formData.append('photoId', selectedPhoto.id);
		formData.append('keywords', saveData.keywords.join(','));
		formData.append('assessment', saveData.assessment);
		formData.append('needsReassessment', String(saveData.needsReassessment));
		formData.append('markReviewed', String(saveData.markReviewed));

		await fetch('?/updatePhoto', {
			method: 'POST',
			body: formData
		});

		await invalidateAll();
		saving = false;

		// Update selected photo from refreshed data
		const updated = data.photos.find((p) => p.id === selectedPhoto?.id);
		if (updated) {
			selectedPhoto = updated;
		}
	}

	function getPageNumbers(current: number, total: number): (number | '...')[] {
		if (total <= 7) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}

		if (current <= 3) {
			return [1, 2, 3, 4, '...', total];
		}

		if (current >= total - 2) {
			return [1, '...', total - 3, total - 2, total - 1, total];
		}

		return [1, '...', current - 1, current, current + 1, '...', total];
	}
</script>

<div class="photos-page">
	<header class="page-header">
		<h1>Photos</h1>
		<span class="count">{data.totalItems} photos</span>
	</header>

	<div class="filters">
		{#each filters as f}
			<a
				href="/admin/photos?filter={f.value}"
				class="filter-btn"
				class:active={data.filter === f.value}
			>
				{f.label}
			</a>
		{/each}
	</div>

	<div class="photo-grid">
		{#each data.photos as photo (photo.id)}
			<PhotoCard
				{photo}
				reviews={data.reviews}
				selected={selectedPhoto?.id === photo.id}
				onclick={() => selectPhoto(photo)}
			/>
		{/each}
	</div>

	{#if data.totalPages > 1}
		<nav class="pagination">
			{#if data.currentPage > 1}
				<a href="/admin/photos?page={data.currentPage - 1}&filter={data.filter}" class="page-btn">
					← Prev
				</a>
			{/if}

			{#each getPageNumbers(data.currentPage, data.totalPages) as pageNum}
				{#if pageNum === '...'}
					<span class="ellipsis">...</span>
				{:else}
					<a
						href="/admin/photos?page={pageNum}&filter={data.filter}"
						class="page-btn"
						class:active={data.currentPage === pageNum}
					>
						{pageNum}
					</a>
				{/if}
			{/each}

			{#if data.currentPage < data.totalPages}
				<a href="/admin/photos?page={data.currentPage + 1}&filter={data.filter}" class="page-btn">
					Next →
				</a>
			{/if}
		</nav>
	{/if}
</div>

{#if selectedPhoto}
	<div class="overlay" onclick={closePanel} role="presentation"></div>
	<PhotoEditPanel
		photo={selectedPhoto}
		reviews={data.reviews}
		allKeywords={data.allKeywords}
		onclose={closePanel}
		onsave={handleSave}
	/>
{/if}

<style>
	.photos-page {
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--space-lg);
	}

	.page-header {
		display: flex;
		align-items: baseline;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
	}

	.count {
		color: var(--text-secondary);
		font-size: 13px;
	}

	.filters {
		display: flex;
		gap: var(--space-sm);
		margin-bottom: var(--space-lg);
	}

	.filter-btn {
		padding: var(--space-sm) var(--space-md);
		background: var(--bg-primary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 13px;
		transition: background-color 0.1s ease;
	}

	.filter-btn:hover {
		background: var(--bg-secondary);
		color: var(--text-primary);
		text-decoration: none;
	}

	.filter-btn.active {
		background: var(--accent-primary);
		border-color: var(--accent-primary);
		color: white;
	}

	.photo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--space-md);
	}

	.pagination {
		display: flex;
		justify-content: center;
		gap: var(--space-xs);
		margin-top: var(--space-lg);
	}

	.page-btn {
		padding: var(--space-sm) var(--space-md);
		background: var(--bg-primary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 13px;
		transition: background-color 0.1s ease;
	}

	.page-btn:hover {
		background: var(--bg-secondary);
		color: var(--text-primary);
		text-decoration: none;
	}

	.page-btn.active {
		background: var(--accent-primary);
		border-color: var(--accent-primary);
		color: white;
	}

	.ellipsis {
		padding: var(--space-sm);
		color: var(--text-tertiary);
	}

	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 999;
	}
</style>
