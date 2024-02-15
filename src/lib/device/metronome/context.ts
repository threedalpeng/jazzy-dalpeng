import { getContext, setContext } from 'svelte';
import Metronome, {
	type MetronomeOption,
	type OnBarCallback,
	type OnBeatCallback
} from './metronome';

const CONTEXT_KEY = 'metronome';

export const setMetronomeContext = (option: MetronomeOption) => {
	const context = setContext(CONTEXT_KEY, new Metronome(option));
	return context;
};

export const getMetronomeContext: () => Metronome = () => {
	return getContext(CONTEXT_KEY);
};

export const onBeat = (cb: OnBeatCallback) => getMetronomeContext().onBeat(cb);
export const onBar = (cb: OnBarCallback) => getMetronomeContext().onBar(cb);
