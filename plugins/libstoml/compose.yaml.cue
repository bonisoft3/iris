package compose

import "bonisoft.org/plugins/sayt:compose"

volumes: compose.volumes
services: compose.services
services: [name=_]: build: {
  dockerfile: "plugins/libstoml/Dockerfile"
}
services: develop: command: "gradle run"
secrets: compose.secrets
