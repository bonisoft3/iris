
package docker

import "bonisoft.org/plugins/devserver"
import docker "bonisoft.org/plugins/sayt:docker"

#sources: docker.#image & {
  from: devserver.#devserver.as
  as: *"sources" | string
	workdir: "libraries/xproto/"
	run: [ docker.#gradle, { dirs: [ "src", "trash" ], files: [ "buf.yaml", "buf.lock", "buf.gradle.gen.yaml" ] } ]
}

_output: docker.#dockerfile & { stages: [ devserver.#devserver, #sources ] }
_output.contents
