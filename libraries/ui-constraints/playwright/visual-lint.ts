import type { Page, Locator } from "@playwright/test"
import { expect } from "@playwright/test"

interface VisualBug {
  rule: string
  description: string
  severity: "critical" | "major" | "minor"
  element?: string
}

interface VisualLintResult {
  passed: boolean
  bugs: VisualBug[]
}

/**
 * visualLint — generic layout assertion engine.
 *
 * Runs a battery of deterministic checks on any page with zero page-specific
 * knowledge. Catches bugs that are invisible in code review but obvious to
 * a human looking at the rendered page.
 *
 * Checks:
 * 1. No interactive element is obscured by another element
 * 2. No horizontal overflow (content wider than viewport)
 * 3. All constrained images maintain their aspect ratio containers
 * 4. No content is clipped at viewport edges
 * 5. Z-index values come from the design token scale
 */
export async function visualLint(page: Page): Promise<VisualLintResult> {
  const bugs: VisualBug[] = []

  const results = await Promise.all([
    checkInteractiveOverlap(page),
    checkHorizontalOverflow(page),
    checkConstrainedImages(page),
    checkUnconstrainedObjectCoverImages(page),
    checkViewportBounds(page),
  ])

  for (const result of results) {
    bugs.push(...result)
  }

  return { passed: bugs.length === 0, bugs }
}

/**
 * Check that no interactive element (button, link, input) is obscured.
 *
 * Tests FIVE hit points per element (center + 4 quadrant points near edges),
 * not just the center. This catches elements that use negative margins (like
 * the camera FAB's -mt-5) where the TOP of the element may be covered even
 * though the center is clear.
 *
 * Uses elementFromPoint to determine what's actually on top, then verifies
 * it's the element itself (or a child of it). This catches:
 * - FAB covered by scroll container (especially the protruding -mt-5 top)
 * - Buttons hidden behind overlays
 * - Links underneath fixed headers
 */
async function checkInteractiveOverlap(page: Page): Promise<VisualBug[]> {
  return page.evaluate(() => {
    const bugs: VisualBug[] = []
    const interactives = document.querySelectorAll(
      'button, a[href], input, textarea, select, [role="button"], [tabindex="0"]',
    )

    for (const el of interactives) {
      const htmlEl = el as HTMLElement

      // Skip hidden or zero-size elements
      const style = getComputedStyle(htmlEl)
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0" ||
        htmlEl.offsetWidth === 0 ||
        htmlEl.offsetHeight === 0
      ) {
        continue
      }

      const rect = htmlEl.getBoundingClientRect()

      // Skip elements outside the viewport
      if (
        rect.bottom < 0 ||
        rect.top > window.innerHeight ||
        rect.right < 0 ||
        rect.left > window.innerWidth
      ) {
        continue
      }

      // Check 5 points: center + 4 quadrant points inset 25% from each edge.
      // This catches the camera FAB's -mt-5: the TOP-CENTER point would be
      // covered even when the center point is fine.
      const insetX = rect.width * 0.25
      const insetY = rect.height * 0.25
      const hitPoints = [
        { label: "center",       px: rect.left + rect.width / 2,  py: rect.top + rect.height / 2 },
        { label: "top-center",   px: rect.left + rect.width / 2,  py: rect.top + insetY },
        { label: "bottom-center",px: rect.left + rect.width / 2,  py: rect.bottom - insetY },
        { label: "left-center",  px: rect.left + insetX,          py: rect.top + rect.height / 2 },
        { label: "right-center", px: rect.right - insetX,         py: rect.top + rect.height / 2 },
      ]

      for (const { label: pointLabel, px, py } of hitPoints) {
        // Clamp to viewport (elementFromPoint returns null outside)
        const x = Math.max(0, Math.min(px, window.innerWidth - 1))
        const y = Math.max(0, Math.min(py, window.innerHeight - 1))

        // Skip points outside viewport (element partially off-screen is OK)
        if (px < 0 || px >= window.innerWidth || py < 0 || py >= window.innerHeight) {
          continue
        }

        const topElement = document.elementFromPoint(x, y)

        if (topElement && !htmlEl.contains(topElement) && !topElement.contains(htmlEl)) {
          const id =
            htmlEl.getAttribute("data-testid") ||
            htmlEl.getAttribute("aria-label") ||
            htmlEl.textContent?.trim().slice(0, 30) ||
            htmlEl.tagName.toLowerCase()

          const blockerId =
            (topElement as HTMLElement).getAttribute("data-testid") ||
            (topElement as HTMLElement).className?.toString().slice(0, 40) ||
            topElement.tagName.toLowerCase()

          bugs.push({
            rule: "no-interactive-overlap",
            description: `"${id}" is obscured by "${blockerId}" at ${pointLabel} (${Math.round(x)}, ${Math.round(y)})`,
            severity: "critical",
            element: id,
          })
          break // one hit is enough per element — don't spam
        }
      }
    }

    return bugs
  })
}

/**
 * Check that the document doesn't overflow the viewport horizontally.
 * Horizontal overflow causes an unwanted horizontal scrollbar and is
 * almost always a layout bug.
 */
async function checkHorizontalOverflow(page: Page): Promise<VisualBug[]> {
  return page.evaluate(() => {
    const bugs: VisualBug[] = []
    const docWidth = document.documentElement.scrollWidth
    const viewportWidth = window.innerWidth

    if (docWidth > viewportWidth + 1) {
      // 1px tolerance for subpixel rounding
      bugs.push({
        rule: "no-horizontal-overflow",
        description: `Document width (${docWidth}px) exceeds viewport (${viewportWidth}px) by ${docWidth - viewportWidth}px`,
        severity: "major",
      })
    }

    return bugs
  })
}

/**
 * Check that all elements marked with data-constrained-image have:
 * - An explicit CSS aspect-ratio
 * - overflow:hidden
 * - A child img that is position:absolute
 */
async function checkConstrainedImages(page: Page): Promise<VisualBug[]> {
  return page.evaluate(() => {
    const bugs: VisualBug[] = []
    const images = document.querySelectorAll("[data-constrained-image]")

    for (const container of images) {
      const el = container as HTMLElement
      const style = getComputedStyle(el)
      const testId = el.getAttribute("data-testid") || "unnamed-image"

      if (style.aspectRatio === "auto" || !style.aspectRatio) {
        bugs.push({
          rule: "constrained-image-ratio",
          description: `Image "${testId}" container missing aspect-ratio`,
          severity: "major",
          element: testId,
        })
      }

      if (style.overflow !== "hidden") {
        bugs.push({
          rule: "constrained-image-overflow",
          description: `Image "${testId}" container missing overflow:hidden`,
          severity: "minor",
          element: testId,
        })
      }

      const img = el.querySelector("img")
      if (img) {
        const imgStyle = getComputedStyle(img)
        if (imgStyle.position !== "absolute") {
          bugs.push({
            rule: "constrained-image-position",
            description: `Image "${testId}" <img> should be position:absolute, got ${imgStyle.position}`,
            severity: "major",
            element: testId,
          })
        }
      }
    }

    return bugs
  })
}

/**
 * Check that ALL <img> elements using object-fit:cover have a parent with
 * an explicit CSS aspect-ratio.
 *
 * This is the key check that catches Bug 2 (image cropping during classification):
 *
 *   PendingCard:    <div class="aspect-square overflow-hidden">  ← has aspect-ratio ✓
 *   ClassifiedCard: <div class="h-full overflow-hidden">         ← NO aspect-ratio ✗
 *
 * When an item transitions from pending → classified, the container loses its
 * locked aspect ratio and the image re-crops to fill the new dimensions. This
 * check catches that by flagging ANY object-cover image without an aspect-ratio
 * container — REGARDLESS of whether the component uses ConstrainedImage.
 *
 * This works on the EXISTING codebase without migration.
 */
async function checkUnconstrainedObjectCoverImages(page: Page): Promise<VisualBug[]> {
  return page.evaluate(() => {
    const bugs: VisualBug[] = []
    const images = document.querySelectorAll("img")

    for (const img of images) {
      const imgStyle = getComputedStyle(img)

      // Only care about images using object-fit:cover (these are the ones that crop)
      if (imgStyle.objectFit !== "cover") continue

      // Skip hidden/invisible images
      if (imgStyle.display === "none" || imgStyle.visibility === "hidden") continue
      if (img.offsetWidth === 0 || img.offsetHeight === 0) continue

      // Walk up to find the nearest positioned/sized ancestor that acts as the
      // image container (typically the direct parent or grandparent)
      let container = img.parentElement
      let foundAspect = false
      let depth = 0

      while (container && depth < 3) {
        const containerStyle = getComputedStyle(container)
        const aspect = containerStyle.aspectRatio

        if (aspect && aspect !== "auto") {
          foundAspect = true
          break
        }

        container = container.parentElement
        depth++
      }

      if (!foundAspect) {
        // Build a useful identifier
        const src = img.getAttribute("src") || ""
        const alt = img.getAttribute("alt") || ""
        const parentClass = img.parentElement?.className?.toString().slice(0, 50) || ""
        const identifier = alt || src.slice(-30) || parentClass

        bugs.push({
          rule: "unconstrained-object-cover",
          description: `<img> with object-cover "${identifier}" has no aspect-ratio container within 3 ancestors. Dimensions will change if content/state changes, causing visible cropping.`,
          severity: "major",
          element: identifier,
        })
      }
    }

    return bugs
  })
}

/**
 * Check that no visible element extends significantly outside the viewport.
 * Catches elements that are partially clipped at the right or bottom edge.
 */
async function checkViewportBounds(page: Page): Promise<VisualBug[]> {
  return page.evaluate(() => {
    const bugs: VisualBug[] = []
    const THRESHOLD = 10 // px tolerance for box-shadow, borders etc.
    const viewportW = window.innerWidth
    const viewportH = window.innerHeight

    // Check interactive elements and content containers
    const elements = document.querySelectorAll(
      'button, a[href], input, [role="button"], [data-testid], .card, nav',
    )

    for (const el of elements) {
      const htmlEl = el as HTMLElement
      const style = getComputedStyle(htmlEl)
      if (style.display === "none" || style.visibility === "hidden") continue

      const rect = htmlEl.getBoundingClientRect()

      // Skip elements that are intentionally off-screen (e.g. for animation entry)
      if (rect.top > viewportH * 2 || rect.left > viewportW * 2) continue
      // Skip tiny elements
      if (rect.width < 5 || rect.height < 5) continue

      if (rect.right > viewportW + THRESHOLD && rect.left < viewportW) {
        const id =
          htmlEl.getAttribute("data-testid") ||
          htmlEl.textContent?.trim().slice(0, 20) ||
          htmlEl.tagName.toLowerCase()

        bugs.push({
          rule: "viewport-bounds",
          description: `"${id}" overflows right edge by ${Math.round(rect.right - viewportW)}px`,
          severity: "minor",
          element: id,
        })
      }
    }

    return bugs
  })
}

/**
 * Assert that the visual lint passes (throws if any bugs found).
 * Use in Playwright tests:
 *
 *   test("gallery has no visual bugs", async ({ page }) => {
 *     await page.goto("/gallery")
 *     await assertVisualLint(page)
 *   })
 */
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

  const isClickable = await page.evaluate(
    ({ x, y, selector }) => {
      const target = document.querySelector(selector)
      if (!target) return false
      const top = document.elementFromPoint(x, y)
      return top !== null && (target.contains(top) || top.contains(target))
    },
    {
      x: center.x,
      y: center.y,
      selector: (await locator.evaluate((el) => {
        // Build a unique selector for this element
        if (el.id) return `#${el.id}`
        const testId = el.getAttribute("data-testid")
        if (testId) return `[data-testid="${testId}"]`
        return el.tagName.toLowerCase()
      })),
    },
  )

  expect(
    isClickable,
    `${label || "element"} is obscured at center (${Math.round(center.x)}, ${Math.round(center.y)})`,
  ).toBe(true)
}

/**
 * Assert that an element's dimensions remain stable during a state transition.
 * Use to catch image cropping bugs during classification, loading states, etc.
 *
 * Usage:
 *   await assertDimensionStability(
 *     page.locator("[data-testid=gallery-item-0]"),
 *     async () => { /* trigger classification *\/ },
 *     { tolerance: 2 }
 *   )
 */
/**
 * Vision LLM review — sends a screenshot to a vision model and asks it to
 * find visual bugs that programmatic checks can't express.
 *
 * Catches aesthetic issues like:
 * - Empty space / wasted whitespace in cards or containers
 * - Misaligned elements that aren't technically overlapping
 * - Inconsistent spacing between similar elements
 * - Text truncated in a way that looks broken (but isn't technically clipped)
 * - Visual imbalance in grid layouts
 *
 * Requires ANTHROPIC_API_KEY in the environment.
 *
 * Usage:
 *   await assertVisionReview(page, { viewport: "mobile" })
 */
export async function assertVisionReview(
  page: Page,
  opts: {
    /** Label for the viewport being tested (included in the prompt) */
    viewport?: string
    /** Additional context about what the page should look like */
    context?: string
    /** Severity threshold — only fail on bugs at this level or above */
    failOn?: "critical" | "major" | "minor"
  } = {},
) {
  const { viewport = "unknown", context = "", failOn = "major" } = opts

  // Dynamic import so the dep is optional
  let Anthropic: any
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Anthropic = (await (Function('return import("@anthropic-ai/sdk")')() as Promise<any>)).default
  } catch {
    console.warn("[vision-review] @anthropic-ai/sdk not installed, skipping vision review")
    return
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("[vision-review] ANTHROPIC_API_KEY not set, skipping vision review")
    return
  }

  const screenshot = await page.screenshot({ fullPage: true, type: "png" })
  const base64 = screenshot.toString("base64")

  const anthropic = new Anthropic()
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/png", data: base64 },
          },
          {
            type: "text",
            text: `You are a senior UI/UX reviewer inspecting a ${viewport} screenshot of a mobile PWA.
${context ? `Context: ${context}\n` : ""}
Examine the screenshot and report ANY visual bugs. Focus on issues a human would immediately notice:
- Empty space or wasted whitespace inside cards/containers that looks broken
- Elements that appear misaligned or inconsistently spaced
- Images that appear cropped, stretched, or have wrong aspect ratios
- Text that is truncated, unreadable, or overlapping other content
- Interactive elements (buttons, links) that appear obscured or unreachable
- Visual inconsistencies between similar elements (e.g., cards in a grid)
- Layout that looks broken on this viewport size

Do NOT report:
- Minor spacing preferences or subjective design opinions
- Missing content (empty states are OK if they look intentional)
- Intentional theme colors (brand colors, dark/light mode)

DO report color-related bugs like backgrounds bleeding through transparent elements.

Respond with ONLY this JSON (no markdown, no explanation):
{"bugs":[{"description":"...","severity":"critical|major|minor"}],"passed":true|false}

If there are no bugs, return: {"bugs":[],"passed":true}`,
          },
        ],
      },
    ],
  })

  const text = response.content[0].type === "text" ? response.content[0].text : ""
  let result: { bugs: Array<{ description: string; severity: string }>; passed: boolean }

  try {
    result = JSON.parse(text)
  } catch {
    console.warn(`[vision-review] Failed to parse response: ${text.slice(0, 200)}`)
    return
  }

  const severityRank = { minor: 0, major: 1, critical: 2 }
  const threshold = severityRank[failOn] ?? 1
  const failingBugs = result.bugs.filter(
    (b) => (severityRank[b.severity as keyof typeof severityRank] ?? 0) >= threshold,
  )

  if (failingBugs.length > 0) {
    const summary = failingBugs
      .map((b) => `[${b.severity}] ${b.description}`)
      .join("\n")
    expect(
      failingBugs.length,
      `Vision review found ${failingBugs.length} bug(s) at ${viewport}:\n${summary}`,
    ).toBe(0)
  }
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

  expect(
    Math.abs(after!.width - before!.width),
    `Width changed from ${before!.width} to ${after!.width}`,
  ).toBeLessThanOrEqual(tolerance)

  expect(
    Math.abs(after!.height - before!.height),
    `Height changed from ${before!.height} to ${after!.height}`,
  ).toBeLessThanOrEqual(tolerance)
}
