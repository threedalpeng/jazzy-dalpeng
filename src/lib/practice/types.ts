import type { FingerPosition, FretRangeOption } from '$/lib/guitar/finger-board/FingerBoard.svelte';
import { type TuneInfo } from '$/utils/music/pitch';

export interface Tempo {
	bpm: number;
	beatPerBar: number;
	signatureUnit: number;
}
export interface ScoreTimestamp {
	start: number;
	duration?: number;
}

export interface PracticeNote {
	position: number;
	time: ScoreTimestamp;
}
export interface PracticeBoard {
	title?: string;
	fingers: number[];
	time: ScoreTimestamp;
}
export interface PracticeScore {
	positions: FingerPosition[];
	notes: PracticeNote[];
	boards: PracticeBoard[];
	fretRange: FretRangeOption;
}

export interface Practice {
	tempo: Tempo;
	guitar: {
		tuning: TuneInfo;
	};
	scores: PracticeScore[];
}
