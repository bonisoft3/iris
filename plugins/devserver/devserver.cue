package devserver

import "bonisoft.org/plugins/sayt:docker"

#devserver: docker.#image & {
	from: "cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a"
	as: "devserver"
	mount: [
		"type=cache,target=${DCM_PATH}",
	]
	workdir: "./plugins/devserver/"
	env: [
		"DCM_PATH=/root/.dcm",
		"DOCKER_CACHE_MOUNT=${DCM_PATH}",
		"XDG_CACHE_HOME=${DCM_PATH}/cache",
		"XDG_DATA_HOME=${DCM_PATH}/local/share",
		"TASK_TEMP_DIR=${DCM_PATH}/task",
		"SKAFFOLD_CACHE_FILE=${DCM_PATH}/skaffold/cache",
		"PATH=/root/.local/bin:${XDG_DATA_HOME}/mise/shims:$PATH",
		"MISE_VERSION=2025.10.2",
	]
	run: [
		{ stmt: ["ARG TARGETOS", "ARG TARGETARCH"] },
		{ stmt: ["COPY --from=tonistiigi/xx:1.5.0@sha256:0c6a569797744e45955f39d4f7538ac344bfb7ebf0a54006a0a4297b153ccf0f / /"] },
		{ cmd: "mkdir -p ${DCM_PATH} /var/run /usr/local/bin ${XDG_CONFIG_HOME}/mise" },
		{ cmd: "xx-apk add curl libgcc libstdc++ coreutils xz bash" },
		{ cmd: "curl -fsSL https://mise.run/ | MISE_VERSION=v${MISE_VERSION} sh" },
		{ stmt: [ "COPY .devcontainer/mise.toml .devcontainer/mise.lock .devcontainer/mise.alpine.lock ./", ] },
		{ stmt: [ "COPY --chmod=0755 .devcontainer/lazy-shims.nu .devcontainer/lazy-docker.sh .devcontainer/lazy-mise.sh ./", ] },
		{ cmd: """
mv mise.toml ${XDG_CONFIG_HOME}/mise/config.toml && \\
    mv mise.lock ${XDG_CONFIG_HOME}/mise/config.lock && \\
    (test -f /etc/alpine-release && mv mise.alpine.lock ${XDG_CONFIG_HOME}/mise/config.lock || rm mise.alpine.lock)
""" },
		{ cmd: """
cd ${XDG_CONFIG_HOME}/mise && \\
		mv /monorepo/plugins/devserver/lazy-mise.sh /root/.local/bin/lazy-mise && \\
		/root/.local/bin/lazy-mise --help && \\
		mise trust && mise install && \\
		${XDG_DATA_HOME}/mise/shims/nu /monorepo/plugins/devserver/lazy-shims.nu config.toml --delete-installs && \\
		mv /monorepo/plugins/devserver/lazy-docker.sh /root/.local/bin/docker && \\
		rm /monorepo/plugins/devserver/lazy-shims.nu
""" },
	]
}
