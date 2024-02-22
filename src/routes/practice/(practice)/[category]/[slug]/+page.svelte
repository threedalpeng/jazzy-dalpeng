<script lang="ts">
	import MetronomeBeats from '$/lib/device/metronome/MetronomeBeats.svelte';
	import MetronomeOptions from '$/lib/device/metronome/MetronomeOptions.svelte';
	import MetronomePlayButton from '$/lib/device/metronome/MetronomePlayButton.svelte';
	import { getMetronomeContext } from '$/lib/device/metronome/context';
	import type { OnBarCallback, OnOptionChangeCallback } from '$/lib/device/metronome/metronome';
	import FingerBoard, {
		type FingerInfo,
		type FingerPosition
	} from '$/lib/guitar/finger-board/FingerBoard.svelte';
	import RandomBoxOptions from '$/lib/practice/RandomBox/RandomBoxOptions.svelte';
	import { getRandomBoxContext } from '$/lib/practice/RandomBox/context';
	import type { PracticeScore } from '$/lib/practice/types';
	import { getPitchFromFingerPosition, numberingPitch } from '$/utils/music/pitch';
	import { CacheStorage, Soundfont } from 'smplr';
	import { onDestroy, onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	$: practice = data.pages.current.practice;

	const metronome = getMetronomeContext();
	const randomBox = getRandomBoxContext<PracticeScore>();

	const timer = metronome.timer;
	$: score = replaceScore();
	$: fretRange = score.fretRange;
	$: practice, (score = replaceScore());
	$: console.log(score);
	let isRunning: boolean = metronome.isRunning;

	function replaceScore() {
		let score = randomBox.open();
		const schedule = () => {
			if (!guitarSoundfont) {
				guitarSoundfont = new Soundfont(timer.audioCtx!!, {
					instrument: 'acoustic_guitar_steel',
					storage: new CacheStorage()
				});
			}
			// preload soundfont
			guitarSoundfont.load.then(() => {
				metronome.clearSchedule();
				metronome.schedule();
				scheduleScore(score);
			});
		};
		timer.onStart(schedule);
		return score;
	}

	$: currentBoard = score.boards[0];
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

	let guitarSoundfont: Soundfont | null = null;

	function scheduleScore(score: PracticeScore) {
		/** Now scheduling */

		// 1. board replacement
		score.boards.map((board) => {
			timer.onTimeAfter(
				board.time,
				() => {
					currentActiveFingers.clear();
					currentBoard = board;
				},
				({ audioCtx }) => {
					// guitarSoundfont!!.start({
					// 	note: 50 + 12
					// });
				}
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
				({ audioCtx, time }) => {
					// play audio with pitch
					if (note.pitch) {
						guitarSoundfont!!.start({
							note: numberingPitch(note.pitch) + 12,
							time: time,
							duration: note.time.duration
								? timer.convert(note.time.duration, 'note', 'second')
								: note.time.duration
						});
					}
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
		</div>
		<div class="relative flex h-full flex-col items-center justify-center">
			<FingerBoard class="" readonly {fingers} {fretRange}></FingerBoard>
			<MetronomeBeats class="p-20" />
			<MetronomePlayButton class="h-20" />
		</div>
	</div>
</div>
