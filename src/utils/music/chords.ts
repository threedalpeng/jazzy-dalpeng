import { numberingPitch, type Pitch, type PitchNote } from './pitch';

export type ChordRoot = PitchNote;
export type ChordBass = PitchNote;
export type ChordQuality = 'major' | 'minor' | 'sus2' | 'sus4' | 'dim' | 'aug' | 'half-dim';
export type ChordExtension = '5' | 'b6' | '6' | 'dim7' | '7' | 'maj7' | '7, maj7' | '6/9';

export type ChordName =
	| 'dominantSeventh'
	| 'majorSeventh'
	| 'minorSeventh'
	| 'halfDiminishedSeventh'
	| 'diminishedSeventh'
	| 'none';

export function identifyChordsFromPitches(pitches: Pitch[]) {
	if (pitches.length === 0) {
		return null;
	}
	const sortedPitchNumber = pitches.map((pitch) => numberingPitch(pitch)).toSorted();
	const bass = sortedPitchNumber[0];
	const bassNumber = ((bass % 12) + 12) % 12;

	const identifiedChords = [];

	const numberedNotes = [
		...new Set(pitches.map((pitch) => ((numberingPitch(pitch) % 12) + 12) % 12))
	].toSorted();
	console.log(numberedNotes);
	for (const root of numberedNotes) {
		const intervals = new Set(
			numberedNotes.map((n) => (n >= root ? n - root : n - root + 12)).filter((n) => n !== 0)
		);
		console.log([...intervals]);
		identifiedChords.push(identifyChordFromIntervals(bassNumber, root, intervals));
	}
	return { chords: identifiedChords, bass: bass };
}

function identifyChordFromIntervals(bass: number, root: number, intervals: Set<number>) {
	const bassInterval = bass >= root ? bass - root : bass - root + 12;
	/**
	 * chord tones
	 * - third: only one, else will be tensions
	 * - fifth: only one, else will be tensions
	 * - seventh: only one (but might be duplicated in worst case),
	 *            6th can be tensions but 7th cannot.
	 * - tensions: others
	 */
	let third: null | 2 | 3 | 4 | 5 = null;
	let fifth: null | 6 | 7 | 8 = null;
	let seventh: null | 8 | 9 | 10 | 11 | -1 = null;
	const tensions = new Set<13 | 14 | 15 | 17 | 18 | 20 | 21>();

	// b2 to b9
	if (intervals.has(1)) {
		intervals.delete(1);
		tensions.add(13);
	}

	// find 3rd
	const thirdPriority: (2 | 3 | 4 | 5)[] = [4, 3, 5, 2];
	for (const [i, p] of thirdPriority.entries()) {
		if (intervals.has(p)) {
			intervals.delete(p);
			third = p;
			for (let j = i + 1; j < thirdPriority.length; j++) {
				const q = thirdPriority[j];
				if (intervals.has(q)) {
					intervals.delete(q);
					tensions.add((q + 12) as 14 | 15 | 17);
				}
			}
			break;
		}
	}

	// now we found 3rd! it's very critical to determine its quality
	if (third !== bassInterval) {
		console.log(third, bassInterval);
		intervals.delete(bassInterval);
		intervals.delete(bassInterval + 12);
	}

	// find exact 5th
	if (intervals.has(7)) {
		intervals.delete(7);
		fifth = 7;
		if (intervals.has(6)) {
			intervals.delete(6);
			tensions.add(18);
		}
		if (intervals.has(8)) {
			intervals.delete(8);
			tensions.add(20);
		}
	}

	// find 7th, excluding 6th
	if (intervals.has(10)) {
		intervals.delete(10);
		seventh = 10;
		if (intervals.has(11)) {
			intervals.delete(11);
			seventh = -1;
		}
	} else if (intervals.has(11)) {
		seventh = 11;
		intervals.delete(11);
	}
	// mark base chord
	let quality: ChordQuality = 'major';
	let extension: null | ChordExtension = null;
	switch (third) {
		case 2: // sus2
			quality = 'sus2';
			switch (seventh) {
				case 10: // dominant 7th
					extension = '7';
					[6, 8, 9].forEach((n) => {
						if (intervals.has(n)) {
							intervals.delete(n);
							tensions.add((n + 12) as 18 | 20 | 21);
						}
					});
					break;
				case 11: // major 7th
					extension = 'maj7';
					[6, 8, 9].forEach((n) => {
						if (intervals.has(n)) {
							intervals.delete(n);
							tensions.add((n + 12) as 18 | 20 | 21);
						}
					});
					break;
				case -1: // sadly duplicated 7th
					extension = '7, maj7';
					[6, 8, 9].forEach((n) => {
						if (intervals.has(n)) {
							intervals.delete(n);
							tensions.add((n + 12) as 18 | 20 | 21);
						}
					});
					break;
				default: // extension: b6, 6(dim7), or empty
					if (intervals.has(9)) {
						// 6
						intervals.delete(9);
						seventh = 9;
						extension = '6';
						if (intervals.has(8)) {
							// b6 -> b13
							intervals.delete(8);
							tensions.add(20);
						}
						if (tensions.has(14)) {
							extension = '6/9';
							tensions.delete(14);
						}
					} else if (intervals.has(8)) {
						// b6
						intervals.delete(8);
						seventh = 8;
						extension = 'b6';
					}
					break;
			}
			break;
		case 3: // minor 3rd
			quality = 'minor';
			switch (seventh) {
				case 10: // dominant 7th
					extension = '7';
					if (intervals.has(6)) {
						// b5 -> half-diminished
						intervals.delete(6);
						quality = 'half-dim';
						fifth = 6;
					}
					if (intervals.has(8)) {
						// #5 -> b13
						intervals.delete(8);
						tensions.add(20);
					}
					break;
				case 11: // major 7th
					extension = 'maj7';
					if (intervals.has(8)) {
						// #5 -> hmm, it's strange m#5
						intervals.delete(8);
						fifth = 8;
					}
					if (intervals.has(6)) {
						// b5 -> #11
						intervals.delete(6);
						tensions.add(18);
					}
					break;
				case -1: // sadly duplicated 7th
					extension = '7, maj7';
					if (intervals.has(6)) {
						// b5 -> #11
						intervals.delete(6);
						tensions.add(18);
					}
					if (intervals.has(8)) {
						// #5 -> b13
						intervals.delete(8);
						tensions.add(20);
					}
					break;
				default: // extension: b6, 6(dim7), or empty
					// check diminished first
					if (intervals.has(6)) {
						// b5 -> diminished
						intervals.delete(6);
						quality = 'dim';
						if (intervals.has(9)) {
							// 6 -> dim7
							intervals.delete(9);
							seventh = 9;
							extension = 'dim7';
							if (intervals.has(8)) {
								// b6 -> b13
								intervals.delete(8);
								tensions.add(20);
							}
						} else if (intervals.has(8)) {
							// b6
							intervals.delete(8);
							seventh = 8;
							extension = 'b6';
						}
					}
					// else becomes minor
					else {
						if (intervals.has(9)) {
							// 6
							intervals.delete(9);
							seventh = 9;
							extension = '6';
							if (intervals.has(8)) {
								// b6 -> b13
								intervals.delete(8);
								tensions.add(20);
							}
							if (tensions.has(14)) {
								extension = '6/9';
								tensions.delete(14);
							}
						} else if (intervals.has(8)) {
							// b6
							intervals.delete(8);
							seventh = 8;
							extension = 'b6';
						}
					}
					break;
			}
			break;
		case 4: // major 3rd
			quality = 'major';
			switch (seventh) {
				case 10: // dominant 7th
					extension = '7';
					[6, 8, 9].forEach((n) => {
						if (intervals.has(n)) {
							intervals.delete(n);
							tensions.add((n + 12) as 18 | 20 | 21);
						}
					});
					break;
				case 11: // major 7th
					extension = 'maj7';
					if (intervals.has(8)) {
						// #5 -> hmm, it's strange m#5
						intervals.delete(8);
						fifth = 8;
					}
					[6, 9].forEach((n) => {
						if (intervals.has(n)) {
							intervals.delete(n);
							tensions.add((n + 12) as 18 | 20 | 21);
						}
					});
					break;
				case -1: // sadly duplicated 7th
					extension = '7, maj7';
					[6, 8, 9].forEach((n) => {
						if (intervals.has(n)) {
							intervals.delete(n);
							tensions.add((n + 12) as 18 | 20 | 21);
						}
					});
					break;
				default: // extension: b6, 6(dim7), or empty
					if (intervals.has(9)) {
						// 6
						intervals.delete(9);
						seventh = 9;
						extension = '6';
						if (intervals.has(8)) {
							// b6 -> b13
							intervals.delete(8);
							tensions.add(20);
						}
						if (tensions.has(14)) {
							extension = '6/9';
							tensions.delete(14);
						}
					} else if (intervals.has(8)) {
						// b6
						intervals.delete(8);
						seventh = 8;
						extension = 'b6';
					}
					break;
			}
			break;
		case 5: // sus4
			quality = 'sus4';
			console.log('seventh:', seventh, fifth);
			switch (seventh) {
				case 10: // dominant 7th
					extension = '7';
					[6, 8, 9].forEach((n) => {
						if (intervals.has(n)) {
							intervals.delete(n);
							tensions.add((n + 12) as 18 | 20 | 21);
						}
					});
					break;
				case 11: // major 7th
					extension = 'maj7';
					[6, 8, 9].forEach((n) => {
						if (intervals.has(n)) {
							intervals.delete(n);
							tensions.add((n + 12) as 18 | 20 | 21);
						}
					});
					break;
				case -1: // sadly duplicated 7th
					extension = '7, maj7';
					[6, 8, 9].forEach((n) => {
						if (intervals.has(n)) {
							intervals.delete(n);
							tensions.add((n + 12) as 18 | 20 | 21);
						}
					});
					break;
				default: // extension: b6, 6, or empty
					if (intervals.has(9)) {
						// 6
						intervals.delete(9);
						seventh = 9;
						extension = '6';
						if (tensions.has(14)) {
							extension = '6/9';
							tensions.delete(14);
						}
						if (intervals.has(8)) {
							intervals.delete(8);
							tensions.add(20);
						}
					} else if (intervals.has(8)) {
						// #5 -> b6
						intervals.delete(8);
						seventh = 8;
						extension = 'b6';
					}
					break;
			}
			break;
		default:
			switch (seventh) {
				case 10: // dominant 7th
					extension = '7';
					[6, 8, 9].forEach((n) => {
						if (intervals.has(n)) {
							intervals.delete(n);
							tensions.add((n + 12) as 18 | 20 | 21);
						}
					});
					break;
				case 11: // major 7th
					extension = 'maj7';
					[6, 8, 9].forEach((n) => {
						if (intervals.has(n)) {
							intervals.delete(n);
							tensions.add((n + 12) as 18 | 20 | 21);
						}
					});
					break;
				case -1: // sadly duplicated 7th
					extension = '7, maj7';
					[6, 8, 9].forEach((n) => {
						if (intervals.has(n)) {
							intervals.delete(n);
							tensions.add((n + 12) as 18 | 20 | 21);
						}
					});
					break;
				default: // extension: b6, 6, or empty
					if (intervals.has(8)) {
						// #5 -> augmented
						intervals.delete(8);
						fifth = 8;
						quality = 'aug';
					} else if (intervals.has(9)) {
						// 6
						intervals.delete(9);
						seventh = 9;
						extension = '6';
					}
					if (fifth === 7 && intervals.size === 0) {
						extension = '5';
					}
					break;
			}
			break;
	}
	return {
		tones: {
			third,
			fifth,
			seventh,
			tensions: [...tensions]
		},
		symbols: {
			root,
			quality,
			extension
		}
	};
}
