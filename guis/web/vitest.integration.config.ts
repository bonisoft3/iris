import { defineConfig, mergeConfig } from 'vitest/config'
import vitestConfig from './vitest.config'

export default defineConfig(configEnv => mergeConfig(
  vitestConfig(configEnv),
  defineConfig({
    test: {
      include: ['**/*.spec.ts'],
    },
  }),
))
