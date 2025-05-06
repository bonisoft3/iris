#!/bin/sh
set -e

if [ "$CLOUD_TLS" = "true" ]; then
	TEMPLATE=/home/nonroot/transcoding.yaml.gcp.tpl
else
	TEMPLATE=/home/nonroot/transcoding.yaml.tpl
fi

envsubst <"$TEMPLATE" | tee /home/nonroot/transcoding.yaml
exec /usr/local/bin/envoy -c /home/nonroot/transcoding.yaml
