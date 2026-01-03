<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { Person } from '$lib/types/admin';
	import PersonCard from '$lib/components/admin/PersonCard.svelte';
	import PersonForm from '$lib/components/admin/PersonForm.svelte';

	interface Props {
		data: {
			people: Person[];
		};
	}

	let { data }: Props = $props();

	let showForm = $state(false);
	let editingPerson = $state<Person | null>(null);
	let confirmDelete = $state<Person | null>(null);

	function openCreateForm() {
		editingPerson = null;
		showForm = true;
	}

	function openEditForm(person: Person) {
		editingPerson = person;
		showForm = true;
	}

	function closeForm() {
		showForm = false;
		editingPerson = null;
	}

	async function handleSave(formData: FormData) {
		const action = editingPerson ? '?/update' : '?/create';
		await fetch(action, {
			method: 'POST',
			body: formData
		});
		await invalidateAll();
		closeForm();
	}

	function openDeleteConfirm(person: Person) {
		confirmDelete = person;
	}

	async function handleDelete() {
		if (!confirmDelete) return;

		const formData = new FormData();
		formData.append('id', confirmDelete.id);

		await fetch('?/delete', {
			method: 'POST',
			body: formData
		});
		await invalidateAll();
		confirmDelete = null;
	}

	async function handleExport() {
		const exportData = data.people.map((p) => ({
			name: p.name,
			aliases: p.aliases,
			surname: p.surname,
			generation: p.generation,
			birth_year_range: p.birth_year_range,
			physical_description: p.physical_description,
			relationships: p.relationships,
			often_seen_with: p.often_seen_with,
			notes: p.notes
		}));

		const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'people-context.json';
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="people-page">
	<header class="page-header">
		<div class="header-left">
			<h1>People</h1>
			<span class="count">{data.people.length} people</span>
		</div>
		<div class="header-actions">
			<button type="button" class="btn-secondary" onclick={handleExport}>
				Export JSON
			</button>
			<button type="button" class="btn-primary" onclick={openCreateForm}>
				+ Add Person
			</button>
		</div>
	</header>

	{#if data.people.length === 0}
		<div class="empty-state glass-card">
			<p>No people added yet.</p>
			<button type="button" class="btn-primary" onclick={openCreateForm}>
				Add your first person
			</button>
		</div>
	{:else}
		<div class="people-grid">
			{#each data.people as person (person.id)}
				<PersonCard
					{person}
					onedit={() => openEditForm(person)}
					ondelete={() => openDeleteConfirm(person)}
				/>
			{/each}
		</div>
	{/if}
</div>

{#if showForm}
	<PersonForm
		person={editingPerson}
		allPeople={data.people}
		onclose={closeForm}
		onsave={handleSave}
	/>
{/if}

{#if confirmDelete}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="modal-overlay" onclick={() => (confirmDelete = null)} role="presentation">
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<div class="confirm-modal glass-card" onclick={(e) => e.stopPropagation()} role="dialog">
			<h3>Delete Person</h3>
			<p>Are you sure you want to delete <strong>{confirmDelete.name}</strong>?</p>
			<div class="confirm-actions">
				<button type="button" class="btn-secondary" onclick={() => (confirmDelete = null)}>
					Cancel
				</button>
				<button type="button" class="btn-danger" onclick={handleDelete}>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.people-page {
		max-width: 1200px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.header-left {
		display: flex;
		align-items: baseline;
		gap: 1rem;
	}

	.header-left h1 {
		margin: 0;
	}

	.count {
		color: var(--text-secondary);
		font-size: 0.875rem;
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.625rem 1rem;
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

	.btn-primary:hover {
		filter: brightness(1.1);
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

	.empty-state {
		padding: 3rem;
		text-align: center;
	}

	.empty-state p {
		color: var(--text-secondary);
		margin-bottom: 1rem;
	}

	.people-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1rem;
	}

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
	}

	.confirm-modal {
		padding: 1.5rem;
		max-width: 400px;
		text-align: center;
	}

	.confirm-modal h3 {
		margin: 0 0 1rem;
	}

	.confirm-modal p {
		margin: 0 0 1.5rem;
		color: var(--text-secondary);
	}

	.confirm-actions {
		display: flex;
		gap: 1rem;
	}

	.confirm-actions button {
		flex: 1;
	}

	.btn-danger {
		padding: 0.625rem 1rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		background: hsl(0, 70%, 50%);
		border: none;
		color: white;
		transition: all 0.2s ease;
	}

	.btn-danger:hover {
		background: hsl(0, 70%, 45%);
	}
</style>
