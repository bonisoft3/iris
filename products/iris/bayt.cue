// products/iris — the old iris product: guis/web over services/tracker and
// services/tracker-tx. Its integrate builds nothing of its own; it names the
// three entry targets so bayt emits them as this project's depot-build group
// (.bayt/depot.json), which ci (old-iris) plans its cache hits against.
package iris

import (
	bayt "bonisoft.org/plugins/bayt/core:bayt"
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
)

// Group member (compose service) → the target it is.
_members: {
	"guis_web-integrate":            "guis_web:integrate"
	"services_tracker-ci":           "services_tracker:ci"
	"services_tracker-tx-integrate": "services_tracker-tx:integrate"
}

project: bayt.#project & {
	dir:      "products/iris"
	activate: ""
	depot:    true

	targets: {
		"setup": sayt.setup & {
			activate: ""
			deps: ["workspaceroot:setup"]
			srcs: globs: []
			outs: globs: []
			dockerfile: from: ref: "workspaceroot:setup"
			cmd: "builtin": do: "true"
		}
		// Membership is the runtime closure of depends_on, which stops at
		// another project's services: listing the entries is the whole group.
		"integrate": sayt.integrate & {
			activate: ""
			srcs: globs: []
			outs: globs: []
			dockerfile: from: ref: ":setup"
			deps: [for _, t in _members {t}]
			compose: depends_on: {for s, _ in _members {(s): condition: "service_started"}}
			cmd: "builtin": do: "true"
		}
	}
}
