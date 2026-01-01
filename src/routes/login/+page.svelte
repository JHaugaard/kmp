<script lang="ts">
	import { enhance } from '$app/forms';
	let { form } = $props();

	let loading = $state(false);
</script>

<div class="login-container">
	<div class="glass-card login-card hover-lift">
		<h1 class="premium-gradient">Family Archive Access</h1>
		<p class="subtitle">Enter your email to receive a secure access link.</p>

		{#if form?.success}
			<div class="success-message">
				<p>✨ Check your inbox! A secure link has been sent to your email.</p>
			</div>
		{:else}
			<form 
				method="POST" 
				action="?/requestMagicLink" 
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
			>
				<div class="input-group">
					<input 
						type="email" 
						name="email" 
						id="email" 
						placeholder="email@example.com"
						required 
					/>
				</div>

				{#if form?.error}
					<p class="error">Something went wrong. Please try again or contact the admin.</p>
				{/if}

				<button type="submit" disabled={loading} class="submit-btn hover-lift">
					{loading ? 'Sending...' : 'Request Access Link'}
				</button>
			</form>
		{/if}
	</div>
</div>

<style>
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		padding: 20px;
	}

	.login-card {
		padding: 3rem;
		width: 100%;
		max-width: 450px;
		text-align: center;
	}

	h1 {
		margin-bottom: 0.5rem;
		font-size: 2rem;
	}

	.subtitle {
		color: var(--text-secondary);
		margin-bottom: 2rem;
		font-size: 0.95rem;
	}

	.input-group {
		margin-bottom: 1.5rem;
	}

	input {
		width: 100%;
		padding: 0.8rem 1rem;
		border-radius: 12px;
		border: 1px solid var(--border-subtle);
		background: rgba(255, 255, 255, 0.05);
		color: var(--text-primary);
		font-family: var(--font-main);
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	input:focus {
		outline: none;
		border-color: var(--accent-primary);
		background: rgba(255, 255, 255, 0.08);
	}

	.submit-btn {
		width: 100%;
		padding: 1rem;
		border-radius: 12px;
		border: none;
		background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
		color: white;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		margin-top: 0.5rem;
	}

	.submit-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.success-message {
		padding: 1.5rem;
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 12px;
		color: #10b981;
	}

	.error {
		color: #ef4444;
		font-size: 0.85rem;
		margin-bottom: 1rem;
	}
</style>
