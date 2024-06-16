import type { ChordExtension, ChordQuality, ChordRoot } from '$/utils/music/chords';
import type { finaleJazzChordCharacterMap } from '$/utils/music/font';

export const chordRootToFinaleJazzChordSignMap: Record<
	ChordRoot,
	(keyof typeof finaleJazzChordCharacterMap)[]
> = {
	C: ['C'],
	'C#': ['C', 'Sharp'],
	Db: ['D', 'Flat'],
	D: ['D'],
	'D#': ['D', 'Sharp'],
	Eb: ['E', 'Flat'],
	E: ['E'],
	F: ['F'],
	'F#': ['F', 'Sharp'],
	Gb: ['G', 'Flat'],
	G: ['G'],
	'G#': ['G', 'Sharp'],
	Ab: ['A', 'Flat'],
	A: ['A'],
	'A#': ['A', 'Sharp'],
	Bb: ['B', 'Flat'],
	B: ['B']
};

export const chordExtensionToFinaleJazzChordSignMap: Record<
	ChordExtension,
	(keyof typeof finaleJazzChordCharacterMap)[]
> = {
	'5': ['5'],
	'6': ['6'],
	'6/9': ['6/9'],
	dim7: ['7'],
	maj7: ['Major', '7'],
	'7, maj7': ['7', 'Major', '7'],
	'7': ['7'],
	b6: ['Flat', '6']
};

export const chordQualityToFinaleJazzChordSignMap: Record<
	ChordQuality,
	keyof typeof finaleJazzChordCharacterMap
> = {
	major: 'Major',
	minor: 'Minor',
	aug: 'Augmented',
	dim: 'Diminished',
	'half-dim': 'HalfDiminished',
	sus2: 'SuspendedSecond',
	sus4: 'SuspendedFourth'
};

export const chordTensionToFinaleJazzChordSignMap: Record<
	number,
	(keyof typeof finaleJazzChordCharacterMap)[]
> = {
	13: ['9'],
	14: ['9'],
	15: ['9'],
	17: ['11'],
	18: ['11'],
	20: ['13'],
	21: ['13']
};
