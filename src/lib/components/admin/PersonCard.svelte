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

<div class="person-card glass-card">
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
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.card-header {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.name-section h3 {
		margin: 0;
		font-size: 1.125rem;
	}

	.aliases {
		font-size: 0.75rem;
		color: var(--text-secondary);
		font-style: italic;
	}

	.card-body {
		flex: 1;
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.badge {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.badge.surname {
		background: hsla(210, 100%, 60%, 0.2);
		color: var(--accent-primary);
	}

	.badge.generation {
		background: hsla(280, 80%, 65%, 0.2);
		color: var(--accent-secondary);
	}

	.badge.years {
		background: hsla(0, 0%, 100%, 0.1);
		color: var(--text-secondary);
	}

	.description {
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.relationships {
		margin-top: 0.75rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.relationship {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.card-actions {
		display: flex;
		gap: 0.5rem;
		border-top: 1px solid var(--border-subtle);
		padding-top: 1rem;
	}

	.btn-edit,
	.btn-delete {
		flex: 1;
		padding: 0.5rem;
		border-radius: 6px;
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-edit {
		background: transparent;
		border: 1px solid var(--glass-border);
		color: var(--text-secondary);
	}

	.btn-edit:hover {
		background: hsla(0, 0%, 100%, 0.05);
		color: var(--text-primary);
	}

	.btn-delete {
		background: transparent;
		border: 1px solid hsla(0, 70%, 50%, 0.3);
		color: hsl(0, 70%, 60%);
	}

	.btn-delete:hover {
		background: hsla(0, 70%, 50%, 0.1);
	}
</style>
