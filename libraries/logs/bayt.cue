// logs — centralized logging library (JVM).
package logs

import (
	bayt "bonisoft.org/plugins/bayt/core:bayt"
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
)

_logs: sayt.gradle & {
	dir: "libraries/logs"

	// Share the monorepo bake cache scope so downstream consumers
	// (tracker) get warm-cache short-circuits on this lib's layers.
	bake: cache: {
		type:     "registry"
		registry: "registry.depot.dev/f5k5087x1b"
		scope:    "monorepo-bake-cache-v1"
	}

	targets: {
		// Public: consumed by libraries/pbtables, libraries/xproto, services/tracker.
		"build": visibility: "public"
		// REPRODUCER: chain setup FROM plugins_jvm:build to inherit the JDK
		// install (saves the per-project mise install step). Combined with
		// the same chain on pbtables/xproto/micronaut/tracker, this pushes
		// BuildKit's frontend gRPC payload past its ~4 MB ceiling. See
		// plugins/jvm/bayt.cue for the full story.
		"setup": dockerfile: from: ref: "plugins_jvm:build"
		// settings.gradle.kts uses id("catalog") from libstoml plugin;
		// pluginManagement also includes jvm. workspaceroot:setup's
		// content flows in via the FROM chain (setup → plugins_jvm:build
		// → … → workspaceroot:setup), so no explicit dep needed.
		"build": deps: [":setup", "plugins_libstoml:build", "plugins_jvm:build"]

		// Library: not deployed standalone, no dev server, no e2e
		// preview. Drop the inherited targets that would emit dead
		// bake/skaffold/compose blocks.
		"release": null
		"launch":  null
		"verify":  null
	}
}

// Exported so other projects can ref this project's targets via
// `deps: [<alias>.project.targets.<verb>]` for cross-project
// target-level dep graphs.
project: _logs

depManifestsIn: {[string]: _}
_render: (bayt.#render & {project: _logs, depManifests: depManifestsIn})
