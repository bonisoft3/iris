// xproto — cross-service proto definitions. Multi-language outputs
// (JVM for tracker, Go for shelfie, TS for web, Rust for boxer).
// Modeled as a JVM project since tracker consumes the JVM artifact.
package xproto

import (
	bayt "bonisoft.org/plugins/bayt/core:bayt"
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
)

_xproto: sayt.gradle & {
	dir: "libraries/xproto"

	// Share the monorepo bake cache scope so downstream consumers
	// (pbtables, tracker) get warm-cache short-circuits on this lib's layers.
	bake: cache: {
		type:     "registry"
		registry: "registry.depot.dev/f5k5087x1b"
		scope:    "monorepo-bake-cache-v1"
	}

	targets: {
		// Public: consumed by libraries/pbtables and services/tracker.
		"build": visibility: "public"
		// REPRODUCER: see plugins/jvm/bayt.cue for the gRPC limit context.
		"setup": dockerfile: from: ref: "plugins_jvm:build"
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
			// workspaceroot:setup flows via FROM chain (setup → jvm:build
			// → workspaceroot:setup), so no explicit dep needed.
			deps: [":setup", "plugins_libstoml:build", "plugins_jvm:build", "libraries_logs:build"]
		}

		// descriptor — single-artifact buf-built FileDescriptorSet,
		// consumed by services that wire envoy's grpc_json_transcoder
		// (e.g. services/tracker-tx's launch). Separate from the main
		// gradle/bufGenerate build so consumers don't pull the whole
		// JVM toolchain stack just to get a binpb file. Public so
		// cross-project deps can reference it.
		"descriptor": sayt.generate & {
			visibility: "public"
			deps: ["workspaceroot:setup"]
			srcs: globs: [
				"buf.yaml",
				"buf.lock",
				"trash/**/*.proto",
			]
			outs: globs: ["out/xproto.desc.pb"]
			cmd: "builtin": {
				shell: "sh"
				do:    "mkdir -p out && mise x -- buf build --as-file-descriptor-set --exclude-source-info -o 'out/xproto.desc.pb#format=binpb' ."
			}
			dockerfile: bayt.nubox
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
