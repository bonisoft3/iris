# Dapr sidecar with bundled component definitions.
FROM busybox:1.36.1-musl@sha256:2f9af5cf39068ec3a9e124feceaa11910c511e23a1670dcfdff0bc16793545fb AS busybox

FROM daprio/daprd:1.16.1@sha256:b977660c4503fe9872b0a94a33067df0dfe0a84878dc054acd8caff82a8c4125

COPY --from=busybox /bin/busybox /busybox
COPY services/mesh/dapr/components/httpendpoints.yaml services/mesh/dapr/components/statestore.yaml /dapr/components/
COPY --chmod=755 services/mesh/entrypoint.sh /entrypoint.sh
COPY --chmod=755 services/mesh/healthcheck.sh /healthcheck.sh

ENTRYPOINT ["/entrypoint.sh"]

HEALTHCHECK --interval=5s --timeout=5s --retries=6 --start-period=30s CMD ["/healthcheck.sh"]
