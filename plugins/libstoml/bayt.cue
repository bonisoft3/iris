// libstoml — TOML manipulation helpers for gradle configs. JVM. Leaf.
package libstoml

import (
	bayt "bonisoft.org/plugins/bayt/bayt"
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
)

_libstoml: sayt.gradle & {
	dir: "plugins/libstoml"

	targets: {
		// Public: consumed by plugins/jvm and plugins/micronaut (gradle
		// composite-build) and downstream services.
		"build": visibility: "public"

		// Library: not deployed standalone, no dev server, no e2e
		// preview.
		"release": null
		"launch":  null
		"verify":  null
	}
}

// Exported so other projects can ref this project's targets via
// cross-project Bazel-style refs (e.g. "plugins_libstoml:build").
project: _libstoml

depManifestsIn: {[string]: _}
_render: (bayt.#render & {project: _libstoml, depManifests: depManifestsIn})
