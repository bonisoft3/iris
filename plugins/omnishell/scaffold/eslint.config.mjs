import { omnishellLint } from "../src/lint/eslint/index.ts"

export default [
  ...omnishellLint,
  {
    ignores: ["src/routeTree.gen.ts", "dist/**"],
  },
]
