import { expect, test } from '@playwright/test'

test('has product title', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await expect(page).toHaveTitle(/Iris/)
})

test('can login as guest', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await page.goto('http://localhost:3000/login?redirect=/')
  await page.getByRole('button', { name: 'Continue as guest' }).click()
  await page.goto('http://localhost:3000/intro')
})
