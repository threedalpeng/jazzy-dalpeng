import type { Practice } from '$/lib/practice/types';
import { TUNE } from '$/utils/music/pitch';

export interface PracticeRoute {
	title: string;
	slug: string;
	practice: Practice;
}

export type PracticeRouteCategory = 'core' | 'custom';
export interface PracticeRoutes extends Record<PracticeRouteCategory, PracticeRoute[]> {}

export const routes: PracticeRoutes = {
	core: [
		{
			title: 'Major Scale',
			slug: 'major-scale',
			practice: {
				tempo: {
					bpm: 120,
					beatPerBar: 4,
					signatureUnit: 4
				},
				guitar: {
					tuning: TUNE.standard
				},
				scores: [
					{
						positions: [
							{ line: 6, fret: 8 },
							{ line: 6, fret: 10 },
							{ line: 5, fret: 7 },
							{ line: 5, fret: 8 },
							{ line: 5, fret: 10 },
							{ line: 4, fret: 7 },
							{ line: 4, fret: 9 },
							{ line: 4, fret: 10 },
							{ line: 3, fret: 7 },
							{ line: 3, fret: 9 },
							{ line: 3, fret: 10 },
							{ line: 2, fret: 8 },
							{ line: 2, fret: 10 },
							{ line: 1, fret: 7 },
							{ line: 1, fret: 8 },
							{ line: 1, fret: 10 },
							{ line: 6, fret: 7 }
						],
						notes: [
							{ position: 0, time: { start: 0, duration: 0.0625 } },
							{ position: 1, time: { start: 0.0625, duration: 0.0625 } },
							{ position: 2, time: { start: 0.125, duration: 0.0625 } },
							{ position: 3, time: { start: 0.1875, duration: 0.0625 } },
							{ position: 4, time: { start: 0.25, duration: 0.0625 } },
							{ position: 5, time: { start: 0.3125, duration: 0.0625 } },
							{ position: 6, time: { start: 0.375, duration: 0.0625 } },
							{ position: 7, time: { start: 0.4375, duration: 0.0625 } },
							{ position: 8, time: { start: 0.5, duration: 0.0625 } },
							{ position: 9, time: { start: 0.5625, duration: 0.0625 } },
							{ position: 10, time: { start: 0.625, duration: 0.0625 } },
							{ position: 11, time: { start: 0.6875, duration: 0.0625 } },
							{ position: 12, time: { start: 0.75, duration: 0.0625 } },
							{ position: 13, time: { start: 0.8125, duration: 0.0625 } },
							{ position: 14, time: { start: 0.875, duration: 0.0625 } },
							{ position: 15, time: { start: 0.9375, duration: 0.0625 } },
							{ position: 14, time: { start: 1, duration: 0.0625 } },
							{ position: 13, time: { start: 1.0625, duration: 0.0625 } },
							{ position: 12, time: { start: 1.125, duration: 0.0625 } },
							{ position: 11, time: { start: 1.1875, duration: 0.0625 } },
							{ position: 10, time: { start: 1.25, duration: 0.0625 } },
							{ position: 9, time: { start: 1.3125, duration: 0.0625 } },
							{ position: 8, time: { start: 1.375, duration: 0.0625 } },
							{ position: 7, time: { start: 1.4375, duration: 0.0625 } },
							{ position: 6, time: { start: 1.5, duration: 0.0625 } },
							{ position: 5, time: { start: 1.5625, duration: 0.0625 } },
							{ position: 4, time: { start: 1.625, duration: 0.0625 } },
							{ position: 3, time: { start: 1.6875, duration: 0.0625 } },
							{ position: 2, time: { start: 1.75, duration: 0.0625 } },
							{ position: 1, time: { start: 1.8125, duration: 0.0625 } },
							{ position: 0, time: { start: 1.875, duration: 0.0625 } },
							{ position: 16, time: { start: 1.9375, duration: 0.0625 } },
							{ position: 0, time: { start: 2, duration: 0.0625 } }
						],
						boards: [
							{
								title: 'C line 1',
								fingers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
								time: { start: 0 }
							},
							{
								title: 'C line 2',
								fingers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
								time: { start: 15 / 16 }
							}
						],
						fretRange: {
							start: 5,
							end: 11,
							visibility: 'all'
						}
					}
				]
			}
		},
		{
			title: 'Rhythm Test',
			slug: 'rhythm-test',
			practice: {
				tempo: {
					bpm: 120,
					beatPerBar: 4,
					signatureUnit: 4
				},
				guitar: {
					tuning: TUNE.standard
				},
				scores: [
					{
						positions: [
							{ line: 5, fret: 3 },
							{ line: 6, fret: 3 },
							{ line: 1, fret: 'open' },
							{ line: 2, fret: 1 },
							{ line: 3, fret: 'open' }
						],
						notes: [
							{ position: 0, time: { start: 0, duration: 1 / 4 } },
							{ position: 2, time: { start: 1 / 4, duration: 1 / 4 } },
							{ position: 3, time: { start: 1 / 4, duration: 1 / 4 } },
							{ position: 4, time: { start: 1 / 4, duration: 1 / 4 } },
							{ position: 1, time: { start: 2 / 4, duration: 1 / 4 } },
							{ position: 2, time: { start: 3 / 4, duration: 1 / 4 } },
							{ position: 3, time: { start: 3 / 4, duration: 1 / 4 } },
							{ position: 4, time: { start: 3 / 4, duration: 1 / 4 } },
							{ position: 0, time: { start: 4 / 4, duration: 1 / 4 } },
							{ position: 2, time: { start: 5 / 4, duration: 1 / 4 } },
							{ position: 3, time: { start: 5 / 4, duration: 1 / 4 } },
							{ position: 4, time: { start: 5 / 4, duration: 1 / 4 } },
							{ position: 1, time: { start: 6 / 4, duration: 1 / 4 } },
							{ position: 2, time: { start: 7 / 4, duration: 1 / 4 } },
							{ position: 3, time: { start: 7 / 4, duration: 1 / 4 } },
							{ position: 4, time: { start: 7 / 4, duration: 1 / 4 } },
							{ position: 0, time: { start: 8 / 4, duration: 1 / 4 } },
							{ position: 2, time: { start: 9 / 4, duration: 1 / 4 } },
							{ position: 3, time: { start: 9 / 4, duration: 1 / 4 } },
							{ position: 4, time: { start: 9 / 4, duration: 1 / 4 } },
							{ position: 1, time: { start: 10 / 4, duration: 1 / 4 } },
							{ position: 2, time: { start: 11 / 4, duration: 1 / 4 } },
							{ position: 3, time: { start: 11 / 4, duration: 1 / 4 } },
							{ position: 4, time: { start: 11 / 4, duration: 1 / 4 } },
							{ position: 0, time: { start: 12 / 4, duration: 1 / 4 } },
							{ position: 2, time: { start: 13 / 4, duration: 1 / 4 } },
							{ position: 3, time: { start: 13 / 4, duration: 1 / 4 } },
							{ position: 4, time: { start: 13 / 4, duration: 1 / 4 } },
							{ position: 1, time: { start: 14 / 4, duration: 1 / 4 } },
							{ position: 2, time: { start: 15 / 4, duration: 1 / 4 } },
							{ position: 3, time: { start: 15 / 4, duration: 1 / 4 } },
							{ position: 4, time: { start: 15 / 4, duration: 1 / 4 } }
						],
						boards: [
							{
								title: 'C line 1',
								fingers: [0, 2, 3, 4],
								time: { start: 0 }
							},
							{
								title: 'C line 1',
								fingers: [1, 2, 3, 4],
								time: { start: 1 / 2 }
							},
							{
								title: 'C line 1',
								fingers: [0, 2, 3, 4],
								time: { start: 2 / 2 }
							},
							{
								title: 'C line 1',
								fingers: [1, 2, 3, 4],
								time: { start: 3 / 2 }
							},
							{
								title: 'C line 1',
								fingers: [0, 2, 3, 4],
								time: { start: 4 / 2 }
							},
							{
								title: 'C line 1',
								fingers: [1, 2, 3, 4],
								time: { start: 5 / 2 }
							},
							{
								title: 'C line 1',
								fingers: [0, 2, 3, 4],
								time: { start: 6 / 2 }
							},
							{
								title: 'C line 1',
								fingers: [1, 2, 3, 4],
								time: { start: 7 / 2 }
							}
						],
						fretRange: {
							start: 0,
							end: 12,
							visibility: 'all'
						}
					}
				]
			}
		}
	],
	custom: []
};
