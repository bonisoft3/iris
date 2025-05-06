package libstoml

#vet: {
  "Dockerfile": =~ "cgr.dev/chainguard/wolfi-base:latest@sha256:378e1d3d5ced3c8ea83c92784b081972bb235c813db8b56f936c50deac8357f3" & !~ ":latest "
  ".pkgx.yaml": {...}
}
