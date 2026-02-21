package devserver

import "bonisoft.org/plugins/sayt:docker"

#devserver: docker.#image & {
	#docker_cache_mount: "/root/.dcm"
	from: "chainguard/wolfi-base:latest@sha256:9925d3017788558fa8f27e8bb160b791e56202b60c91fbcc5c867de3175986c8"
	as: "devserver"
	mount: [
		// still finding how to make this reliable
		// "type=cache,target=\(#docker_cache_mount)",
	]
	workdir: "./plugins/devserver/"
	env: [
		"DCM_PATH=\(#docker_cache_mount)",
    "XDG_CACHE_HOME=${DCM_PATH}/cache",
    "XDG_DATA_HOME=${DCM_PATH}/local/share",
    "TASK_TEMP_DIR=${DCM_PATH}/task",
    "SKAFFOLD_CACHE_FILE=${DCM_PATH}/skaffold/cache",
		"PATH=/root/.local/bin:${XDG_DATA_HOME}/mise/shims:$PATH",
		"MISE_VERSION=2026.1.7",
	]
	run: [
		{ stmt: ["ARG TARGETOS", "ARG TARGETARCH"] },
		{ stmt: ["COPY --from=tonistiigi/xx:1.5.0@sha256:0c6a569797744e45955f39d4f7538ac344bfb7ebf0a54006a0a4297b153ccf0f / /"] },
		{ cmd: "mkdir -p /var/run /usr/local/bin /root/.local/bin ${XDG_CONFIG_HOME}/mise" },
		{ cmd: "xx-apk add curl libgcc libstdc++ coreutils xz bash just socat nmap" },
		{ cmd: "./mise-install.sh /root/.local/bin", scripts: [ "mise-install.sh" ] },
		{ cmd: "cp ./stubs/* $HOME/.local/bin/", dirs: [ "stubs" ] },
   	{ cmd: "curl -fsSL https://github.com/ko1nksm/shdotenv/releases/download/v0.14.0/shdotenv -o $HOME/.local/bin/shdotenv && chmod 755 $HOME/.local/bin/shdotenv" },
   	{ cmd: "cp dind.sh $HOME/.local/bin/", files: [ "dind.sh" ] }
	]
}
