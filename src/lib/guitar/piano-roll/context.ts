import type { ReadableProperties, WritableProperties } from '$/utils/types';
import { getContext, setContext } from 'svelte';
import { derived, writable } from 'svelte/store';

export const PIANO_ROLL_KEY = 'pianoroll';

interface PianoRollBaseContext {
	timeGridlineHeight: number;
	noteFrameStart: number;
	noteWidth: number;
	noteHeight: number;
	pianoWidth: number;
	beatPerBar: number;
	signatureUnit: number;
	bpm: number;
	quantizingUnit: number;
}
interface PianoRollDerivedContext {
	pianoHeight: number;
}

type PianoRollContext = WritableProperties<PianoRollBaseContext> &
	ReadableProperties<PianoRollDerivedContext>;

export const setPianoRollContext = (context?: Partial<PianoRollBaseContext>) => {
	const timeGridlineHeight = writable<number>(context?.timeGridlineHeight ?? 20);
	const noteFrameStart = writable<number>(context?.noteFrameStart ?? 0);
	const noteWidth = writable<number>(context?.noteWidth ?? 40);
	const noteHeight = writable<number>(context?.noteHeight ?? 7);
	const pianoWidth = writable<number>(context?.pianoWidth ?? 28);
	const pianoHeight = derived(noteHeight, ($h) => ($h * 12) / 7);
	const beatPerBar = writable<number>(context?.beatPerBar ?? 4);
	const signatureUnit = writable<number>(context?.signatureUnit ?? 4);
	const bpm = writable<number>(context?.bpm ?? 120);
	const quantizingUnit = writable<number>(context?.quantizingUnit ?? 0.25);
	return setContext<PianoRollContext>(PIANO_ROLL_KEY, {
		timeGridlineHeight,
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
