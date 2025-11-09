

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS devserver
WORKDIR /monorepo/./plugins/devserver/
ENV DCM_PATH=/root/.dcm
ENV DOCKER_CACHE_MOUNT=${DCM_PATH}
ENV XDG_CACHE_HOME=${DCM_PATH}/cache
ENV XDG_DATA_HOME=${DCM_PATH}/local/share
ENV TASK_TEMP_DIR=${DCM_PATH}/task
ENV SKAFFOLD_CACHE_FILE=${DCM_PATH}/skaffold/cache
ENV PATH=/root/.local/bin:${XDG_DATA_HOME}/mise/shims:$PATH
ENV MISE_VERSION=2025.10.2
ARG TARGETOS
ARG TARGETARCH
COPY --from=tonistiigi/xx:1.5.0@sha256:0c6a569797744e45955f39d4f7538ac344bfb7ebf0a54006a0a4297b153ccf0f / /
RUN --mount=type=cache,target=${DCM_PATH} mkdir -p ${DCM_PATH} /var/run /usr/local/bin ${XDG_CONFIG_HOME}/mise
RUN --mount=type=cache,target=${DCM_PATH} xx-apk add curl libgcc libstdc++ coreutils xz bash
RUN --mount=type=cache,target=${DCM_PATH} curl -fsSL https://mise.run/ | MISE_VERSION=v${MISE_VERSION} sh
COPY .devcontainer/mise.toml .devcontainer/mise.lock .devcontainer/mise.alpine.lock ./
COPY --chmod=0755 .devcontainer/lazy-shims.nu .devcontainer/lazy-docker.sh .devcontainer/lazy-mise.sh ./
RUN --mount=type=cache,target=${DCM_PATH} mv mise.toml ${XDG_CONFIG_HOME}/mise/config.toml && \
    mv mise.lock ${XDG_CONFIG_HOME}/mise/config.lock && \
    (test -f /etc/alpine-release && mv mise.alpine.lock ${XDG_CONFIG_HOME}/mise/config.lock || rm mise.alpine.lock)
RUN --mount=type=cache,target=${DCM_PATH} cd ${XDG_CONFIG_HOME}/mise && \
		mv /monorepo/plugins/devserver/lazy-mise.sh /root/.local/bin/lazy-mise && \
		/root/.local/bin/lazy-mise --help && \
		mise trust && mise install && \
		${XDG_DATA_HOME}/mise/shims/nu /monorepo/plugins/devserver/lazy-shims.nu config.toml --delete-installs && \
		mv /monorepo/plugins/devserver/lazy-docker.sh /root/.local/bin/docker && \
		rm /monorepo/plugins/devserver/lazy-shims.nu

FROM scratch AS sources
WORKDIR /monorepo/./
COPY ./. .

FROM devserver AS release
WORKDIR /monorepo/./plugins/devserver/
COPY --from=sources /monorepo /monorepo
COPY --chmod=0755 ./plugins/devserver/dind.sh ./
RUN --mount=type=cache,target=${DCM_PATH} cp dind.sh /usr/local/bin/

FROM release AS debug
WORKDIR /monorepo/.

FROM release AS integrate
WORKDIR /monorepo/./plugins/devserver/
COPY ./plugins/devserver/Dockerfile ./plugins/devserver/compose.yaml ./
RUN --mount=type=cache,target=${DCM_PATH} --mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && docker compose build develop