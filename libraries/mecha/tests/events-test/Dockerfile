# Dapr state-store smoke test to keep event infrastructure warm.
FROM busybox:1.36.1-musl@sha256:2f9af5cf39068ec3a9e124feceaa11910c511e23a1670dcfdff0bc16793545fb AS busybox

FROM tarampampam/curl@sha256:617b3306349beaacb7ad82bddda8d6876a40c3bad06d7a28981504d230802d7e

COPY --chmod=755 tests/events-test/entrypoint.sh /entrypoint.sh
COPY --chmod=755 tests/events-test/healthcheck.sh /healthcheck.sh

COPY --from=busybox /bin/busybox /bin/busybox

ENTRYPOINT ["/bin/busybox", "sh", "/entrypoint.sh"]

HEALTHCHECK --interval=5s --timeout=5s --retries=6 --start-period=15s CMD ["/bin/busybox", "sh", "/healthcheck.sh"]
