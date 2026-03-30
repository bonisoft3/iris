# lint-lazybox-sync.nu — Checks that plugins/devserver/lazy-mise matches the canonical .devcontainer/lazy-mise

export def main [] {
	let canonical = $env.FILE_PWD | path join "../../.devcontainer/lazy-mise"
	let copy = $env.FILE_PWD | path join "lazy-mise"

	if not ($canonical | path exists) {
		print -e "✗ canonical .devcontainer/lazy-mise not found"
		exit 1
	}
	if not ($copy | path exists) {
		print -e "✗ plugins/devserver/lazy-mise not found — copy from .devcontainer/lazy-mise"
		exit 1
	}

	let canonical_content = open $canonical --raw
	let copy_content = open $copy --raw

	if $canonical_content != $copy_content {
		print -e "✗ plugins/devserver/lazy-mise is out of sync with .devcontainer/lazy-mise"
		print -e "  Run: cp .devcontainer/lazy-mise plugins/devserver/lazy-mise"
		exit 1
	}
	print "lazy-mise in sync with .devcontainer/lazy-mise"
}
