import type { Page } from "@playwright/test"
import type { VisualBug } from "../types"

/**
 * Measure CLS (Cumulative Layout Shift) on a page.
 * Observes layout shifts for 3 seconds after page load.
 * Threshold: 0.1 (Google's "good" CLS target).
 */
export async function checkCLS(page: Page): Promise<VisualBug[]> {
  const cls = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number }
          if (!shift.hadRecentInput) {
            clsValue += shift.value
          }
        }
      })
      observer.observe({ type: "layout-shift", buffered: true })
      setTimeout(() => {
        observer.disconnect()
        resolve(clsValue)
      }, 3000)
    })
  })

  const bugs: VisualBug[] = []
  if (cls > 0.1) {
    bugs.push({
      rule: "cls-threshold",
      description: `Cumulative Layout Shift is ${cls.toFixed(3)}, exceeds threshold of 0.1`,
      severity: "major",
    })
  }
  return bugs
}
