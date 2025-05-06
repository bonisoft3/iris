FROM nginx:1.25.2-alpine-slim@sha256:68e92f1705aaf3f9ff5df66da3fe2a66c2288248f14527ad15b27a218eb3b165 AS service

# We use this image as a simple reverse proxy from localhost
# to $UPSTREAM_URL
COPY default.conf /etc/nginx/templates/default.conf.template
