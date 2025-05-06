package docker

import "bonisoft.org/plugins/sayt:docker"
import "bonisoft.org/plugins/devserver"
import "bonisoft.org:root"

#release: docker.#image & {
	as: "release"
  from: devserver.#devserver.as
	mount: devserver.#devserver.mount
	workdir: devserver.#devserver.workdir
  run: [ {
    cmd: "cp dind.sh /usr/local/bin/", 
		scripts: [ "dind.sh" ], from: [ root.#sources.as ]
  } ]
}


#debug: docker.#image & {
	as: "debug"
  from: #release.as
	workdir: "."
}

#integrate: docker.#image & {
	as: "integrate"
  from: #release.as
	mount: #release.mount
	workdir: devserver.#devserver.workdir
	run: [ {
		"cmd": "--mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env &&  docker compose build develop",
		files: [ "Dockerfile", "compose.yaml", "Taskfile.yaml" ],
	} ]
}

_output: docker.#dockerfile & { images: [ devserver.#devserver, root.#sources, #release, #debug, #integrate ] }
_output.contents
