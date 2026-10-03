import { expect, it } from 'vitest';
import { identifyChordsFromPitches } from '../../src/utils/music/chords';
import { getPitchFromNumber } from '../../src/utils/music/pitch';
it('identifies a C major triad with C in the bass', () => {
	const result = identifyChordsFromPitches(
		[48, 52, 55].map((number) => getPitchFromNumber(number))
	);
	expect(result?.bass).toBe(0);
	expect(result?.chords.some((chord) => chord.symbols.root === 0)).toBe(true);
});
