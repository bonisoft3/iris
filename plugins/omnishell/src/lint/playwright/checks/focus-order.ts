import type { Page } from "@playwright/test"
import type { VisualBug } from "../types"

/**
 * Tab through all focusable elements and check that focus order
 * follows visual order (top-to-bottom, left-to-right).
 *
 * Each position:fixed container is its own focus sequence: a fixed
 * rail (sidebar, bottom nav) is a separate landmark whose tab order
 * is meaningful on its own, and its screen position says nothing
 * about where it belongs relative to the document flow. Only
 * elements within the same sequence are compared.
 */
export async function checkFocusOrder(page: Page): Promise<VisualBug[]> {
  const bugs: VisualBug[] = []

  const positions = await page.evaluate(() => {
    const results: Array<{ id: string; top: number; left: number; group: string }> = []
    const focusable = document.querySelectorAll(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    )

    const groupIds = new Map<Element, string>()
    function groupOf(el: HTMLElement): string {
      for (let a: HTMLElement | null = el; a; a = a.parentElement) {
        if (getComputedStyle(a).position === "fixed") {
          if (!groupIds.has(a)) groupIds.set(a, `fixed-${groupIds.size}`)
          return groupIds.get(a)!
        }
      }
      return "flow"
    }

    for (const el of focusable) {
      const htmlEl = el as HTMLElement
      const style = getComputedStyle(htmlEl)
      if (style.display === "none" || style.visibility === "hidden") continue
      if (htmlEl.offsetWidth === 0 || htmlEl.offsetHeight === 0) continue

      const rect = htmlEl.getBoundingClientRect()
      // Skip off-screen elements
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue

      const id =
        htmlEl.getAttribute("data-testid") ||
        htmlEl.getAttribute("aria-label") ||
        htmlEl.textContent?.trim().slice(0, 20) ||
        htmlEl.tagName.toLowerCase()
      results.push({
        id,
        top: rect.top,
        left: rect.left,
        group: groupOf(htmlEl),
      })
    }

    return results
  })

  const sequences = new Map<string, typeof positions>()
  for (const p of positions) {
    const seq = sequences.get(p.group)
    if (seq) seq.push(p)
    else sequences.set(p.group, [p])
  }

  // Check that elements are roughly in visual order
  // Allow some tolerance for elements on the same "row" (within 20px vertically)
  const ROW_TOLERANCE = 20
  for (const sequence of sequences.values()) {
    for (let i = 1; i < sequence.length; i++) {
      const prev = sequence[i - 1]!
      const curr = sequence[i]!

      const sameRow = Math.abs(curr.top - prev.top) < ROW_TOLERANCE
      if (sameRow) {
        // Same row: current should be to the right of previous
        if (curr.left < prev.left - ROW_TOLERANCE) {
          bugs.push({
            rule: "focus-order",
            description: `Focus order jumps: "${prev.id}" (${Math.round(prev.left)},${Math.round(prev.top)}) → "${curr.id}" (${Math.round(curr.left)},${Math.round(curr.top)}) — goes left within same row`,
            severity: "minor",
            element: curr.id,
          })
        }
      } else {
        // Different row: current should be below previous
        if (curr.top < prev.top - ROW_TOLERANCE) {
          bugs.push({
            rule: "focus-order",
            description: `Focus order jumps: "${prev.id}" (row ${Math.round(prev.top)}) → "${curr.id}" (row ${Math.round(curr.top)}) — goes upward`,
            severity: "minor",
            element: curr.id,
          })
        }
      }
    }
  }

  return bugs
}
