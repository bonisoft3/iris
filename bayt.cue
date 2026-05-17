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
	// Workspace-root setup is consumed by every project's setup via
	// `deps: ["workspaceroot:setup"]`. Public so cross-project
	// consumers may reference it.
	targets: "setup": visibility: "public"

	// ops — bake-graph scaffolding only: compose includes, taskfile
	// chain, bayt runtime helpers. Toolchain inputs (mise lockfile,
	// package.json tree, gradle catalog) belong to :setup, which
	// installs them; consumers that need them chain off :setup.
	targets: "ops": {
		let _ops = [
			".bayt/**",
			"plugins/bayt/runtime/**",
			"Taskfile.yml",
			"compose.yaml",
			"bayt.cue",
			"plugins/devserver/dind.sh",
		]
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
