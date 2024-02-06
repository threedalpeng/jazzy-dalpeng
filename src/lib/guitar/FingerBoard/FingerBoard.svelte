<script lang="ts" context="module">
	export interface FingerPosition {
		line: number;
		fret: number | 'mute' | 'open';
	}
</script>

<script lang="ts">
	import { Canvas, Circle, Crop, Text } from '$lib/canvas';
	import { createEventDispatcher } from 'svelte';
	import FingerBoardBackground from './components/FingerBoardBackground.svelte';
	import FingerBoardPoisitionIndicator from './components/FingerBoardPoisitionIndicator.svelte';
	import { getXFromFretNumber, getYFromStringNumber, setFingerBoardContext } from './context';
	import HitRegion from '$/lib/canvas/elements/HitRegion.svelte';

	const dispatch = createEventDispatcher<{ click: FingerPosition; hover: FingerPosition }>();

	const { FRET_START, FRET_WIDTH, FRET_GAP, STRING_START, STRING_GAP, FINGER_RADIUS, FRET_MAX } =
		setFingerBoardContext();

	export let readonly: boolean = false;

	export let fretRange: {
		start: number;
		end: number;
		visibility: 'none' | 'all' | 'start' | 'end';
	} = {
		start: 3,
		end: 12,
		visibility: 'start'
	};
	const fretNumberPadding = 0.3;
	$: fretRangeGap = fretRange.end - fretRange.start;
	$: fretRangeWidth = FRET_GAP * (fretRangeGap + fretNumberPadding * 2);

	export let fingers: FingerPosition[] = [];
	$: fingersOnFret = fingers.filter(
		(finger) => typeof finger.fret === 'number' && finger.fret > 0
	) as { fret: number; line: number }[];
	$: noneFingers = fingers.filter(
		(finger) => !(typeof finger.fret === 'number' && finger.fret > 0)
	) as { fret: 0 | 'open' | 'mute'; line: number }[];

	export let inlayVisible: boolean = true;
</script>

<Canvas width={FRET_START * 2 + fretRangeWidth} height={STRING_START * 2 + STRING_GAP * 5}>
	<Crop
		width={FRET_START * 2 + FRET_GAP * FRET_MAX}
		height={STRING_START * 2 + STRING_GAP * 5}
		sourceArea={{
			x: getXFromFretNumber(fretRange.start) - FRET_WIDTH - 4,
			width: fretRangeWidth
		}}
		destArea={{ x: FRET_START }}
		debug={false}
	>
		<FingerBoardBackground {inlayVisible} />
		{#each fingersOnFret as finger}
			<Circle
				active={false}
				x={getXFromFretNumber(finger.fret - 0.5)}
				y={getYFromStringNumber(finger.line)}
				radius={FINGER_RADIUS}
			/>
		{/each}
		{#if !readonly}
			{#each Array(fretRange.end - fretRange.start) as _, i}
				{@const fretNum = i + 1 + fretRange.start}
				{@const leftX = getXFromFretNumber(fretNum - 1)}
				{#each Array(6) as _, j}
					{@const lineNum = j + 1}
					{@const centerY = getYFromStringNumber(lineNum)}
					<FingerBoardPoisitionIndicator
						{leftX}
						{centerY}
						on:click={(ev) => {
							if (ev.detail.button === 0) {
								dispatch('click', { fret: fretNum, line: lineNum });
							} else if (ev.detail.button === 2) {
								dispatch('click', { fret: 'mute', line: lineNum });
							}
						}}
					/>
				{/each}
			{/each}
		{/if}
	</Crop>
	{#each Array(6) as _, j}
		{@const lineNum = j + 1}
		{@const centerY = getYFromStringNumber(lineNum)}
		<HitRegion
			on:click={() => {
				dispatch('click', { fret: 'open', line: lineNum });
			}}
			render={(ctx) => {
				const width = FRET_GAP;
				const height = STRING_GAP;
				ctx.fillRect(FRET_START - FRET_GAP, centerY - height / 2, width, height);
			}}
		></HitRegion>
	{/each}
	{#each noneFingers as noneFinger}
		<Text
			fontSize="20px"
			fontFamily="Spoqa Han Sans Neo"
			textAlign="left"
			textBaseline="middle"
			text={noneFinger.fret === 'mute' ? 'X' : 'O'}
			x={getXFromFretNumber(-fretNumberPadding)}
			y={getYFromStringNumber(noneFinger.line)}
		/>
	{/each}
	{#if fretRange.visibility === 'all' || fretRange.visibility === 'start'}
		<Text
			fontSize="20px"
			fontFamily="FinaleJazz"
			textAlign="center"
			textBaseline="bottom"
			text={`${fretRange.start}`}
			x={FRET_START + fretNumberPadding * FRET_GAP}
			y={STRING_START - (fretRange.start === 0 ? 3 : 0)}
		/>
	{/if}
	{#if fretRange.visibility === 'all' || fretRange.visibility === 'end'}
		<Text
			fontSize="20px"
			fontFamily="FinaleJazz"
			textAlign="center"
			textBaseline="bottom"
			text={`${fretRange.end}`}
			x={FRET_START + fretRangeWidth - fretNumberPadding * FRET_GAP}
			y={STRING_START}
		/>
	{/if}
</Canvas>
