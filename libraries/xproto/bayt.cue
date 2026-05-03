// xproto — cross-service proto definitions. Multi-language outputs
// (JVM for tracker, Go for shelfie, TS for web, Rust for boxer).
// Modeled as a JVM project since tracker consumes the JVM artifact.
package xproto

import (
	bayt "bonisoft.org/plugins/bayt/bayt"
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
)

_xproto: sayt.gradle & {
	dir: "libraries/xproto"

	targets: {
		// Public: consumed by libraries/pbtables and services/tracker.
		"build": visibility: "public"
		// REPRODUCER: see plugins/jvm/bayt.cue for the gRPC limit context.
		"setup": {
			deps: ["plugins_jvm:build"]
			dockerfile: from: ref: "plugins_jvm:build"
		}
		// catalog plugin requires libstoml+jvm; top-level includeBuild("../../libraries/logs") needs logs.
		// Proto source dir (input to bufGenerate task) must be in the build container.
		"build": {
			srcs: globs: [
				"src/**/*.kt",
				"src/**/*.gradle.kts",
				"src/**/*.java",
				"src/**/*.sql",
				"src/**/*.sq",
				"src/**/*.sqm",
				"build.gradle.kts",
				"settings.gradle.kts",
				"gradle.properties",
				"gradlew",
				"gradle/wrapper/gradle-wrapper.jar",
				"gradle/libs.versions.toml",
				// Proto source files for bufGenerate
				"trash/**/*.proto",
				"buf.gradle.gen.yaml",
				"buf.yaml",
				"buf.lock",
			]
			deps: [":setup", "workspaceroot:setup", "plugins_libstoml:build", "plugins_jvm:build", "libraries_logs:build"]
		}

		// Library: not deployed standalone, no dev server, no e2e
		// preview.
		"release": null
		"launch":  null
		"verify":  null
	}
}

project: _xproto

depManifestsIn: {[string]: _}
_render: (bayt.#render & {project: _xproto, depManifests: depManifestsIn})
