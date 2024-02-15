<script lang="ts">
	import type { FingerInfo, FingerPosition } from '$/lib/guitar/finger-board/FingerBoard.svelte';
	import Board from './Board.svelte';

	let fingers: Record<number, FingerInfo> = {};
	function updateFingerPosition(position: FingerPosition) {
		if (fingers[position.line]?.position.fret === position.fret) {
			delete fingers[position.line];
		} else {
			fingers[position.line] = { position };
		}
		fingers = fingers;
	}
</script>

<div class="h-full w-screen">
	<Board
		fingers={Object.values(fingers)}
		on:click={({ detail: { fret, line } }) => {
			updateFingerPosition({ fret, line });
		}}
	></Board>
	<!-- <MetronomeProvider><RandomBox {components} /></MetronomeProvider> -->
</div>
