package micronaut

import docker "bonisoft.org/plugins/sayt:docker"
import stacks "bonisoft.org/plugins/sayt:stacks"
import "bonisoft.org/plugins/libstoml"
import "bonisoft.org/plugins/jvm"

#micronaut: stacks.#basic & { dir: "plugins/micronaut/", copy: [
	libstoml.#libstoml, jvm.#jvm
] }

_dockerfile: (docker.#dockerfile & { args: #micronaut.args , images: [ #micronaut.sources ] })
_dockerfile.contents
