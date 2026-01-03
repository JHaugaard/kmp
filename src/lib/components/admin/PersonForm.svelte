<script lang="ts">
	import type { Person } from '$lib/types/admin';

	interface Props {
		person?: Person | null;
		allPeople: Person[];
		onclose: () => void;
		onsave: (formData: FormData) => void;
	}

	let { person = null, allPeople = [], onclose, onsave }: Props = $props();

	let name = $state(person?.name || '');
	let aliases = $state(person?.aliases?.join(', ') || '');
	let surname = $state(person?.surname || '');
	let generation = $state(person?.generation?.toString() || '');
	let birthYearRange = $state(person?.birth_year_range || '');
	let physicalDescription = $state(person?.physical_description || '');
	let spouse = $state(person?.relationships?.spouse || '');
	let parents = $state(person?.relationships?.parents?.join(', ') || '');
	let children = $state(person?.relationships?.children?.join(', ') || '');
	let siblings = $state(person?.relationships?.siblings?.join(', ') || '');
	let oftenSeenWith = $state(person?.often_seen_with?.join(', ') || '');
	let notes = $state(person?.notes || '');
	let sortOrder = $state(person?.sort_order?.toString() || '');

	let saving = $state(false);

	const surnames = ['Martin', 'Kline', 'Haugaard', 'Walsh', 'Anderson', 'Other'];
	const generations = ['1', '2', '3', '4'];

	// Filter out current person for relationship suggestions
	const otherPeople = $derived(
		allPeople.filter((p) => p.id !== person?.id).map((p) => p.name)
	);

	function handleSubmit(e: Event) {
		e.preventDefault();
		saving = true;

		const formData = new FormData();
		if (person) formData.append('id', person.id);
		formData.append('name', name);
		formData.append('aliases', aliases);
		formData.append('surname', surname);
		formData.append('generation', generation);
		formData.append('birth_year_range', birthYearRange);
		formData.append('physical_description', physicalDescription);
		formData.append('spouse', spouse);
		formData.append('parents', parents);
		formData.append('children', children);
		formData.append('siblings', siblings);
		formData.append('often_seen_with', oftenSeenWith);
		formData.append('notes', notes);
		formData.append('sort_order', sortOrder);

		onsave(formData);
	}
</script>

<div class="modal-overlay" onclick={onclose} role="presentation">
	<div class="modal glass-card" onclick={(e) => e.stopPropagation()} role="dialog">
		<div class="modal-header">
			<h2>{person ? 'Edit Person' : 'Add Person'}</h2>
			<button type="button" class="close-btn" onclick={onclose}>×</button>
		</div>

		<form onsubmit={handleSubmit}>
			<div class="form-grid">
				<div class="field full-width">
					<label for="name">Name *</label>
					<input type="text" id="name" bind:value={name} required />
				</div>

				<div class="field full-width">
					<label for="aliases">Aliases (comma-separated)</label>
					<input type="text" id="aliases" bind:value={aliases} placeholder="Jack, Jackie, Uncle Jack" />
				</div>

				<div class="field">
					<label for="surname">Surname</label>
					<select id="surname" bind:value={surname}>
						<option value="">Select...</option>
						{#each surnames as s}
							<option value={s}>{s}</option>
						{/each}
					</select>
				</div>

				<div class="field">
					<label for="generation">Generation</label>
					<select id="generation" bind:value={generation}>
						<option value="">Select...</option>
						{#each generations as g}
							<option value={g}>{g}</option>
						{/each}
					</select>
				</div>

				<div class="field full-width">
					<label for="birth_year_range">Birth Year Range</label>
					<input type="text" id="birth_year_range" bind:value={birthYearRange} placeholder="1920-1930" />
				</div>

				<div class="field full-width">
					<label for="physical_description">Physical Description</label>
					<textarea id="physical_description" bind:value={physicalDescription} rows="2" placeholder="Tall, dark hair, glasses..."></textarea>
				</div>

				<div class="section-header">
					<h3>Relationships</h3>
				</div>

				<div class="field">
					<label for="spouse">Spouse</label>
					<input type="text" id="spouse" bind:value={spouse} list="people-list" />
				</div>

				<div class="field">
					<label for="parents">Parents (comma-separated)</label>
					<input type="text" id="parents" bind:value={parents} placeholder="John Doe, Jane Doe" />
				</div>

				<div class="field">
					<label for="children">Children (comma-separated)</label>
					<input type="text" id="children" bind:value={children} />
				</div>

				<div class="field">
					<label for="siblings">Siblings (comma-separated)</label>
					<input type="text" id="siblings" bind:value={siblings} />
				</div>

				<div class="field full-width">
					<label for="often_seen_with">Often Seen With (comma-separated)</label>
					<input type="text" id="often_seen_with" bind:value={oftenSeenWith} />
				</div>

				<div class="field full-width">
					<label for="notes">Notes</label>
					<textarea id="notes" bind:value={notes} rows="3"></textarea>
				</div>

				<div class="field">
					<label for="sort_order">Sort Order</label>
					<input type="number" id="sort_order" bind:value={sortOrder} />
				</div>
			</div>

			<datalist id="people-list">
				{#each otherPeople as p}
					<option value={p} />
				{/each}
			</datalist>

			<div class="form-actions">
				<button type="button" class="btn-secondary" onclick={onclose}>Cancel</button>
				<button type="submit" class="btn-primary" disabled={saving || !name}>
					{saving ? 'Saving...' : person ? 'Update' : 'Create'}
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: hsla(0, 0%, 0%, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 2rem;
	}

	.modal {
		width: 100%;
		max-width: 600px;
		max-height: 90vh;
		overflow-y: auto;
		padding: 0;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--border-subtle);
		position: sticky;
		top: 0;
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
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

	form {
		padding: 1.5rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field.full-width {
		grid-column: 1 / -1;
	}

	.section-header {
		grid-column: 1 / -1;
		margin-top: 0.5rem;
	}

	.section-header h3 {
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	label {
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	input,
	select,
	textarea {
		padding: 0.75rem;
		background: hsla(220, 15%, 15%, 0.5);
		border: 1px solid var(--glass-border);
		border-radius: 8px;
		color: var(--text-primary);
		font-family: inherit;
		font-size: 0.875rem;
	}

	input:focus,
	select:focus,
	textarea:focus {
		outline: none;
		border-color: var(--accent-primary);
	}

	select {
		cursor: pointer;
	}

	textarea {
		resize: vertical;
	}

	.form-actions {
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
