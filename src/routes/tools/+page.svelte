<script lang="ts">
	import SvgIcon from '$/lib/ui/SvgIcon.svelte';
	import MetronomeIcon from '$assets/icons/metronome-icon.svg?raw';
	import type { UIEventHandler } from 'svelte/elements';

	const tools = [{ col: 1, row: 2, logoSvg: MetronomeIcon, title: 'Metronome' }];

	const SQUARE_SIZE_MIN = 240;
	const GAP_SQUARE_RATIO = 6;
	const GAP_MIN = SQUARE_SIZE_MIN / GAP_SQUARE_RATIO;
	let windowSize = {
		long: Math.max(window.innerWidth, window.innerHeight),
		short: Math.min(window.innerWidth, window.innerHeight)
	};
	$: maxCenterSquares = Math.floor(
		((windowSize.short * 0.8) / GAP_MIN + 1) / (GAP_SQUARE_RATIO + 1)
	);
	$: gap = (windowSize.short * 0.8) / ((GAP_SQUARE_RATIO + 1) * maxCenterSquares - 1);
	$: squareSize = gap * GAP_SQUARE_RATIO;
	$: start = {
		x: window.innerWidth * 0.5 - windowSize.short * 0.4,
		y: window.innerHeight * 0.5 - windowSize.short * 0.4
	};

	$: xFillerSquares = Math.ceil(start.x / ((GAP_SQUARE_RATIO + 1) * gap));
	$: yFillerSquares = Math.ceil(start.y / ((GAP_SQUARE_RATIO + 1) * gap));
	$: xSquares = maxCenterSquares + xFillerSquares * 2;
	$: ySquares = maxCenterSquares + yFillerSquares * 2;
	$: fillerStart = {
		x: start.x - xFillerSquares * (GAP_SQUARE_RATIO + 1) * gap,
		y: start.y - yFillerSquares * (GAP_SQUARE_RATIO + 1) * gap
	};

	const updateOnResize: UIEventHandler<Window> = (ev) => {
		windowSize = {
			long: Math.max(window.innerWidth, window.innerHeight),
			short: Math.min(window.innerWidth, window.innerHeight)
		};
	};
</script>

<svelte:window on:resize={updateOnResize} />
<main class="neumorph-container relative h-full overflow-clip">
	{#each Array(xSquares) as _, i}
		{@const x = fillerStart.x + i * gap * (GAP_SQUARE_RATIO + 1)}
		{#each Array(ySquares) as _, j}
			{@const y = fillerStart.y + j * gap * (GAP_SQUARE_RATIO + 1)}
			{@const hasContent =
				xFillerSquares <= i &&
				i < xFillerSquares + maxCenterSquares &&
				yFillerSquares <= j &&
				j < yFillerSquares + maxCenterSquares}
			{#if hasContent}
				<a href="./">
					<div
						style={`--neu-square-size:${squareSize}px; top: ${y}px; left: ${x}px`}
						class="neumorph neumorph-active absolute grid place-items-center"
					>
						<div class="flex flex-col items-center gap-8">
							<SvgIcon class="aspect-square w-1/3">
								{@html MetronomeIcon}
							</SvgIcon>
							<h2 class="text-xl font-light">Metronome</h2>
						</div>
					</div>
				</a>
			{:else}
				<div
					style={`--neu-square-size:${squareSize}px; top: ${y}px; left: ${x}px`}
					class="neumorph neumorph-inset absolute grid place-items-center"
				></div>
			{/if}
		{/each}
	{/each}
</main>

<style scoped>
	.neumorph-container {
		--neu-color: theme('colors.indigo.500');
		--neu-color-text: color-mix(in lab, var(--neu-color) 20%, black);
		--neu-color-light: color-mix(in lab, var(--neu-color) 40%, white);
		--neu-color-lighter: color-mix(in lab, var(--neu-color) 10%, white);
		--neu-color-dark: color-mix(in lab, var(--neu-color) 90%, black);
		--neu-color-darker: color-mix(in lab, var(--neu-color) 80%, black);
		color: var(--neu-color-text);
		background-color: var(--neu-color-light);
		fill: var(--neu-color-text);
	}
	.neumorph {
		width: var(--neu-square-size);
		height: var(--neu-square-size);
		border-radius: calc(var(--neu-square-size) / 8);
		--neu-distance: calc(var(--neu-square-size) / 40);

		background: linear-gradient(145deg, var(--neu-color-lighter), var(--neu-color-light));

		box-shadow:
			var(--neu-distance) var(--neu-distance) calc(var(--neu-distance) * 2) var(--neu-color),
			calc(0px - var(--neu-distance)) calc(0px - var(--neu-distance)) calc(var(--neu-distance) * 2)
				var(--neu-color-light);
	}

	.neumorph-inset {
		--neu-distance-inset: calc(var(--neu-distance) / 3);
		background: linear-gradient(145deg, var(--neu-color-light), var(--neu-color-lighter));
		box-shadow:
			inset var(--neu-distance-inset) var(--neu-distance-inset) calc(var(--neu-distance-inset) * 2)
				var(--neu-color),
			inset calc(0px - var(--neu-distance-inset)) calc(0px - var(--neu-distance-inset))
				calc(var(--neu-distance-inset) * 2) var(--neu-color-light);
	}

	.neumorph-active:hover {
		color: theme('colors.indigo.600');
		fill: theme('colors.indigo.600');
		background-color: theme('colors.indigo.50');
		box-shadow:
			var(--neu-distance) var(--neu-distance) calc(var(--neu-distance) * 2)
				theme('colors.indigo.200'),
			calc(0px - var(--neu-distance)) calc(0px - var(--neu-distance)) calc(var(--neu-distance) * 2)
				theme('colors.indigo.100');
	}

	.neumorph-active:active {
		color: theme('colors.indigo.800');
		fill: theme('colors.indigo.800');
		background-color: theme('colors.indigo.50');
		box-shadow:
			var(--neu-distance) var(--neu-distance) calc(var(--neu-distance) * 2)
				theme('colors.indigo.300'),
			calc(0px - var(--neu-distance)) calc(0px - var(--neu-distance)) calc(var(--neu-distance) * 2)
				theme('colors.indigo.200');
	}
</style>
