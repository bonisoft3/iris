// logs — centralized logging library (JVM).
package logs

import (
	bayt "bonisoft.org/plugins/bayt/bayt"
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
)

_logs: sayt.gradle & {
	dir: "libraries/logs"

	targets: {
		// Public: consumed by libraries/pbtables, libraries/xproto, services/tracker.
		"build": visibility: "public"
		// REPRODUCER: chain setup FROM plugins_jvm:build to inherit the JDK
		// install (saves the per-project mise install step). Combined with
		// the same chain on pbtables/xproto/micronaut/tracker, this pushes
		// BuildKit's frontend gRPC payload past its ~4 MB ceiling. See
		// plugins/jvm/bayt.cue for the full story.
		"setup": {
			deps: ["plugins_jvm:build"]
			dockerfile: from: ref: "plugins_jvm:build"
		}
		// settings.gradle.kts uses id("catalog") from libstoml plugin; pluginManagement also includes jvm.
		"build": deps: [":setup", "workspaceroot:setup", "plugins_libstoml:build", "plugins_jvm:build"]

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
