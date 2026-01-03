<script lang="ts">
	import type { Person } from '$lib/types/admin';

	interface Props {
		person: Person;
		onedit: () => void;
		ondelete: () => void;
	}

	let { person, onedit, ondelete }: Props = $props();

	const surnames: Record<string, string> = {
		Martin: 'M',
		Kline: 'K',
		Haugaard: 'H',
		Walsh: 'W',
		Anderson: 'A'
	};

	const surnameInitial = $derived(
		person.surname && surnames[person.surname] ? surnames[person.surname] : '?'
	);
</script>

<div class="person-card card">
	<div class="card-header">
		<div class="avatar" data-initial={surnameInitial}>
			{surnameInitial}
		</div>
		<div class="name-section">
			<h3>{person.name}</h3>
			{#if person.aliases && person.aliases.length > 0}
				<span class="aliases">aka {person.aliases.join(', ')}</span>
			{/if}
		</div>
	</div>

	<div class="card-body">
		<div class="meta-row">
			{#if person.surname}
				<span class="badge surname">{person.surname}</span>
			{/if}
			{#if person.generation}
				<span class="badge generation">Gen {person.generation}</span>
			{/if}
			{#if person.birth_year_range}
				<span class="badge years">{person.birth_year_range}</span>
			{/if}
		</div>

		{#if person.physical_description}
			<p class="description">{person.physical_description}</p>
		{/if}

		{#if person.relationships}
			<div class="relationships">
				{#if person.relationships.spouse}
					<span class="relationship">💑 {person.relationships.spouse}</span>
				{/if}
				{#if person.relationships.children?.length}
					<span class="relationship">👶 {person.relationships.children.join(', ')}</span>
				{/if}
			</div>
		{/if}
	</div>

	<div class="card-actions">
		<button type="button" class="btn-edit" onclick={onedit}>Edit</button>
		<button type="button" class="btn-delete" onclick={ondelete}>Delete</button>
	</div>
</div>

<style>
	.person-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.card-header {
		display: flex;
		gap: var(--space-md);
		align-items: flex-start;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--accent-primary);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 14px;
		flex-shrink: 0;
	}

	.name-section h3 {
		margin: 0;
		font-size: 15px;
	}

	.aliases {
		font-size: 12px;
		color: var(--text-tertiary);
		font-style: italic;
	}

	.card-body {
		flex: 1;
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		margin-bottom: var(--space-sm);
	}

	.badge {
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		font-size: 11px;
		font-weight: 500;
	}

	.badge.surname {
		background: #e8f4fd;
		color: var(--accent-primary);
	}

	.badge.generation {
		background: #f3e8ff;
		color: #7c3aed;
	}

	.badge.years {
		background: var(--bg-secondary);
		color: var(--text-secondary);
	}

	.description {
		margin: 0;
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.relationships {
		margin-top: var(--space-sm);
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.relationship {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.card-actions {
		display: flex;
		gap: var(--space-sm);
		border-top: 1px solid var(--border-light);
		padding-top: var(--space-md);
	}

	.btn-edit,
	.btn-delete {
		flex: 1;
		padding: var(--space-sm);
		border-radius: var(--radius-sm);
		font-size: 12px;
		cursor: pointer;
		transition: background-color 0.1s ease;
	}

	.btn-edit {
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		color: var(--text-primary);
	}

	.btn-edit:hover {
		background: var(--bg-hover);
	}

	.btn-delete {
		background: transparent;
		border: 1px solid #fecaca;
		color: #dc2626;
	}

	.btn-delete:hover {
		background: #fef2f2;
	}
</style>
