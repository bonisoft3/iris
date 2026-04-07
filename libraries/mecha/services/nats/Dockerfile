# NATS Server with JetStream enabled.
FROM nats:2.10-alpine@sha256:b83efabe3e7def1e0a4a31ec6e078999bb17c80363f881df35edc70fcb6bb927

COPY services/nats/nats-server.conf /etc/nats/nats-server.conf

CMD ["-js", "-c", "/etc/nats/nats-server.conf"]
