import type { Locator } from "@playwright/test"
import { expect } from "@playwright/test"

export async function assertNotObscured(locator: Locator, label?: string) {
  const page = locator.page()
  const box = await locator.boundingBox()
  expect(box, `${label || "element"} should be visible`).toBeTruthy()
  const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 }
  const isClickable = await locator.evaluate(
    (el, { x, y }) => {
      const top = document.elementFromPoint(x, y)
      return top !== null && (el.contains(top) || top.contains(el))
    },
    { x: center.x, y: center.y },
  )
  expect(isClickable, `${label || "element"} is obscured at center (${Math.round(center.x)}, ${Math.round(center.y)})`).toBe(true)
}

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
  expect(Math.abs(after!.width - before!.width), `Width changed from ${before!.width} to ${after!.width}`).toBeLessThanOrEqual(tolerance)
  expect(Math.abs(after!.height - before!.height), `Height changed from ${before!.height} to ${after!.height}`).toBeLessThanOrEqual(tolerance)
}
