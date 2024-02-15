<script lang="ts" context="module">
	export interface Board {
		title: string;
		fingers: FingerInfo[];
	}
</script>

<script lang="ts">
	import MetronomeProvider from '$/lib/device/metronome/MetronomeProvider.svelte';
	import type { FingerInfo } from '$/lib/guitar/finger-board/FingerBoard.svelte';
</script>

<MetronomeProvider>
	<slot />
</MetronomeProvider>
