import type { FingerPosition } from '#lib/guitar/finger-board/FingerBoard.svelte';

export const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11] as const;
export const KEYS = [
	{ name: 'C', pitch: 0, notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
	{ name: 'Db', pitch: 1, notes: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'] },
	{ name: 'D', pitch: 2, notes: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'] },
	{ name: 'Eb', pitch: 3, notes: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'] },
	{ name: 'E', pitch: 4, notes: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'] },
	{ name: 'F', pitch: 5, notes: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'] },
	{ name: 'F#', pitch: 6, notes: ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'] },
	{ name: 'G', pitch: 7, notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'] },
	{ name: 'Ab', pitch: 8, notes: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'] },
	{ name: 'A', pitch: 9, notes: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'] },
	{ name: 'Bb', pitch: 10, notes: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'] },
	{ name: 'B', pitch: 11, notes: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'] }
] as const;
export const OPEN_MIDI = [64, 59, 55, 50, 45, 40] as const;
export interface ScalePosition {
	position: FingerPosition & { fret: number };
	midi: number;
	degree: number;
	note: string;
	id: string;
}
export function midiAt(position: FingerPosition) {
	if (position.fret === 'mute') return null;
	return OPEN_MIDI[position.line - 1] + (position.fret === 'open' ? 0 : position.fret);
}
export function scalePositions(keyIndex: number, start: number, end: number): ScalePosition[] {
	const key = KEYS[keyIndex];
	const result: ScalePosition[] = [];
	for (let line = 6; line >= 1; line--) {
		for (let fret = start + 1; fret <= end; fret++) {
			const midi = OPEN_MIDI[line - 1] + fret;
			const degree =
				MAJOR_INTERVALS.findIndex((interval) => (midi - key.pitch + 120) % 12 === interval) + 1;
			if (degree)
				result.push({
					position: { line, fret },
					midi,
					degree,
					note: key.notes[degree - 1],
					id: `${line}:${fret}`
				});
		}
	}
	return result;
}
export function scaleSequence(positions: ScalePosition[], direction: 'up' | 'down' | 'both') {
	const sorted = [...positions].sort(
		(a, b) => a.midi - b.midi || b.position.line - a.position.line
	);
	const unique = sorted.filter((p, i) => i === 0 || p.midi !== sorted[i - 1].midi);
	const firstRoot = unique.findIndex((p) => p.degree === 1);
	if (firstRoot < 0) return [];
	const octave = unique.slice(firstRoot).filter((p) => p.midi <= unique[firstRoot].midi + 12);
	if (octave.length !== 8) return [];
	return direction === 'down'
		? octave.toReversed()
		: direction === 'both'
			? [...octave, ...octave.slice(0, -1).toReversed()]
			: octave;
}
export const RECORD_KEY = 'jazzy-dalpeng.learning.v1';
export interface LearningRecord {
	version: 1;
	key: number;
	range: number;
	bpm: number;
	stage: number;
	answers: number[];
	assisted: boolean;
	assessment: string;
	triad: number[];
	complete: boolean;
	updated: string;
}
export function parseRecord(raw: string | null): LearningRecord | null {
	try {
		if (!raw) return null;
		const r = JSON.parse(raw);
		if (
			r.version !== 1 ||
			!Number.isInteger(r.key) ||
			r.key < 0 ||
			r.key >= KEYS.length ||
			![0, 4, 8, 12].includes(r.range) ||
			!Number.isInteger(r.bpm) ||
			r.bpm < 40 ||
			r.bpm > 160 ||
			!Number.isInteger(r.stage) ||
			r.stage < 0 ||
			r.stage > 3 ||
			!Array.isArray(r.answers) ||
			r.answers.some((v: unknown) => typeof v !== 'number' || ![2, 3, 5].includes(v)) ||
			!Array.isArray(r.triad) ||
			r.triad.some((v: unknown) => typeof v !== 'number' || ![1, 3, 5].includes(v)) ||
			!['', '아직 어려움', '천천히 가능', '편하게 가능'].includes(r.assessment) ||
			typeof r.assisted !== 'boolean' ||
			typeof r.complete !== 'boolean' ||
			typeof r.updated !== 'string'
		)
			return null;
		return r as LearningRecord;
	} catch {
		return null;
	}
}
