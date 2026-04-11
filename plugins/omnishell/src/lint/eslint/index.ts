import type { Linter } from "eslint"
import { noRawZindex } from "./rules/no-raw-zindex"
import { noRawSpacing } from "./rules/no-raw-spacing"
import { noRawColors } from "./rules/no-raw-colors"
import { noUnconstrainedPosition } from "./rules/no-unconstrained-position"
import { noInlineStyle } from "./rules/no-inline-style"
import { requireUiPrimitive } from "./rules/require-ui-primitive"
import { noFetchInComponents } from "./rules/no-fetch-in-components"
import { noApply } from "./rules/no-apply"
import { noNestedScroll } from "./rules/no-nested-scroll"
import { requireErrorBoundary } from "./rules/require-error-boundary"

const FILES = ["**/*.{ts,tsx,js,jsx}"]

export const omnishellLint: Linter.Config[] = [
  {
    name: "@omnishell/rails/locked-tokens",
    files: FILES,
    plugins: {
      "@omnishell/rails": {
        rules: {
          "no-raw-zindex": noRawZindex,
          "no-raw-spacing": noRawSpacing,
          "no-raw-colors": noRawColors,
          "no-inline-style": noInlineStyle,
          "no-apply": noApply,
        },
      },
    },
    rules: {
      "@omnishell/rails/no-raw-zindex": "error",
      "@omnishell/rails/no-raw-spacing": "error",
      "@omnishell/rails/no-raw-colors": "error",
      "@omnishell/rails/no-inline-style": "error",
      "@omnishell/rails/no-apply": "error",
    },
  },
  {
    name: "@omnishell/rails/ui-primitives",
    files: FILES,
    plugins: {
      "@omnishell/rails": {
        rules: {
          "require-ui-primitive": requireUiPrimitive,
          "no-unconstrained-position": noUnconstrainedPosition,
        },
      },
    },
    rules: {
      "@omnishell/rails/require-ui-primitive": "error",
      "@omnishell/rails/no-unconstrained-position": "warn",
    },
  },
  {
    name: "@omnishell/rails/logic-separation",
    files: FILES,
    plugins: {
      "@omnishell/rails": {
        rules: {
          "no-fetch-in-components": noFetchInComponents,
        },
      },
    },
    rules: {
      "@omnishell/rails/no-fetch-in-components": "error",
    },
  },
  {
    name: "@omnishell/lint/structural",
    files: FILES,
    plugins: {
      "@omnishell/lint": {
        rules: {
          "no-nested-scroll": noNestedScroll,
          "require-error-boundary": requireErrorBoundary,
        },
      },
    },
    rules: {
      "@omnishell/lint/no-nested-scroll": "warn",
      "@omnishell/lint/require-error-boundary": "error",
    },
  },
]
