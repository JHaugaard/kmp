<script lang="ts">
	interface Props {
		value: string[];
		suggestions?: string[];
		placeholder?: string;
		onchange?: (value: string[]) => void;
	}

	let { value = $bindable([]), suggestions = [], placeholder = 'Add tag...' }: Props = $props();

	let inputValue = $state('');
	let showSuggestions = $state(false);
	let inputRef: HTMLInputElement;

	const filteredSuggestions = $derived(
		suggestions
			.filter(
				(s) =>
					s.toLowerCase().includes(inputValue.toLowerCase()) &&
					!value.includes(s)
			)
			.slice(0, 8)
	);

	function addTag(tag: string) {
		const trimmed = tag.trim();
		if (trimmed && !value.includes(trimmed)) {
			value = [...value, trimmed];
		}
		inputValue = '';
		showSuggestions = false;
		inputRef?.focus();
	}

	function removeTag(tag: string) {
		value = value.filter((t) => t !== tag);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && inputValue.trim()) {
			e.preventDefault();
			addTag(inputValue);
		} else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
			removeTag(value[value.length - 1]);
		} else if (e.key === 'Escape') {
			showSuggestions = false;
		}
	}
</script>

<div class="tag-input-container">
	<div class="tags">
		{#each value as tag}
			<span class="tag">
				{tag}
				<button type="button" class="tag-remove" onclick={() => removeTag(tag)}>×</button>
			</span>
		{/each}
		<input
			bind:this={inputRef}
			type="text"
			bind:value={inputValue}
			{placeholder}
			onkeydown={handleKeydown}
			onfocus={() => (showSuggestions = true)}
			onblur={() => setTimeout(() => (showSuggestions = false), 200)}
			class="tag-input"
		/>
	</div>

	{#if showSuggestions && filteredSuggestions.length > 0}
		<ul class="suggestions">
			{#each filteredSuggestions as suggestion}
				<li>
					<button type="button" onmousedown={() => addTag(suggestion)}>
						{suggestion}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.tag-input-container {
		position: relative;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		padding: var(--space-sm);
		background: var(--bg-primary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-sm);
		min-height: 40px;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 8px;
		background: #e8f4fd;
		color: var(--accent-primary);
		border-radius: var(--radius-sm);
		font-size: 13px;
	}

	.tag-remove {
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		padding: 0;
		font-size: 14px;
		line-height: 1;
		opacity: 0.7;
	}

	.tag-remove:hover {
		opacity: 1;
	}

	.tag-input {
		flex: 1;
		min-width: 100px;
		background: none;
		border: none;
		color: var(--text-primary);
		outline: none;
		font-size: 14px;
	}

	.tag-input::placeholder {
		color: var(--text-tertiary);
	}

	.suggestions {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin: 4px 0 0;
		padding: 0;
		list-style: none;
		background: var(--bg-primary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-sm);
		max-height: 200px;
		overflow-y: auto;
		z-index: 100;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.suggestions li button {
		display: block;
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		text-align: left;
		background: none;
		border: none;
		color: var(--text-primary);
		cursor: pointer;
		font-size: 13px;
	}

	.suggestions li button:hover {
		background: var(--bg-secondary);
	}
</style>
