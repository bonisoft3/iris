# PostgREST API with curl tooling for smoke tests.
FROM postgrest/postgrest:v12.2.3@sha256:0a46780309a604cdc8b56c776c6e5e15788ce58174d709e40459ab5a2d44d228
COPY --from=bonisoft3/lazybox /lazybox/ /home/ubuntu/
ENV PATH=$PATH:/home/ubuntu/.local/bin:/home/ubuntu/.local/share/lazybox/bin

COPY --chmod=755 services/crud/healthcheck.sh /usr/local/bin/healthcheck.sh

CMD ["postgrest"]

HEALTHCHECK --interval=5s --timeout=5s --retries=12 --start-period=30s CMD ["/usr/local/bin/healthcheck.sh"]
