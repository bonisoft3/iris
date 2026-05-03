// micronaut — Micronaut framework conventions for JVM services.
package micronaut

import (
	bayt "bonisoft.org/plugins/bayt/bayt"
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
)

_micronaut: sayt.gradle & {
	dir: "plugins/micronaut"

	targets: {
		// Public: consumed by libraries and services downstream.
		"build": visibility: "public"
		// REPRODUCER: see plugins/jvm/bayt.cue for the gRPC limit context.
		"setup": {
			deps: ["plugins_jvm:build"]
			dockerfile: from: ref: "plugins_jvm:build"
		}
		// settings.gradle.kts pluginManagement includes both libstoml
		// and jvm via includeBuild — both must exist in the build container.
		"build": deps: [":setup", "workspaceroot:setup", "plugins_libstoml:build", "plugins_jvm:build"]

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
