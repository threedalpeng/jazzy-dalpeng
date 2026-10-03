<script lang="ts">
	import { resolve } from '$app/paths';
	import SvgIcon from '#src/lib/ui/SvgIcon.svelte';
	import MetronomeIcon from '#assets/icons/metronome-icon.svg?raw';
	import ChordNotation from '#lib/notation/ChordNotation.svelte';
</script>

<svelte:head><title>연습 도구 · JazzyDalpeng</title></svelte:head>
<main class="neumorph-container">
	<div class="tool-list">
		<a class="neumorph neumorph-active" href={resolve('/tools/metronome')}>
			<SvgIcon>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- bundled SVG asset -->
				{@html MetronomeIcon}
			</SvgIcon>
			<h1 class="font-jazz">Metronome</h1>
			<p>박과 템포를 익혀요</p>
		</a>
		<a class="neumorph neumorph-active" href={resolve('/tools/chord-finder')}>
			<span class="chord-symbol" aria-hidden="true"
				><ChordNotation root="C" extension="maj7" /></span
			>
			<h2 class="font-jazz">Chord Finder</h2>
			<p>지판에서 코드를 찾아요</p>
		</a>
	</div>
</main>

<style>
	.neumorph-container {
		display: grid;
		place-items: center;
		flex: 1;
		min-height: 0;
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

	.tool-list {
		display: flex;
		gap: 36px;
		padding: 24px;
	}
	.tool-list .neumorph {
		--neu-square-size: min(240px, 30vw);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
	}
	.tool-list :global(svg) {
		width: 64px;
		height: 64px;
	}
	.tool-list h1,
	.tool-list h2 {
		font-size: 28px;
	}
	.tool-list p {
		font-size: 11px;
	}
	.chord-symbol {
		font-size: 64px;
		line-height: 1;
	}
	a:focus-visible {
		outline: 3px solid #4338ca;
		outline-offset: 6px;
	}
	@media (max-width: 760px) {
		.tool-list {
			flex-direction: column;
			gap: 24px;
			padding: 20px;
		}
		.tool-list .neumorph {
			--neu-square-size: min(190px, calc((100dvh - 140px) / 2));
			gap: 8px;
		}
		.tool-list h1,
		.tool-list h2 {
			font-size: 24px;
		}
		.tool-list :global(svg) {
			width: 48px;
			height: 48px;
		}
		.chord-symbol {
			font-size: 48px;
		}
	}
</style>
