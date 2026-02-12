FROM cgr.dev/chainguard/wolfi-base:latest@sha256:417d791afa234c538bca977fe0f44011d2381e60a9fde44c938bd17b9cc38f66 AS model-downloader
RUN apk update && apk add --no-cache wget
RUN mkdir -p /app/models
RUN wget -O /app/models/smollm2-135m-instruct-q4_k_m.gguf https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF/resolve/main/SmolLM2-135M-Instruct-Q4_K_M.gguf 

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:417d791afa234c538bca977fe0f44011d2381e60a9fde44c938bd17b9cc38f66 AS shimmy-downloader
ARG TARGETOS
ARG TARGETARCH
COPY --from=tonistiigi/xx:1.5.0@sha256:0c6a569797744e45955f39d4f7538ac344bfb7ebf0a54006a0a4297b153ccf0f / /
RUN apk update && apk add --no-cache gnutar wget
RUN wget "https://github.com/Michael-A-Kuykendall/shimmy/releases/download/v1.7.4/shimmy-${TARGETOS}-$(xx-info alpine-arch)" -O shimmy && chmod +x shimmy

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:417d791afa234c538bca977fe0f44011d2381e60a9fde44c938bd17b9cc38f66 AS release
RUN apk update && apk add --no-cache libstdc++ curl
COPY --from=shimmy-downloader /shimmy /usr/local/bin/shimmy
COPY --from=model-downloader /app/models /app/models
ENV SHIMMY_BASE_GGUF=/app/models/smollm2-135m-instruct-q4_k_m.gguf
EXPOSE 11435
CMD ["shimmy", "serve", "--bind", "0.0.0.0:11435"]
