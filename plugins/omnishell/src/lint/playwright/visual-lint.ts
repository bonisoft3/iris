import type { Page, Locator } from "@playwright/test"
import { expect } from "@playwright/test"
import type { VisualLintResult } from "./types"
import { checkInteractiveOverlap } from "./checks/interactive-overlap"
import { checkHorizontalOverflow } from "./checks/horizontal-overflow"
import { checkConstrainedImages } from "./checks/constrained-images"
import { checkViewportBounds } from "./checks/viewport-bounds"
import { checkTouchTargets } from "./checks/touch-targets"
import { checkFocusOrder } from "./checks/focus-order"
import { checkThemeStability } from "./checks/theme-stability"
import type { ConsoleCapture } from "./checks/console-messages"
import { analyzeConsole } from "./checks/console-messages"

export type { VisualBug, VisualLintResult } from "./types"
export { checkCLS } from "./checks/cls"
export {
  captureConsole,
  analyzeConsole,
  checkConsoleMessages,
  type ConsoleCapture,
} from "./checks/console-messages"

/**
 * Run the standard DOM-based visual lint battery.
 * Pass a `consoleCapture` (from `captureConsole(page)` before navigation) to
 * include console errors/warnings in the result. If omitted, console checks
 * are skipped.
 */
export async function visualLint(
  page: Page,
  consoleCapture?: ConsoleCapture,
): Promise<VisualLintResult> {
  const results = await Promise.all([
    checkInteractiveOverlap(page),
    checkHorizontalOverflow(page),
    checkConstrainedImages(page),
    checkViewportBounds(page),
    checkTouchTargets(page),
    checkFocusOrder(page),
    checkThemeStability(page),
    // CLS is excluded from the default battery — it requires a 3-second wait
    // Use checkCLS(page) separately in tests that care about layout shift
  ])
  const bugs = results.flat()
  if (consoleCapture) {
    bugs.push(...analyzeConsole(consoleCapture))
  }
  return { passed: bugs.length === 0, bugs }
}

export async function assertVisualLint(page: Page) {
  const result = await visualLint(page)
  if (!result.passed) {
    const summary = result.bugs
      .map((b) => `[${b.severity}] ${b.rule}: ${b.description}`)
      .join("\n")
    expect(result.passed, `Visual lint failed:\n${summary}`).toBe(true)
  }
}

/**
 * Assert that a specific element is not obscured at its center.
 * More targeted than the full visual lint — use for specific known-fragile elements.
 */
export async function assertNotObscured(locator: Locator, label?: string) {
  const page = locator.page()
  const box = await locator.boundingBox()
  expect(box, `${label || "element"} should be visible`).toBeTruthy()

  const center = {
    x: box!.x + box!.width / 2,
    y: box!.y + box!.height / 2,
  }

  const isClickable = await locator.evaluate(
    (el, { x, y }) => {
      const top = document.elementFromPoint(x, y)
      return top !== null && (el.contains(top) || top.contains(el))
    },
    { x: center.x, y: center.y },
  )

  expect(
    isClickable,
    `${label || "element"} is obscured at center (${Math.round(center.x)}, ${Math.round(center.y)})`,
  ).toBe(true)
}

/**
 * Assert that an element's dimensions remain stable during a state transition.
 * Use to catch image cropping bugs during classification, loading states, etc.
 */
export async function assertDimensionStability(
  locator: Locator,
  trigger: () => Promise<void>,
  opts: { tolerance?: number; waitMs?: number } = {},
) {
  const { tolerance = 2, waitMs = 500 } = opts

  const before = await locator.boundingBox()
  expect(before, "element should be visible before trigger").toBeTruthy()

  await trigger()
  await locator.page().waitForTimeout(waitMs)

  const after = await locator.boundingBox()
  expect(after, "element should be visible after trigger").toBeTruthy()

  expect(
    Math.abs(after!.width - before!.width),
    `Width changed from ${before!.width} to ${after!.width}`,
  ).toBeLessThanOrEqual(tolerance)

  expect(
    Math.abs(after!.height - before!.height),
    `Height changed from ${before!.height} to ${after!.height}`,
  ).toBeLessThanOrEqual(tolerance)
}

export { assertVisionReview, assertFeatureParity } from "./vision-review"
