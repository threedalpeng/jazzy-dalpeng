<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';

	interface ToolsLayoutProps {
		children: Snippet;
	}
	const { children }: ToolsLayoutProps = $props();
</script>

<div class="flex h-[100dvh] w-full flex-col">
	<header class="flex h-[60px] w-screen flex-row items-center">
		<a href={resolve('/')} class="ml-4 font-jazz text-xl font-bold sm:ml-8 sm:text-2xl">
			JazzyDalpeng / Jazz Guitar Practice</a
		>
	</header>
	{@render children()}
	<nav class="h-60px relative w-screen"></nav>
</div>
