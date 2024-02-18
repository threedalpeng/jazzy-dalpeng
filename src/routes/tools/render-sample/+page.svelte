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
	import { type AudioTickCallback, type TickCallback } from '$/lib/timer/tick';
	import { getPitchFromFingerPosition } from '$/utils/music/pitch';
	import { Play, Stop } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { onDestroy, onMount } from 'svelte';
	import { practice } from './data';

	const metronome = getMetronomeContext();
	const randomBox = getRandomBoxContext<(typeof practice.scores)[number]>();

	const timer = metronome.timer;
	let score = replaceScore();
	let isRunning: boolean = metronome.isRunning;
	let testNum = 0;

	function replaceScore() {
		let score = randomBox.open();
		const schedule = () => {
			scheduleScore(score);
			timer.removeTick(schedule);
		};
		timer.onTick(schedule);
		return score;
	}

	let currentBoard: (typeof score.boards)[number];
	let currentActiveFingers = new Set<number>();
	$: fingers = (currentBoard?.fingers ?? []).map((finger) => {
		return {
			position: score.notes[finger].position,
			style: { color: currentActiveFingers.has(finger) ? 'red' : undefined }
		};
	}) as FingerInfo[];

	function scheduleScore(score: (typeof practice.scores)[number]) {
		/** Now scheduleing */

		// 1. board replacement
		score.boards.map((board) => {
			const notes = board.fingers.map((finger) => {
				const note = score.notes[finger];
				const pitch = getPitchFromFingerPosition(
					note.position as FingerPosition,
					practice.guitar.tuning
				);
				return { ...note, id: finger, pitch };
			});

			onTimeAfter(
				board.time,
				() => {
					currentBoard = board;
					// 2. active note(finger)
					notes.forEach((note) => {
						onTimeAfter(
							note.time,
							() => {
								currentActiveFingers.add(note.id);
								currentActiveFingers = currentActiveFingers;
								return () => {
									currentActiveFingers.delete(note.id);
									currentActiveFingers = currentActiveFingers;
								};
							},
							({ audioCtx }) => {}
						);
					});
				},
				({ audioCtx }) => {}
			);
		});
	}

	function onTimeAfter(
		time: { start: number; duration?: number },
		cb: TickCallback,
		audioCb: AudioTickCallback
	) {
		const start = timer.convert(time.start, 'note', 'second');
		const duration = time.duration ? timer.convert(time.duration, 'note', 'second') : -1;

		let currentTime = metronome.timer.currentTime;
		let cleanup: TickCallback | null = null;
		const onStart: TickCallback = (state) => {
			if (currentTime + start <= state.time) {
				cleanup = cb(state) as TickCallback;
				timer.removeTick(onStart);
			}
		};
		const onEnd: TickCallback = (state) => {
			if (currentTime + start + duration <= state.time) {
				if (cleanup) {
					cleanup(state);
				}
				timer.removeTick(onEnd);
			}
		};
		const onAudioTick: AudioTickCallback = (state) => {
			if (currentTime + start >= state.time) {
				audioCb(state);
				timer.removeAudioTick(onAudioTick);
			}
		};

		metronome.timer.onTick(onStart);
		if (duration > 0) {
			metronome.timer.onTick(onEnd);
		}
		metronome.timer.onAudioTick(onAudioTick);
	}

	onMount(() => {
		metronome.onBar(onMetronomeBar);
		metronome.onOptionChange(onMetronomeOptionChange);
		timer.onTick(onTimerTick);
	});

	onDestroy(() => {
		metronome.removeBar(onMetronomeBar);
		metronome.removeOptionChange(onMetronomeOptionChange);
		timer.removeTick(onTimerTick);
	});

	const onMetronomeBar: OnBarCallback = () => {
		score = replaceScore();
	};
	const onMetronomeOptionChange: OnOptionChangeCallback = ({ bpm }) => {
		// timer.tickIntervalMs = calcTickIntervalMs(bpm);
	};
	const onTimerTick: TickCallback = ({ tickPassed }) => {
		testNum = Math.floor(timer.convert(tickPassed, 'tick', 'beat'));
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
