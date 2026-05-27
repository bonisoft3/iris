// micronaut — Micronaut framework conventions for JVM services.
package micronaut

import (
	bayt "bonisoft.org/plugins/bayt/core:bayt"
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
)

_micronaut: sayt.gradle & {
	dir: "plugins/micronaut"

	// Share the monorepo bake cache scope so downstream consumers
	// (tracker) get warm-cache short-circuits on this plugin's layers.
	bake: cache: {
		type:     "registry"
		registry: "registry.depot.dev/f5k5087x1b"
		scope:    "monorepo-bake-cache-v1"
	}

	targets: {
		// Public: consumed by libraries and services downstream.
		"build": visibility: "public"
		// REPRODUCER: see plugins/jvm/bayt.cue for the gRPC limit context.
		"setup": dockerfile: from: ref: "plugins_jvm:build"
		// settings.gradle.kts pluginManagement includes both libstoml
		// and jvm via includeBuild — both must exist in the build container.
		"build": deps: [":setup", "workspaceroot:setup", "plugins_libstoml:build", "plugins_jvm:build"]

		"ops": {
			srcs: globs: [".bayt/**"]
			outs: globs: [".bayt/**"]
			deps: ["workspaceroot:ops", "plugins_libstoml:ops", "plugins_jvm:ops"]
			visibility: "public"
			dockerfile: bayt.scratch
			cmd: "builtin": null
		}

		// Library: not deployed standalone, no dev server, no e2e
		// preview.
		"release": null
		"launch":  null
		"verify":  null
	}
}

// Exported so other projects can ref this project's targets via
// `deps: [<alias>.project.targets.<verb>]` for cross-project
// target-level dep graphs.
project: _micronaut

depManifestsIn: {[string]: _}
_render: (bayt.#render & {project: _micronaut, depManifests: depManifestsIn})
