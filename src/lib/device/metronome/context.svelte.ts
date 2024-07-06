import { TempoTimer } from '$/lib/timer/tick';
import { getContext, setContext } from 'svelte';
import Metronome from './metronome';

const CONTEXT_KEY = 'metronome';
interface MetronomeContext {
	metronome: Metronome;
	beatPerBar: number;
	signatureUnit: number;
	bpm: number;
}

export const setMetronomeContext = (timer?: TempoTimer) => {
	const tempoTimer = timer ?? new TempoTimer();
	const metronome = new Metronome(tempoTimer);
	let beatPerBar = $state(tempoTimer.beatPerBar);
	let signatureUnit = $state(tempoTimer.signatureUnit);
	let bpm = $state(tempoTimer.bpm);

	tempoTimer.onTempoChanged((state) => {
		beatPerBar = state.beatPerBar;
		signatureUnit = state.signatureUnit;
		bpm = state.bpm;
	});

	$effect(() => {
		tempoTimer.updateTempo((timer) => {
			timer.beatPerBar = beatPerBar;
			timer.signatureUnit = signatureUnit;
			timer.bpm = bpm;
		});
	});

	return setContext(CONTEXT_KEY, {
		metronome,
		get beatPerBar() {
			return beatPerBar;
		},
		set beatPerBar(value) {
			beatPerBar = value;
		},
		get signatureUnit() {
			return signatureUnit;
		},
		set signatureUnit(value) {
			signatureUnit = value;
		},
		get bpm() {
			return bpm;
		},
		set bpm(value) {
			bpm = value;
		}
	});
};

export const getMetronomeContext: () => MetronomeContext = () => {
	return getContext(CONTEXT_KEY);
};
