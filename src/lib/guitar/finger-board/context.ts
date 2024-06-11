import { getContext, setContext } from 'svelte';

interface FingerBoardState {
	FRET_START: number;
	FRET_GAP: number;
	FRET_WIDTH: number;
	FRET_MAX: number;
	STRING_START: number;
	STRING_GAP: number;
	STRING_WIDTH: number;
	FINGER_RADIUS: number;
	INLAY_RADIUS: number;
	INLAY_STROKE_STYLE: string;
	INLAY_FILL_STYLE: string;
}
interface FingerBoardContext extends FingerBoardState {
	getXFromFretNumber: (fret: number) => number;
	getYFromStringNumber: (string: number) => number;
}

export const createFingerBoardState = (state?: Partial<FingerBoardState>) => {
	return {
		FRET_START: 30,
		FRET_GAP: 50,
		FRET_WIDTH: 4,
		FRET_MAX: 24,
		STRING_START: 30,
		STRING_GAP: 30,
		STRING_WIDTH: 1,
		FINGER_RADIUS: 7,
		INLAY_RADIUS: 3,
		INLAY_STROKE_STYLE: '#555',
		INLAY_FILL_STYLE: '#eee',
		...state
	} as FingerBoardState;
};

export const setFingerBoardContext = (state?: Partial<FingerBoardState>) => {
	const contextState = createFingerBoardState(state);
	return setContext<FingerBoardContext>('fingerboard', {
		...contextState,
		getXFromFretNumber(fret) {
			return contextState.FRET_START + fret * contextState.FRET_GAP;
		},
		getYFromStringNumber(string) {
			return contextState.STRING_START + (string - 1) * contextState.STRING_GAP;
		}
	});
};

export const getFingerBoardContext = () => getContext<FingerBoardContext>('fingerboard');
