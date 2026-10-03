<script lang="ts">
	import '#src/app.css';
	import type { Snippet } from 'svelte';
	const { children }: { children: Snippet } = $props();
</script>

{@render children()}
