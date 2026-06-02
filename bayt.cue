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
	bayt "bonisoft.org/plugins/bayt/core:bayt"
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
)

_wsroot: sayt.pnpmWorkspace & {
	dir: ""

	// Per-target cache scope so transitive consumers (iris's dindbox
	// cascade, hello's probe, etc.) get cache-hits on the
	// workspaceroot-setup / workspaceroot-ops layers instead of
	// rebuilding zypper+mise install fresh every run.
	bake: cache: {
		type:     "registry"
		registry: "registry.depot.dev/f5k5087x1b"
		scope:    "monorepo-bake-cache-v1"
	}

	// Workspace-root setup is consumed by every project's setup via
	// `deps: ["workspaceroot:setup"]`. Public so cross-project
	// consumers may reference it. workspaceroot:setup's srcs/outs
	// already carry `plugins/devserver/dind.sh` (per sayt.pnpmWorkspace),
	// so dind.sh flows to consumers via the setup FROM chain — no
	// separate scaffolding target needed. Bake-graph scaffolding
	// (.bayt/**, Taskfile.yml, compose.yaml) flows via the auto-emitted
	// `:bayt` synthetic, transitive across cross-project deps.
	targets: "setup": visibility: "public"
}

project: _wsroot

depManifestsIn: {[string]: _}
_render: (bayt.#render & {project: _wsroot, depManifests: depManifestsIn})
