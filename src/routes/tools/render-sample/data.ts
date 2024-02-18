import type { Practice } from '$/lib/practice/types';
import { TUNE } from '$/utils/music/pitch';

const practices: Record<string, Practice> = {
	// root: {
	// 	tempo: {
	// 		bpm: 120,
	// 		beatPerBar: 6,
	// 		signatureUnit: 8
	// 	},
	// 	guitar: {
	// 		tuning: TUNE.standard,
	// 		fretRange: {
	// 			start: 0,
	// 			end: 12,
	// 			visibility: 'end'
	// 		}
	// 	},
	// 	scores: [
	// 		{
	// 			notes: [
	// 				{ position: { fret: 'open', line: 6 }, time: { start: 0, duration: 1 / 8 } },
	// 				{ position: { fret: 7, line: 5 }, time: { start: 1 / 8, duration: 1 / 8 } },
	// 				{ position: { fret: 2, line: 4 }, time: { start: 2 / 8, duration: 1 / 8 } },
	// 				{ position: { fret: 9, line: 3 }, time: { start: 3 / 8, duration: 1 / 8 } },
	// 				{ position: { fret: 5, line: 2 }, time: { start: 4 / 8, duration: 1 / 8 } },
	// 				{ position: { fret: 'open', line: 1 }, time: { start: 5 / 8, duration: 1 / 8 } }
	// 			],
	// 			boards: [
	// 				{
	// 					title: 'E',
	// 					fingers: [0, 1, 2, 3, 4, 5],
	// 					time: { start: 0 }
	// 				}
	// 			]
	// 		},
	// 		{
	// 			notes: [
	// 				{ position: { fret: 1, line: 6 }, time: { start: 0, duration: 1 / 8 } },
	// 				{ position: { fret: 8, line: 5 }, time: { start: 1 / 8, duration: 1 / 8 } },
	// 				{ position: { fret: 3, line: 4 }, time: { start: 2 / 8, duration: 1 / 8 } },
	// 				{ position: { fret: 10, line: 3 }, time: { start: 3 / 8, duration: 1 / 8 } },
	// 				{ position: { fret: 6, line: 2 }, time: { start: 4 / 8, duration: 1 / 8 } },
	// 				{ position: { fret: 1, line: 1 }, time: { start: 5 / 8, duration: 1 / 8 } }
	// 			],
	// 			boards: [
	// 				{
	// 					title: 'E',
	// 					fingers: [0, 1, 2, 3, 4, 5],
	// 					time: { start: 0, duration: 6 / 8 }
	// 				}
	// 			]
	// 		}
	// 	]
	// },
	'major-scale': {
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
};

export const practice: Practice = practices['major-scale'];

export const items = [
	{
		title: 'E',
		fingers: [
			{ position: { fret: 'open', line: 6 }, text: 'E' },
			{ position: { fret: 7, line: 5 }, text: 'E' },
			{ position: { fret: 2, line: 4 }, text: 'E' },
			{ position: { fret: 9, line: 3 }, text: 'E' },
			{ position: { fret: 5, line: 2 }, text: 'E' },
			{ position: { fret: 'open', line: 1 }, text: 'E' }
		]
	},
	{
		title: 'F',
		fingers: [
			{ position: { fret: 1, line: 6 } },
			{ position: { fret: 1, line: 1 } },
			{ position: { fret: 3, line: 4 } },
			{ position: { fret: 6, line: 2 } },
			{ position: { fret: 8, line: 5 } },
			{ position: { fret: 10, line: 3 } }
		]
	},
	{
		title: 'G',
		fingers: [
			{ position: { fret: 3, line: 6 } },
			{ position: { fret: 5, line: 4 } },
			{ position: { fret: 8, line: 2 } },
			{ position: { fret: 10, line: 5 } },
			{ position: { fret: 'open', line: 3 } },
			{ position: { fret: 3, line: 1 } }
		]
	},
	{
		title: 'A',
		fingers: [
			{ position: { fret: 5, line: 6 } },
			{ position: { fret: 7, line: 4 } },
			{ position: { fret: 10, line: 2 } },
			{ position: { fret: 'open', line: 5 } },
			{ position: { fret: 2, line: 3 } },
			{ position: { fret: 5, line: 1 } }
		]
	},
	{
		title: 'B',
		fingers: [
			{ position: { fret: 2, line: 5 } },
			{ position: { fret: 4, line: 3 } },
			{ position: { fret: 7, line: 1 } },
			{ position: { fret: 7, line: 6 } },
			{ position: { fret: 9, line: 4 } },
			{ position: { fret: 'open', line: 2 } }
		]
	},
	{
		title: 'C',
		fingers: [
			{ position: { fret: 3, line: 5 } },
			{ position: { fret: 5, line: 3 } },
			{ position: { fret: 8, line: 1 } },
			{ position: { fret: 8, line: 6 } },
			{ position: { fret: 10, line: 4 } },
			{ position: { fret: 1, line: 2 } }
		]
	},
	{
		title: 'D',
		fingers: [
			{ position: { fret: 'open', line: 4 } },
			{ position: { fret: 2, line: 2 } },
			{ position: { fret: 5, line: 5 } },
			{ position: { fret: 7, line: 3 } },
			{ position: { fret: 10, line: 1 } },
			{ position: { fret: 10, line: 6 } }
		]
	}
];
