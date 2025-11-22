#!/busybox sh
set -eu

exec /daprd \
  --app-id mechaed \
  --dapr-listen-addresses 0.0.0.0 \
  --resources-path /dapr/components \
  --app-channel-address proxy \
  --app-port 80 \
  --log-level debug \
  --enable-api-logging
