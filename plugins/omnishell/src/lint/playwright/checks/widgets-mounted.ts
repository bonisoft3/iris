/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import type { Page } from "@playwright/test"
import type { VisualBug } from "../types"

/**
 * A screen that declares a widget must end up with a live machine behind it.
 *
 * Nothing else notices when this fails: the markup is authored, so the parts
 * are all in the DOM and the screen looks finished — it is only inert, and a
 * unit test driving the dispatcher directly stays green through it.
 *
 * `data-scope` is Zag's own stamp, applied by the first props pass, so its
 * presence means the machine started rather than that the markup mentions it.
 */
export async function checkWidgetsMounted(page: Page): Promise<VisualBug[]> {
  return page.evaluate(() => {
    const bugs: Array<{ rule: string; description: string; severity: "critical" | "major" | "minor" }> = []
    for (const root of document.querySelectorAll("[data-widget]")) {
      if (root.hasAttribute("data-scope")) continue
      bugs.push({
        rule: "widget-mounted",
        description: `[data-widget="${root.getAttribute("data-widget")}"] never mounted: no machine stamped it, so its affordance is inert`,
        severity: "critical",
      })
    }
    return bugs
  })
}
