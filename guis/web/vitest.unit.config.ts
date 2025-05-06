import { defineConfig } from 'vitest/config'

// This is the basic setup for running unit tests fast
export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    globalSetup: ['tests/globalSetup.ts'],
    setupFiles: ['tests/setup.ts'],
  },
  resolve: {
    alias: {
      // We don't really have import parity with nuxt without the plugin below
      // accessible through nuxt-vitest, which is a too heavy as a dependency.
      // import { getVitestConfigFromNuxt } from 'nuxt-vitest/config'
      // const nuxtViteConfig = await getVitestConfigFromNuxt(void 0, {})
      // const plugin = nuxtViteConfig.plugins.filter(
      // (item) => item.name === 'nuxt:resolve-bare-imports')
      // Hence, we just do a manual alias for code coming from the monorepo
      xproto: 'node_modules/xproto',
    },
  },
})
