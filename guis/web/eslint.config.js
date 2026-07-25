import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";


export default [
  // Generated build output and vendored deps — never linted.
  { ignores: [".nuxt/**", ".output/**", "dist/**", "node_modules/**"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    // vue-eslint-parser handles the SFC shell; delegate <script lang="ts"> to
    // the TypeScript parser so type syntax in .vue files parses.
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    rules: {
      // TypeScript already reports undefined identifiers, and eslint has no
      // knowledge of Nuxt's auto-imports (ref, useRoute, definePageMeta, …),
      // so no-undef here produces only false positives.
      "no-undef": "off",
      // Nuxt/Vue single-file components are legitimately single-word
      // (Error, Loading, Heading, Stepper, …).
      "vue/multi-word-component-names": "off",
      // `_`-prefixed identifiers are the convention for intentionally-unused
      // bindings (ignored callback params, placeholder destructures).
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
];
