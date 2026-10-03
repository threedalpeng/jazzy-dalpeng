import { describe, expect, it } from 'vitest';
import {
	KEYS,
	MAJOR_INTERVALS,
	OPEN_MIDI,
	midiAt,
	parseRecord,
	scalePositions,
	scaleSequence
} from '../../src/lib/learning/major-scale';

describe('guitar learning domain', () => {
	it('uses actual standard-tuning MIDI values across six strings', () => {
		expect(OPEN_MIDI).toEqual([64, 59, 55, 50, 45, 40]);
		expect(midiAt({ line: 6, fret: 8 })).toBe(48);
		expect(midiAt({ line: 1, fret: 'open' })).toBe(64);
		expect(midiAt({ line: 3, fret: 'mute' })).toBeNull();
	});
	it('spells each major scale by letter, including E sharp in F sharp', () => {
		expect(KEYS[6].notes).toEqual(['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#']);
		for (let key = 0; key < 12; key++)
			for (const position of scalePositions(key, 4, 9)) {
				expect((position.midi - KEYS[key].pitch + 120) % 12).toBe(
					MAJOR_INTERVALS[position.degree - 1]
				);
				expect(position.note).toBe(KEYS[key].notes[position.degree - 1]);
			}
	});
	it('creates a root-to-octave sequence for every supported key and range', () => {
		for (let key = 0; key < 12; key++)
			for (const range of [0, 4, 8, 12]) {
				const positions = scalePositions(key, range, range + 5);
				const up = scaleSequence(positions, 'up');
				expect(up.map((p) => p.degree)).toEqual([1, 2, 3, 4, 5, 6, 7, 1]);
				expect(up.map((p) => p.midi - up[0].midi)).toEqual([...MAJOR_INTERVALS, 12]);
				expect(scaleSequence(positions, 'down')).toEqual(up.toReversed());
				expect(scaleSequence(positions, 'both')).toHaveLength(15);
			}
	});
	it('rejects damaged or unsupported local progress', () => {
		expect(parseRecord('{')).toBeNull();
		expect(parseRecord('{"version":2}')).toBeNull();
		const record = {
			version: 1,
			key: 0,
			range: 4,
			bpm: 72,
			stage: 1,
			answers: [2],
			assisted: false,
			assessment: '',
			triad: [],
			complete: false,
			updated: '2026-10-03'
		};
		expect(parseRecord(JSON.stringify(record))).toEqual(record);
		expect(parseRecord(JSON.stringify({ ...record, key: 12 }))).toBeNull();
		expect(parseRecord(JSON.stringify({ ...record, bpm: null }))).toBeNull();
	});
});
