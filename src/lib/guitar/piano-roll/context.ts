import type { ReadableProperties, WritableProperties } from '$/utils/types';
import { getContext, setContext } from 'svelte';
import { derived, writable } from 'svelte/store';

export const PIANO_ROLL_KEY = 'pianoroll';

export interface PianoRollBaseContext {
	timeGridlineHeight: number;
	noteFrameStart: number;
	noteWidth: number;
	noteHeight: number;
	pianoWidth: number;
	pitchStart: number;
	pitchEnd: number;
	beatPerBar: number;
	signatureUnit: number;
	bpm: number;
	quantizingUnit: number;
}
interface PianoRollDerivedContext {
	pianoHeight: number;
	toNote: (offsetX: number) => number;
	toCanvasOffsetX: (note: number) => number;
	toPitch: (offsetY: number) => number | 'mute';
	toCanvasOffsetY: (pitch: number | 'mute') => number;
}

export type PianoRollContext = WritableProperties<PianoRollBaseContext> &
	ReadableProperties<PianoRollDerivedContext>;

export const setPianoRollContext = (context?: Partial<PianoRollBaseContext>) => {
	const timeGridlineHeight = writable<number>(context?.timeGridlineHeight ?? 20);
	const noteFrameStart = writable<number>(context?.noteFrameStart ?? 0);
	const noteWidth = writable<number>(context?.noteWidth ?? 40);
	const noteHeight = writable<number>(context?.noteHeight ?? 7);
	const pianoWidth = writable<number>(context?.pianoWidth ?? 28);
	const pianoHeight = derived(noteHeight, ($h) => ($h * 12) / 7);
	const pitchStart = writable<number>(context?.pitchStart ?? 40);
	const pitchEnd = writable<number>(context?.pitchEnd ?? 84);
	const beatPerBar = writable<number>(context?.beatPerBar ?? 4);
	const signatureUnit = writable<number>(context?.signatureUnit ?? 4);
	const bpm = writable<number>(context?.bpm ?? 120);
	const quantizingUnit = writable<number>(context?.quantizingUnit ?? 0.25);
	const toNote = derived(
		[noteWidth, noteFrameStart, pianoWidth],
		([$noteWidth, $noteFrameStart, $pianoWidth]) =>
			(offsetX: number) =>
				(offsetX - $pianoWidth) / $noteWidth + $noteFrameStart
	);
	const toCanvasOffsetX = derived(
		[noteWidth, noteFrameStart, pianoWidth],
		([$noteWidth, $noteFrameStart, $pianoWidth]) =>
			(note: number) =>
				(note - $noteFrameStart) * $noteWidth + $pianoWidth
	);
	const toPitch = derived(
		[noteHeight, pitchStart, pitchEnd],
		([$noteHeight, $pitchStart, $pitchEnd]) =>
			(offsetY: number) => {
				const pitch = $pitchEnd - offsetY / $noteHeight;
				return pitch === $pitchStart - 2 ? 'mute' : pitch;
			}
	);
	const toCanvasOffsetY = derived(
		[noteHeight, pitchStart, pitchEnd],
		([$noteHeight, $pitchStart, $pitchEnd]) =>
			(pitch: number | 'mute') =>
				($pitchEnd - (pitch === 'mute' ? $pitchStart - 2 : pitch)) * $noteHeight
	);

	return setContext<PianoRollContext>(PIANO_ROLL_KEY, {
		timeGridlineHeight,
		noteFrameStart,
		noteWidth,
		noteHeight,
		pianoWidth,
		pianoHeight,
		pitchStart,
		pitchEnd,
		beatPerBar,
		signatureUnit,
		bpm,
		quantizingUnit,
		toNote,
		toCanvasOffsetX,
		toPitch,
		toCanvasOffsetY
	});
};

export const getPianoRollContext = () => getContext<PianoRollContext>(PIANO_ROLL_KEY);
