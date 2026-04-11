#!/usr/bin/env node
import { generateSW } from "workbox-build"
import { existsSync } from "node:fs"
import { resolve } from "node:path"

// TanStack Start outputs client assets here
const clientDist = resolve(".tanstack/start/build/client-dist")

if (!existsSync(clientDist)) {
  console.log("[workbox] No client-dist found — skipping SW generation (run vite build first)")
  process.exit(0)
}

const { count, size } = await generateSW({
  globDirectory: clientDist,
  globPatterns: ["**/*.{js,css,html,svg,png,webmanifest,json}"],
  globIgnores: ["sw.js", "workbox-*.js"],
  swDest: resolve(clientDist, "sw.js"),
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: "StaleWhileRevalidate",
      options: { cacheName: "images", expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 } },
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: "StaleWhileRevalidate",
      options: { cacheName: "static-assets" },
    },
  ],
})

console.log(`[workbox] Precached ${count} files (${(size / 1024).toFixed(1)} KiB)`)
