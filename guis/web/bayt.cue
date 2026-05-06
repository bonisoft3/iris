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
			dockerfile: from: ref: "workspaceroot:setup"
			// Filter by package name to web's transitive deps.
			// Path-based `--filter ./guis/web...` doesn't resolve from
			// /monorepo/guis/web (relative to cwd, not workspace root).
			// Without the filter, sibling workspace members' postinstalls
			// run inside web's container (e.g. flashcards' `prisma
			// generate` fails because its schema isn't COPYed in).
			cmd: "pnpm": do: "mise x -- pnpm install --frozen-lockfile --filter Iris..."
		}

		// Incremental build inside Docker: `task build:build` wraps
		// the pnpm invocation so fingerprint.nu's status hook short-
		// circuits reruns when srcs haven't changed. fingerprint.nu
		// reaches the container via the bayt-runtime
		// additional_contexts wiring; stamps live in the image layer
		// so downstream stages COPY --from inherit them.
		"build": bayt.incremental & {}

		"release": {
			// Nuxt SSR runtime contract — k8s preview manifest references
			// containerPort 8080. Chain inherits build's WORKDIR
			// (/monorepo/guis/web), where `nuxt build` lands its output
			// at .output/server/index.mjs.
			env: {
				HOST:     "0.0.0.0"
				PORT:     "8080"
				NODE_ENV: "production"
			}
			dockerfile: {
				expose: [8080]
				cmd: ["node", "/monorepo/guis/web/.output/server/index.mjs"]
			}
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

		// Launch target listens on 3000 (nuxt dev server). Local dev
		// loop = `docker compose up launch`; skaffold dev reuses the
		// release artifact (one image identity per project — skaffold
		// rejects duplicate images across configs).
		"launch": {
			dockerfile: bayt.nubox
			dockerfile: expose: [3000]
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
