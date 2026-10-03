import { expect, test, type Page } from '@playwright/test';

async function choose(page: Page, position: string) {
	await page.getByRole('button', { name: '음 선택', exact: true }).click();
	await page.getByRole('combobox', { name: '지판 음 선택' }).selectOption(position);
	await page.getByRole('button', { name: '선택 확인', exact: true }).click();
}
async function findDegrees(page: Page) {
	await choose(page, '5:5');
	await choose(page, '5:7');
	await choose(page, '4:5');
}

test('six-string learning completes and restores progress on a small screen', async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 667 });
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/jazzy-dalpeng/learn/major-scale/');
	await expect(page.getByRole('heading', { name: '지판 탐색' })).toBeVisible();
	const fit = async () =>
		expect(
			await page.evaluate(() => ({
				width: document.documentElement.scrollWidth <= innerWidth,
				height: document.documentElement.scrollHeight <= innerHeight
			}))
		).toEqual({ width: true, height: true });
	await fit();
	await page.getByRole('button', { name: '도수 찾기 →' }).click();
	await expect(page.getByRole('button', { name: '반복 연주 →' })).toBeDisabled();
	await choose(page, '6:8');
	await expect(page.getByRole('button', { name: '반복 연주 →' })).toBeDisabled();
	await findDegrees(page);
	await page.reload();
	await expect(page.getByRole('heading', { name: '도수 찾기 완료' })).toBeVisible();
	await page.getByRole('button', { name: '반복 연주 →' }).click();
	await fit();
	await expect(page.getByRole('button', { name: '코드 만들기 →' })).toBeDisabled();
	await page.getByRole('radio', { name: '천천히 가능', exact: true }).check();
	await page.getByRole('button', { name: '코드 만들기 →' }).click();
	await choose(page, '6:8');
	await choose(page, '5:7');
	await choose(page, '4:5');
	await fit();
	await page.getByRole('button', { name: '학습 마치기' }).click();
	await expect(page.getByRole('heading', { name: '완료' })).toBeVisible();
	await expect(page.getByText(/천천히 가능 · 72 BPM/)).toBeVisible();
	await page.reload();
	await expect(page.getByRole('heading', { name: '완료' })).toBeVisible();
	expect(errors).toEqual([]);
});

test('cropped canvas hit regions work after viewport scaling', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/jazzy-dalpeng/learn/major-scale/');
	const canvas = page.locator('canvas');
	await expect(canvas).toBeVisible();
	// C at 6th string, 8th fret in the existing FingerBoard coordinate system.
	const bounds = await canvas.boundingBox();
	const size = await canvas.evaluate((el) => ({
		width: Number((el as HTMLCanvasElement).dataset.logicalWidth),
		height: Number((el as HTMLCanvasElement).dataset.logicalHeight)
	}));
	await page.mouse.click(
		bounds!.x + (220 / size.width) * bounds!.width,
		bounds!.y + (180 / size.height) * bounds!.height
	);
	await page.getByRole('button', { name: '음 선택', exact: true }).click();
	await expect(page.getByRole('combobox', { name: '지판 음 선택' })).toHaveValue('6:8');
	await page.keyboard.press('Escape');
	await expect(page.getByText('C · 1도', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: '가이드' }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('root changes update the scale and cancel audio; practice starts and stops', async ({
	page
}) => {
	await page.goto('/jazzy-dalpeng/learn/major-scale/');
	await page.getByRole('button', { name: '스케일 듣기', exact: false }).click();
	await expect(page.getByRole('button', { name: '재생 정지', exact: false })).toBeVisible();
	await expect.poll(() => page.locator('.fretboard').getAttribute('data-active-note')).toBe('0');
	await page.getByRole('combobox', { name: '근음', exact: true }).selectOption('7');
	await expect(page.getByRole('button', { name: '스케일 듣기', exact: false })).toBeVisible();
	await expect(page.getByRole('heading', { name: '지판 탐색' })).toBeVisible();
	await page.getByRole('combobox', { name: '근음', exact: true }).selectOption('0');
	await page.getByRole('button', { name: '도수 찾기 →' }).click();
	await findDegrees(page);
	await page.getByRole('button', { name: '반복 연주 →' }).click();
	await page.getByRole('button', { name: '연습 시작', exact: false }).click();
	await expect(page.getByText(/준비 · [1-4]박/)).toBeVisible();
	await page.getByRole('button', { name: '재생 정지', exact: false }).click();
	await expect(page.getByRole('button', { name: '연습 시작', exact: false })).toBeVisible();
});

test('practice settings persist and reloading never resumes sound automatically', async ({
	page
}) => {
	await page.goto('/jazzy-dalpeng/learn/major-scale/');
	await page.getByRole('button', { name: '설정 · 진도' }).click();
	await page.getByRole('combobox', { name: '연주 방향' }).selectOption('down');
	await page.getByRole('checkbox', { name: '반복 연주' }).uncheck();
	await page.getByRole('checkbox', { name: '시작 전 4박 준비' }).uncheck();
	await page.getByRole('button', { name: '닫기 ✕', exact: true }).click();
	await page.getByRole('button', { name: '스케일 듣기', exact: false }).click();
	await expect(page.getByRole('button', { name: '재생 정지', exact: false })).toBeVisible();
	await page.reload();
	await expect(page.getByRole('button', { name: '스케일 듣기', exact: false })).toBeVisible();
	await page.getByRole('button', { name: '설정 · 진도' }).click();
	await expect(page.getByRole('combobox', { name: '연주 방향' })).toHaveValue('down');
	await expect(page.getByRole('checkbox', { name: '반복 연주' })).not.toBeChecked();
	await expect(page.getByRole('checkbox', { name: '시작 전 4박 준비' })).not.toBeChecked();
});

test('retina fretboards render at display resolution and retain cropped hit regions', async ({
	browser
}) => {
	const context = await browser.newContext({
		viewport: { width: 390, height: 844 },
		deviceScaleFactor: 3,
		baseURL: 'http://127.0.0.1:1357'
	});
	const page = await context.newPage();
	await page.goto('/jazzy-dalpeng/learn/major-scale/');
	const canvas = page.locator('canvas');
	await expect
		.poll(() =>
			canvas.evaluate((el) => {
				const c = el as HTMLCanvasElement;
				const bounds = c.getBoundingClientRect();
				return (
					c.width >= Math.floor(bounds.width * devicePixelRatio) &&
					c.height >= Math.floor(bounds.height * devicePixelRatio)
				);
			})
		)
		.toBe(true);
	const bounds = await canvas.boundingBox();
	await page.mouse.click(
		bounds!.x + (220 / 340) * bounds!.width,
		bounds!.y + (180 / 210) * bounds!.height
	);
	await expect(page.getByText('C · 1도', { exact: true })).toBeVisible();
	await page.setViewportSize({ width: 1440, height: 900 });
	await expect
		.poll(() =>
			canvas.evaluate(
				(el) =>
					(el as HTMLCanvasElement).height >=
					Math.floor(el.getBoundingClientRect().height * devicePixelRatio)
			)
		)
		.toBe(true);
	await context.close();
});
