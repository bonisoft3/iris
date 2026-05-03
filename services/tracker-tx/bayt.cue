// services/tracker-tx/bayt.cue — bayt configuration for tracker-tx.
//
// Envoy-based gRPC transcoding proxy. Composes sayt's verb conventions
// with the mise toolchain stack and project-specific yq invocations
// (no language stack — this project is yaml templates + envoy, not
// gradle or pnpm). bayt emits everything under .bayt/: Taskfile chain,
// per-target Dockerfiles (including the launch image with envoy COPY'd
// from envoyproxy/envoy), compose graph, skaffold + bake configs, and
// the canonical per-target manifests.
//
// Hand-maintained files at the project root:
//   - compose.yaml             : thin federation shim that includes
//                                .bayt/compose.yaml (compose's default
//                                lookup is ./compose.yaml).
//   - skaffold.yaml            : thin glue file that requires the
//                                bayt skaffold fragments and supports
//                                cd-here `skaffold dev` plus iris's
//                                requires-chain composition.
//   - Dockerfile               : the envoyproxy/envoy-distroless
//                                runtime image referenced by the
//                                hand-maintained workspace-root
//                                docker-bake.override.hcl. Carries
//                                the xproto descriptor + custom
//                                ENTRYPOINT for envoy.
//   - docker-bake.override.hcl : per-target bake overrides for
//                                production push (image tag, cache
//                                scope, etc.). Workspace-root bake
//                                graph reads this.
package tracker_tx

import (
	bayt "bonisoft.org/plugins/bayt/bayt"
	mise "bonisoft.org/plugins/bayt/stacks/mise"
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
)

_tx: bayt.#project & {
	// `dir` slash→underscore yields `services_tracker-tx` — matches
	// skaffold's metadata.name convention, so iris can reference this
	// project as `configs: [services_tracker-tx]`.
	dir:      "services/tracker-tx"
	activate: "mise x --"

	targets: {
		"setup": sayt.setup & mise.install & {
			dockerfile: bayt.nubox
		}
		"doctor": sayt.doctor & mise.doctor
		"build": sayt.build & mise.exec & {
			// tracker-tx is a yaml-template-only project. Build =
			// concatenate the envoy transcoding configs into per-
			// environment templates. The hand-maintained Dockerfile's
			// release stage also bundles xproto.desc.pb; once release
			// is bayt-emitted, add an xproto:descriptor cross-project
			// dep to bring it into the build stage.
			srcs: globs: ["transcoding.yaml", "cloud_run_tls.yaml", "edge.yaml"]
			outs: globs: ["out/transcoding.yaml.tpl", "out/transcoding.yaml.gcp.tpl"]
			cmd: "builtin": {
				shell: "sh"  // && chain + redirects
				do:    "mkdir -p out && cat transcoding.yaml cloud_run_tls.yaml > out/transcoding.yaml.gcp.tpl && cat transcoding.yaml > out/transcoding.yaml.tpl"
			}
			dockerfile: bayt.nubox
		}
		"test": sayt.test & mise.exec & {
			// Validate generated templates parse as YAML.
			srcs: globs: ["transcoding.yaml", "cloud_run_tls.yaml"]
			outs: globs: ["build/test-results/**/*.xml"]
			cmd: "builtin": {
				shell: "sh"  // < redirect
				do:    "yq . < out/transcoding.yaml.gcp.tpl"
			}
		}
		"launch": sayt.launch & mise.exec & {
			// Launch target — envoy with the transcoding config. Chains
			// off :build so the rendered templates (out/*.tpl) and the
			// mise toolchain are already present; runtime only adds
			// envoy and envsubst.
			//
			// envoy: COPY'd from envoyproxy/envoy. The binary links only
			// against glibc, which leap already provides — no cross-
			// distro library shimming needed.
			//
			// envsubst: from leap's gettext-runtime package.
			//
			// mise shims: added to PATH so the runtime command can call
			// `task` and `yq` without an explicit `mise x --` prefix.
			dockerfile: {
				from: ref: ":build"
				preamble: [
					"COPY --from=\(bayt.lock.images.envoy) /usr/local/bin/envoy /usr/local/bin/envoy",
					"RUN zypper -n install gettext-runtime && zypper clean -a",
					"ENV PATH=/root/.local/share/mise/shims:$PATH",
				]
				expose: [8080]
			}
			// No build cmd — runtime command does the work. `true` is a
			// valid sentinel for "image build is just the COPY+install".
			cmd: "builtin": do: "true"
			// Cluster-side dev: setting skaffold.image enables the
			// bayt-dev profile (auto-fires on `skaffold dev`).
			// Activation rule + dockerfile path (.bayt/Dockerfile.launch)
			// come from stacks/sayt's launch verb fragment.
			skaffold: profiles: "bayt-dev": build: artifact: image: "gcr.io/trash-362115/services.tracker-tx-gcp"
			compose: runtime: {
				// envoy reads transcoding.yaml directly (envsubst expands
				// env vars, yq converts to JSON via process substitution).
				command: ["bash", "-c", "envoy -c <(envsubst < transcoding.yaml | yq -o json)"]
				ports: ["8080"]
				// Docker socket for envoy → docker desktop bridge.
				volumes: ["//var/run/docker.sock:/var/run/docker.sock"]
				healthcheck: {
					test:         "curl http://localhost:18080/"
					interval:     "40s"
					timeout:      "30s"
					retries:      3
					start_period: "60s"
				}
			}
		}
		"integrate": sayt.integrate & mise.exec & {
			// Smoke-test the rendered envoy configs parse as valid
			// YAML (both per-environment templates) and the edge
			// config too. Cheap, no docker — the fuller "boot envoy
			// in dind and curl the health endpoint" version lives in
			// the hand-maintained Dockerfile and will move here once
			// the dind-as-plugin mechanism lands.
			//
			// No host.env secret (yq doesn't need auth) and no
			// `dind.sh` wrap (no docker-in-docker), overriding the
			// sayt.integrate defaults.
			srcs: globs: ["transcoding.yaml", "cloud_run_tls.yaml", "edge.yaml"]
			outs: globs: ["build/test-results-int/**/*.xml"]
			dockerfile: {
				bayt.nubox
				secrets: []
			}
			cmd: "builtin": {
				shell: "sh"  // < redirects + && chain
				do:    "yq . < out/transcoding.yaml.tpl && yq . < out/transcoding.yaml.gcp.tpl && yq . < edge.yaml"
				dockerfile: wrap: ""
			}
		}
		"release": sayt.release & {
			// Release stage is FROM busybox (no mise) and pure
			// packaging — artifacts arrive via COPY --from= chains;
			// the runtime entrypoint does the actual work (envsubst
			// over tpl files). No build-time cmd needed at all, so
			// drop the inherited builtin cmd via `cmd: "builtin":
			// null`. No RUN line gets emitted in Dockerfile.release.
			dockerfile: bayt.busybox
			cmd: "builtin": null
			bake: {
				image:      "gcr.io/trash-362115/services.tracker-tx-gcp"
				push:       false
				cacheScope: ""
				platforms: ["linux/amd64"]
			}
			_releaseBuild: {
				artifact: {
					image: "gcr.io/trash-362115/services.tracker-tx-gcp"
					// `docker compose config` flattens the federated bayt
					// graph; bake then uses additional_contexts from the
					// flattened compose to resolve cross-Dockerfile FROM
					// refs (Dockerfile.release does
					// `COPY --from=services_tracker-tx-build`, which is a
					// sibling target's image — not a stage in this
					// Dockerfile). Without the flatten, bake errors with
					// "pull access denied" looking for a non-existent
					// docker.io/library/services_tracker-tx-build image.
					custom: buildCommand: "docker compose config | docker buildx bake --allow=fs.read=../.. -f- -f .bayt/bake.release.hcl release"
				}
				platforms: ["linux/amd64"]
				local: push: true
			}
			skaffold: profiles: {
				"bayt-build": {
					build: _releaseBuild
					test: [{
						image: "gcr.io/trash-362115/services.tracker-tx"
						custom: [{command: "task bayt:integrate", timeoutSeconds: 3000}]
					}]
				}
				"bayt-run": null
			}
		}
		"verify":   sayt.verify   & mise.exec & {cmd: "builtin": do: "nu sayt.nu verify"}
		"generate": sayt.generate & {cmd: "builtin": do: "nu sayt.nu generate"}
		"lint":     sayt.lint     & {cmd: "builtin": do: "nu sayt.nu lint"}
	}
}

project: _tx

depManifestsIn: {[string]: _}
_render: (bayt.#render & {project: _tx, depManifests: depManifestsIn})
