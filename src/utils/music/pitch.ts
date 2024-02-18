import type { FingerPosition } from '$/lib/guitar/finger-board/FingerBoard.svelte';

export type NoteSignName = 'sharp' | 'flat' | 'natural';
export type PitchNote =
	| 'C'
	| 'C#'
	| 'Db'
	| 'D'
	| 'D#'
	| 'Eb'
	| 'E'
	| 'F'
	| 'F#'
	| 'Gb'
	| 'G'
	| 'G#'
	| 'Ab'
	| 'A'
	| 'A#'
	| 'Bb'
	| 'B';
export const pitchNoteIndexMap: Record<PitchNote, number> = {
	C: 0,
	'C#': 1,
	Db: 1,
	D: 2,
	'D#': 3,
	Eb: 3,
	E: 4,
	F: 5,
	'F#': 6,
	Gb: 6,
	G: 7,
	'G#': 8,
	Ab: 8,
	A: 9,
	'A#': 10,
	Bb: 10,
	B: 11
};
export const pitchNoteIndexReverseMap: {
	flat: Record<number, PitchNote>;
	sharp: Record<number, PitchNote>;
} = {
	flat: {
		0: 'C',
		1: 'Db',
		2: 'D',
		3: 'Eb',
		4: 'E',
		5: 'F',
		6: 'Gb',
		7: 'G',
		8: 'Ab',
		9: 'A',
		10: 'Bb',
		11: 'B'
	},
	sharp: {
		0: 'C',
		1: 'C#',
		2: 'D',
		3: 'D#',
		4: 'E',
		5: 'F',
		6: 'F#',
		7: 'G',
		8: 'G#',
		9: 'A',
		10: 'A#',
		11: 'B'
	}
};

export interface Pitch {
	note: PitchNote;
	octave: number;
}

export interface TuneInfo {
	[line: number]: Pitch;
}

type TuneKey = 'standard';
export const TUNE: Record<TuneKey, TuneInfo> = {
	standard: {
		1: { note: 'E', octave: 4 },
		2: { note: 'B', octave: 3 },
		3: { note: 'G', octave: 3 },
		4: { note: 'D', octave: 3 },
		5: { note: 'A', octave: 2 },
		6: { note: 'E', octave: 2 }
	}
};

export function getNoteSign(pitchNote: PitchNote): NoteSignName {
	const last = pitchNote.at(-1);
	if (last === 'b') {
		return 'flat';
	} else if (last === '#') {
		return 'sharp';
	} else {
		return 'natural';
	}
}

export function numberingPitch(pitch: Pitch): number {
	const index = pitchNoteIndexMap[pitch.note];
	return index + pitch.octave * 12;
}
export function getPitchFromNumber(i: number, sign: 'flat' | 'sharp' = 'sharp'): Pitch {
	const octave = Math.floor(i / 12);
	const index = i - octave * 12;
	return { note: pitchNoteIndexReverseMap[sign][index], octave };
}

export function pitchUp(pitch: Pitch, value: number, sign?: 'flat' | 'sharp'): Pitch {
	const pitchNumber = numberingPitch(pitch) + value;
	const noteSign = getNoteSign(pitch.note);
	const newNoteSign = sign === undefined ? (noteSign === 'natural' ? 'sharp' : noteSign) : sign;
	return getPitchFromNumber(pitchNumber, newNoteSign);
}

export function pitchDown(pitch: Pitch, value: number) {
	return pitchUp(pitch, -value);
}

export function getPitchFromFingerPosition(
	position: FingerPosition,
	tune: TuneInfo = TUNE.standard
) {
	if (position.fret === 'mute') return null;
	const fretNum = position.fret === 'open' ? 0 : position.fret;
	const currentLineTune = tune[position.line];
	return getPitchFromNumber(numberingPitch(currentLineTune) + fretNum);
}

export function getPitchesFromFingerPositions(
	positions: FingerPosition[],
	tune: TuneInfo = TUNE.standard
): Pitch[] {
	return positions
		.map((pos) => getPitchFromFingerPosition(pos, tune))
		.filter((pitch): pitch is Pitch => pitch !== null);
}

export function sortPitches(pitches: Pitch[]) {
	return pitches
		.map((p) => numberingPitch(p))
		.toSorted()
		.map((n) => getPitchFromNumber(n));
}
