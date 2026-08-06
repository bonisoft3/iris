// Fixtures for driving a running pronto-emitted app from Playwright.
//
// The app is a cluster: Caddy in front of the shell statics, the /crud
// gateway, /auth and Electric. Nothing here starts it — point APP_URL at a
// stack that is already up.
import type { Page } from "@playwright/test"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import crypto from "node:crypto"

export const APP = process.env.APP_URL ?? "http://localhost:8090"
export const APP_DIR =
  process.env.APP_DIR ??
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../apps/realworld")
// The dev signing key. A cluster holding a real key is not a lint target.
const SECRET = process.env.JWT_SECRET ?? "pronto-dev-secret-please-override-32ch"
const HANDLE = process.env.APP_HANDLE ?? "rustic-heron-17"

const b64u = (b: Buffer) => b.toString("base64url")

/** A session token for an existing row, minted rather than earned: CDP cannot drive the passkey ceremony. */
export function mint(sub: string): string {
  const h = b64u(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })))
  const p = b64u(
    Buffer.from(
      JSON.stringify({ role: "app_user", sub, exp: Math.floor(Date.now() / 1000) + 7200 }),
    ),
  )
  const s = crypto.createHmac("sha256", SECRET).update(`${h}.${p}`).digest()
  return `${h}.${p}.${b64u(s)}`
}

async function api<T>(pathAndQuery: string, token: string): Promise<T> {
  const r = await fetch(`${APP}${pathAndQuery}`, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) throw new Error(`GET ${pathAndQuery} -> ${r.status} ${await r.text()}`)
  return r.json() as Promise<T>
}

/**
 * Route patterns straight from the app's own shell.yaml, so a screen added to
 * program.cue is linted without touching this file.
 *
 * `path:` appears only under `routes:` in the emitted file, and the runner is
 * node with no YAML parser in its dependency set — hence the slice rather than
 * a parse.
 */
export function routePatterns(): string[] {
  const yaml = readFileSync(path.join(APP_DIR, "shell/shell.yaml"), "utf8")
  const start = yaml.indexOf("\nroutes:\n")
  if (start < 0) throw new Error(`no routes: block in ${APP_DIR}/shell/shell.yaml`)
  const rest = yaml.slice(start + 1)
  const end = rest.search(/\n[a-z_]+:/)
  const block = end < 0 ? rest : rest.slice(0, end)
  const paths = [...block.matchAll(/^\s*-?\s*path: '?([^'\n]+)'?$/gm)].map((m) => m[1]!)
  if (!paths.length) throw new Error("no route paths parsed from shell.yaml")
  return paths
}

export type Session = { token: string; user: { id: string; handle: string } }
export type AppContext = {
  session: Session
  /** Real values keyed by the param name every route pattern uses. */
  params: Record<string, string>
}

type Row = Record<string, unknown>

/**
 * Real row values for every parametrized segment. A placeholder renders the
 * `gone` state, and linting an empty screen measures nothing.
 */
export async function appContext(): Promise<AppContext> {
  const guest: Session = await fetch(`${APP}/auth/guest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  }).then((r) => r.json() as Promise<Session>)
  const scout = guest.token

  const [me] = await api<Row[]>(
    `/crud/app_user?select=id,handle&handle=eq.${HANDLE}`,
    scout,
  )
  if (!me) throw new Error(`no app_user with handle ${HANDLE}`)
  const session: Session = {
    token: mint(me.id as string),
    user: { id: me.id as string, handle: me.handle as string },
  }

  const articles = await api<Row[]>(
    "/crud/article?select=id,slug,title,created_at,author:app_user(handle)&order=created_at.desc",
    scout,
  )
  const comments = await api<Row[]>("/crud/comment?select=article_id", scout)
  const favorites = await api<Row[]>(
    "/crud/favorite_index?select=article_id,user:app_user(handle)&active=is.true",
    scout,
  )
  const [tag] = await api<Row[]>(
    "/crud/tag_count?select=id&article_count=gt.0&order=article_count.desc,id.asc&limit=1",
    scout,
  )
  if (!articles.length || !tag) throw new Error("app has no seeded articles or tags")

  // The busiest article: the one screen where comments, tags and stats all paint.
  const commentCount = new Map<string, number>()
  for (const c of comments) {
    const k = c.article_id as string
    commentCount.set(k, (commentCount.get(k) ?? 0) + 1)
  }
  const article =
    [...articles].sort(
      (a, b) =>
        (commentCount.get(b.id as string) ?? 0) - (commentCount.get(a.id as string) ?? 0),
    )[0]!

  // A handle that both authored and favorited, so /profile/:handle and
  // /profile/:handle/favorites are both populated for the same subject.
  const authors = new Set(articles.map((a) => (a.author as Row).handle as string))
  const favoriter = favorites
    .map((f) => (f.user as Row).handle as string)
    .find((h) => authors.has(h))
  const profile = favoriter ?? ((article.author as Row).handle as string)

  return {
    session,
    params: {
      slug: article.slug as string,
      id: article.id as string,
      handle: profile,
      name: tag.id as string,
      // Strictly-older cursor: the newest row's timestamp leaves the rest to paint.
      when: articles[0]!.created_at as string,
      q: await searchTerm(articles, scout),
    },
  }
}

/** A term the full-text index actually matches — a guessed word lints an empty screen. */
async function searchTerm(articles: Row[], token: string): Promise<string> {
  const words = [
    ...new Set(
      articles
        .flatMap((a) => (a.title as string).toLowerCase().split(/[^a-z]+/))
        .filter((w) => w.length >= 4),
    ),
  ]
  for (const w of words) {
    const hits = await api<Row[]>(
      `/crud/article?select=id&search=plfts(simple).${w}&limit=1`,
      token,
    )
    if (hits.length) return w
  }
  throw new Error("no title word matches the search index")
}

/**
 * Load one route with a session already in place.
 *
 * The shell reads sessionStorage before first paint, so the seed has to be an
 * init script and the navigation has to be a full load — a hash-only change
 * re-renders without re-running boot.
 *
 * Never wait for `networkidle` here: Electric holds its shape connections open,
 * so that state never arrives and the wait consumes the whole test timeout.
 */
export async function openRoute(page: Page, ctx: AppContext, url: string): Promise<string> {
  await page.addInitScript(
    (s) => sessionStorage.setItem("pronto-token", JSON.stringify(s)),
    ctx.session,
  )
  await page.goto(`${APP}/shell/#${url}`, { waitUntil: "domcontentloaded" })
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
  // Late arrivals — image decode, a second shape — move geometry after the
  // first non-loading state and would otherwise be measured mid-flight.
  await page.waitForTimeout(1200)
  return state
}

/** Substitute real values for `:param` segments in a route pattern. */
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
