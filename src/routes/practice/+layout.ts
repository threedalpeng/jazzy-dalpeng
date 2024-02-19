import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from '../$types';
import { base } from '$app/paths';

interface PracticeData {
	title: string;
	slug: string;
	practice: object;
}

interface PracticeRoutes {
	core: PracticeData[];
	custom: PracticeData[];
}

export const load: LayoutLoad = (data) => {
	const routes: PracticeRoutes = {
		core: [
			{
				title: 'ABC',
				slug: 'abc',
				practice: {}
			},
			{
				title: 'ANC',
				slug: 'sdfwe',
				practice: {}
			}
		],
		custom: []
	};

	const { category, slug } = data.params;

	console.log(category, slug);
	if (category !== 'core' && category !== 'custom') {
		redirect(303, `${base}/practice/core/${routes['core'][0].slug}`);
	}

	const currentCategoryRoutes = routes[category];
	const currentPageIndex = currentCategoryRoutes.findIndex((route) => route.slug === slug);
	if (currentPageIndex === -1) {
		redirect(303, `${base}/practice/${category}/${routes[category][0].slug}`);
	}

	const pages: {
		previous?: PracticeData;
		current: PracticeData;
		next?: PracticeData;
	} = {
		previous: currentPageIndex - 1 >= 0 ? currentCategoryRoutes[currentPageIndex - 1] : undefined,
		current: currentCategoryRoutes[currentPageIndex],
		next:
			currentPageIndex < currentCategoryRoutes.length - 1
				? currentCategoryRoutes[currentPageIndex + 1]
				: undefined
	};

	return { routes, category, pages };
};
