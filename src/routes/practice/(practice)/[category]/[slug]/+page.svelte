<script lang="ts">
	import MetronomeBeats from '$/lib/device/metronome/MetronomeBeats.svelte';
	import MetronomeOptions from '$/lib/device/metronome/MetronomeOptions.svelte';
	import { getMetronomeContext } from '$/lib/device/metronome/context';
	import FingerBoard, {
		type FingerInfo,
		type FingerPosition,
		type FretRangeOption
	} from '$/lib/guitar/finger-board/FingerBoard.svelte';
	import RandomBoxOptions from '$/lib/practice/RandomBox/RandomBoxOptions.svelte';
	import { getRandomBoxContext } from '$/lib/practice/RandomBox/context';
	import type { PracticeBoard, PracticeScore } from '$/lib/practice/types';
	import { getPitchFromFingerPosition, numberingPitch } from '$/utils/music/pitch';
	import MetronomePlayButton from '$lib/device/metronome/MetronomePlayButton.svelte';
	import { CacheStorage, Soundfont } from 'smplr';
	import { Set } from 'svelte/reactivity';
	import type { PageData } from './$types';

	interface PracticeSlugPageProps {
		data: PageData;
	}

	const { data }: PracticeSlugPageProps = $props();
	const practice = $derived(data.pages.current.practice);

	const metronome = getMetronomeContext();
	const randomBox = getRandomBoxContext<PracticeScore>();

	const timer = metronome.timer;
	let currentScore = $state<PracticeScore>();
	let currentBoard = $state<PracticeBoard>();
	let fretRange = $derived<FretRangeOption>(
		currentScore?.fretRange ?? { start: 0, end: 12, visibility: 'none' }
	);
	let currentActiveFingers = new Set<number>();
	let nextNotes: number[] = [];
	const fingers = $derived.by(() => {
		if (currentScore === undefined) return [];
		if (currentBoard === undefined || currentBoard.fingers === undefined) {
			return [];
		} else
			return (currentBoard?.fingers ?? []).map((finger) => {
				const order = nextNotes.findIndex((f) => f === finger);
				return {
					position: currentScore!.positions[finger],
					style: {
						color: currentActiveFingers.has(finger) ? 'red' : undefined
						// scale: currentActiveFingers.has(finger) ? 1 : order >= 0 ? (4 - order) / 4 : 0.5
					}
				};
			}) as FingerInfo[];
	});

	let guitarSoundfont: Soundfont | null = null;

	$effect.pre(replaceScore);
	function replaceScore() {
		practice;
		currentScore = randomBox.open();
		currentBoard = currentScore.boards[0];
		const cancel = timer.beforeStart(async () => {
			if (!guitarSoundfont) {
				guitarSoundfont = new Soundfont(timer.audioCtx!!, {
					instrument: 'acoustic_guitar_steel',
					storage: new CacheStorage()
				});
			}
			// preload soundfont
			guitarSoundfont.load.then(() => {
				currentScheduleIdList.forEach((id) => {
					timer.cancelSchedule(id);
				});
				scheduleScore(currentScore!);
				cancel();
			});
		});
	}

	let currentScheduleIdList: number[] = [];
	function scheduleScore(score: PracticeScore) {
		/** Now scheduling */

		// 1. board replacement
		score.boards.map((board) => {
			const boardScheduleId = timer.scheduleOnTempo({
				time: board.time,
				animation: () => {
					currentActiveFingers.clear();
					currentBoard = board;
				}
			});
			currentScheduleIdList.push(boardScheduleId);
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
			const noteScheduleId = timer.scheduleOnTempo({
				time: note.time,
				animation: () => {
					currentActiveFingers.add(note.position);
					nextNotes = nextThreeFingers;
					return () => {
						currentActiveFingers.delete(note.position);
					};
				},
				audio: ({ audioCtx, time }) => {
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
			});
			currentScheduleIdList.push(noteScheduleId);
		}
	}
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
			<button onclick={replaceScore}>
				<FingerBoard class="max-w-[100vw]" readonly {fingers} {fretRange}></FingerBoard>
			</button>
			<MetronomeBeats class="p-20" />
			<MetronomePlayButton class="h-20" />
		</div>
	</div>
</div>
