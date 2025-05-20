FROM cgr.dev/chainguard/wolfi-base:latest@sha256:378e1d3d5ced3c8ea83c92784b081972bb235c813db8b56f936c50deac8357f3 AS downloader

RUN apk update && apk add wget gnutar xz
RUN wget https://github.com/PostgREST/postgrest/releases/download/v10.1.2/postgrest-v10.1.2-linux-static-x64.tar.xz
RUN tar -xf postgrest-v10.1.2-linux-static-x64.tar.xz

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:378e1d3d5ced3c8ea83c92784b081972bb235c813db8b56f936c50deac8357f3

COPY --from=downloader /postgrest /usr/bin/postgrest

CMD ["postgrest"]
