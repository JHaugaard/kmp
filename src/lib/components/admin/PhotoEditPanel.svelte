<script lang="ts">
	import type { Photo, Review } from '$lib/types/admin';
	import TagInput from './TagInput.svelte';

	interface Props {
		photo: Photo;
		reviews: Review[];
		allKeywords: string[];
		onclose: () => void;
		onsave: (data: {
			keywords: string[];
			assessment: string;
			needsReassessment: boolean;
			markReviewed: boolean;
		}) => void;
	}

	let { photo, reviews = [], allKeywords = [], onclose, onsave }: Props = $props();

	let keywords = $state<string[]>(photo.keywords || []);
	let assessment = $state(photo.assessment || '');
	let needsReassessment = $state(photo.needs_reassessment);
	let markReviewed = $state(false);
	let saving = $state(false);

	const photoReviews = $derived(
		reviews
			.filter((r) => r.photo === photo.id)
			.sort((a, b) => new Date(b.reviewed_at).getTime() - new Date(a.reviewed_at).getTime())
	);

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function handleSave() {
		saving = true;
		await onsave({ keywords, assessment, needsReassessment, markReviewed });
		saving = false;
	}
</script>

<div class="panel glass-card">
	<div class="panel-header">
		<h3>{photo.filename}</h3>
		<button type="button" class="close-btn" onclick={onclose}>×</button>
	</div>

	<div class="panel-content">
		<div class="image-preview">
			{#if photo.image_url}
				<img src={photo.image_url} alt={photo.filename} />
			{:else}
				<div class="no-image">No image available</div>
			{/if}
		</div>

		<form onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
			<div class="field">
				<label for="keywords">Keywords</label>
				<TagInput bind:value={keywords} suggestions={allKeywords} placeholder="Add keyword..." />
			</div>

			<div class="field">
				<label for="assessment">Assessment</label>
				<textarea id="assessment" bind:value={assessment} rows="4" placeholder="AI-generated description..."></textarea>
			</div>

			<div class="field checkbox-field">
				<label>
					<input type="checkbox" bind:checked={needsReassessment} />
					<span>Needs reassessment</span>
				</label>
			</div>

			<div class="field checkbox-field">
				<label>
					<input type="checkbox" bind:checked={markReviewed} />
					<span>Mark as reviewed by me</span>
				</label>
			</div>

			{#if photoReviews.length > 0}
				<div class="reviews-section">
					<h4>Review History</h4>
					<ul class="review-list">
						{#each photoReviews as review}
							<li>
								<span class="review-reviewer">{review.expand?.reviewer?.email || 'Unknown'}</span>
								<time>{formatDate(review.reviewed_at)}</time>
								{#if review.keywords_changed || review.assessment_changed}
									<span class="changes">
										{review.keywords_changed ? 'keywords' : ''}
										{review.keywords_changed && review.assessment_changed ? ', ' : ''}
										{review.assessment_changed ? 'assessment' : ''}
									</span>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<div class="actions">
				<button type="button" class="btn-secondary" onclick={onclose}>Cancel</button>
				<button type="submit" class="btn-primary" disabled={saving}>
					{saving ? 'Saving...' : 'Save'}
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	.panel {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: 480px;
		max-width: 100%;
		border-radius: 0;
		border-left: 1px solid var(--glass-border);
		display: flex;
		flex-direction: column;
		z-index: 1000;
		overflow: hidden;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.panel-header h3 {
		margin: 0;
		font-size: 1rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.close-btn {
		background: none;
		border: none;
		color: var(--text-secondary);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.25rem;
		line-height: 1;
	}

	.close-btn:hover {
		color: var(--text-primary);
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}

	.image-preview {
		margin-bottom: 1.5rem;
		border-radius: 8px;
		overflow: hidden;
		background: var(--bg-secondary);
	}

	.image-preview img {
		width: 100%;
		height: auto;
		display: block;
	}

	.no-image {
		padding: 3rem;
		text-align: center;
		color: var(--text-secondary);
	}

	.field {
		margin-bottom: 1rem;
	}

	.field label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	textarea {
		width: 100%;
		padding: 0.75rem;
		background: hsla(220, 15%, 15%, 0.5);
		border: 1px solid var(--glass-border);
		border-radius: 8px;
		color: var(--text-primary);
		font-family: inherit;
		font-size: 0.875rem;
		resize: vertical;
	}

	textarea:focus {
		outline: none;
		border-color: var(--accent-primary);
	}

	.checkbox-field label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.checkbox-field input {
		width: 18px;
		height: 18px;
		accent-color: var(--accent-primary);
	}

	.reviews-section {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border-subtle);
	}

	.reviews-section h4 {
		margin: 0 0 0.75rem;
		font-size: 0.875rem;
	}

	.review-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.review-list li {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0.5rem 0;
		font-size: 0.75rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.review-reviewer {
		font-weight: 500;
	}

	.review-list time {
		color: var(--text-secondary);
	}

	.changes {
		color: var(--accent-primary);
		font-size: 0.625rem;
		background: hsla(210, 100%, 60%, 0.1);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
	}

	.actions {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border-subtle);
	}

	.btn-primary,
	.btn-secondary {
		flex: 1;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-primary {
		background: var(--accent-primary);
		border: none;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		filter: brightness(1.1);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: transparent;
		border: 1px solid var(--glass-border);
		color: var(--text-secondary);
	}

	.btn-secondary:hover {
		background: hsla(0, 0%, 100%, 0.05);
		color: var(--text-primary);
	}
</style>
