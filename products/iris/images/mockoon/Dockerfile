FROM mockoon/cli:9.4.0 AS service

COPY mockoon-env.json /mockoon-env.json

CMD ["--data", "/mockoon-env.json", "--port", "1080", "--hostname", "0.0.0.0", "--disable-log-to-file"]
