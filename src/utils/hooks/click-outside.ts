import type { Action, ActionReturn } from 'svelte/action';

export const clickoutside: Action<
	Element,
	unknown,
	{ 'on:clickoutside'?: (event: CustomEvent<MouseEvent>) => any }
> = (node) => {
	const handleClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (!event.target) {
			return;
		}
		if (node && !node.contains(target) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent('clickoutside', { detail: CustomEvent<MouseEvent> }));
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
};
