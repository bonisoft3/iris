// Monorepo-root bayt project — owns workspace-level state that
// every downstream project needs (pnpm-lock.yaml, pnpm-workspace.yaml,
// root package.json, root .mise.toml).
//
// Consumers wire this in as a target-level cross-project dep on setup:
//
//   _web: sayt.pnpm & {
//       targets: "setup": deps: ["workspaceroot:setup"]
//   }
//
// `dir: ""` marks this as the workspace-root project. The emitter
// special-cases depth 0 so every path (WORKDIR, COPY destinations,
// cross-project include paths) resolves at /monorepo/ directly
// without spurious `../` hops or double slashes. The empty-dir
// special case in #project's name-default produces "workspaceroot".
//
// Package name is `root` to match the existing docker.cue at the
// monorepo root (pre-existing sayt convention).
package root

import (
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
	Bake "bonisoft.org/bake"
	pronto "bonisoft.org/plugins/pronto/builders:bayt"
)

_wsroot: sayt.pnpmWorkspace & {
	dir: ""

	// Per-target cache scope so transitive consumers (iris's bkid
	// cascade, hello's probe, etc.) get cache-hits on the
	// workspaceroot-setup / workspaceroot-ops layers instead of
	// rebuilding zypper+mise install fresh every run.
	bake: cache: Bake.monorepoCache

	// Workspace-root setup is consumed by every project's setup via
	// `deps: ["workspaceroot:setup"]` (toolchain + cross-stack files);
	// pnpm-workspace consumers take `workspaceroot:setup-js` instead
	// (pnpm state + every member's package.json) so JVM warm floors
	// survive JS dep churn. Public so cross-project consumers may
	// reference them. workspaceroot:setup's srcs/outs already carry
	// `plugins/devserver/docker-bridge.sh` (per sayt.pnpmWorkspace), so docker-bridge.sh
	// flows to consumers via the setup FROM chain — no separate
	// scaffolding target needed. Bake-graph scaffolding (.bayt/**,
	// Taskfile.yml, compose.yaml) flows via the auto-emitted `:bayt`
	// synthetic, transitive across cross-project deps.
	targets: "setup": visibility:    "public"
	targets: "setup-js": visibility: "public"
	targets: "pronto-sources": {
		visibility: "public"
		srcs: {globs: pronto.#CompilerSources.paths, exclude: pronto.#CompilerSources.exclude}
		dockerfile: from: null
	}
}

project: _wsroot
