// guis/web/bayt.cue — bayt configuration for the web PWA.
//
// What bayt owns here: skaffold.yaml + Taskfile.yml + per-target
// canonical manifests. Dockerfile / compose / bake HCL stay hand-
// maintained — they wire pnpm/nuxt conventions that the pnpm stack
// doesn't fully reproduce yet.
package web

import (
	bayt "bonisoft.org/plugins/bayt/bayt"
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
)

_web: sayt.pnpm & {
	dir: "guis/web"

	targets: {
		// Setup chains FROM workspaceroot:setup so we inherit lazybox
		// + the workspace-level mise install (act/just/nu/cue/uv) +
		// pnpm-lock.yaml / pnpm-workspace.yaml / root package.json.
		// This project then only adds its own pnpm install on top
		// (no repeat of the workspace tools mise install). Cuts ~10-15s
		// off cold setup builds.
		"setup": {
			deps: ["workspaceroot:setup"]
			dockerfile: from: ref: "workspaceroot:setup"
		}

		// Incremental build inside Docker: `task build:build` wraps
		// the pnpm invocation so fingerprint.nu's status hook short-
		// circuits reruns when srcs haven't changed. fingerprint.nu
		// reaches the container via the bayt-runtime
		// additional_contexts wiring; stamps live in the image layer
		// so downstream stages COPY --from inherit them.
		"build": bayt.incremental & {}

		"release": {
			bake: {
				image:      "gcr.io/trash-362115/guis.web"
				push:       false
				cacheScope: ""
				platforms: ["linux/amd64"]
			}

			_releaseBuild: {
				artifact: {
					image: "gcr.io/trash-362115/guis.web"
					// `docker compose config` flattens the federated bayt
					// graph; bake then uses additional_contexts from the
					// flattened compose to resolve the cross-Dockerfile
					// `FROM guis_web-build AS release` reference (a sibling
					// target's image, not a stage in this Dockerfile).
					// --allow=fs.read=../.. whitelists the worktree root for
				// the bayt-runtime additional_context (lives at
				// plugins/bayt/runtime/). Same pattern tracker uses.
				custom: buildCommand: "docker compose config | docker buildx bake --allow=fs.read=../.. -f- -f .bayt/bake.release.hcl release"
				}
				platforms: ["linux/amd64"]
				local: push: true
			}
			skaffold: profiles: {
				"bayt-build": {
					build: _releaseBuild
					test: [{
						image: "gcr.io/trash-362115/guis.web"
						custom: [{command: "task bayt:integrate", timeoutSeconds: 3000}]
					}]
				}
				"bayt-run": null
			}
		}

		// Launch target listens on 3000 (nuxt dev server). Setting
		// skaffold.image enables the bayt-dev profile so iris's
		// preview chain or `cd guis/web && skaffold dev` brings it up.
		"launch": {
			dockerfile: expose: [3000]
			skaffold: profiles: "bayt-dev": build: artifact: image: "gcr.io/trash-362115/guis.web"
		}

		// Integrate uses the container task chain to reuse setup→build
		// stamps; drops the host.env secret + dind.sh wrap from
		// sayt.integrate's defaults (this project's integration tests
		// don't need either).
		"integrate": bayt.incremental & {
			dockerfile: secrets: []
			cmd: "builtin": dockerfile: wrap: ""
		}
	}
}

project: _web

depManifestsIn: {[string]: _}
_render: (bayt.#render & {project: _web, depManifests: depManifestsIn})
