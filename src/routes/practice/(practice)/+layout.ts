import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import { routes, type PracticeRoute, type PracticeRouteCategory } from '../data';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = (data) => {
	const { category, slug } = data.params;

	if (category !== 'core' && category !== 'custom') {
		redirect(303, `${base}/practice`);
	}

	const currentCategoryRoutes = routes[category];
	const currentPageIndex = currentCategoryRoutes.findIndex((route) => route.slug === slug);
	if (currentPageIndex === -1) {
		redirect(303, `${base}/practice/${category}/${routes[category][0].slug}`);
	}

	const pages: {
		previous?: PracticeRoute;
		current: PracticeRoute;
		next?: PracticeRoute;
	} = {
		previous: currentPageIndex - 1 >= 0 ? currentCategoryRoutes[currentPageIndex - 1] : undefined,
		current: currentCategoryRoutes[currentPageIndex],
		next:
			currentPageIndex < currentCategoryRoutes.length - 1
				? currentCategoryRoutes[currentPageIndex + 1]
				: undefined
	};

	return { routes, category: category as PracticeRouteCategory, pages };
};
