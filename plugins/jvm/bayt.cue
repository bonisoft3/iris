// jvm — shared JVM gradle conventions.
package jvm

import (
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
)

_jvm: sayt.gradle & {
	dir: "plugins/jvm"

	// Share the monorepo bake cache scope so downstream consumers
	// (micronaut/libs/tracker) get warm-cache short-circuits on this plugin's layers.
	bake: cache: {
		type:     "registry"
		registry: "registry.depot.dev/f5k5087x1b"
		scope:    "monorepo-bake-cache-v1"
	}

	targets: {
		// Public: consumed by plugins/micronaut and downstream services.
		// :setup is public too so consumers can chain-FROM jvm:build (which
		// has the JDK via mise) instead of repeating the install.
		// REPRODUCER (kept intentionally): the chain-FROM-jvm pattern across
		// all jvm consumers (logs/pbtables/xproto/micronaut/tracker) trips
		// BuildKit's ~4 MB frontend gRPC limit (ResourceExhausted on
		// `just sayt -d services/tracker integrate`). Revert path: drop the
		// `setup` overrides + visibility=public in this file and the lib/
		// plugin chain consumers.
		"build": visibility: "public"
		"setup": visibility: "public"
		"setup": dockerfile: from: ref: "workspaceroot:setup"
		// settings.gradle.kts includes libstoml via pluginManagement
		// includeBuild — that directory must exist in the build container.
		// workspaceroot:setup flows in via setup's FROM chain.
		"build": deps: ["plugins_libstoml:build"]

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
project: _jvm

