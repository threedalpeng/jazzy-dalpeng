import { getContext, setContext } from 'svelte';
import { RandomBox } from './RandomBox';

const CONTEXT_KEY = 'random-box';

export const setRandomBoxContext = <T>(randomBox: RandomBox<T>) => {
	const context = setContext(CONTEXT_KEY, randomBox);
	return context;
};

export const getRandomBoxContext = <T>() => {
	return getContext<RandomBox<T>>(CONTEXT_KEY);
};
