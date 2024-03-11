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
			tuning: TUNE.standard
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

	let fingers: FingerInfo[] = [];
	let fingerOnSelected: boolean = false;
	let fingerPositionsProcessing: FingerPosition[] = [];
	let fingersRegistered: FingerInfo[] = [];
	$: fingers = fingerPositionsProcessing.map<FingerInfo>((position) => ({
		position,
		style: { color: 'gray' }
	}));

	let notes: PianoRollNote[] = [];
	let noteOnSelected: boolean = false;
	let noteProcessing: PianoRollNote | null = null;
	let pitchHighlight: number | 'mute' | null = null;
	let notesRegistered: PianoRollNote[] = [];
	$: notes = notesRegistered.concat(noteProcessing !== null ? [noteProcessing] : []);

	function initializeState() {
		fingerPositionsProcessing = [];
		pitchHighlight = null;
		noteProcessing = null;
		noteOnSelected = false;
		fingerOnSelected = false;
	}

	function updateFingers(ev: CustomEvent<FingerPosition>) {
		const onCandidate = fingerPositionsProcessing.find(
			(pos) => pos.fret === ev.detail.fret && pos.line === ev.detail.line
		);

		if (noteOnSelected) {
			if (onCandidate) {
				fingerPositionsProcessing = [ev.detail];
				registerNote();
				return;
			} else {
				initializeState();
			}
		}
		fingerPositionsProcessing = [ev.detail];

		const pitch = getPitchFromFingerPosition(ev.detail, practice.guitar.tuning);
		const pitchNumber = pitch ? numberingPitch(pitch) : 'mute';
		pitchHighlight = pitchNumber;
		fingerOnSelected = true;
	}

	function updateNotes(ev: CustomEvent<PianoRollNote>) {
		noteProcessing = ev.detail;
		if (fingerOnSelected) {
			registerNote();
			return;
		}

		fingerPositionsProcessing = getFingerPositionsFromPitch(
			noteProcessing.pitch,
			practice.guitar.tuning
		);
		noteOnSelected = true;
	}

	function registerNote() {
		fingersRegistered.push(
			...fingerPositionsProcessing.map<FingerInfo>((position) => ({ position }))
		);
		fingersRegistered = fingersRegistered;

		notesRegistered.push(noteProcessing!);
		notesRegistered = notesRegistered;
		initializeState();
	}
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
			<FingerBoard class="max-w-[100vw]" {fingers} on:click={updateFingers}></FingerBoard>
			<MetronomeBeats class="p-20" />
			<MetronomePlayButton class="h-20" />
		</div>
	</div>
</div>
