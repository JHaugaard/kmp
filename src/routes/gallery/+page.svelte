<script lang="ts">
	let { data } = $props();
	
	let searchQuery = $state('');
	let results = $state([]);
	let searching = $state(false);

	async function handleSearch() {
		if (!searchQuery.trim()) return;
		searching = true;
		
		try {
			const res = await fetch('/api/search', {
				method: 'POST',
				body: JSON.stringify({ query: searchQuery })
			});
			const data = await res.json();
			results = data.results || [];
		} catch (err) {
			console.error('Search error:', err);
		} finally {
			searching = false;
		}
	}
</script>

<div class="gallery-container">
	<header class="glass-card nav-header">
		<h2 class="premium-gradient">KMP Archive</h2>
		<div class="user-info">
			<span>{data.user?.email}</span>
		</div>
	</header>

	<main>
		<section class="search-section">
			<div class="search-box glass-card">
				<input 
					type="text" 
					bind:value={searchQuery} 
					placeholder="Search memories (e.g., 'Christmas at the cabin' or 'cars at the beach')..."
					onkeydown={(e) => e.key === 'Enter' && handleSearch()}
				/>
				<button onclick={handleSearch} disabled={searching}>
					{searching ? '...' : 'Search'}
				</button>
			</div>
		</section>

		<section class="results-grid">
			{#each results as photo}
				<div class="photo-card glass-card hover-lift">
					<!-- Note: For dev, we'll show a placeholder as the actually images are on the private Volume -->
					<div class="image-placeholder">
						<span class="filename">{photo.filename}</span>
						<span class="score">{(photo.score * 100).toFixed(0)}% match</span>
					</div>
					<div class="card-content">
						<p class="assessment">{photo.assessment}</p>
						<div class="tags">
							{#each photo.keywords as tag}
								<span class="tag">{tag}</span>
							{/each}
						</div>
					</div>
				</div>
			{:else}
				{#if !searching}
					<div class="empty-state">
						<p>Try searching for something! The first 10 photos of the archive are indexed.</p>
					</div>
				{/if}
			{/each}
		</section>
	</main>
</div>

<style>
	.gallery-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.nav-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		margin-bottom: 3rem;
	}

	.user-info {
		font-size: 0.8rem;
		color: var(--text-secondary);
	}

	.search-section {
		display: flex;
		justify-content: center;
		margin-bottom: 4rem;
	}

	.search-box {
		display: flex;
		width: 100%;
		max-width: 700px;
		padding: 0.5rem;
		gap: 0.5rem;
		border-radius: 99px;
	}

	input {
		flex: 1;
		background: transparent;
		border: none;
		color: var(--text-primary);
		padding: 0.8rem 1.5rem;
		font-size: 1.1rem;
		font-family: var(--font-main);
	}

	input:focus {
		outline: none;
	}

	button {
		background: var(--accent-primary);
		color: white;
		border: none;
		padding: 0.8rem 2rem;
		border-radius: 99px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	button:disabled {
		opacity: 0.5;
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 2rem;
	}

	.photo-card {
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.image-placeholder {
		height: 200px;
		background: var(--bg-secondary);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid var(--border-subtle);
		position: relative;
	}

	.filename {
		font-size: 0.9rem;
		font-weight: 600;
	}

	.score {
		font-size: 0.7rem;
		background: var(--accent-primary);
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		margin-top: 0.5rem;
	}

	.card-content {
		padding: 1.5rem;
	}

	.assessment {
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--text-primary);
		margin-bottom: 1rem;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		font-size: 0.7rem;
		background: rgba(255, 255, 255, 0.05);
		padding: 0.2rem 0.6rem;
		border-radius: 4px;
		color: var(--text-secondary);
	}

	.empty-state {
		grid-column: 1 / -1;
		text-align: center;
		padding: 5rem;
		color: var(--text-secondary);
	}
</style>
