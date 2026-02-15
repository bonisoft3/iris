# Copy & paste from ../../plugins/devserver/Dockerfile
FROM cgr.dev/chainguard/wolfi-base:latest@sha256:417d791afa234c538bca977fe0f44011d2381e60a9fde44c938bd17b9cc38f66 AS devserver
WORKDIR /monorepo/./plugins/devserver/
ENV XDG_CACHE_HOME=/root/.local/cache
ENV XDG_DATA_HOME=/root/.local/share
ENV XDG_CONFIG_HOME=/root/.local/config
ENV PATH=/root/.local/bin:${XDG_DATA_HOME}/mise/shims:$PATH
ENV MISE_VERSION=2026.1.7
ARG TARGETOS
ARG TARGETARCH
COPY --from=tonistiigi/xx:1.5.0@sha256:0c6a569797744e45955f39d4f7538ac344bfb7ebf0a54006a0a4297b153ccf0f / /
RUN  mkdir -p /var/run /usr/local/bin /root/.local/bin ${XDG_CONFIG_HOME}/mise
RUN  xx-apk add curl libgcc libstdc++ coreutils xz bash just socat nmap
COPY --chmod=0755 ./plugins/devserver/mise-install.sh ./
RUN  ./mise-install.sh /root/.local/bin
COPY ./plugins/devserver/stubs stubs
RUN  cp ./stubs/* $HOME/.local/bin/
COPY ./plugins/devserver/dind.sh ./
RUN  curl -fsSL https://github.com/ko1nksm/shdotenv/releases/download/v0.14.0/shdotenv -o $HOME/.local/bin/shdotenv && chmod 755 $HOME/.local/bin/shdotenv
RUN which nu 
RUN yq --help

FROM devserver AS debug
COPY .justfile /monorepo/
COPY plugins/sayt /monorepo/plugins/sayt
COPY buf.work.yaml /monorepo/
COPY libraries/xproto /monorepo/libraries/xproto
COPY plugins/devserver /monorepo/plugins/devserver
WORKDIR /monorepo/services/tracker-tx
RUN apk add --no-cache envoy=1.35.3-r0 wget socat nmap
# envsubst has no aarch64 release, but the x86_64 works on aarch64
RUN echo https://github.com/a8m/envsubst/releases/download/v1.2.0/envsubst-`uname -s`-`uname -m` | sed -e 's/aarch64/x86_64/' | xargs wget -O /usr/local/bin/envsubst
RUN chmod +x /usr/local/bin/envsubst
ENV GRPC_TRACKER_SERVICE=trash.tracker.v1.TrackerService
ENV GRPC_NEWS_SERVICE=trash.tracker.v1.NewsService
ENV GRPC_OBJECT_MATERIAL_SERVICE=trash.tracker.v1.ObjectMaterialService
ENV GRPC_DISPOSAL_PLACE_SERVICE=trash.tracker.v1.DisposalPlaceService
ENV PROTO_DESCRIPTOR_PB=/monorepo/libraries/xproto/out/xproto.desc.pb
ENV GRPC_ADDRESS=127.0.0.1
ENV GRPC_PORT=50051
COPY services/tracker-tx .
RUN mise trust -a .
RUN MISE_DEBUG=1 just setup
RUN yq --help

FROM debug AS test
RUN just test
RUN --network=none just test

FROM debug AS integrate
RUN --mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && docker compose up --force-recreate --build --remove-orphans -d --wait develop

FROM debug AS artifact
RUN task build

FROM busybox:1.36.1-uclibc@sha256:f9673c18abc855770e7de2f1bafd341a514facf10d5b1036c362c66ee1c1ccaf AS binaries

FROM envoyproxy/envoy-distroless:v1.30.1@sha256:645582c5e845940c11b61d6203d1ded5095e3908b23c39a53450fc9940cc4989 AS envoy
COPY --from=binaries /bin/ls /bin/ls
COPY --from=binaries /bin/sh /bin/sh
COPY --from=binaries /bin/tee /bin/tee
COPY --from=binaries /bin/cat /bin/cat
COPY --from=debug /usr/local/bin//envsubst /bin/envsubst

FROM envoy AS release
COPY services/tracker-tx /monorepo/services/tracker-tx
COPY --from=artifact /monorepo/libraries/xproto/out/xproto.desc.pb /home/nonroot/xproto.desc.pb
COPY --from=artifact /monorepo/services/tracker-tx/out/transcoding.yaml.gcp.tpl /home/nonroot/transcoding.yaml.gcp.tpl
COPY --from=artifact /monorepo/services/tracker-tx/out/transcoding.yaml.tpl /home/nonroot/transcoding.yaml.tpl
ENV GRPC_TRACKER_SERVICE=trash.tracker.v1.TrackerService
ENV GRPC_NEWS_SERVICE=trash.tracker.v1.NewsService
ENV GRPC_OBJECT_MATERIAL_SERVICE=trash.tracker.v1.ObjectMaterialService
ENV GRPC_DISPOSAL_PLACE_SERVICE=trash.tracker.v1.DisposalPlaceService
ENV PROTO_DESCRIPTOR_PB=/home/nonroot/xproto.desc.pb
# https://github.com/envoyproxy/envoy/issues/11551
ENV ENVOY_UID=0
EXPOSE 18080
WORKDIR /
COPY services/tracker-tx/startup.sh /monorepo/services/tracker-tx/

ENTRYPOINT ["/bin/sh", "/monorepo/services/tracker-tx/startup.sh"]
