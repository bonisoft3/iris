import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://guis-web-svc:8080/');
  await page.getByRole('button', { name: 'Continue as guest' }).click();
  await page.getByRole('button', { name: 'Skip' }).click();
  await page.getByRole('link', { name: 'Home' }).click();
  // await expect(page).toHaveURL(/home/);
  await page.getByRole('link', { name: 'Gallery' }).click();
  await expect(page).toHaveURL(/gallery/);
  await page.getByAltText('Scan').click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/camera/);
});
