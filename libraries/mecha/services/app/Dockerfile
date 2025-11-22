# Lightweight static app served by nginx on port 8000.
FROM nginx:1.29.2-alpine@sha256:61e01287e546aac28a3f56839c136b31f590273f3b41187a36f46f6a03bbfe22

COPY services/app/html/index.html /usr/share/nginx/html/index.html

RUN sed -i 's/listen       80;/listen       8000;/' /etc/nginx/conf.d/default.conf

COPY --chmod=755 services/app/healthcheck.sh /usr/local/bin/healthcheck.sh

EXPOSE 8000

CMD ["nginx", "-g", "daemon off;"]

HEALTHCHECK --interval=5s --timeout=5s --retries=6 --start-period=30s CMD ["/usr/local/bin/healthcheck.sh"]
