import { test, expect } from "@playwright/test"
import { visualLint, assertVisualLint } from "../src/lint/playwright/visual-lint"
import { checkFocusOrder } from "../src/lint/playwright/checks/focus-order"
import { checkThemeStability } from "../src/lint/playwright/checks/theme-stability"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.join(__dirname, "../test/lint/fixtures")

test.describe("visualLint - good page", () => {
  test("passes with no bugs", async ({ page }) => {
    await page.goto(`file://${fixturesDir}/good-page.html`)
    const result = await visualLint(page)
    expect(result.passed).toBe(true)
    expect(result.bugs).toHaveLength(0)
  })
})

test.describe("visualLint - bad page", () => {
  test("detects horizontal overflow", async ({ page }) => {
    await page.goto(`file://${fixturesDir}/bad-page.html`)
    const result = await visualLint(page)
    expect(result.passed).toBe(false)
    const overflowBugs = result.bugs.filter((b) => b.rule === "no-horizontal-overflow")
    expect(overflowBugs.length).toBeGreaterThan(0)
  })

  test("detects unconstrained object-cover images", async ({ page }) => {
    await page.goto(`file://${fixturesDir}/bad-page.html`)
    const result = await visualLint(page)
    const imgBugs = result.bugs.filter((b) => b.rule === "unconstrained-object-cover")
    expect(imgBugs.length).toBeGreaterThan(0)
  })

  test("detects constrained image missing aspect-ratio", async ({ page }) => {
    await page.goto(`file://${fixturesDir}/bad-page.html`)
    const result = await visualLint(page)
    const constrainedBugs = result.bugs.filter((b) => b.rule === "constrained-image-ratio")
    expect(constrainedBugs.length).toBeGreaterThan(0)
  })

  test("detects small touch targets at mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(`file://${fixturesDir}/bad-page.html`)
    const result = await visualLint(page)
    const touchBugs = result.bugs.filter((b) => b.rule === "touch-target-size")
    expect(touchBugs.length).toBeGreaterThan(0)
  })
})

test.describe("assertVisualLint", () => {
  test("throws on bad page", async ({ page }) => {
    await page.goto(`file://${fixturesDir}/bad-page.html`)
    let threw = false
    try {
      await assertVisualLint(page)
    } catch {
      threw = true
    }
    expect(threw).toBe(true)
  })

  test("passes on good page", async ({ page }) => {
    await page.goto(`file://${fixturesDir}/good-page.html`)
    await assertVisualLint(page)
  })
})

test.describe("checkFocusOrder", () => {
  test("runs on good page without throwing", async ({ page }) => {
    await page.goto(`file://${fixturesDir}/good-page.html`)
    const bugs = await checkFocusOrder(page)
    // Good page should have reasonable focus order
    console.log(`Focus order: ${bugs.length} issues`)
    expect(Array.isArray(bugs)).toBe(true)
  })
})

test.describe("checkThemeStability", () => {
  test("runs on good page without throwing", async ({ page }) => {
    await page.goto(`file://${fixturesDir}/good-page.html`)
    const bugs = await checkThemeStability(page)
    console.log(`Theme stability: ${bugs.length} issues`)
    expect(Array.isArray(bugs)).toBe(true)
  })
})
