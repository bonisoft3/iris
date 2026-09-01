// pronto visual lint: the terminal's own rendering invariants, measured
// against a running app.
//
//   deno run -A ../../plugins/omnishell/check-visual.ts .
//   deno run ../../plugins/omnishell/check-visual.ts --self-test
//
// The DOM checks under src/lint/playwright/ describe omnishell's rendering
// surface rather than any one app's, which is why the terminal declares them
// and no app restates them. They need a laid-out page over real content, so
// this runs at integrate with the cluster up. The fixture storybook cannot
// host them: there a screen is a 360px frame on a flex board, so every
// geometry check resolves against the board instead of the screen.
//
// Findings print as {severity, path, message} JSON (SPEC.md lint format).
// Only `critical` exits non-zero. A rendered-page battery reports genuine but
// advisory design findings at major/minor — tap targets below the AAA size,
// focus-order nits — and a gate that fails on advice is muted within a week,
// taking the criticals with it.
import { parse as parseYaml } from "jsr:@std/yaml@1.0.5"
import { checkInteractiveOverlap } from "./src/lint/playwright/checks/interactive-overlap.ts"
import { checkHorizontalOverflow } from "./src/lint/playwright/checks/horizontal-overflow.ts"
import { checkConstrainedImages } from "./src/lint/playwright/checks/constrained-images.ts"
import { checkViewportBounds } from "./src/lint/playwright/checks/viewport-bounds.ts"
import { checkTouchTargets } from "./src/lint/playwright/checks/touch-targets.ts"
import { checkWidgetsMounted } from "./src/lint/playwright/checks/widgets-mounted.ts"
import { checkFocusOrder } from "./src/lint/playwright/checks/focus-order.ts"
import { captureConsole, analyzeConsole } from "./src/lint/playwright/checks/console-messages.ts"
import type { VisualBug } from "./src/lint/playwright/types.ts"

type Finding = { severity: string; path: string; message: string }
/** Only what this driver drives; the checks take @playwright/test's Page, which is the same object. */
type PageLike = {
  goto(url: string, opts?: unknown): Promise<unknown>
  waitForFunction(fn: unknown, arg?: unknown, opts?: unknown): Promise<{ jsonValue(): Promise<unknown> }>
  evaluate(fn: unknown, arg?: unknown): Promise<unknown>
  close(): Promise<void>
}
/** Likewise: the one method a lane calls on a viewport's context. */
type ContextLike = { newPage(): Promise<PageLike> }
type Read = { entity?: string; filter?: string }
type Route = { path: string; reads?: Read[] }

type Viewport = { name: string; width: number; height: number }
const VIEWPORTS: Viewport[] = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "narrow", width: 400, height: 900 },
]

// Routes in flight per viewport. The two viewports already run as separate
// contexts, so the browser holds up to twice this many live pages. Past four
// the wall clock flattens: what the battery spends is round trips to one
// browser, not CPU it could spread wider.
const LANES = 4

// WCAG 2.5.8 (AA). The battery's own default is 2.5.5's 44px, which on a
// content surface reports every article title and byline — real advice, but
// not a gate. See checks/touch-targets.ts.
const TOUCH_MIN = 24

// A screen is ready to measure when it stops changing. This long without a
// mutation, a moved box or a loading image means it has; past the cap it is
// still changing and says so. A constant wait instead of a predicate would
// have to be sized for the slowest screen, be paid by every screen, and still
// be a guess on the slowest one.
const SETTLE_STABLE_MS = 100
const SETTLE_CAP_MS = 2500

/** Electric announces its transport once per boot; a property of the dev cluster, not a screen. */
// SES announces every intrinsic it removes when a compartment is first built.
// That is the terminal's own vendored runtime talking, and it says the same
// dozen lines for every app that evaluates a Jessie module — it is not the
// app's console and must not spend the app's advisory budget.
const IGNORE = [
  /\[Electric\] Using HTTP \(not HTTPS\)/,
  /ERR_NETWORK_IO_SUSPENDED/,
  /^Removing intrinsics\./,
]

/** Entity names are PascalCase in the program and snake_case in Postgres. */
export function tableFor(entity: string): string {
  return entity.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase()
}

export function routesFrom(yamlText: string): Route[] {
  const doc = parseYaml(yamlText) as { routes?: Route[] }
  if (!doc?.routes?.length) throw new Error("no routes: block in shell.yaml")
  return doc.routes
}

export type ParamPlan = { param: string; entity: string; column: string; op: string }

/**
 * Where each `:param` gets a real value. A route declares its own reads, and
 * exactly one of them filters on the param — so the fixture is derivable from
 * the program rather than hardcoded per app. A placeholder segment renders the
 * `gone` state, and linting an empty screen measures nothing.
 */
export function paramPlans(routes: Route[]): ParamPlan[] {
  const plans = new Map<string, ParamPlan>()
  for (const route of routes) {
    for (const seg of route.path.split("/")) {
      if (!seg.startsWith(":")) continue
      const param = seg.slice(1)
      if (plans.has(param)) continue
      for (const read of route.reads ?? []) {
        if (!read.filter || !read.entity) continue
        // e.g. `slug=eq.{param.slug}`, `created_at=lt.{param.when}`,
        // `article_tag.tag=eq.{param.name}`, `search=plfts(simple).{param.q}`
        const m = read.filter.match(
          new RegExp(`([\\w.]+)=([a-z]+(?:\\([^)]*\\))?)\\.\\{param\\.${param}\\}`),
        )
        if (!m) continue
        plans.set(param, { param, entity: read.entity, column: m[1], op: m[2] })
        break
      }
    }
  }
  return [...plans.values()]
}

/** Substitute resolved values for `:param` segments. */
export function fillRoute(pattern: string, params: Record<string, string>): string {
  return pattern
    .split("/")
    .map((seg) => {
      if (!seg.startsWith(":")) return seg
      const v = params[seg.slice(1)]
      if (v === undefined) throw new Error(`no fixture value for :${seg.slice(1)}`)
      return encodeURIComponent(v)
    })
    .join("/")
}

async function crud<T>(base: string, q: string, token: string): Promise<T> {
  const r = await fetch(`${base}/crud/${q}`, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) throw new Error(`GET /crud/${q} -> ${r.status} ${await r.text()}`)
  return r.json() as Promise<T>
}

/**
 * Ask the running cluster for a value that makes each parametrized route
 * paint. `lt`/`gt` cursors take the extreme so the rest of the set remains;
 * full-text search samples a word the index actually matches.
 */
async function resolveParams(
  base: string,
  token: string,
  plans: ParamPlan[],
): Promise<{ params: Record<string, string>; unresolved: string[] }> {
  const params: Record<string, string> = {}
  const unresolved: string[] = []
  for (const plan of plans) {
    const table = tableFor(plan.entity)
    // An embedded column (`article_tag.tag`) is selected through its relation.
    const [rel, embedded] = plan.column.includes(".") ? plan.column.split(".") : [null, null]
    const select = rel ? `${rel}(${embedded})` : plan.column
    try {
      if (plan.op.startsWith("plfts")) {
        const rows = await crud<Record<string, unknown>[]>(
          base,
          `${table}?select=title&limit=40`,
          token,
        )
        const words = [
          ...new Set(
            rows.flatMap((r) => String(r.title ?? "").toLowerCase().split(/[^a-z]+/)).filter((w) => w.length >= 4),
          ),
        ]
        let hit: string | undefined
        for (const w of words) {
          const got = await crud<unknown[]>(base, `${table}?select=id&${plan.column}=${plan.op}.${w}&limit=1`, token)
          if (got.length) { hit = w; break }
        }
        if (hit) params[plan.param] = hit
        else unresolved.push(plan.param)
        continue
      }
      const order = plan.op === "lt" ? `&order=${plan.column}.desc` : plan.op === "gt" ? `&order=${plan.column}.asc` : ""
      const rows = await crud<Record<string, unknown>[]>(
        base,
        `${table}?select=${select}${order}&limit=1`,
        token,
      )
      const row = rows[0]
      if (!row) { unresolved.push(plan.param); continue }
      const raw = rel ? (Array.isArray(row[rel]) ? (row[rel] as Record<string, unknown>[])[0]?.[embedded!] : (row[rel] as Record<string, unknown>)?.[embedded!]) : row[plan.column]
      if (raw === undefined || raw === null) unresolved.push(plan.param)
      else params[plan.param] = String(raw)
    } catch {
      unresolved.push(plan.param)
    }
  }
  return { params, unresolved }
}

/**
 * Never wait for networkidle: Electric holds its shape connections open, so
 * that state never arrives and the wait consumes the whole timeout.
 */
async function openRoute(
  page: PageLike,
  base: string,
  url: string,
): Promise<{ state: string; settled: boolean }> {
  await page.goto(`${base}/shell/#${url}`, { waitUntil: "domcontentloaded" })
  const state = await page
    .waitForFunction(
      () => {
        const el = document.querySelector("#app .shell-screen:not([hidden]) .screen")
        const s = el?.getAttribute("data-state")
        return s && s !== "loading" ? s : null
      },
      undefined,
      { timeout: 20_000 },
    )
    .then((h) => h.jsonValue() as Promise<string>)
  return { state, settled: await settle(page) }
}

/**
 * Hold until the screen stops becoming itself: no DOM mutation, no geometry
 * change, no image still loading, for one quiet interval.
 *
 * Mutation matters as much as motion. A widget machine stamps `data-scope`
 * without moving a box, and `checkWidgetsMounted` reads that attribute — a
 * predicate watching only geometry would clear the screen before the widget
 * it is about to call inert has mounted.
 *
 * Console messages need no separate window: measured across two apps, every
 * error and warning arrived before this predicate cleared, because what logs
 * during boot is what mutates the DOM. An error with no DOM effect at all
 * could still outrun it, and always could.
 *
 * Sampling runs in the page — one round trip for the whole wait, and the
 * geometry never crosses the wire. False means the cap came first, which the
 * caller reports. The cap is armed before anything else is awaited:
 * `page.evaluate` takes no timeout, so a promise that never settles in here
 * would hang the run with no output at all.
 */
export async function settle(page: PageLike): Promise<boolean> {
  return await page.evaluate(
    ({ stableMs, capMs }: { stableMs: number; capMs: number }) =>
      new Promise<boolean>((resolve) => {
        let done = false
        const finish = (quiet: boolean) => {
          if (done) return
          done = true
          observer.disconnect()
          resolve(quiet)
        }
        const cap = setTimeout(() => finish(false), capMs)

        let mutated = true
        const observer = new MutationObserver(() => {
          mutated = true
        })
        observer.observe(document.documentElement, {
          attributes: true,
          characterData: true,
          childList: true,
          subtree: true,
        })

        const fingerprint = () => {
          let h = 0
          for (const el of document.querySelectorAll("*")) {
            const r = el.getBoundingClientRect()
            const s = `${r.x},${r.y},${r.width},${r.height}`
            for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
          }
          return h
        }
        // Read fresh each sample: an image the second shape inserts is not in
        // any list taken earlier. `complete` covers errored images too, where
        // awaiting decode() would wait on a promise that never settles.
        const loading = () => [...document.images].some((img) => !img.complete)

        let previous = fingerprint()
        let stableSince = performance.now()
        const sample = () => {
          if (done) return
          const now = performance.now()
          const current = fingerprint()
          if (mutated || current !== previous || loading()) {
            mutated = false
            previous = current
            stableSince = now
          } else if (now - stableSince >= stableMs) {
            clearTimeout(cap)
            return finish(true)
          }
          setTimeout(sample, 50)
        }
        setTimeout(sample, 50)
      }),
    { stableMs: SETTLE_STABLE_MS, capMs: SETTLE_CAP_MS },
  ) as boolean
}

/** The host port compose actually published, rather than the compose default. */
async function baseUrl(appDir: string): Promise<string> {
  const fromEnv = Deno.env.get("APP_URL")
  if (fromEnv) return fromEnv
  const out = await new Deno.Command("docker", {
    args: ["compose", "port", "caddy", "8443"],
    cwd: appDir,
    stdout: "piped",
    stderr: "piped",
  }).output()
  const text = new TextDecoder().decode(out.stdout).trim()
  const port = text.split("\n")[0]?.split(":").pop()
  if (!out.success || !port) {
    throw new Error(`could not read the published caddy port: ${new TextDecoder().decode(out.stderr).trim()}`)
  }
  return `https://localhost:${port}`
}

async function main(appDir: string): Promise<number> {
  // Lazily, because playwright touches the environment at module scope and
  // --self-test must stay runnable with no permissions.
  const { chromium } = await import("npm:playwright@1.59.1")
  const base = await baseUrl(appDir)
  const routes = routesFrom(await Deno.readTextFile(`${appDir}/shell/shell.yaml`))

  // A guest is a real row, so it needs no signing key and no seeded handle.
  const session = await fetch(`${base}/auth/guest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  }).then((r) => (r.ok ? (r.json() as Promise<{ token: string }>) : { token: "" })).catch(() => ({ token: "" }))

  const { params, unresolved } = await resolveParams(base, session.token, paramPlans(routes))
  const findings: Finding[] = []

  // A route whose param never resolved is a coverage hole, not a pass.
  for (const p of unresolved) {
    findings.push({
      severity: "major",
      path: "shell/shell.yaml",
      message: `no fixture value for :${p} — every route using it went unlinted. Seed a row the param's read can match.`,
    })
  }

  // A route whose param never resolved was already reported above; linting it
  // would measure the gone state.
  const live = routes.filter(
    (route) => !route.path.split("/").some((s) => s.startsWith(":") && params[s.slice(1)] === undefined),
  )

  const lintRoute = async (context: ContextLike, viewport: Viewport, route: Route, out: Finding[]) => {
    const url = fillRoute(route.path, params)
    const where = `${viewport.name} ${route.path}`
    // Opening the page is inside the report: at eight pages in flight the
    // browser can refuse one, and a lane that threw would take every finding
    // both boards had collected with it.
    let page: PageLike
    let console_: ReturnType<typeof captureConsole>
    try {
      page = await context.newPage()
      // Armed before navigation: the leak this hunts is transient by nature —
      // a binding's brace text painted during the hydration window — so the
      // sampler must be watching from the first frame. innerText is the
      // rendered projection: it never sees a <template>'s content, script or
      // style text (an inline script templating {dx} is not a leak), or the
      // data-* attributes the binder consumes — so anything matched was
      // really painted. The runtime twin of the typechecker's R5.
      await (page as { addInitScript?: (fn: () => void) => Promise<void> }).addInitScript?.(() => {
        const leaks = new Set<string>()
        ;(window as unknown as { __placeholderLeaks: Set<string> }).__placeholderLeaks = leaks
        const tick = () => {
          const t = document.body?.innerText
          if (t) for (const m of t.match(/\{[\w.]+\}/g) ?? []) leaks.add(m)
          if (leaks.size < 20) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
      console_ = captureConsole(page as never)
    } catch (err) {
      out.push({
        severity: "critical",
        path: url,
        message: `${where}: no page to lint in — ${err instanceof Error ? err.message : String(err)}`,
      })
      return
    }
    try {
      const { state, settled } = await openRoute(page, base, url)
      if (state === "gone") {
        out.push({
          severity: "major",
          path: url,
          message: `${where}: rendered the gone state, so nothing below was measured — the fixture value is stale.`,
        })
        return
      }
      if (!settled) {
        out.push({
          severity: "major",
          path: url,
          message: `${where}: still moving after ${SETTLE_CAP_MS}ms, so everything below measured a moving screen.`,
        })
      }
      const p = page as never
      // theme-stability is absent by design: it toggles a `.dark` class,
      // and pronto themes through prefers-color-scheme plus a `-dark`
      // state suffix, so the toggle changes no computed colour and the
      // check passes without measuring. cls is absent because its 3s
      // settle makes it a property of the harness's pacing here rather
      // than of the screen.
      const bugs: VisualBug[] = (
        await Promise.all([
          checkInteractiveOverlap(p),
          checkHorizontalOverflow(p),
          checkConstrainedImages(p),
          checkViewportBounds(p),
          checkTouchTargets(p, { minSize: TOUCH_MIN }),
          checkWidgetsMounted(p),
          checkFocusOrder(p),
        ])
      ).flat()
      bugs.push(...analyzeConsole(console_, { ignore: IGNORE }))
      const leaked = (await page.evaluate(() => {
        const w = window as unknown as { __placeholderLeaks?: Set<string> }
        const now = document.body?.innerText?.match(/\{[\w.]+\}/g) ?? []
        return [...new Set([...(w.__placeholderLeaks ?? []), ...now])]
      })) as string[]
      if (leaked.length > 0) {
        bugs.push({
          severity: "critical",
          rule: "placeholder-leak",
          description: `rendered binding text reached the screen: ${leaked.slice(0, 5).join(", ")}` +
            (leaked.length > 5 ? ` (+${leaked.length - 5} more)` : ""),
        })
      }
      for (const b of bugs) {
        out.push({
          severity: b.severity,
          path: url,
          message: `${where} [${b.rule}] ${b.description}`,
        })
      }
    } catch (err) {
      out.push({
        severity: "critical",
        path: url,
        message: `${where}: could not be linted — ${err instanceof Error ? err.message : String(err)}`,
      })
    } finally {
      console_.dispose()
      // A page whose browser already died throws on close; the findings this
      // route produced are worth more than the tidy teardown.
      await page.close().catch(() => {})
    }
  }

  // Each job owns the findings it produces. The lanes finish in whatever order
  // they finish, and the output stays in viewport-then-route order — so the
  // order is stable run to run even though the set need not be: a console
  // message or a screen that misses the settle cap is wall-clock dependent.
  const boards = VIEWPORTS.map((viewport) => ({
    viewport,
    failure: [] as Finding[],
    jobs: live.map((route) => ({ route, out: [] as Finding[] })),
  }))

  const browser = await chromium.launch()
  try {
    // Never rejects: a board that fails records why and lets its sibling
    // finish, rather than reaching the browser.close() below while the other
    // board still has pages open on it.
    await Promise.all(
      boards.map(async ({ viewport, failure, jobs }) => {
        // The door is TLS on a certificate mkcert issued for the developer's own
        // trust store, which this browser does not share. Ignoring it is the
        // whole reason the battery can drive h2 without a per-CI trust install.
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          viewport: { width: viewport.width, height: viewport.height },
        })
        try {
          await context.addInitScript((s) => sessionStorage.setItem("pronto-token", JSON.stringify(s)), session)
          let next = 0
          const lane = async () => {
            for (;;) {
              const job = jobs[next++]
              if (!job) return
              await lintRoute(context, viewport, job.route, job.out)
            }
          }
          await Promise.all(Array.from({ length: Math.min(LANES, jobs.length) }, lane))
        } catch (err) {
          failure.push({
            severity: "critical",
            path: "shell/shell.yaml",
            message: `${viewport.name}: the viewport went unlinted — ${err instanceof Error ? err.message : String(err)}`,
          })
        } finally {
          await context.close().catch(() => {})
        }
      }),
    )
  } finally {
    await browser.close()
  }
  findings.push(...boards.flatMap((b) => [...b.failure, ...b.jobs.flatMap((j) => j.out)]))

  console.log(JSON.stringify(findings, null, 2))
  const critical = findings.filter((f) => f.severity === "critical")
  if (critical.length) {
    console.error(`\ncheck-visual: ${critical.length} critical finding(s); ${findings.length - critical.length} advisory.`)
    return 1
  }
  console.error(`check-visual: no critical findings; ${findings.length} advisory.`)
  return 0
}

function selfTest() {
  const yaml = [
    "routes:",
    "  - path: /",
    "    reads:",
    "      - entity: Article",
    "        filter: limit=20",
    "  - path: /article/:slug",
    "    reads:",
    "      - entity: Article",
    "        filter: 'slug=eq.{param.slug}'",
    "  - path: /tag/:name",
    "    reads:",
    "      - entity: Article",
    "        filter: 'article_tag.tag=eq.{param.name}&limit=20'",
    "  - path: /older/:when",
    "    reads:",
    "      - entity: ArticleStats",
    "        filter: 'created_at=lt.{param.when}&limit=20'",
    "  - path: /search/:q",
    "    reads:",
    "      - entity: Article",
    "        filter: 'search=plfts(simple).{param.q}&limit=20'",
  ].join("\n")
  const routes = routesFrom(yaml)
  const plans = paramPlans(routes)
  const by = Object.fromEntries(plans.map((p) => [p.param, p]))
  const eq = (got: unknown, want: unknown, what: string) => {
    const g = JSON.stringify(got), w = JSON.stringify(want)
    if (g !== w) throw new Error(`${what}: got ${g}, want ${w}`)
  }
  eq(routes.length, 5, "route count")
  eq(by.slug, { param: "slug", entity: "Article", column: "slug", op: "eq" }, "slug plan")
  eq(by.name, { param: "name", entity: "Article", column: "article_tag.tag", op: "eq" }, "embedded column plan")
  eq(by.when, { param: "when", entity: "ArticleStats", column: "created_at", op: "lt" }, "cursor plan")
  eq(by.q, { param: "q", entity: "Article", column: "search", op: "plfts(simple)" }, "full-text plan")
  eq(tableFor("ArticleStats"), "article_stats", "tableFor")
  eq(tableFor("Article"), "article", "tableFor single word")
  eq(fillRoute("/article/:slug", { slug: "a b" }), "/article/a%20b", "fillRoute encodes")
  console.log("check-visual: self-test ok")
}

if (import.meta.main) {
  if (Deno.args[0] === "--self-test") {
    selfTest()
    Deno.exit(0)
  }
  if (Deno.args.length === 0) {
    console.error("usage: check-visual.ts <app dir> | --self-test")
    Deno.exit(1)
  }
  Deno.exit(await main(Deno.args[0]))
}
