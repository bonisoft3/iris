import { test, expect } from "@playwright/test"
import { visualLint } from "../src/lint/playwright/visual-lint"
import { assertVisionReview } from "../src/lint/playwright/vision-review"

const STORYBOOK = "http://localhost:6006"

const STORIES = [
  "components-cardsetcard--default",
  "components-cardsetcard--empty",
  "components-cardsetcard--long-name",
  "pages-dashboard--default",
  "components-editcarddialog--open",
  "components-errorfallback--default",
  "components-flashcardcard--with-image",
  "components-flashcardcard--flipped",
  "components-flashcardcard--no-image",
  "components-generationform--empty",
  "components-generationform--with-quick-suggestion",
  "components-onboarding--default",
  "components-pdfexportbutton--default",
  "components-reviewsession--default",
  "components-reviewsession--empty",
  "components-themetoggle--default",
]

for (const storyId of STORIES) {
  test(`visual lint — ${storyId}`, async ({ page }) => {
    await page.goto(`${STORYBOOK}/iframe.html?id=${storyId}&viewMode=story`)
    await page.waitForTimeout(5000)
    const result = await visualLint(page)
    for (const bug of result.bugs) console.log(`  [${bug.severity}] ${bug.rule}: ${bug.description}`)
    // Fail on critical/major — minor issues (focus-order) are logged but not blocking
    const blocking = result.bugs.filter(b => b.severity === "critical" || b.severity === "major")
    expect(blocking.length, `Visual lint:\n${blocking.map(b => `[${b.severity}] ${b.rule}: ${b.description}`).join("\n")}`).toBe(0)
  })
}

const VISION_STORIES = [
  { id: "pages-dashboard--default", context: "Dashboard with card sets grid. Odd numbers of cards in a 2-column grid are expected — the last row may have a single card. Seed data may include cards in multiple languages." },
  { id: "components-flashcardcard--with-image", context: "Flashcard with image" },
  { id: "components-generationform--empty", context: "Card generation form" },
  { id: "components-reviewsession--default", context: "Card review session" },
]

for (const { id, context } of VISION_STORIES) {
  test(`vision review — ${id}`, async ({ page }) => {
    await page.goto(`${STORYBOOK}/iframe.html?id=${id}&viewMode=story`)
    await page.waitForTimeout(5000)
    await assertVisionReview(page, { viewport: "desktop", context, failOn: "major" })
  })
}
