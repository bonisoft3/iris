// libstoml — TOML manipulation helpers for gradle configs. JVM.
package libstoml

import (
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
)

_libstoml: sayt.gradle & {
	dir: "plugins/libstoml"

	// Share the monorepo bake cache scope so downstream consumers
	// (jvm/micronaut/tracker) get warm-cache short-circuits on this plugin's layers.
	bake: cache: {
		type:     "registry"
		registry: "registry.depot.dev/f5k5087x1b"
		scope:    "monorepo-bake-cache-v1"
	}

	targets: {
		// Public: consumed by plugins/jvm and plugins/micronaut (gradle
		// composite-build) and downstream services.
		"build": visibility: "public"

		// Chain FROM workspaceroot:setup — lazybox + GNU shell utils flow
		// in via the FROM chain instead of running zypper here.
		"setup": dockerfile: from: ref: "workspaceroot:setup"

		// Library: not deployed standalone, no dev server, no e2e
		// preview, no integration tests.
		"release":   null
		"launch":    null
		"verify":    null
		"integrate": null
	}
}

// Exported so other projects can ref this project's targets via
// cross-project Bazel-style refs (e.g. "plugins_libstoml:build").
project: _libstoml

