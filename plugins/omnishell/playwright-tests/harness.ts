// The browser-test harness, so no spec names a runtime.
//
// Playwright drives the browser here directly rather than through
// @playwright/test: the runner is deno's, and the checks under
// src/lint/playwright/ type their page as @playwright/test's `Page` while
// being the same object at runtime.
//
// A browser is launched per test and closed with it. A shared instance would
// be faster, but deno's resource sanitiser fails any test that outlives its
// own ops, and a leaked browser is a hung CI run rather than a red one.
import { chromium, type Page } from "npm:playwright@1.59.1"

export { afterAll, afterEach, beforeAll, beforeEach, describe, it, it as test } from "jsr:@std/testing@1/bdd"
export { expect } from "jsr:@std/expect@1"
export type { Page }

export type PageOptions = { viewport?: { width: number; height: number } }

/** Run `body` against a fresh page, tearing the browser down either way. */
export async function withPage<T>(
  body: (page: Page) => Promise<T>,
  opts: PageOptions = {},
): Promise<T> {
  const browser = await chromium.launch()
  try {
    const context = await browser.newContext(opts)
    return await body(await context.newPage())
  } finally {
    await browser.close()
  }
}

/** The checks take @playwright/test's Page; this is the same object. */
// deno-lint-ignore no-explicit-any
export const asCheckPage = (page: Page): any => page
