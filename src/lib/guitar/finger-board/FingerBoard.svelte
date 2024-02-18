<script lang="ts" context="module">
	export interface FingerPosition {
		line: number;
		fret: number | 'mute' | 'open';
	}
	export interface FingerOnFretPosition {
		line: number;
		fret: number;
	}
	export interface NonFingerPosition {
		line: number;
		fret: 'mute' | 'open';
	}
	export interface FingerEffect {
		type: string;
	}
	export interface FingerStyle {
		color: CanvasStyle;
		scale: number;
	}
	export interface FingerInfo {
		position: FingerPosition;
		style?: Partial<FingerStyle>;
		text?: string;
	}
	export interface FingerOnFretInfo {
		position: FingerOnFretPosition;
		style?: Partial<FingerStyle>;
		text?: string;
	}
	export interface NonFingerInfo {
		position: NonFingerPosition;
		style?: Partial<FingerStyle>;
		text?: string;
	}
</script>

<script lang="ts">
	import { Canvas, Circle, Crop, Text } from '$lib/canvas';
	import { createEventDispatcher } from 'svelte';
	import FingerBoardBackground from './components/FingerBoardBackground.svelte';
	import FingerBoardPoisitionIndicator from './components/FingerBoardPoisitionIndicator.svelte';
	import { getXFromFretNumber, getYFromStringNumber, setFingerBoardContext } from './context';
	import HitRegion from '$/lib/canvas/elements/HitRegion.svelte';
	import Clip from '$/lib/canvas/elements/Clip.svelte';

	const dispatch = createEventDispatcher<{ click: FingerPosition; hover: FingerPosition }>();

	const { FRET_START, FRET_WIDTH, FRET_GAP, STRING_START, STRING_GAP, FINGER_RADIUS, FRET_MAX } =
		setFingerBoardContext();

	export let readonly: boolean = false;

	export let fretRange: {
		start: number;
		end: number;
		visibility: 'none' | 'all' | 'start' | 'end';
	} = {
		start: 0,
		end: 12,
		visibility: 'start'
	};
	const fretNumberPadding = 0.3;
	$: fretRangeGap = fretRange.end - fretRange.start;
	$: fretRangeWidth = FRET_GAP * (fretRangeGap + fretNumberPadding * 2);

	export let fingers: FingerInfo[] = [];
	$: fingersOnFret = fingers.filter(
		(finger) => typeof finger.position.fret === 'number' && finger.position.fret > 0
	) as FingerOnFretInfo[];
	$: nonFingers = fingers.filter(
		(finger) => !(typeof finger.position.fret === 'number' && finger.position.fret > 0)
	) as NonFingerInfo[];

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
			{@const size = FINGER_RADIUS * (finger.style?.scale ?? 1)}
			{#if finger.text === undefined}
				<Circle
					x={getXFromFretNumber(finger.position.fret - 0.5)}
					y={getYFromStringNumber(finger.position.line)}
					radius={size}
					fillStyle={finger.style?.color}
					strokeStyle={finger.style?.color}
				/>
			{:else}
				{@const textSize = size * 3}
				<Clip
					x={getXFromFretNumber(finger.position.fret - 0.5) - textSize / 2}
					y={getYFromStringNumber(finger.position.line) - textSize / 2}
					width={textSize}
					height={textSize}
				/>
				<Text
					x={getXFromFretNumber(finger.position.fret - 0.5)}
					y={getYFromStringNumber(finger.position.line)}
					fontFamily="FinaleJazz"
					textAlign="center"
					textBaseline="middle"
					fontSize={`${textSize}px`}
					fillStyle={finger.style?.color}
					strokeStyle={finger.style?.color}
					text={finger.text}
				/>
			{/if}
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
			on:click={(ev) => {
				if (ev.detail.button === 0) {
					dispatch('click', { fret: 'open', line: lineNum });
				} else if (ev.detail.button === 2) {
					dispatch('click', { fret: 'mute', line: lineNum });
				}
			}}
			render={(ctx) => {
				const width = FRET_GAP;
				const height = STRING_GAP;
				ctx.fillRect(FRET_START - FRET_GAP, centerY - height / 2, width, height);
			}}
		></HitRegion>
	{/each}
	{#each nonFingers as nonFinger}
		<Text
			fontSize="20px"
			fontFamily="Spoqa Han Sans Neo"
			textAlign="center"
			textBaseline="middle"
			text={nonFinger.position.fret === 'mute' ? 'X' : 'O'}
			fillStyle={nonFinger.style?.color}
			strokeStyle={nonFinger.style?.color}
			x={getXFromFretNumber(-fretNumberPadding / 2)}
			y={getYFromStringNumber(nonFinger.position.line)}
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
