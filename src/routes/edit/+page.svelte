<script lang="ts">
	import MetronomeBeats from '$/lib/device/metronome/MetronomeBeats.svelte';
	import { getMetronomeContext } from '$/lib/device/metronome/context';
	import FingerBoard, {
		type FingerInfo,
		type FingerPosition
	} from '$/lib/guitar/finger-board/FingerBoard.svelte';
	import PianoRoll, { type PianoRollNote } from '$/lib/guitar/piano-roll/PianoRoll.svelte';
	import type { Practice, PracticeScore } from '$/lib/practice/types';
	import {
		TUNE,
		getFingerPositionsFromPitch,
		getPitchFromFingerPosition,
		numberingPitch
	} from '$/utils/music/pitch';
	import MetronomePlayButton from '$lib/device/metronome/MetronomePlayButton.svelte';

	const metronome = getMetronomeContext();

	const practice: Practice = {
		guitar: {
			tuning: { ...TUNE.standard }
		},
		scores: [
			{
				positions: [
					{
						fret: 1,
						line: 1
					}
				],
				boards: [],
				notes: [],
				fretRange: {
					start: 0,
					end: 0,
					visibility: 'none'
				}
			}
		],
		tempo: {
			bpm: 0,
			beatPerBar: 0,
			signatureUnit: 0
		}
	};

	$: currentScoreIndex = 0;
	$: currentBoardIndex = 0;

	$: currentScore = practice.scores[currentScoreIndex];
	$: currentBoard = currentScore.boards[currentBoardIndex];

	function loadScore(score: PracticeScore) {
		score.boards[0];
	}

	// $: notes = currentScore.notes.map((note) => {
	// 	const pitch = getPitchFromFingerPosition(
	// 		currentScore.positions[note.position],
	// 		practice.guitar.tuning
	// 	);
	// 	return {
	// 		...note,
	// 		pitch: pitch ? numberingPitch(pitch) : null
	// 	};
	// });

	let fingers: FingerInfo[] = [];
	let fingerPositionsProcessing: FingerPosition[] = [];
	let fingersRegistered: FingerInfo[] = [];
	$: fingers = fingerPositionsProcessing
		.map<FingerInfo>((position) => ({
			position,
			style: { color: 'gray' }
		}))
		.concat(fingersRegistered);

	let notes: PianoRollNote[] = [];
	let noteProcessing: PianoRollNote | null = null;
	let pitchHighlight: number | 'mute' | null = null;
	let notesRegistered: PianoRollNote[] = [];
	$: notes = notesRegistered.concat(noteProcessing !== null ? [noteProcessing] : []);

	function updateFingers(ev: CustomEvent<FingerPosition>) {
		fingerPositionsProcessing = [ev.detail];
		if (noteProcessing) {
			registerNote();
			return;
		}

		const pitch = getPitchFromFingerPosition(ev.detail, practice.guitar.tuning);
		const pitchNumber = pitch ? numberingPitch(pitch) : 'mute';
		pitchHighlight = pitchNumber;
	}
	function updateNotes(ev: CustomEvent<PianoRollNote>) {
		noteProcessing = ev.detail;
		if (fingerPositionsProcessing.length !== 0) {
			registerNote();
			return;
		}

		fingerPositionsProcessing = getFingerPositionsFromPitch(
			noteProcessing.pitch,
			practice.guitar.tuning
		);
		console.log(fingerPositionsProcessing);
	}
	function registerNote() {
		fingersRegistered.push(
			...fingerPositionsProcessing.map<FingerInfo>((position) => ({ position }))
		);
		fingersRegistered = fingersRegistered;
		fingerPositionsProcessing = [];

		pitchHighlight = null;
		notesRegistered.push(noteProcessing!);
		notesRegistered = notesRegistered;
		noteProcessing = null;
	}

	const timer = metronome.timer;
</script>

<div class="h-full w-screen">
	<div class="relative h-full">
		<div class="absolute right-0 z-10 flex h-[60px] w-screen flex-row items-center justify-between">
			<div class="ml-4 flex h-full flex-row items-start justify-between gap-4">
				<!-- <MetronomeOptions /> -->
			</div>
		</div>
		<div class="relative flex h-screen flex-col items-center justify-center">
			<PianoRoll {notes} {pitchHighlight} on:select={updateNotes}></PianoRoll>
			{JSON.stringify(noteProcessing)}
			<FingerBoard class="max-w-[100vw]" {fingers} on:click={updateFingers}></FingerBoard>
			<MetronomeBeats class="p-20" />
			<MetronomePlayButton class="h-20" />
		</div>
	</div>
</div>
