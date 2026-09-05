set shell := ["nu", "-c"]

@_default:
  just --list --unsorted


[no-cd]
setup:
  just sayt setup
[no-cd]
doctor:
  just sayt doctor

[no-cd]
generate:
  just sayt generate
# `mise x -- nu`, not bare `nu`: the YAML emitter differs between nushell
# versions, so generating under whatever is on PATH writes a tree that
# verify-generated rejects — and that job runs only on a release tag, long
# after the commit. Pinned here rather than via `set shell` because the
# [no-cd] recipes run in the user's directory, where mise refuses an
# untrusted .mise.toml and would take `just setup` down with it.
generate-all:
  use {{justfile_directory()}}/plugins/sayt/auto-bayt.nu docker-env; with-env (docker-env) { mise x -- nu {{justfile_directory()}}/plugins/bayt/bayt.nu generate --all --runtime plugins/bayt }
[no-cd]
lint:
  just sayt lint

[no-cd]
build:
  just sayt build
[no-cd]
test:
  just sayt test

[no-cd]
launch:
  just sayt launch
[no-cd]
integrate:
  just sayt integrate

[no-cd]
release:
  just sayt release
[no-cd]
verify:
  just sayt verify

[private]
[no-cd]
sayt target *args:
  nu {{justfile_directory()}}/plugins/sayt/sayt.nu {{target}} {{args}}
