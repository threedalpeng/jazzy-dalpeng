<script lang="ts">
	import MetronomeBeats from '$/lib/device/metronome/MetronomeBeats.svelte';
	import { getMetronomeContext } from '$/lib/device/metronome/context';
	import FingerBoard, {
		type FingerInfo,
		type FingerPosition
	} from '$/lib/guitar/finger-board/FingerBoard.svelte';
	import PianoRoll, { type PianoRollNote } from '$/lib/guitar/piano-roll/PianoRoll.svelte';
	import type { Practice } from '$/lib/practice/types';
	import {
		TUNE,
		getFingerPositionsFromPitch,
		getPitchFromFingerPosition,
		numberingPitch
	} from '$/utils/music/pitch';
	import MetronomePlayButton from '$lib/device/metronome/MetronomePlayButton.svelte';

	const _metronome = getMetronomeContext();

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

	let fingerOnSelected: boolean = false;
	let fingerPositionsProcessing = $state<FingerPosition[]>([]);
	let fingersRegistered = $state<FingerInfo[]>([]);
	const fingers = $derived(
		fingerPositionsProcessing.map<FingerInfo>((position) => ({
			position,
			style: { color: 'gray' }
		}))
	);

	let noteOnSelected: boolean = false;
	let noteProcessing = $state<PianoRollNote | null>(null);
	let pitchHighlight = $state<number | 'mute' | null>(null);
	let notesRegistered = $state<PianoRollNote[]>([]);
	const notes = $derived(notesRegistered.concat(noteProcessing !== null ? [noteProcessing] : []));
	$inspect('notes in page: ', notesRegistered, noteProcessing, notes);

	function initializeState() {
		fingerPositionsProcessing = [];
		pitchHighlight = null;
		noteProcessing = null;
		noteOnSelected = false;
		fingerOnSelected = false;
	}

	function updateFingers(fingerPosition: FingerPosition) {
		const onCandidate = fingerPositionsProcessing.find(
			(pos) => pos.fret === fingerPosition.fret && pos.line === fingerPosition.line
		);

		if (noteOnSelected) {
			if (onCandidate) {
				fingerPositionsProcessing = [fingerPosition];
				registerNote();
				return;
			} else {
				initializeState();
			}
		}
		fingerPositionsProcessing = [fingerPosition];

		const pitch = getPitchFromFingerPosition(fingerPosition, practice.guitar.tuning);
		const pitchNumber = pitch ? numberingPitch(pitch) : 'mute';
		pitchHighlight = pitchNumber;
		fingerOnSelected = true;
	}

	function updateNotes(note: PianoRollNote) {
		noteProcessing = note;
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

		notesRegistered.push(noteProcessing!);
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
			<PianoRoll {notes} {pitchHighlight} onselect={updateNotes}></PianoRoll>
			<FingerBoard class="max-w-[100vw]" {fingers} onclick={updateFingers}></FingerBoard>
			<MetronomeBeats class="p-20" />
			<MetronomePlayButton class="h-20" />
		</div>
	</div>
</div>
