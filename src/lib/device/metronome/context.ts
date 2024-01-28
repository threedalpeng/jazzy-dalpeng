import { getContext, onMount, setContext } from 'svelte';
import Metronome, {
	type MetronomeOption,
	type OnBarCallback,
	type OnBeatCallback
} from './Metronome';

const CONTEXT_KEY = 'metronome';

export const setMetronomeContext = (option: MetronomeOption) => {
	let context = setContext(CONTEXT_KEY, Metronome.create(option));
	return context;
};

export const getMetronomeContext: () => Metronome = () => {
	return getContext(CONTEXT_KEY);
};

export const onBeat = (cb: OnBeatCallback) => getMetronomeContext().onBeat(cb);
export const onBar = (cb: OnBarCallback) => getMetronomeContext().onBar(cb);
