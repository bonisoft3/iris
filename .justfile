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
