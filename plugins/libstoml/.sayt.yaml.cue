package libstoml

#vet: {
  "Dockerfile": =~ "chainguard/wolfi-base:latest@sha256:9925d3017788558fa8f27e8bb160b791e56202b60c91fbcc5c867de3175986c8" & !~ ":latest "
  ".pkgx.yaml": {...}
}
