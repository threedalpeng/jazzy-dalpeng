import { TempoTimer } from '$/lib/timer/tick';
import { getContext, setContext } from 'svelte';
import Metronome from './metronome';

const CONTEXT_KEY = 'metronome';

export const setMetronomeContext = (timer?: TempoTimer) => {
	const context = setContext(CONTEXT_KEY, new Metronome(timer ?? new TempoTimer()));
	return context;
};

export const getMetronomeContext: () => Metronome = () => {
	return getContext(CONTEXT_KEY);
};
