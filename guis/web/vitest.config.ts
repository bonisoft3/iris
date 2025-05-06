// This setup can run both unit and integration tests, and is what
// is used by default by the IDE
import { defineVitestConfig } from '@nuxt/test-utils/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { mergeConfig } from 'vitest/config'

import type { UserWorkspaceConfig } from 'vitest/config'
import vitestUnitConfig from './vitest.unit.config'

const vitestConfig: UserWorkspaceConfig = {
  plugins: [tsconfigPaths()],
  test: {
    // The vscode plugin sometimes fails to read this, so we only use
    // the two suffixes it seems to be predefined to enable.
    include: ['**/*.test.ts', '**/*.spec.ts'],
  },
}

export default defineVitestConfig(mergeConfig(vitestUnitConfig, vitestConfig))
