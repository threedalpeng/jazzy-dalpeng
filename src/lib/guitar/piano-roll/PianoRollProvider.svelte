<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setPianoRollContext } from './context';

	interface Props {
		quantizingUnit?: number;
		children: Snippet;
	}

	let { quantizingUnit, children }: Props = $props();
	setPianoRollContext({
		quantizingUnit
	});
</script>

{@render children()}
