import type { Page } from "@playwright/test"
import type { VisualBug } from "../types"

export async function checkTouchTargets(page: Page): Promise<VisualBug[]> {
  return page.evaluate(() => {
    const bugs: Array<{ rule: string; description: string; severity: "critical" | "major" | "minor"; element?: string }> = []
    if (window.innerWidth > 768) return bugs

    const MIN_SIZE = 44
    const interactives = document.querySelectorAll('button, a[href], input, textarea, select, [role="button"], [tabindex="0"]')

    for (const el of interactives) {
      const htmlEl = el as HTMLElement
      const style = getComputedStyle(htmlEl)
      if (style.display === "none" || style.visibility === "hidden") continue
      if (htmlEl.offsetWidth === 0 || htmlEl.offsetHeight === 0) continue
      const rect = htmlEl.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue

      if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) {
        const id = htmlEl.getAttribute("data-testid") || htmlEl.getAttribute("aria-label") || htmlEl.textContent?.trim().slice(0, 20) || htmlEl.tagName.toLowerCase()
        bugs.push({ rule: "touch-target-size", description: `"${id}" is ${Math.round(rect.width)}x${Math.round(rect.height)}px, minimum is ${MIN_SIZE}x${MIN_SIZE}px`, severity: "major", element: id })
      }
    }
    return bugs
  })
}
