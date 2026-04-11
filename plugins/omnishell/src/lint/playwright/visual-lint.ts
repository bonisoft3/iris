import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"
import type { VisualLintResult } from "./types"
import { checkInteractiveOverlap } from "./checks/interactive-overlap"
import { checkHorizontalOverflow } from "./checks/horizontal-overflow"
import { checkConstrainedImages } from "./checks/constrained-images"
import { checkViewportBounds } from "./checks/viewport-bounds"
import { checkTouchTargets } from "./checks/touch-targets"
import { checkFocusOrder } from "./checks/focus-order"
import { checkThemeStability } from "./checks/theme-stability"

export type { VisualBug, VisualLintResult } from "./types"
export { checkCLS } from "./checks/cls"

export async function visualLint(page: Page): Promise<VisualLintResult> {
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
