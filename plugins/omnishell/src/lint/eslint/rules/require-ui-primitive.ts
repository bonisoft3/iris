import type { Rule } from "eslint"
import { matchesFilePattern, UI_PRIMITIVE_PATTERNS } from "../utils"

const BANNED_ELEMENTS: Record<string, string> = {
  button: "Button", input: "Input", select: "Select", textarea: "Textarea", dialog: "Dialog",
}

export const requireUiPrimitive: Rule.RuleModule = {
  meta: { type: "problem", docs: { description: "Require shadcn/ui primitives instead of raw HTML interactive elements" } },
  create(context) {
    const filename = context.filename ?? context.getFilename()
    if (matchesFilePattern(filename, UI_PRIMITIVE_PATTERNS)) return {}
    return {
      JSXOpeningElement(node: any) {
        const name = node.name?.name
        if (typeof name === "string" && name in BANNED_ELEMENTS) {
          context.report({ node, message: `Raw <${name}> is banned. Use <${BANNED_ELEMENTS[name]!}> from shadcn/ui instead.` })
        }
      },
    }
  },
}
