import { TempoTimer } from '#src/lib/timer/tick.ts';
import { getContext, setContext } from 'svelte';
import Metronome from './metronome';

const CONTEXT_KEY = 'metronome';

export const setMetronomeContext = (timer?: TempoTimer) => {
	const context = setContext(CONTEXT_KEY, new Metronome(timer ?? new TempoTimer(), !timer));
	return context;
};

export const getMetronomeContext: () => Metronome = () => {
	return getContext(CONTEXT_KEY);
};
