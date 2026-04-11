import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tsConfigPaths from "vite-tsconfig-paths"
import { paraglideVitePlugin } from "@inlang/paraglide-js"

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
      outputStructure: "message-modules",
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    tsConfigPaths(),
  ],
})
