<script lang="ts">
	import type { Snippet } from 'svelte';

	interface ToolsLayoutProps {
		children: Snippet;
	}
	const { children }: ToolsLayoutProps = $props();
</script>

<div class="flex h-screen w-screen flex-col">
	<header class="flex h-[60px] w-screen flex-row items-center">
		<span class="ml-8 font-jazz text-2xl font-bold"> JazzyDalpeng / Jazz Guitar Practice</span>
	</header>
	{@render children()}
	<nav class="h-60px relative w-screen"></nav>
</div>
