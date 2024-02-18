import { TUNE } from '$/utils/music/pitch';

export const practice = {
	tempo: {
		bpm: 120,
		beatPerBar: 6,
		signatureUnit: 8
	},
	guitar: {
		tuning: TUNE.standard
	},
	scores: [
		{
			notes: [
				{ position: { fret: 'open', line: 6 }, time: { start: 0, duration: 1 / 8 } },
				{ position: { fret: 7, line: 5 }, time: { start: 1 / 8, duration: 1 / 8 } },
				{ position: { fret: 2, line: 4 }, time: { start: 2 / 8, duration: 1 / 8 } },
				{ position: { fret: 9, line: 3 }, time: { start: 3 / 8, duration: 1 / 8 } },
				{ position: { fret: 5, line: 2 }, time: { start: 4 / 8, duration: 1 / 8 } },
				{ position: { fret: 'open', line: 1 }, time: { start: 5 / 8, duration: 1 / 8 } }
			],
			boards: [
				{
					title: 'E',
					fingers: [0, 1, 2, 3, 4, 5],
					time: { start: 0 }
				}
			]
		},
		{
			notes: [
				{ position: { fret: 1, line: 6 }, time: { start: 0, duration: 1 / 8 } },
				{ position: { fret: 8, line: 5 }, time: { start: 1 / 8, duration: 1 / 8 } },
				{ position: { fret: 3, line: 4 }, time: { start: 2 / 8, duration: 1 / 8 } },
				{ position: { fret: 10, line: 3 }, time: { start: 3 / 8, duration: 1 / 8 } },
				{ position: { fret: 6, line: 2 }, time: { start: 4 / 8, duration: 1 / 8 } },
				{ position: { fret: 1, line: 1 }, time: { start: 5 / 8, duration: 1 / 8 } }
			],
			boards: [
				{
					title: 'E',
					fingers: [0, 1, 2, 3, 4, 5],
					time: { start: 0, duration: 6 / 8 }
				}
			]
		}
	]
};

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
