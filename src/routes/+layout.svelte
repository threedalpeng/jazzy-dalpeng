<script lang="ts">
	import '$/app.css';
	import type { Snippet } from 'svelte';
	// import { pwaInfo } from 'virtual:pwa-info';
	// $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';

	interface RootLayoutProps {
		children: Snippet;
	}
	const { children }: RootLayoutProps = $props();
</script>

<!-- <svelte:head>
	{@html webManifestLink}
</svelte:head> -->
{@render children()}

<!-- {#await import('$lib/ReloadPrompt.svelte') then { default: ReloadPrompt }}
	<ReloadPrompt />
{/await} -->
