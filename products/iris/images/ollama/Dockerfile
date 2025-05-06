FROM cgr.dev/chainguard/wolfi-base:latest@sha256:378e1d3d5ced3c8ea83c92784b081972bb235c813db8b56f936c50deac8357f3 AS downloader
RUN apk update && apk add --no-cache curl gnutar
RUN curl -#LO https://github.com/atkrad/wait4x/releases/latest/download/wait4x-linux-amd64.tar.gz
RUN tar --one-top-level -xvf wait4x-linux-amd64.tar.gz

FROM ollama/ollama:0.3.13@sha256:2e620e1066fd098b388cd8a40a214f510807c619a80092133546f0d0d271f5f1 AS release
COPY --from=downloader /wait4x-linux-amd64/wait4x /usr/bin
RUN nohup bash -c "ollama serve &" && wait4x http http://127.0.0.1:11434 && ollama pull llava-phi3:3.8b && ollama pull llama3.2:1b
