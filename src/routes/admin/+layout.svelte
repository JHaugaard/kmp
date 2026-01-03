<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		data: { user: { id: string; email: string; role: string } };
		children: Snippet;
	}

	let { data, children }: Props = $props();

	const navItems = [
		{ href: '/admin', label: 'Dashboard', icon: '📊' },
		{ href: '/admin/photos', label: 'Photos', icon: '🖼️' },
		{ href: '/admin/people', label: 'People', icon: '👥' }
	];
</script>

<div class="admin-layout">
	<aside class="sidebar glass-card">
		<div class="sidebar-header">
			<h2 class="premium-gradient">KMP Admin</h2>
			<span class="role-badge">{data.user.role}</span>
		</div>

		<nav class="nav">
			{#each navItems as item}
				<a href={item.href} class="nav-item">
					<span class="nav-icon">{item.icon}</span>
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>

		<div class="sidebar-footer">
			<span class="user-email">{data.user.email}</span>
			<a href="/gallery" class="back-link">← Back to Gallery</a>
		</div>
	</aside>

	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	.admin-layout {
		display: flex;
		min-height: 100vh;
	}

	.sidebar {
		width: 240px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		border-radius: 0;
		border-right: 1px solid var(--glass-border);
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
	}

	.sidebar-header {
		margin-bottom: 2rem;
	}

	.sidebar-header h2 {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
	}

	.role-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		background: var(--accent-primary);
		border-radius: 12px;
		font-size: 0.75rem;
		text-transform: uppercase;
		font-weight: 600;
	}

	.nav {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		color: var(--text-secondary);
		text-decoration: none;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.nav-item:hover {
		background: hsla(0, 0%, 100%, 0.1);
		color: var(--text-primary);
	}

	.nav-icon {
		font-size: 1.25rem;
	}

	.sidebar-footer {
		border-top: 1px solid var(--border-subtle);
		padding-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.user-email {
		font-size: 0.875rem;
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.back-link {
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 0.875rem;
	}

	.back-link:hover {
		color: var(--accent-primary);
	}

	.main-content {
		flex: 1;
		margin-left: 240px;
		padding: 2rem;
	}
</style>
