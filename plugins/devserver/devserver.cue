package devserver

import "bonisoft.org/plugins/sayt:docker"

#devserver: docker.#image & {
	from: "cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a"
	as: "devserver"
	mount: [
		"type=cache,target=/root/.dcm/"
	]
	workdir: "./plugins/devserver/"
	env: [
		"DOCKER_CACHE_MOUNT='/root/.dcm'",
		"PKGX_DIR='/root/.dcm/pkgx'",
		"XDG_CACHE_HOME='/root/.dcm/cache'",
		"XDG_DATA_HOME='/root/.dcm/local/share'",
		"TASK_TEMP_DIR='/root/.dcm/task'",
		"SKAFFOLD_CACHE_FILE='/root/.dcm/skaffold/cache'"
	]
	run: [
		{ "stmt": [ "ARG TARGETOS", "ARG TARGETARCH", "COPY --from=tonistiigi/xx:1.5.0@sha256:0c6a569797744e45955f39d4f7538ac344bfb7ebf0a54006a0a4297b153ccf0f / /" ] },
		{ "cmd": "mkdir -p ~/.dcm && mkdir -p /var/run && mkdir -p /usr/local/bin" },
		{ "cmd": "xx-apk add curl libgcc libstdc++ coreutils xz" },
		{ "cmd": "curl -ssL https://github.com/pkgxdev/pkgx/releases/download/v1.3.1/pkgx-1.3.1+$(xx-info os)+$(xx-info alpine-arch | tr _ -).tar.xz | tar xJ -C /usr/local/bin/" },
		{ "cmd": "pkgx task wolfi", files: [ "Taskfile.yaml" ], scripts: [ "dind.sh" ] }
	]
}
