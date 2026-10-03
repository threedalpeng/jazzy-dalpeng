import { expect, test } from '@playwright/test';

test('chord finder renders the cropped hitmap and responds to a click', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/jazzy-dalpeng/tools/chord-finder/');
	const canvas = page.locator('canvas');
	await expect(canvas).toBeVisible();
	await expect
		.poll(() =>
			canvas.evaluate((element) => {
				const ctx = (element as HTMLCanvasElement).getContext('2d')!;
				return ctx.getImageData(55, 30, 1, 1).data[3];
			})
		)
		.toBe(255);
	const before = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL());
	const bounds = await canvas.boundingBox();
	const dimensions = await canvas.evaluate((element) => ({
		width: (element as HTMLCanvasElement).width,
		height: (element as HTMLCanvasElement).height
	}));
	await page.mouse.click(
		bounds!.x + (55 / dimensions.width) * bounds!.width,
		bounds!.y + (30 / dimensions.height) * bounds!.height
	);
	await expect
		.poll(() => canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL()))
		.not.toBe(before);
	await expect
		.poll(() =>
			canvas.evaluate((element) => {
				return Array.from(
					(element as HTMLCanvasElement).getContext('2d')!.getImageData(63, 33, 1, 1).data
				);
			})
		)
		.toEqual([0, 0, 0, 255]);
	expect(errors).toEqual([]);
});

test('metronome renders canvas beats and can start and stop', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/jazzy-dalpeng/tools/metronome/');
	await expect(page.getByRole('img', { name: /Beat 0 of/ })).toBeVisible();
	await page.getByRole('button', { name: 'Start metronome' }).click();
	await expect(page.getByRole('button', { name: 'Stop metronome' })).toBeVisible();
	await expect
		.poll(() => page.locator('canvas').getAttribute('aria-label'))
		.not.toContain('Beat 0 ');
	await page.getByRole('button', { name: 'Stop metronome' }).click();
	await expect(page.getByRole('button', { name: 'Start metronome' })).toBeVisible();
	expect(errors).toEqual([]);
});

test('practice renders both the fretboard and canvas beat display', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/jazzy-dalpeng/practice/core/major-scale/');
	await expect(page.locator('canvas')).toHaveCount(2);
	await expect(page.locator('canvas').first()).toBeVisible();
	await expect(page.getByRole('button', { name: 'Start metronome' })).toBeVisible();
	expect(errors).toEqual([]);
});
