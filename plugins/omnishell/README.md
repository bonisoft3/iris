# @omnishell/core

Frontend framework that makes UI bugs harder to introduce. Fewer patterns, stricter types, architectural rails over flexibility.

## Modules

### Auth

Pluggable biometric-first authentication with WebAuthn as the default.

```typescript
import { createAuth, WebAuthnAdapter, MemoryStorage } from "@omnishell/core"

const auth = createAuth({
  biometric: new WebAuthnAdapter({ rpName: "My App", rpID: "myapp.com", origin: "https://myapp.com" }),
  storage: new MemoryStorage(),
  secret: process.env.AUTH_SECRET,
})
```

Browser-only mode (no server):

```typescript
import { LocalStorageAdapter, createBrowserSessionManager } from "@omnishell/core"
```

### Layout

Config-driven sidebar/bottom-nav with responsive breakpoints.

```typescript
import { createLayout } from "@omnishell/core"
import { Home, Settings } from "lucide-react"

const { AppShell } = createLayout({
  items: [
    { path: "/", label: "Home", icon: Home },
    { path: "/settings", label: "Settings", icon: Settings },
  ],
})
```

### Lint

10 ESLint rules enforcing architectural rails + Tailwind preset.

```typescript
// eslint.config.mjs
import { omnishellLint } from "@omnishell/core/lint/eslint"
export default [...omnishellLint]
```

### Visual Lint (Playwright)

Deterministic layout checks + AI vision review.

```typescript
import { visualLint, assertVisualLint } from "@omnishell/core/lint/playwright/visual-lint"
import { assertVisionReview } from "@omnishell/core/lint/playwright/vision-review"
```

### Storybook

AI component review + regression gate.

```typescript
import { reviewComponentScreenshot, detectRegression } from "@omnishell/core/lint/storybook/ai-review"
```

## Scaffold

The `scaffold/` directory is a working TanStack Start app demonstrating all patterns:

```bash
cd scaffold && bun run dev  # starts app (port 3000) + Storybook (port 6006)
```

## TODO: Distribution

Omnishell is consumed as TypeScript source, which is ideal for HMR (edit a lint rule, see the change immediately). But ESLint under Node ESM can't resolve extensionless `.ts` inter-module imports. Current workaround: `bun build` a bundle on demand, but this breaks HMR.

The right fix: make omnishell a **workspace package** so bun/pnpm resolve imports natively.

**Monorepo (bun workspace):**
1. Add omnishell to the root `package.json` workspaces: `"plugins/omnishell"`
2. Consumers depend on `"@omnishell/core": "workspace:*"`
3. Import directly from source: `import { omnishellLint } from "@omnishell/core/lint/eslint"`
4. Bun resolves `.ts` imports natively — no build step, full HMR
5. ESLint must run via `bun eslint` (not `npx eslint`) so bun's resolver handles `.ts`
6. Add proper `"exports"` field to package.json mapping subpath patterns to source files

**External (copybara-published repo):**
1. Copybara syncs omnishell to its own repo
2. CI runs `tsup` or `bun build` to produce ESM+CJS bundles
3. Publish to npm as `@omnishell/core`
4. External consumers install from npm — same import paths, built output

**Also affected:** `createLayout` and `createAuth` — the scaffold imports these via relative paths (`../../../src/...`) which break in worktrees. With workspace linking, these become `@omnishell/core/layout` and `@omnishell/core/auth`.

## Development

```bash
just setup    # install bun via mise
just build    # typecheck (tsc --noEmit)
just test     # 146 unit tests
just integrate # Docker build + test
```
