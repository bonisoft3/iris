import { expect, test } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await page.getByRole('button', { name: 'Continue as guest' }).click()
  await page.getByRole('button', { name: 'Skip' }).click()
  await page.getByRole('link', { name: 'Home' }).click()
  // await expect(page).toHaveURL(/home/);
  await page.getByRole('link', { name: 'Gallery' }).click()
  await expect(page).toHaveURL(/gallery/)
  await page.getByAltText('Scan').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page).toHaveURL(/camera/)
})
