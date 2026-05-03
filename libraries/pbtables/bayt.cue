// pbtables — database schema + models via protobuf tables. JVM.
package pbtables

import (
	bayt "bonisoft.org/plugins/bayt/bayt"
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
)

_pbtables: sayt.gradle & {
	dir: "libraries/pbtables"

	targets: {
		// Public: consumed by services/tracker.
		"build": visibility: "public"
		// REPRODUCER: see plugins/jvm/bayt.cue for the gRPC limit context.
		"setup": {
			deps: ["plugins_jvm:build"]
			dockerfile: from: ref: "plugins_jvm:build"
		}
		// pluginManagement includes libstoml+jvm+micronaut; top-level includeBuild("../../libraries/xproto").
		// xproto's settings.gradle.kts includes logs, so logs dir must also be in the build container.
		"build": deps: [":setup", "workspaceroot:setup", "plugins_libstoml:build", "plugins_jvm:build", "plugins_micronaut:build", "libraries_xproto:build", "libraries_logs:build"]

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
project: _pbtables

depManifestsIn: {[string]: _}
_render: (bayt.#render & {project: _pbtables, depManifests: depManifestsIn})
