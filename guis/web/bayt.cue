// guis/web/bayt.cue — bayt configuration for the web PWA.
package web

import (
	bayt "bonisoft.org/plugins/bayt/core:bayt"
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
				platforms: ["linux/amd64"]
			}

			skaffold: profiles: {
				"bayt-build": {
					build: {
						artifact: {
							image: "gcr.io/trash-362115/guis.web"
							// `docker compose config` flattens the federated bayt
							// graph; bake then uses additional_contexts from the
							// flattened compose to resolve the cross-Dockerfile
							// `FROM guis_web-build AS release` reference (a sibling
							// target's image, not a stage in this Dockerfile).
							// --allow=fs.read=../.. whitelists the worktree root
							// for the bayt-runtime additional_context (lives at
							// plugins/bayt/runtime/).
							custom: buildCommand: "docker compose config | docker buildx bake --allow=fs.read=../.. -f- -f .bayt/bake.release.hcl release"
						}
						platforms: ["linux/amd64"]
						local: push: true
					}
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
		// Chains off :build (the iris pattern): `pnpm dev` needs the
		// build stage's full filesystem (sources + node_modules), which
		// flows via FROM. A fresh base would only receive build's
		// declared outs (.output/**) under runtime-class dep edges —
		// not enough for the dev server.
		"launch": {
			dockerfile: from: ref: ":build"
			dockerfile: expose: [3000]
		}

		// bayt.incremental routes the cmd through the in-container task
		// chain — setup→build stamps short-circuit reruns inside the
		// build sandbox. Tests don't touch docker, so no inject needed.
		"integrate": bayt.incremental
	}
}

project: _web

depManifestsIn: {[string]: _}
_render: (bayt.#render & {project: _web, depManifests: depManifestsIn})
