import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  const context = page.context();
  await page.goto('http://guis-web-svc:8080/');
  await page.getByRole('button', { name: 'Continue as guest' }).click();
  await page.getByRole('button', { name: 'Skip' }).click();
  await page.getByAltText('Scan').click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/camera/);
  // The remaining tests are not playwing well with
  // tensorflow. Please enable when we have only the
  // new mediapipe detector post picture taking.
  // await expect(page.getByRole('progressbar')).toBeHidden();
  // await expect(page.getByText('Make sure the subject is the focal point.')).toBeVisible();
  // await expect(page.locator('.frame')).toBeVisible();
  // await expect(page.locator('.circle-buttom > div')).toBeVisible();
  // await page.locator('.circle-buttom > div').click();
  // await expect(page.locator('#cameraoverlay')).toBeVisible();
  // await expect(page.locator('.restore-buttom')).toBeVisible();
  // await page.locator('button.circle-buttom').click();
  // await expect(page.locator('.circle-photo > img')).toBeVisible();
  // await page.goto('http://guis-web-svc:8080/gallery');
  // await expect(page.getByText('te')).toBeVisible();
});
