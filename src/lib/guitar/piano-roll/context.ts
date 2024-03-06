import { getContext, setContext } from 'svelte';
import { derived, writable, type Readable, type Writable } from 'svelte/store';

export const PIANO_ROLL_KEY = 'pianoroll';

interface PianoRollBaseContext {
	noteFrameStart: number;
	noteWidth: number;
	noteHeight: number;
	pianoWidth: number;
	beatPerBar: number;
	signatureUnit: number;
	bpm: number;
	quantizingUnit: number;
}

interface PianoRollContext {
	noteFrameStart: Writable<number>;
	noteWidth: Writable<number>;
	noteHeight: Writable<number>;
	pianoWidth: Writable<number>;
	pianoHeight: Readable<number>;
	beatPerBar: Writable<number>;
	signatureUnit: Writable<number>;
	bpm: Writable<number>;
	quantizingUnit: Writable<number>;
}

export const setPianoRollContext = (context?: Partial<PianoRollContext>) => {
	const noteFrameStart = writable<number>(0);
	const noteWidth = writable<number>(40);
	const noteHeight = writable<number>(7);
	const pianoWidth = writable<number>(15);
	const pianoHeight = derived(noteHeight, ($h) => ($h * 12) / 7);
	const beatPerBar = writable<number>(4);
	const signatureUnit = writable<number>(4);
	const bpm = writable<number>(120);
	const quantizingUnit = writable<number>(0.25);
	return setContext<PianoRollContext>(PIANO_ROLL_KEY, {
		noteFrameStart,
		noteWidth,
		noteHeight,
		pianoWidth,
		pianoHeight,
		beatPerBar,
		signatureUnit,
		bpm,
		quantizingUnit
	});
};

export const getPianoRollContext = () => getContext<PianoRollContext>(PIANO_ROLL_KEY);
