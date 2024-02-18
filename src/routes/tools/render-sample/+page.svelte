<script lang="ts">
	import MetronomeBeats from '$/lib/device/metronome/MetronomeBeats.svelte';
	import MetronomeOptions from '$/lib/device/metronome/MetronomeOptions.svelte';
	import { getMetronomeContext } from '$/lib/device/metronome/context';
	import type { OnBarCallback, OnOptionChangeCallback } from '$/lib/device/metronome/metronome';
	import FingerBoard, {
		type FingerInfo,
		type FingerPosition
	} from '$/lib/guitar/finger-board/FingerBoard.svelte';
	import RandomBoxOptions from '$/lib/practice/RandomBox/RandomBoxOptions.svelte';
	import { getRandomBoxContext } from '$/lib/practice/RandomBox/context';
	import type { PracticeBoard, PracticeScore } from '$/lib/practice/types';
	import { getPitchFromFingerPosition } from '$/utils/music/pitch';
	import { onDestroy, onMount } from 'svelte';
	import { practice } from './data';

	const metronome = getMetronomeContext();
	const randomBox = getRandomBoxContext<(typeof practice.scores)[number]>();

	const timer = metronome.timer;
	let score = replaceScore();
	let isRunning: boolean = metronome.isRunning;

	function replaceScore() {
		let score = randomBox.open();
		const schedule = () => {
			scheduleScore(score);
			timer.removeTick(schedule);
		};
		timer.onTick(schedule);
		return score;
	}

	let currentBoard: PracticeBoard = score.boards[0];
	let currentActiveFingers = new Set<number>();
	let nextNotes: number[] = [];
	$: fingers = (currentBoard?.fingers ?? []).map((finger) => {
		const order = nextNotes.findIndex((f) => f === finger);
		return {
			position: score.positions[finger],
			style: {
				color: currentActiveFingers.has(finger) ? 'red' : undefined
				// scale: currentActiveFingers.has(finger) ? 1 : order >= 0 ? (4 - order) / 4 : 0.5
			}
		};
	}) as FingerInfo[];
	// $: console.log(nextNotes);

	function scheduleScore(score: PracticeScore) {
		/** Now scheduleing */

		// 1. board replacement
		score.boards.map((board) => {
			timer.onTimeAfter(
				board.time,
				() => {
					currentActiveFingers.clear();
					currentBoard = board;
				},
				({ audioCtx }) => {}
			);
		});

		// 2. notes
		const notes = score.notes.map((note) => {
			const pitch = getPitchFromFingerPosition(
				score.positions[note.position] as FingerPosition,
				practice.guitar.tuning
			);
			return { ...note, pitch };
		});
		for (let i = 0; i < notes.length; i++) {
			const note = notes[i];
			const nextThreeFingers = notes.slice(i + 1, i + 4).map((n) => n.position);
			timer.onTimeAfter(
				note.time,
				() => {
					currentActiveFingers.add(note.position);
					currentActiveFingers = currentActiveFingers;
					nextNotes = nextThreeFingers;
					return () => {
						currentActiveFingers.delete(note.position);
						currentActiveFingers = currentActiveFingers;
					};
				},
				({ audioCtx }) => {
					// play audio with pitch
				}
			);
		}
	}

	onMount(() => {
		metronome.onBar(onMetronomeBar);
		metronome.onOptionChange(onMetronomeOptionChange);
	});

	onDestroy(() => {
		metronome.removeBar(onMetronomeBar);
		metronome.removeOptionChange(onMetronomeOptionChange);
	});

	const onMetronomeBar: OnBarCallback = () => {
		// score = replaceScore();
	};
	const onMetronomeOptionChange: OnOptionChangeCallback = ({ bpm }) => {
		// timer.tickIntervalMs = calcTickIntervalMs(bpm);
	};
</script>

<div class="h-full w-screen">
	<div class="relative h-full">
		<div class="absolute right-0 z-10 flex h-[60px] w-screen flex-row items-center justify-between">
			<div class="ml-4 flex h-full flex-row items-start justify-between gap-4">
				<MetronomeOptions />
				<RandomBoxOptions />
			</div>
			<button
				class="mr-8 flex aspect-square h-3/4 items-center justify-center rounded-full bg-indigo-900 p-0 focus:outline-none"
				on:click={() => {
					metronome.toggle();
					isRunning = metronome.isRunning;
				}}
			>
				{#if isRunning}
					<Icon class="m-0 h-[20px] w-[20px] p-0 text-indigo-100" src={Stop} theme="solid" />
				{:else}
					<Icon class="m-0 h-[20px] w-[20px] p-0 text-indigo-100" src={Play} theme="solid" />
				{/if}
			</button>
		</div>
		<div class="relative flex h-full flex-col items-center justify-center">
			<div class="relative" style="left: {0}em;">{testNum}</div>
			<FingerBoard readonly {fingers}></FingerBoard>
			<MetronomeBeats />
		</div>
	</div>
</div>
