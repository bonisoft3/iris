# Arroyo stream-processing cluster with auto-bootstrap query loader.
FROM ghcr.io/arroyosystems/arroyo@sha256:f1e6fe0102505ac33da459da0ee7b06f5c31c9eeacad97534e768d6f65ebf4cd

RUN apt-get update -y && apt-get install -y curl netcat-openbsd && apt-get clean -y && rm -rf /var/lib/apt/lists/*

COPY --chmod=755 services/arroyo/arroyo-init.sh /init-scripts/arroyo-init.sh
COPY --chmod=755 services/arroyo/healthcheck.sh /usr/local/bin/arroyo-healthcheck.sh
COPY services/arroyo/queries /queries

ENTRYPOINT ["/bin/sh", "/init-scripts/arroyo-init.sh"]

HEALTHCHECK --interval=5s --timeout=5s --retries=6 --start-period=30s CMD ["/usr/local/bin/arroyo-healthcheck.sh"]
