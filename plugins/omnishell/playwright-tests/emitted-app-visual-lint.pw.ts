// The visual-lint battery pointed at a running pronto-emitted app rather than
// at a component storybook. `plugins/pronto/docs/2026-08-01-visual-lint.md`
// names this as the gap: nine DOM checks exist, no emitted app is a consumer,
// and a check no verb reaches does not exist.
//
//   APP_URL=http://localhost:8090 APP_DIR=../../apps/realworld \
//     bun run test:pw emitted-app-visual-lint
//
// Unlike the storybook surface the doc measures, here the frame *is* the
// viewport, so every geometry check resolves against the box it was written
// for. Two viewports: a desktop one, and 400px, where a phone-shaped layout
// turns `touch-targets` on and puts absolutely-positioned chrome on top of
// flow content.
import { test, expect } from "@playwright/test"
import { visualLint } from "../src/lint/playwright/visual-lint"
import { captureConsole } from "../src/lint/playwright/checks/console-messages"
import { appContext, fillRoute, openRoute, routePatterns, type AppContext } from "./emitted-app"

// Electric warns once per boot that HTTP/1.1 caps concurrent shapes. It is a
// property of the dev cluster's scheme, not of any screen.
const IGNORE = [/\[Electric\] Using HTTP \(not HTTPS\)/]

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "narrow", width: 400, height: 900 },
]

const lint = test.extend<Record<string, never>, { app: AppContext }>({
  app: [async ({}, use) => await use(await appContext()), { scope: "worker" }],
})

for (const viewport of VIEWPORTS) {
  lint.describe(viewport.name, () => {
    lint.use({ viewport: { width: viewport.width, height: viewport.height } })

    for (const pattern of routePatterns()) {
      lint(`${pattern}`, async ({ page, app }) => {
        const url = fillRoute(pattern, app.params)
        const console_ = captureConsole(page)
        const state = await openRoute(page, app, url)
        // `gone` is what a route renders for a row that is not there: the
        // fixture missed, and everything measured below is the empty screen.
        expect(state, `${url} rendered the gone state — fixture value is stale`).not.toBe("gone")

        const result = await visualLint(page, console_)
        console_.dispose()
        const bugs = result.bugs.filter((b) => !IGNORE.some((re) => re.test(b.description)))

        if (bugs.length) {
          const lines = bugs.map((b) => `    [${b.severity}] ${b.rule}: ${b.description}`)
          console.log(
            `\n### ${viewport.name} ${pattern}  (url ${url}, state ${state}) — ${bugs.length} finding(s)\n${lines.join("\n")}`,
          )
        }
        const report = bugs.map((b) => `${b.rule}: ${b.description}`).join("\n")
        expect(report, `${viewport.name} ${pattern} (${url})`).toBe("")
      })
    }
  })
}
