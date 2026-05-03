// jvm — shared JVM gradle conventions.
package jvm

import (
	bayt "bonisoft.org/plugins/bayt/bayt"
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
)

_jvm: sayt.gradle & {
	dir: "plugins/jvm"

	targets: {
		// Public: consumed by plugins/micronaut and downstream services.
		// :setup is public too so consumers can chain-FROM jvm:build (which
		// has the JDK installed via mise) instead of repeating the install.
		// REPRODUCER: this FROM-chain config across all jvm consumers
		// (logs/pbtables/xproto/micronaut/tracker) inflates BuildKit's
		// frontend gRPC message past its ~4 MB limit. Hits
		// `ResourceExhausted: grpc: received message larger than max
		// (~6 MB vs 4 MB)` on `just sayt -d services/tracker integrate`.
		// Reverting just the `setup` overrides + visibility="public"
		// (in this file plus libs/plugins below) returns to working
		// baseline. Left here intentionally as a reproducer.
		"build": visibility: "public"
		"setup": visibility: "public"
		"setup": {
			deps: ["workspaceroot:setup"]
			dockerfile: from: ref: "workspaceroot:setup"
		}
		// settings.gradle.kts includes libstoml via pluginManagement
		// includeBuild — that directory must exist in the build container.
		"build": deps: [":setup", "workspaceroot:setup", "plugins_libstoml:build"]

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

depManifestsIn: {[string]: _}
_render: (bayt.#render & {project: _jvm, depManifests: depManifestsIn})
