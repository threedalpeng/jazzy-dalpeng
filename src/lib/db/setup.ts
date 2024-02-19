import { openDB, type DBSchema, type IDBPObjectStore } from 'idb';

interface JazzyDB extends DBSchema {
	practices: {
		key: number;
		value: {
			order: number;
			title: string;
			type: 'core' | 'custom';
			data: any;
		};
		indexes: {
			type: string;
		};
	};
}

export async function setupIDB() {
	const JAZZY_LATEST_VER = 1;
	const jazzyDB = await openDB<JazzyDB>('jazzy', JAZZY_LATEST_VER, {
		upgrade(db, oldVersion, newViersion, transaction) {
			switch (oldVersion) {
				case JAZZY_LATEST_VER:
					const practiceStore = db.createObjectStore('practices', {
						autoIncrement: true
					});
					practiceStore.createIndex('type', 'type');
					updateCorePractices(practiceStore);
			}
		}
	});

	return jazzyDB;
}

// function convertSlugToOrderTitle(slug: string) {
// 	const [orderText, titleKebab] = slug.split('-', 2);
// 	if (orderText == undefined || titleKebab == undefined) {
// 		throw Error("Cannot split by '-'.");
// 	}

// 	const order = Number.parseInt(orderText, 10);
// 	if (Number.isNaN(order)) {
// 		throw Error('The value of Order is not a number.');
// 	}

// 	const title = titleKebab
// 		.split('-')
// 		.map((word) => (word && word[0].toUpperCase() + word.slice(1)) || '')
// 		.join(' ');

// 	return [order, title];
// }

function convertOrderTitleToSlug(order: number, title: string) {
	const titleKebab = title
		.split(' ')
		.map((word) => word.toLowerCase())
		.join('-');
	const orderText = order.toString(10).padStart(2, '0');
	return `${orderText}-${titleKebab}`;
}

async function updateCorePractices(
	store: IDBPObjectStore<JazzyDB, ArrayLike<'practices'>, 'practices', 'versionchange'>
) {
	const typeIndex = store.index('type');
	const rangeCore = IDBKeyRange.only('core');
	let cursor = await typeIndex.openCursor(rangeCore);
	while (cursor) {
		await store.delete(cursor.primaryKey);
		cursor = await cursor.continue();
	}

	await Promise.all([
		store.add({
			type: 'core',
			order: 1,
			title: 'Basic Chords',
			data: {}
		}),
		store.add({
			type: 'core',
			order: 2,
			title: 'Pitch Name on Fingerboard',
			data: {}
		}),
		store.add({
			type: 'core',
			order: 3,
			title: 'Root with Pitch Name',
			data: {}
		})
	]);
}
