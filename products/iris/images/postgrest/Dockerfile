FROM chainguard/wolfi-base:latest@sha256:9925d3017788558fa8f27e8bb160b791e56202b60c91fbcc5c867de3175986c8 AS downloader

RUN apk update && apk add wget gnutar xz
RUN wget https://github.com/PostgREST/postgrest/releases/download/v10.1.2/postgrest-v10.1.2-linux-static-x64.tar.xz
RUN tar -xf postgrest-v10.1.2-linux-static-x64.tar.xz

FROM chainguard/wolfi-base:latest@sha256:9925d3017788558fa8f27e8bb160b791e56202b60c91fbcc5c867de3175986c8

COPY --from=downloader /postgrest /usr/bin/postgrest

CMD ["postgrest"]
