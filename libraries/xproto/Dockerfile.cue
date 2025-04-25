package xproto

import docker "bonisoft.org/plugins/sayt:docker"
import stacks "bonisoft.org/plugins/sayt:stacks"
import "bonisoft.org:root"

#xproto: stacks.#basic & { dir: "libraries/xproto/", add: [ root.#buf & { as: "root_buf" } ] }

_dockerfile: (docker.#dockerfile & { args: #xproto.args, images: [ #xproto.sources ] })
_dockerfile.contents

