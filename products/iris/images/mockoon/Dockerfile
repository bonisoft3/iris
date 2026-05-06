FROM mockoon/cli:9.4.0@sha256:ea12a282686e5c0defe9df17256cc04b8de3e306f76ea04e846a1a079586c110 AS service

COPY mockoon-env.json /mockoon-env.json

CMD ["--data", "/mockoon-env.json", "--port", "1080", "--hostname", "0.0.0.0", "--disable-log-to-file"]
