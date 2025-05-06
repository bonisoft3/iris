package compose

import "bonisoft.org/plugins/sayt:compose"

volumes: compose.volumes
services: compose.services
services: [name=_]: build: {
  dockerfile: "services/tracker/Dockerfile"
}
// add --debug-jvm for debug support
services: develop: command: "./gradlew dev -t"
services: develop: ports: [ "8080:8080" ]
secrets: compose.secrets
