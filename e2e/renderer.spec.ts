import { expect, test } from '@playwright/test';

for (const fallback of [false, true]) {
	test(`nested crops retain painter order, cache, and input (${fallback ? 'HTML fallback' : 'OffscreenCanvas'})`, async ({
		browser
	}) => {
		const context = await browser.newContext({ deviceScaleFactor: 3 });
		if (fallback)
			await context.addInitScript(() => {
				Object.defineProperty(window, 'OffscreenCanvas', { value: undefined });
			});
		const page = await context.newPage();
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await page.goto('/jazzy-dalpeng/');
		await page.evaluate(async (fixturePath) => {
			const { default: Fixture, mount } = await import(fixturePath);
			const target = document.createElement('div');
			document.body.prepend(target);
			mount(Fixture, { target });
		}, `/jazzy-dalpeng/@fs${process.cwd()}/src/lib/canvas/__fixtures__/Renderer.svelte`);
		const canvas = page.getByLabel('Renderer test');
		await expect(canvas).toBeVisible();
		const pixel = (x: number, y: number) =>
			canvas.evaluate(
				(element, position) => {
					const c = element as HTMLCanvasElement;
					return [
						...c
							.getContext('2d')!
							.getImageData((position.x * c.width) / 100, (position.y * c.height) / 100, 1, 1).data
					];
				},
				{ x, y }
			);
		const click = async (x: number, y: number) => {
			const bounds = (await canvas.boundingBox())!;
			await page.mouse.click(
				bounds.x + (x * bounds.width) / 100,
				bounds.y + (y * bounds.height) / 100
			);
		};
		await expect.poll(() => pixel(30, 30)).toEqual([0, 0, 255, 255]);
		await expect.poll(() => pixel(50, 50)).toEqual([0, 128, 0, 255]);
		await click(30, 30);
		await expect(page.getByLabel('Hit result')).toHaveText('child');
		await click(50, 50);
		await expect(page.getByLabel('Hit result')).toHaveText('green');
		await page.getByRole('button', { name: 'Toggle front' }).click();
		await page.evaluate(
			() =>
				new Promise<void>((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
				)
		);
		await click(50, 50);
		await expect(page.getByLabel('Hit result')).toHaveText('child');
		await page.getByRole('button', { name: 'Toggle front' }).click();
		await page.evaluate(
			() =>
				new Promise<void>((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
				)
		);
		await click(50, 50);
		await expect(page.getByLabel('Hit result')).toHaveText('green');
		await page.getByRole('button', { name: 'Change cached color' }).click();
		await expect.poll(() => pixel(30, 30)).toEqual([128, 0, 128, 255]);
		await page.getByRole('button', { name: 'Toggle child' }).click();
		await expect.poll(() => pixel(30, 30)).toEqual([255, 0, 0, 255]);
		await click(30, 30);
		await expect(page.getByLabel('Hit result')).toHaveText('red');
		await click(50, 50);
		await expect(page.getByLabel('Hit result')).toHaveText('green');
		await page.getByRole('button', { name: 'Toggle child' }).click();
		await expect.poll(() => pixel(30, 30)).toEqual([128, 0, 128, 255]);
		await expect.poll(() => pixel(50, 50)).toEqual([0, 128, 0, 255]);
		await click(50, 50);
		await expect(page.getByLabel('Hit result')).toHaveText('green');
		await expect.poll(() => pixel(10, 90)).toEqual([255, 165, 0, 255]);
		await click(10, 90);
		await expect(page.getByLabel('Hit result')).toHaveText('orange');
		await page.getByRole('button', { name: 'Reverse layers' }).click();
		await expect.poll(() => pixel(10, 90)).toEqual([255, 255, 0, 255]);
		await click(10, 90);
		await expect(page.getByLabel('Hit result')).toHaveText('yellow');
		await page.getByRole('button', { name: 'Erase corner' }).click();
		await expect.poll(() => pixel(95, 95)).toEqual([0, 0, 0, 0]);
		await click(95, 95);
		await expect(page.getByLabel('Hit result')).toHaveText('yellow');
		expect(errors).toEqual([]);
		await context.close();
	});
}
