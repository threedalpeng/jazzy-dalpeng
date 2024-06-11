<script lang="ts">
	import type { FingerInfo, FingerPosition } from '$/lib/guitar/finger-board/FingerBoard.svelte';
	import { Map } from 'svelte/reactivity';
	import Board from './Board.svelte';

	const fingers = new Map<number, FingerInfo>();
	function updateFingerPosition(position: FingerPosition) {
		if (fingers.get(position.line)?.position.fret === position.fret) {
			fingers.delete(position.line);
		} else {
			fingers.set(position.line, { position });
		}
	}
</script>

<div class="h-full w-screen">
	<div class="relative flex h-full flex-col items-center">
		<Board
			fingers={[...fingers.values()]}
			onclick={({ fret, line }) => {
				updateFingerPosition({ fret, line });
			}}
		></Board>
	</div>
	<!-- <MetronomeProvider><RandomBox {components} /></MetronomeProvider> -->
</div>
