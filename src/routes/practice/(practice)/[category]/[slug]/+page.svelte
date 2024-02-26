<script lang="ts">
	import MetronomeBeats from '$/lib/device/metronome/MetronomeBeats.svelte';
	import MetronomeOptions from '$/lib/device/metronome/MetronomeOptions.svelte';
	import { getMetronomeContext } from '$/lib/device/metronome/context';
	import FingerBoard, {
		type FingerInfo,
		type FingerPosition
	} from '$/lib/guitar/finger-board/FingerBoard.svelte';
	import RandomBoxOptions from '$/lib/practice/RandomBox/RandomBoxOptions.svelte';
	import { getRandomBoxContext } from '$/lib/practice/RandomBox/context';
	import type { PracticeScore } from '$/lib/practice/types';
	import { getPitchFromFingerPosition, numberingPitch } from '$/utils/music/pitch';
	import MetronomePlayButton from '$lib/device/metronome/MetronomePlayButton.svelte';
	import { CacheStorage, Soundfont } from 'smplr';
	import type { PageData } from './$types';

	export let data: PageData;
	$: practice = data.pages.current.practice;

	const metronome = getMetronomeContext();
	const randomBox = getRandomBoxContext<PracticeScore>();

	const timer = metronome.timer;
	$: currentScore = practice.scores[0];
	$: fretRange = currentScore.fretRange;
	$: currentBoard = currentScore.boards[0];
	let currentActiveFingers = new Set<number>();
	let nextNotes: number[] = [];
	$: fingers = (currentBoard?.fingers ?? []).map((finger) => {
		const order = nextNotes.findIndex((f) => f === finger);
		return {
			position: currentScore.positions[finger],
			style: {
				color: currentActiveFingers.has(finger) ? 'red' : undefined
				// scale: currentActiveFingers.has(finger) ? 1 : order >= 0 ? (4 - order) / 4 : 0.5
			}
		};
	}) as FingerInfo[];

	let guitarSoundfont: Soundfont | null = null;

	$: practice,
		(() => {
			currentScore = replaceScore();
		})();
	function replaceScore() {
		let score = randomBox.open();
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
				scheduleScore(score);
				cancel();
			});
		});
		return score;
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
					currentActiveFingers = currentActiveFingers;
					nextNotes = nextThreeFingers;
					return () => {
						currentActiveFingers.delete(note.position);
						currentActiveFingers = currentActiveFingers;
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
			<button on:click={replaceScore}>
				<FingerBoard class="max-w-[100vw]" readonly {fingers} {fretRange}></FingerBoard>
			</button>
			<MetronomeBeats class="p-20" />
			<MetronomePlayButton class="h-20" />
		</div>
	</div>
</div>
