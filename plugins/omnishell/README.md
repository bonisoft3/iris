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

## Development

```bash
just setup    # install bun via mise
just build    # typecheck (tsc --noEmit)
just test     # 146 unit tests
just integrate # Docker build + test
```
