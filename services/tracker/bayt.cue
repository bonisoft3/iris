// services/tracker/bayt.cue — bayt configuration for tracker.
package tracker

import (
	bayt   "bonisoft.org/plugins/bayt/core:bayt"
	sayt   "bonisoft.org/plugins/bayt/stacks/sayt"
	Gradle "bonisoft.org/plugins/bayt/stacks/gradle"
)

_tracker: sayt.gradle & {
	// `dir` slash→underscore yields `services_tracker` — matches
	// skaffold's metadata.name convention, so iris can reference this
	// project as `configs: [services_tracker]`.
	dir: "services/tracker"

	// Per-target compose x-bake cache (depot.dev registry). The
	// #project target loop bakes the target name into each scope key
	// so the inner compose-up's bake graph can warm-restore cleanly
	// across runs. Mirrors iris's pattern.
	bake: cache: {
		type:     "registry"
		registry: "registry.depot.dev/f5k5087x1b"
		scope:    "tracker-bake-cache-v1"
	}

	targets: {
		// Install dind dependencies during setup so the layer builds
		// in parallel with the cross-project lib chains rather than
		// being gated behind them at integrate time. Tracker is the
		// only project in the monorepo that runs integrate-with-dind;
		// other gradle projects (libraries/*, plugins/*) keep their
		// setup lean. Pinned to a specific socat version so layer
		// cache keys don't churn on upstream package updates within
		// a leap release. Bump alongside the leap pin in
		// images.lock.cue — query with `zypper info socat` against
		// the new leap base to find the matching version.
		"setup": dockerfile: from: ref: "workspaceroot:setup"

		// Incremental build inside Docker: `task build:build` wraps the
		// gradle invocation so go-task's status: hook short-circuits
		// reruns when srcs haven't changed. Build depends on all the
		// cross-project libs' build outputs — gradle's project(":lib")
		// references need those compiled classes present.
		"build": bayt.incremental & {
			// Extend the gradle stack default with main resources so
			// that processResources populates build/resources/main/ in
			// the build stage. Without this, classpath:prompts/*.json
			// et al. are absent at integration-test runtime.
			srcs: globs: ["src/main/resources/**/*"]
			// workspaceroot:setup flows in via the FROM chain (setup
			// FROMs workspaceroot:setup), so it's not listed explicitly.
			deps: [
				"libraries_logs:build",
				"libraries_pbtables:build",
				"libraries_xproto:build",
				"plugins_libstoml:build",
				"plugins_jvm:build",
				"plugins_micronaut:build",
			]
			// Chain the build stage off setup via FROM so the mise toolchain
			// (in /root/.local/) and .task/bayt/setup.hash flow in.
			// In-container `task bayt:build` then short-circuits its
			// `::bayt:setup` dep on the inherited stamp instead of re-running
			// `mise install`.
			dockerfile: from: ref: ":setup"
		}

		// release-artifact — runs gradle's jibBuildTar via the generic
		// GradleRelease recipe. Produces build/jib-image.tar (a complete
		// OCI image as a tarball, JVM bundled via jib.from.image).
		// `--no-daemon` matches the hand-maintained Dockerfile's
		// invocation — jib's BuildTarTask has known issues with gradle's
		// configuration cache when the daemon is alive.
		"release-artifact": Gradle.GradleRelease & {
			_target: "jibBuildTar"
			deps: [":build"]
			cmd: "builtin": do: "./gradlew --init-script .bayt/init.gradle.kts --no-daemon jibBuildTar"
			outs: globs: ["build/jib-image.tar"]
			dockerfile: from: ref: ":build"
		}

		// release-layers — extract jib's tarball into a flat layer tree
		// at build/layers/. cache.nu wraps the cmd, but with outs=[]
		// it doesn't PUT/restore — BuildKit's layer cache covers work
		// avoidance for this step (release-artifact's RUN cache-hits
		// when sources are unchanged → jib-image.tar bytes identical
		// → this RUN's layer cache-hits too). Empty outs also
		// suppresses the auto cross-stage COPY into release, which
		// would otherwise land files at the wrong path.
		"release-layers": {
			deps: [":release-artifact"]
			// Single-line shell pipeline: bayt emits cmd.do as one
			// `RUN <do>` line, so multi-line `do` strings (with real
			// newlines) become multiple Dockerfile lines and break
			// the parser. Avoid jq (not installed in nubox) — jib's
			// layer files are uniformly *.tar.gz under the extracted
			// tree, so glob iteration suffices. Shell glob is sorted
			// which matches jib's manifest ordering.
			cmd: "builtin": {
				shell: "sh"  // && chain + for-loop + glob expansion
				do:    "mkdir -p build/jib && tar xf build/jib-image.tar -C build/jib && mkdir -p build/layers && for tb in build/jib/*.tar.gz; do tar xzf \"$tb\" -C build/layers; done"
			}
			dockerfile: {
				from: ref: ":release-artifact"
				// nubox/leap doesn't ship `tar` by default, and lazybox's
				// busybox subset doesn't include it either. zypper-install
				// before the cmd RUN so the extraction can find /usr/bin/tar.
				preamble: ["RUN zypper -n install tar=1.35-160000.3.1 gzip=1.13-160000.2.2 && zypper clean -a"]
			}
		}

		// release — FROM-scratch deployable image holding jib's
		// pre-baked layers. Picks the JibRelease arm of sayt.gradle's
		// release disjunction (Gradle.JibRelease has
		// `dockerfile.from: null`, distinguishing it from the
		// GradleRelease arm).
		//
		// deps: [":release-layers"] wires additional_contexts so bake
		// can resolve `services_tracker-release-layers` for the
		// epilogue COPY. The auto cross-stage COPY that bayt emits
		// for deps iterates over release-layers.outs.globs — that's
		// empty, so no auto-COPY is generated. The epilogue COPY is
		// the only one that lands layer files.
		"release": Gradle.JibRelease & {
			deps: [":release-layers"]

			// Java runtime expects classpath file at /app and bin at
			// /opt/java/openjdk/bin — that's where jib's layer tarballs
			// unpack to when extracted at root. The epilogue COPY below
			// lands them there.
			env: {
				PATH:      "/opt/java/openjdk/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
				JAVA_HOME: "/opt/java/openjdk"
				LANG:      "en_US.UTF-8"
				LANGUAGE:  "en_US:en"
				LC_ALL:    "en_US.UTF-8"
			}

			dockerfile: {
				entrypoint: ["java", "-cp", "@/app/jib-classpath-file", "com.trash.services.tracker.ApplicationKt"]
				// Explicit cross-stage COPY: layers from release-layers
				// land at / (not at /monorepo/.../build/layers/ as bayt's
				// auto cross-stage COPY would do). release-layers.outs is
				// empty so there's no competing auto-COPY here.
				epilogue: ["COPY --link --from=services_tracker-release-layers /monorepo/services/tracker/build/layers/ /"]
			}

			// bake contract (skaffold custom-command integration):
			// emits variable "IMAGE" / "PUSH_IMAGE" / "CACHE_SCOPE" and
			// `output = PUSH_IMAGE ? type=registry : type=docker`. Skaffold
			// sets PUSH_IMAGE=true on the production profile; local dev
			// leaves it false so the image lands in the docker daemon.
			bake: {
				image: "gcr.io/trash-362115/services.tracker"
				push:  false // default; skaffold overrides via env
				platforms: ["linux/amd64"]
			}

			skaffold: profiles: {
				// bayt-build auto-fires on `skaffold build` — what
				// goreleaser's verify (`--push=false`) and publish
				// hooks invoke. No deploy semantics; just the image
				// build pipeline. `skaffold test:` fires after every
				// build so the integration suite runs in both passes.
				"bayt-build": {
					build: {
						artifact: {
							image: "gcr.io/trash-362115/services.tracker"
							// `compose config` flattens the federated bayt graph
							// (dedupes bayt-runtime-stub across per-target files).
							// Bake reads the flattened compose for additional_contexts
							// cross-Dockerfile FROM wiring and the HCL for output /
							// cache / push settings.
							custom: buildCommand: "docker compose config | docker buildx bake --allow=fs.read=../.. -f- -f .bayt/bake.release.hcl release"
						}
						platforms: ["linux/amd64"]
						local: push: true
					}
					test: [{
						image: "gcr.io/trash-362115/services.tracker"
						custom: [{command: "task bayt:integrate"}]
					}]
				}

				// bayt-run is forward-looking — tracker's production
				// deploys flow through Crossplane today, not skaffold
				// run. Null-out so the profile isn't emitted; revisit
				// when a `skaffold run` workflow shows up (the
				// post-deploy health-check verify hook lives there).
				"bayt-run": null
			}
		}

		// Local dev loop is `docker compose up launch`; skaffold dev
		// reuses the release artifact (single image identity per project
		// — skaffold rejects duplicate images across configs). No
		// skaffold.artifact.image declared here, so the launch verb's
		// bayt-dev profile emits no artifact and doesn't shadow release.
		"launch": dockerfile: bayt.nubox

		// Integration tests. integrate is a compose runtime service:
		// image build = bayt-emitted Dockerfile that just COPYs the
		// test sources onto :build (gradle, source already baked in
		// upstream). cmd.builtin is a no-op `["true"]` at bake-time —
		// the real test invocation lives in `compose.command` below.
		// Daemon access for testcontainers comes via the bind-mounted
		// /var/run/docker.sock (host daemon → integrate container);
		// no socat / sayt.inject plumbing needed at the integrate
		// level because we're running on the host daemon directly.
		//
		// No bayt.incremental: tests run at compose-up, not at
		// bake-time. The action's outer marker (sayt-integrate) gates
		// warm-cache short-circuit across runs; the Taskfile machinery
		// stays available for invocation from inside the container if
		// the user shells in, but isn't load-bearing here.
		"integrate": {
			// TrackerEndpointIT reads bottle_test.txt from src/test/resources/
			// via a filesystem path (not classpath), so it must be present
			// in the container at build time. src/it/resources/ already
			// flows in via Gradle.integrationTest's defaultGlobs — listing
			// it here too would emit two COPY lines for the same tree.
			srcs: globs: ["src/test/resources/**/*"]
			cmd: "builtin": do: "true"
			dockerfile: from: ref: ":build"
			compose: {
				command: ["mise", "x", "--", "./gradlew", "--init-script", ".bayt/init.gradle.kts", "integrationTest", "--rerun"]
				volumes: ["/var/run/docker.sock:/var/run/docker.sock"]
				// Own-bridge gateway route to the host's published
				// Ryuk/service ports; see services/hello/bayt.cue.
				environment: TESTCONTAINERS_HOST_OVERRIDE: "host.docker.internal"
				extra_hosts: ["host.docker.internal:host-gateway"]
			}
		}

		// :integrate:srcs carries src/it/{kt,java,resources} (Gradle.
		// integrationTest defaults) + src/test/resources (testcontainers
		// classpath reads). Don't add src/test/**/*.kt — integrationTest
		// only compiles src/it/*; the rest bloats the COPY chain.
		"ci": sayt.ci & {
			// Source-closure for the outer ci stage. `:integrate:srcs`
			// transitively rolls in the upstream `:build:srcs` closures
			// (libraries + plugins) via the synthetic `:srcs` transitive
			// machinery; `workspaceroot:setup:srcs` brings the root-level
			// mise + workspace files.
			deps: [":integrate:srcs", ":bayt"]
		}

		"dindbox": sayt.dindbox
	}
}

project: _tracker

depManifestsIn: {[string]: _}
_render: (bayt.#render & {project: _tracker, depManifests: depManifestsIn})
