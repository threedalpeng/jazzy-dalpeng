import { get, readable } from 'svelte/store';
import { setupIDB } from './setup';

const jazzyDB = readable(await setupIDB(), (set, update) => {
	return () => {};
});

export const db = jazzyDB.subscribe((db) => {
	return {
		practice: {
			getAll() {
				return db.getAll('practices');
			},
			getAllCore() {
				return db.getAll('practices');
			}
		}
	};
});
