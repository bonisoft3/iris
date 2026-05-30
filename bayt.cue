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
	// consumers may reference it.
	targets: "setup": visibility: "public"

	// ops — bake-graph scaffolding only: compose includes, taskfile
	// chain, full bayt tree (bin/, runtime/, core/, ...). The whole
	// plugins/bayt/** ships because the inner ci `compose up integrate`
	// resolves `bayt-runtime: <relative path>` against this layer; a
	// narrower runtime/** glob left bin/bayt missing and the cascade
	// failed with `bayt: executable file not found`. Toolchain inputs
	// (mise lockfile, package.json tree, gradle catalog) belong to
	// :setup; consumers that need them chain off :setup.
	targets: "ops": {
		let _ops = [
			".bayt/**",
			"plugins/bayt/**",
			"Taskfile.yml",
			"compose.yaml",
			"plugins/devserver/dind.sh",
		]
		// bayt.cue is excluded — it's the emitter's *input* (read by
		// `just sayt generate` on the host), not a runtime source.
		// Including it lets comment-only edits bump its mtime via
		// chetan/git-restore-mtime, drifting workspaceroot-ops's
		// chain ID and cascading into every downstream project's
		// cache miss.
		srcs: globs: _ops
		outs: globs: _ops
		visibility: "public"
		dockerfile: bayt.scratch
		cmd: "builtin": null
	}
}

project: _wsroot

depManifestsIn: {[string]: _}
_render: (bayt.#render & {project: _wsroot, depManifests: depManifestsIn})
