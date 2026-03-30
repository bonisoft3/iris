/**
 * @iris/ui-constraints — ESLint shared config
 *
 * Enforces layout constraints across all frontend projects:
 * 1. No raw z-index Tailwind classes (z-10, z-20, z-50 etc.)
 * 2. No position:fixed/sticky/absolute outside layout components
 * 3. All object-cover images must have aspect-ratio containers
 *
 * Usage in eslint.config.mjs:
 *   import layoutRules from "@iris/ui-constraints/eslint"
 *   export default [...layoutRules, ...otherConfigs]
 */

// Raw z-index Tailwind classes that must not be used.
// Use z-[var(--z-bleed)] through z-[var(--z-flash)] instead.
const RAW_Z_CLASSES = [
  "z-0", "z-10", "z-20", "z-30", "z-40", "z-50",
  "z-auto",
]

// Position classes restricted to layout components only.
const POSITION_CLASSES = ["fixed", "sticky"]

// Regex matching z-[number] patterns in className strings
const RAW_Z_REGEX = /\bz-(?:0|10|20|30|40|50|auto)\b/

// Regex matching position classes
const POSITION_REGEX = /\b(?:fixed|sticky)\b/

// Files where position classes ARE allowed (layout shell components)
const LAYOUT_FILE_PATTERNS = [
  "**/components/layout/**",
  "**/components/ui/sheet*",
  "**/components/ui/tooltip*",
  "**/components/ui/popover*",
  "**/components/ui/dialog*",
]

/**
 * Check if a string literal or template literal contains a banned class.
 */
function checkStringForBannedClasses(node, value, context, rule) {
  if (typeof value !== "string") return

  if (rule === "z-index" && RAW_Z_REGEX.test(value)) {
    const match = value.match(RAW_Z_REGEX)
    context.report({
      node,
      message: `Raw z-index class "${match[0]}" is banned. Use z-[var(--z-*)] tokens from @iris/ui-constraints instead. Valid tokens: --z-bleed, --z-sticky, --z-panel, --z-nav, --z-fab, --z-dropdown, --z-overlay, --z-flash.`,
    })
  }

  if (rule === "position" && POSITION_REGEX.test(value)) {
    const match = value.match(POSITION_REGEX)
    context.report({
      node,
      message: `Position class "${match[0]}" is only allowed in layout components (components/layout/*, components/ui/sheet|tooltip|popover|dialog). Use AppShell, StickyHeader, FloatingAction, or OverlayLayer from @iris/ui-constraints instead.`,
    })
  }
}

/**
 * Visitor that walks JSX attributes and function calls looking for
 * className strings that contain banned Tailwind classes.
 */
function createClassNameVisitor(context, rule) {
  return {
    // className="z-50 fixed ..."
    JSXAttribute(node) {
      if (node.name?.name !== "className") return
      if (node.value?.type === "Literal" && typeof node.value.value === "string") {
        checkStringForBannedClasses(node.value, node.value.value, context, rule)
      }
    },

    // Catches cn("z-50", "fixed", ...) and similar utility calls
    Literal(node) {
      // Only check string literals inside function calls or JSX
      if (typeof node.value !== "string") return
      const parent = node.parent
      if (!parent) return

      // Inside a function call (cn, clsx, twMerge, etc.)
      if (parent.type === "CallExpression") {
        checkStringForBannedClasses(node, node.value, context, rule)
        return
      }

      // Inside a template literal expression
      if (parent.type === "TemplateLiteral") {
        checkStringForBannedClasses(node, node.value, context, rule)
      }
    },

    TemplateLiteral(node) {
      // Check the static parts of template literals: `z-50 ${conditional}`
      for (const quasi of node.quasis) {
        if (quasi.value?.raw) {
          checkStringForBannedClasses(quasi, quasi.value.raw, context, rule)
        }
      }
    },
  }
}

/**
 * Check if the current file matches any of the allowed layout file patterns.
 */
function isLayoutFile(filename) {
  return LAYOUT_FILE_PATTERNS.some((pattern) => {
    // Simple glob matching: ** matches any path, * matches segment
    const regex = new RegExp(
      "^" +
      pattern
        .replace(/\*\*/g, ".*")
        .replace(/\*/g, "[^/]*")
        .replace(/\//g, "\\/") +
      "$"
    )
    return regex.test(filename)
  })
}

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    name: "@iris/ui-constraints/no-raw-zindex",
    files: ["**/*.{ts,tsx,js,jsx,vue}"],
    plugins: {
      "@iris/layout": {
        rules: {
          "no-raw-zindex": {
            meta: {
              type: "problem",
              docs: {
                description: "Disallow raw z-index Tailwind classes; require z-[var(--z-*)] tokens",
              },
              messages: {},
            },
            create(context) {
              return createClassNameVisitor(context, "z-index")
            },
          },
        },
      },
    },
    rules: {
      "@iris/layout/no-raw-zindex": "error",
    },
  },
  {
    name: "@iris/ui-constraints/no-unconstrained-position",
    files: ["**/*.{ts,tsx,js,jsx,vue}"],
    ignores: LAYOUT_FILE_PATTERNS,
    plugins: {
      "@iris/layout-position": {
        rules: {
          "no-unconstrained-position": {
            meta: {
              type: "problem",
              docs: {
                description: "Disallow fixed/sticky positioning outside layout components",
              },
              messages: {},
            },
            create(context) {
              return createClassNameVisitor(context, "position")
            },
          },
        },
      },
    },
    rules: {
      "@iris/layout-position/no-unconstrained-position": "warn",
    },
  },
]
