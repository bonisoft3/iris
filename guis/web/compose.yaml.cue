package compose

import "bonisoft.org/plugins/sayt:compose"

volumes: compose.volumes
services: compose.services
services: [name=_]: build: {
  dockerfile: "guis/web/Dockerfile"
}
services: develop: command: "pnpm dev"
services: develop: ports: [ "3000:3000" ]
secrets: compose.secrets
