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

<div class="panel">
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
		background: var(--bg-primary);
		border-left: 1px solid var(--border-default);
		display: flex;
		flex-direction: column;
		z-index: 1000;
		overflow: hidden;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-md) var(--space-lg);
		border-bottom: 1px solid var(--border-default);
	}

	.panel-header h3 {
		margin: 0;
		font-size: 14px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.close-btn {
		background: none;
		border: none;
		color: var(--text-tertiary);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 4px;
		line-height: 1;
	}

	.close-btn:hover {
		color: var(--text-primary);
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-lg);
	}

	.image-preview {
		margin-bottom: var(--space-lg);
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--bg-secondary);
	}

	.image-preview img {
		width: 100%;
		height: auto;
		display: block;
	}

	.no-image {
		padding: var(--space-xl);
		text-align: center;
		color: var(--text-tertiary);
	}

	.field {
		margin-bottom: var(--space-md);
	}

	.field label {
		display: block;
		margin-bottom: var(--space-sm);
		font-size: 13px;
		color: var(--text-secondary);
	}

	textarea {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		background: var(--bg-primary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-family: inherit;
		font-size: 14px;
		resize: vertical;
	}

	textarea:focus {
		outline: none;
		border-color: var(--accent-primary);
	}

	.checkbox-field label {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		cursor: pointer;
		font-size: 14px;
	}

	.checkbox-field input {
		width: 16px;
		height: 16px;
		accent-color: var(--accent-primary);
	}

	.reviews-section {
		margin-top: var(--space-lg);
		padding-top: var(--space-lg);
		border-top: 1px solid var(--border-default);
	}

	.reviews-section h4 {
		margin: 0 0 var(--space-sm);
		font-size: 13px;
		color: var(--text-secondary);
	}

	.review-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.review-list li {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		padding: var(--space-sm) 0;
		font-size: 12px;
		border-bottom: 1px solid var(--border-light);
	}

	.review-reviewer {
		font-weight: 500;
	}

	.review-list time {
		color: var(--text-tertiary);
	}

	.changes {
		color: var(--accent-primary);
		font-size: 10px;
		background: #e8f4fd;
		padding: 1px 4px;
		border-radius: var(--radius-sm);
	}

	.actions {
		display: flex;
		gap: var(--space-sm);
		margin-top: var(--space-lg);
		padding-top: var(--space-lg);
		border-top: 1px solid var(--border-default);
	}

	.btn-primary,
	.btn-secondary {
		flex: 1;
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-sm);
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.1s ease;
	}

	.btn-primary {
		background: var(--accent-primary);
		border: none;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--accent-hover);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		color: var(--text-primary);
	}

	.btn-secondary:hover {
		background: var(--bg-hover);
	}
</style>
