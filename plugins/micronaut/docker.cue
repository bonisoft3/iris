package docker

import "bonisoft.org/plugins/devserver"
import docker "bonisoft.org/plugins/sayt:docker"

#sources: docker.#image & {
  from: devserver.#devserver.as
  as: *"sources" | string
	workdir: "plugins/micronaut/"
	run: [ docker.#gradle, { dirs: [ "src" ] } ]
}

// _output: docker.#dockerfile & { stages: [ devserver.#devserver, #sources ] }
// _output.contents
