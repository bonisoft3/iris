import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    const { paraglideVitePlugin } = await import("@inlang/paraglide-js")
    config.plugins?.push(
      paraglideVitePlugin({
        project: "./project.inlang",
        outdir: "./src/paraglide",
        outputStructure: "message-modules",
      })
    )
    return config
  },
}

export default config
