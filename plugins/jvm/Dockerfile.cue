package jvm

import docker "bonisoft.org/plugins/sayt:docker"
import stacks "bonisoft.org/plugins/sayt:stacks"
import libstoml "bonisoft.org/plugins/libstoml"

#jvm: stacks.#basic & { 
	dir: "plugins/jvm/"
	copy: [ libstoml.#libstoml ]
}

_dockerfile: (docker.#dockerfile & { args: #jvm.args, images: [ #jvm.sources ] })
_dockerfile.contents

